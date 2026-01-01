require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Bank = require('../models/Bank');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Company.deleteMany({});
    await Bank.deleteMany({});
    
    console.log('Seeding demo user...');
    
    // Create demo user
    const user = new User({
      email: 'demo@gstbilling.com',
      password: 'demo123',
      role: 'admin'
    });
    await user.save();
    
    // Create demo company
    const company = new Company({
      userId: user._id,
      name: 'Demo Enterprises Pvt. Ltd.',
      gstNumber: '27AABCD1234A1Z5',
      address: {
        street: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      contact: {
        email: 'contact@demoenterprises.com',
        phone: '+91 9876543210'
      }
    });
    await company.save();
    
    // Update user with company reference
    user.company = company._id;
    await user.save();
    
    // Create demo bank details
    const bank = new Bank({
      userId: user._id,
      bankName: 'State Bank of India',
      branchName: 'Main Branch, Mumbai',
      accountNumber: '123456789012',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Demo Enterprises Pvt. Ltd.'
    });
    await bank.save();
    
    console.log('Database seeded successfully!');
    console.log('Demo credentials:');
    console.log('Email: demo@gstbilling.com');
    console.log('Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();