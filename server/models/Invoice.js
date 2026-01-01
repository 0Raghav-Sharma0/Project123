const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  hsnCode: {
    type: String,
    default: '',
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0.01, 'Quantity must be greater than 0'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  unit: {
    type: String,
    default: 'Nos',
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  gstRate: {
    type: Number,
    required: [true, 'GST rate is required'],
    min: [0, 'GST rate cannot be negative'],
    max: [100, 'GST rate cannot exceed 100%'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  taxableValue: {
    type: Number,
    default: 0,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  cgstAmount: {
    type: Number,
    default: 0,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  sgstAmount: {
    type: Number,
    default: 0,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  totalAmount: {
    type: Number,
    default: 0,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  }
}, {
  _id: true
});

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Pincode must be 6 digits']
  }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  gstin: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  billingAddress: {
    type: addressSchema,
    required: [true, 'Billing address is required']
  },
  shippingAddress: {
    type: addressSchema,
    default: function() {
      // Default shipping address to billing address if not provided
      return this.billingAddress ? {
        street: this.billingAddress.street || '',
        city: this.billingAddress.city || '',
        state: this.billingAddress.state || '',
        pincode: this.billingAddress.pincode || ''
      } : undefined;
    }
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  customer: {
    type: customerSchema,
    required: [true, 'Customer details are required']
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paymentTerms: {
    type: String,
    default: 'Net 30',
    trim: true
  },
  products: {
    type: [productSchema],
    required: [true, 'Products are required'],
    validate: {
      validator: function(products) {
        return Array.isArray(products) && products.length > 0;
      },
      message: 'At least one product is required'
    }
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  cgstTotal: {
    type: Number,
    required: [true, 'CGST total is required'],
    min: [0, 'CGST cannot be negative'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  sgstTotal: {
    type: Number,
    required: [true, 'SGST total is required'],
    min: [0, 'SGST cannot be negative'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  roundOff: {
    type: Number,
    default: 0,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  grandTotal: {
    type: Number,
    required: [true, 'Grand total is required'],
    min: [0, 'Grand total cannot be negative'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(parseFloat(v).toFixed(2))
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'generated', 'sent', 'paid', 'overdue', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'generated'
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // This will automatically add createdAt and updatedAt
  toJSON: { getters: true }, // Apply getters when converting to JSON
  toObject: { getters: true }, // Apply getters when converting to object
  id: false // Disable virtual id field
});

// Middleware to update timestamps
invoiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If this is a new invoice, ensure invoiceDate is set
  if (this.isNew && !this.invoiceDate) {
    this.invoiceDate = new Date();
  }
  
  // Ensure dueDate is after invoiceDate
  if (this.invoiceDate && this.dueDate && this.dueDate < this.invoiceDate) {
    // Set due date to 30 days after invoice date by default
    const dueDate = new Date(this.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    this.dueDate = dueDate;
  }
  
  // Calculate product totals if not already calculated
  if (this.products && this.products.length > 0) {
    this.products.forEach(product => {
      if (product.quantity && product.price && product.gstRate !== undefined) {
        const taxableValue = product.quantity * product.price;
        const gstAmount = taxableValue * (product.gstRate / 100);
        
        product.taxableValue = parseFloat(taxableValue.toFixed(2));
        product.cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
        product.sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
        product.totalAmount = parseFloat((taxableValue + gstAmount).toFixed(2));
      }
    });
  }
  
  // Calculate invoice totals if not already set
  if (this.products && this.products.length > 0 && 
      (this.subtotal === undefined || this.grandTotal === undefined)) {
    const subtotal = this.products.reduce((sum, product) => 
      sum + (product.taxableValue || 0), 0);
    const cgstTotal = this.products.reduce((sum, product) => 
      sum + (product.cgstAmount || 0), 0);
    const sgstTotal = this.products.reduce((sum, product) => 
      sum + (product.sgstAmount || 0), 0);
    const grandTotal = subtotal + cgstTotal + sgstTotal;
    const roundOff = parseFloat((Math.round(grandTotal) - grandTotal).toFixed(2));
    
    this.subtotal = parseFloat(subtotal.toFixed(2));
    this.cgstTotal = parseFloat(cgstTotal.toFixed(2));
    this.sgstTotal = parseFloat(sgstTotal.toFixed(2));
    this.roundOff = roundOff;
    this.grandTotal = Math.round(grandTotal);
  }
  
  // Set default shipping address if not provided
  if (this.customer && this.customer.billingAddress && !this.customer.shippingAddress) {
    this.customer.shippingAddress = {
      street: this.customer.billingAddress.street,
      city: this.customer.billingAddress.city,
      state: this.customer.billingAddress.state,
      pincode: this.customer.billingAddress.pincode
    };
  }
  
  next();
});

// Middleware to validate unique invoice number per user
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && this.invoiceNumber && this.userId) {
    try {
      const existingInvoice = await mongoose.model('Invoice').findOne({
        invoiceNumber: this.invoiceNumber,
        userId: this.userId,
        _id: { $ne: this._id }
      });
      
      if (existingInvoice) {
        const error = new Error('Invoice number already exists for this user');
        error.name = 'DuplicateInvoiceNumber';
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Virtual for checking if invoice is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  if (this.status === 'paid' || this.status === 'cancelled') {
    return false;
  }
  
  if (!this.dueDate) {
    return false;
  }
  
  return new Date() > this.dueDate;
});

// Virtual for days until due
invoiceSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) {
    return null;
  }
  
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
invoiceSchema.index({ userId: 1, invoiceDate: -1 });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, dueDate: 1 });
invoiceSchema.index({ 'customer.name': 'text' }); // Text index for customer name search

// IMPORTANT: Remove the old unique index on invoiceNumber and create a compound index
// This should be done in your database directly or in a migration script
invoiceSchema.index({ invoiceNumber: 1, userId: 1 }, { unique: true });

// Static method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function(userId) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  // Find the last invoice for this user in current year
  const lastInvoice = await this.findOne({
    userId,
    invoiceNumber: { $regex: `^${prefix}` }
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const match = lastInvoice.invoiceNumber.match(/\d+$/);
    if (match) {
      sequence = parseInt(match[0]) + 1;
    }
  }
  
  const invoiceNumber = `${prefix}${sequence.toString().padStart(4, '0')}`;
  
  // Double-check for uniqueness
  const exists = await this.exists({ 
    invoiceNumber, 
    userId 
  });
  
  if (exists) {
    // If duplicate exists, find max sequence number
    const invoices = await this.find({
      userId,
      invoiceNumber: { $regex: `^${prefix}` }
    }).select('invoiceNumber');
    
    let maxSequence = 0;
    invoices.forEach(inv => {
      const match = inv.invoiceNumber.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0]);
        if (num > maxSequence) maxSequence = num;
      }
    });
    
    return `${prefix}${(maxSequence + 1).toString().padStart(4, '0')}`;
  }
  
  return invoiceNumber;
};

// Static method to get dashboard statistics
invoiceSchema.statics.getDashboardStats = async function(userId) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  const invoices = await this.find({ userId });
  
  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    pending: invoices.filter(inv => 
      ['generated', 'sent', 'draft'].includes(inv.status)
    ).length,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0
  };
  
  invoices.forEach(invoice => {
    const amount = invoice.grandTotal || 0;
    stats.totalAmount += amount;
    
    if (invoice.status === 'paid') {
      stats.paidAmount += amount;
    } else if (['generated', 'sent', 'draft'].includes(invoice.status)) {
      stats.pendingAmount += amount;
    }
    
    if (invoice.invoiceDate >= startOfMonth) {
      stats.monthlyRevenue += amount;
    }
    
    if (invoice.invoiceDate >= startOfYear) {
      stats.yearlyRevenue += amount;
    }
  });
  
  // Round all amounts to 2 decimal places
  stats.totalAmount = parseFloat(stats.totalAmount.toFixed(2));
  stats.paidAmount = parseFloat(stats.paidAmount.toFixed(2));
  stats.pendingAmount = parseFloat(stats.pendingAmount.toFixed(2));
  stats.monthlyRevenue = parseFloat(stats.monthlyRevenue.toFixed(2));
  stats.yearlyRevenue = parseFloat(stats.yearlyRevenue.toFixed(2));
  
  stats.collectionRate = stats.totalAmount > 0 
    ? parseFloat(((stats.paidAmount / stats.totalAmount) * 100).toFixed(1))
    : 0;
  
  return stats;
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;