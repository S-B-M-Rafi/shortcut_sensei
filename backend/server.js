const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('common'));

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// MongoDB Connection (commented out for now)
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error(err));

// Passport configuration (commented out for now)
// app.use(passport.initialize());

// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//     profileFields: ['id', 'displayName', 'emails']
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//     //   return cb(err, user);
//     // });
//     return cb(null, profile);
//   }
// ));

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_CALLBACK_URL
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     // User.findOrCreate({ googleId: profile.id }, function (err, user) {
//     //   return cb(err, user);
//     // });
//     return cb(null, profile);
//   }
// ));

// Basic Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// User Registration (example, needs actual user model and logic)
app.post('/api/register',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      // Replace with actual user creation logic
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Save user to DB
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// User Login (example, needs actual user model and logic)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Replace with actual user verification logic
    // const user = await User.findOne({ email });
    // if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: 'user_id' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth with Facebook (commented out for now)
// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// app.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

// Auth with Google (commented out for now)
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', [
  body('email').isEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address',
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    // Email options for the thank you message
    const mailOptions = {
      from: `"Shortcut Sensei" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Shortcut Sensei Newsletter! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #06a3be; margin: 0; font-size: 28px;">Shortcut Sensei</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Master Your Productivity</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Thank you for subscribing! 🙏</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Welcome to the Shortcut Sensei community! We're excited to have you on board.
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              You'll now receive:
            </p>
            
            <ul style="color: #555; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>🚀 Latest productivity tips and keyboard shortcuts</li>
              <li>💡 Weekly insights to boost your workflow</li>
              <li>🔥 Exclusive content and early access to new features</li>
              <li>📱 Application-specific shortcut guides</li>
            </ul>
            
            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="color: #06a3be; font-weight: bold; margin: 0 0 10px 0;">Pro Tip:</p>
              <p style="color: #555; margin: 0; font-size: 14px;">
                Start exploring our blog section to discover shortcuts for your favorite applications!
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Happy shortcutting! ⌨️
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Shortcut Sensei Team
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              You received this email because you subscribed to Shortcut Sensei newsletter.
            </p>
          </div>
        </div>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Thank you for subscribing! Please check your email for a confirmation message.'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, something went wrong. Please try again later.'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


