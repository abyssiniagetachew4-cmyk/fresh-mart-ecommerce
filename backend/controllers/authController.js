const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    { expiresIn: '7d' }
  );
};

/* =========================
   REGISTER (CUSTOMER ONLY)
========================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Registration attempt:', { name, email });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // 🚨 FORCE ROLE TO CUSTOMER
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: req.body.role || 'customer'
    });

    const token = generateToken(user);

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Registration successful for:', email);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ REGISTER ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

/* =========================
   LOGIN (CUSTOMER + ADMIN)
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt for email:', email);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Try to find user WITH password explicitly selected
    const user = await User
      .findOne({ email: email.toLowerCase() })
      .select('+password');

    console.log('🔍 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('🔍 User details:', {
      id: user._id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    // Compare password
    console.log('🔍 Comparing password...');
    const isMatch = await user.comparePassword(password);
    console.log('🔍 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Login successful for:', email, 'Role:', user.role);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR DETAILS:', error);
    console.error('❌ Error stack:', error.stack);

    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
};

/* =========================
   ADMIN ONLY – GET USERS
========================= */
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access only'
      });
    }

    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('❌ GET USERS ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};