const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// User model (inline to avoid circular dependencies)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  phone: String,
  city: String,
  address: String,
  profileImage: String,
  isSuspended: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

const adminData = {
  name: 'Admin User',
  email: 'admin@ethiomarket.com',
  password: 'Admin@123456',
  role: 'admin',
  phone: '+251900000000',
  city: 'Addis Ababa',
  address: 'EthioMarket Headquarters'
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', adminData.email);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated user role to admin.');
      }
    } else {
      // Create admin user
      const admin = await User.create(adminData);
      console.log('========================================');
      console.log('  Admin user created successfully!');
      console.log('========================================');
      console.log('  Email:    admin@ethiomarket.com');
      console.log('  Password: Admin@123456');
      console.log('========================================');
      console.log('  Please change the password after login!');
      console.log('========================================');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();