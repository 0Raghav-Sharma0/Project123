const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');
const { auth } = require('../middleware/auth');

// @route   GET /api/bank
// @desc    Get user's bank details
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/bank - User ID:', req.user._id);
    
    let bank = await Bank.findOne({ userId: req.user._id });
    
    if (!bank) {
      console.log('No bank found for user, returning empty object');
      return res.json({ 
        bank: {
          bankName: '',
          branchName: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          accountType: 'savings',
          upiId: ''
        } 
      });
    }
    
    console.log('Bank found:', bank);
    res.json({ bank });
  } catch (error) {
    console.error('Error in GET /api/bank:', error.message);
    res.status(500).json({ 
      error: 'Server error while fetching bank details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/bank
// @desc    Update user's bank details
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    console.log('PUT /api/bank - User ID:', req.user._id);
    console.log('Request body:', req.body);
    
    const { 
      bankName, 
      branchName, 
      accountNumber, 
      ifscCode, 
      accountHolderName,
      accountType,
      upiId
    } = req.body;
    
    // Validate required fields
    if (!bankName || !branchName || !accountNumber || !ifscCode || !accountHolderName) {
      return res.status(400).json({ 
        error: 'All required fields must be filled' 
      });
    }
    
    // Find and update bank details
    let bank = await Bank.findOne({ userId: req.user._id });
    
    if (!bank) {
      // Create new bank details
      bank = new Bank({
        userId: req.user._id,
        bankName,
        branchName,
        accountNumber,
        ifscCode,
        accountHolderName,
        accountType: accountType || 'savings',
        upiId: upiId || ''
      });
    } else {
      // Update existing bank details
      bank.bankName = bankName;
      bank.branchName = branchName;
      bank.accountNumber = accountNumber;
      bank.ifscCode = ifscCode;
      bank.accountHolderName = accountHolderName;
      bank.accountType = accountType || bank.accountType;
      bank.upiId = upiId || bank.upiId;
      bank.updatedAt = Date.now();
    }
    
    await bank.save();
    
    res.json({
      message: 'Bank details updated successfully',
      bank
    });
  } catch (error) {
    console.error('Error in PUT /api/bank:', error.message);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Bank details already exist for this user' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update bank details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;