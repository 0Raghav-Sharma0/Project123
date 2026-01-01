const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Improved invoice number generation with proper duplicate handling
const generateInvoiceNumber = async (userId, companyId) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    
    // Find the highest invoice number for this company/user and year
    const lastInvoice = await Invoice.findOne({ 
      $or: [
        { companyId: new mongoose.Types.ObjectId(companyId) },
        { userId: new mongoose.Types.ObjectId(userId) }
      ],
      invoiceNumber: { $regex: `^${prefix}` } 
    }).sort({ createdAt: -1 });
    
    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split('-');
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2]);
        if (!isNaN(lastNumber)) {
          sequence = lastNumber + 1;
        }
      }
    }
    
    // Generate the invoice number
    const invoiceNumber = `${prefix}${sequence.toString().padStart(4, '0')}`;
    
    // Double-check for duplicates (should be rare but just in case)
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      // If duplicate exists, use timestamp-based fallback
      const timestamp = Date.now().toString().slice(-8);
      return `${prefix}F${timestamp}`;
    }
    
    return invoiceNumber;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-8);
    return `INV-${new Date().getFullYear()}-F${timestamp}`;
  }
};

// Get all invoices with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      customerName, 
      startDate, 
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (customerName) query['customer.name'] = new RegExp(customerName, 'i');
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const invoices = await Invoice.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('companyId');
    
    const total = await Invoice.countDocuments(query);
    
    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch invoices',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const invoices = await Invoice.find({ userId: req.user._id });
    
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    const pending = invoices.filter(inv => inv.status === 'generated' || inv.status === 'sent' || inv.status === 'draft').length;
    
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'generated' || inv.status === 'sent' || inv.status === 'draft')
      .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    
    const monthlyInvoices = invoices.filter(inv => 
      inv.invoiceDate >= startOfMonth
    );
    const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    
    const yearlyInvoices = invoices.filter(inv => 
      inv.invoiceDate >= startOfYear
    );
    const yearlyRevenue = yearlyInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    
    res.json({
      success: true,
      total,
      paid,
      overdue,
      pending,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      paidAmount: parseFloat(paidAmount.toFixed(2)),
      pendingAmount: parseFloat(pendingAmount.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      yearlyRevenue: parseFloat(yearlyRevenue.toFixed(2)),
      collectionRate: totalAmount > 0 ? parseFloat(((paidAmount / totalAmount) * 100).toFixed(1)) : 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard stats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('companyId');
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        error: 'Invoice not found' 
      });
    }
    
    res.json({ 
      success: true,
      invoice 
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch invoice',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate invoice number endpoint
router.get('/generate-number', auth, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({ 
        success: false,
        error: 'Company not found' 
      });
    }
    
    const invoiceNumber = await generateInvoiceNumber(req.user._id, company._id);
    res.json({ 
      success: true,
      invoiceNumber 
    });
  } catch (error) {
    console.error('Generate number error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate invoice number',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new invoice - FIXED VERSION WITHOUT TRANSACTIONS
router.post('/', auth, [
  body('customer.name').notEmpty().trim().withMessage('Customer name is required'),
  body('customer.billingAddress.street').notEmpty().trim().withMessage('Billing street address is required'),
  body('customer.billingAddress.city').notEmpty().trim().withMessage('Billing city is required'),
  body('customer.billingAddress.state').notEmpty().trim().withMessage('Billing state is required'),
  body('customer.billingAddress.pincode')
    .notEmpty().withMessage('Billing pincode is required')
    .matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('invoiceDate').isISO8601().withMessage('Invalid invoice date format'),
  body('dueDate').isISO8601().withMessage('Invalid due date format'),
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.description').notEmpty().trim().withMessage('Product description is required'),
  body('products.*.quantity')
    .isFloat({ min: 0.01 }).withMessage('Product quantity must be greater than 0'),
  body('products.*.price')
    .isFloat({ min: 0 }).withMessage('Product price must be 0 or greater'),
  body('products.*.gstRate')
    .isFloat({ min: 0, max: 100 }).withMessage('GST rate must be between 0 and 100')
], async (req, res) => {
  try {
    console.log('=== INVOICE CREATION REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('VALIDATION ERRORS:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    
    // Check if company exists
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      console.log('Company not found for user:', req.user._id);
      return res.status(404).json({ 
        success: false,
        error: 'Company not found. Please setup your company details first.' 
      });
    }
    
    console.log('Company found:', company.name);
    
    // Generate invoice number using the improved function
    const invoiceNumber = await generateInvoiceNumber(req.user._id, company._id);
    console.log('Generated invoice number:', invoiceNumber);
    
    // Calculate product totals
    const products = req.body.products.map((product, index) => {
      console.log(`Processing product ${index}:`, product);
      
      const quantity = parseFloat(product.quantity);
      const price = parseFloat(product.price);
      const gstRate = parseFloat(product.gstRate) || 0;
      
      console.log(`Product ${index} values - Qty: ${quantity}, Price: ${price}, GST: ${gstRate}%`);
      
      const taxableValue = parseFloat((quantity * price).toFixed(2));
      const gstAmount = parseFloat((taxableValue * (gstRate / 100)).toFixed(2));
      const cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
      const sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
      const totalAmount = parseFloat((taxableValue + gstAmount).toFixed(2));
      
      console.log(`Product ${index} calculations - Taxable: ${taxableValue}, GST: ${gstAmount}, Total: ${totalAmount}`);
      
      return {
        description: product.description.trim(),
        hsnCode: product.hsnCode ? product.hsnCode.trim() : '',
        quantity: quantity,
        unit: product.unit || 'Nos',
        price: price,
        gstRate: gstRate,
        taxableValue: taxableValue,
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        totalAmount: totalAmount
      };
    });
    
    // Calculate invoice totals
    const subtotal = parseFloat(products.reduce((sum, p) => sum + p.taxableValue, 0).toFixed(2));
    const cgstTotal = parseFloat(products.reduce((sum, p) => sum + p.cgstAmount, 0).toFixed(2));
    const sgstTotal = parseFloat(products.reduce((sum, p) => sum + p.sgstAmount, 0).toFixed(2));
    const grandTotal = parseFloat((subtotal + cgstTotal + sgstTotal).toFixed(2));
    const roundOff = parseFloat((Math.round(grandTotal) - grandTotal).toFixed(2));
    const finalGrandTotal = Math.round(grandTotal);
    
    console.log('Invoice totals:', {
      subtotal: subtotal,
      cgstTotal: cgstTotal,
      sgstTotal: sgstTotal,
      grandTotal: grandTotal,
      roundOff: roundOff,
      finalGrandTotal
    });
    
    // Prepare invoice data
    const invoiceData = {
      customer: {
        name: req.body.customer.name.trim(),
        gstin: req.body.customer.gstin ? req.body.customer.gstin.trim() : '',
        email: req.body.customer.email ? req.body.customer.email.trim() : '',
        phone: req.body.customer.phone ? req.body.customer.phone.trim() : '',
        billingAddress: {
          street: req.body.customer.billingAddress.street.trim(),
          city: req.body.customer.billingAddress.city.trim(),
          state: req.body.customer.billingAddress.state.trim(),
          pincode: req.body.customer.billingAddress.pincode.trim()
        },
        shippingAddress: req.body.customer.shippingAddress ? {
          street: req.body.customer.shippingAddress.street?.trim() || '',
          city: req.body.customer.shippingAddress.city?.trim() || '',
          state: req.body.customer.shippingAddress.state?.trim() || '',
          pincode: req.body.customer.shippingAddress.pincode?.trim() || ''
        } : {
          street: req.body.customer.billingAddress.street.trim(),
          city: req.body.customer.billingAddress.city.trim(),
          state: req.body.customer.billingAddress.state.trim(),
          pincode: req.body.customer.billingAddress.pincode.trim()
        }
      },
      invoiceDate: new Date(req.body.invoiceDate),
      dueDate: new Date(req.body.dueDate),
      paymentTerms: req.body.paymentTerms || 'Net 30',
      notes: req.body.notes ? req.body.notes.trim() : '',
      products,
      invoiceNumber,
      userId: req.user._id,
      companyId: company._id,
      subtotal: subtotal,
      cgstTotal: cgstTotal,
      sgstTotal: sgstTotal,
      roundOff,
      grandTotal: finalGrandTotal,
      status: req.body.status || 'generated'
    };
    
    console.log('Final invoice data:', JSON.stringify(invoiceData, null, 2));
    
    // Create and save invoice (NO TRANSACTION for standalone MongoDB)
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    console.log('Invoice created successfully. ID:', invoice._id);
    
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('companyId');
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice: populatedInvoice
    });
    
  } catch (error) {
    console.error('CREATE INVOICE ERROR DETAILS:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyValue: error.keyValue
    });
    
    // Handle specific errors
    if (error.code === 11000 || error.name === 'MongoServerError') {
      // Try again with a new invoice number
      try {
        console.log('Duplicate detected, retrying with new number...');
        
        // Generate a new invoice number with timestamp fallback
        const timestamp = Date.now().toString().slice(-8);
        const invoiceNumber = `INV-${new Date().getFullYear()}-F${timestamp}`;
        
        // Update the invoice data with new number
        invoiceData.invoiceNumber = invoiceNumber;
        const retryInvoice = new Invoice(invoiceData);
        await retryInvoice.save();
        
        const populatedRetryInvoice = await Invoice.findById(retryInvoice._id)
          .populate('companyId');
        
        return res.status(201).json({
          success: true,
          message: 'Invoice created successfully with fallback number',
          invoice: populatedRetryInvoice
        });
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
      
      return res.status(409).json({ 
        success: false,
        error: 'Invoice number already exists. Please try again.',
        code: 'DUPLICATE_INVOICE'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Invoice validation failed',
        details: errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to create invoice',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update invoice
router.put('/:id', auth, [
  body('customer.name').optional().notEmpty(),
  body('products').optional().isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        error: 'Invoice not found' 
      });
    }
    
    // Update products and recalculate totals if products are being updated
    if (req.body.products) {
      const products = req.body.products.map(product => {
        const quantity = parseFloat(product.quantity) || 0;
        const price = parseFloat(product.price) || 0;
        const gstRate = parseFloat(product.gstRate) || 0;
        
        const taxableValue = parseFloat((quantity * price).toFixed(2));
        const gstAmount = parseFloat((taxableValue * (gstRate / 100)).toFixed(2));
        const cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
        const sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
        const totalAmount = parseFloat((taxableValue + gstAmount).toFixed(2));
        
        return {
          description: product.description?.trim() || '',
          hsnCode: product.hsnCode ? product.hsnCode.trim() : '',
          quantity,
          unit: product.unit || 'Nos',
          price,
          gstRate,
          taxableValue,
          cgstAmount,
          sgstAmount,
          totalAmount
        };
      });
      
      const subtotal = parseFloat(products.reduce((sum, p) => sum + p.taxableValue, 0).toFixed(2));
      const cgstTotal = parseFloat(products.reduce((sum, p) => sum + p.cgstAmount, 0).toFixed(2));
      const sgstTotal = parseFloat(products.reduce((sum, p) => sum + p.sgstAmount, 0).toFixed(2));
      const grandTotal = parseFloat((subtotal + cgstTotal + sgstTotal).toFixed(2));
      const roundOff = parseFloat((Math.round(grandTotal) - grandTotal).toFixed(2));
      
      req.body.products = products;
      req.body.subtotal = subtotal;
      req.body.cgstTotal = cgstTotal;
      req.body.sgstTotal = sgstTotal;
      req.body.roundOff = roundOff;
      req.body.grandTotal = Math.round(grandTotal);
    }
    
    // Update other fields
    if (req.body.customer) {
      if (req.body.customer.name) req.body.customer.name = req.body.customer.name.trim();
      if (req.body.customer.email) req.body.customer.email = req.body.customer.email.trim();
      if (req.body.customer.phone) req.body.customer.phone = req.body.customer.phone.trim();
      if (req.body.customer.gstin) req.body.customer.gstin = req.body.customer.gstin.trim();
      
      if (req.body.customer.billingAddress) {
        Object.keys(req.body.customer.billingAddress).forEach(key => {
          if (req.body.customer.billingAddress[key]) {
            req.body.customer.billingAddress[key] = req.body.customer.billingAddress[key].trim();
          }
        });
      }
    }
    
    Object.assign(invoice, req.body);
    invoice.updatedAt = new Date();
    await invoice.save();
    
    res.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: await invoice.populate('companyId')
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update invoice',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update invoice status
router.patch('/:id/status', auth, [
  body('status').isIn(['draft', 'generated', 'sent', 'paid', 'overdue', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    const { status } = req.body;
    
    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      { 
        status, 
        updatedAt: new Date(),
        ...(status === 'paid' ? { paidAt: new Date() } : {})
      },
      { new: true, runValidators: true }
    ).populate('companyId');
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        error: 'Invoice not found' 
      });
    }
    
    res.json({
      success: true,
      message: `Invoice status updated to ${status}`,
      invoice
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update invoice status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        error: 'Invoice not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Invoice deleted successfully' 
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete invoice',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;