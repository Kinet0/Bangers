import express from 'express';
import { supabase, dbMode } from '../config/db.js';
import { dbService } from '../config/dbService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (dbMode === 'supabase') {
      // 1. Sign up user inside Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError || !authData.user) {
        return res.status(400).json({ error: authError?.message || 'Sign up failed' });
      }

      // 2. Create local profile matching auth user ID
      const profile = await dbService.createProfile({
        id: authData.user.id,
        first_name,
        last_name,
        phone,
        role: 'customer' // Defaults to customer
      });

      res.status(201).json({
        message: 'Registration successful',
        session: authData.session,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name
        }
      });
    } else {
      // MOCK DB MODE
      // Simulate unique user ID
      const mockUserId = 'mock-user-' + Math.random().toString(36).substr(2, 9);
      
      const profile = await dbService.createProfile({
        id: mockUserId,
        first_name,
        last_name,
        phone,
        role: 'customer'
      });

      res.status(201).json({
        message: 'Registration successful (MOCK MODE)',
        session: {
          access_token: 'mock-jwt-token-' + mockUserId,
          expires_in: 3600
        },
        user: {
          id: mockUserId,
          email: email,
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal registration error' });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (dbMode === 'supabase') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.user) {
        return res.status(401).json({ error: error?.message || 'Invalid login credentials' });
      }

      const profile = await dbService.getProfile(data.user.id);

      res.json({
        message: 'Login successful',
        session: data.session,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'customer',
          firstName: profile?.first_name,
          lastName: profile?.last_name
        }
      });
    } else {
      // MOCK DB MODE
      let mockUserId = 'mock-customer-id';
      let role = 'customer';

      // Detect admin login by email for simple testing
      if (email.toLowerCase().includes('admin')) {
        mockUserId = 'mock-admin-id';
        role = 'admin';
      }

      const profile = await dbService.getProfile(mockUserId);

      res.json({
        message: 'Login successful (MOCK MODE)',
        session: {
          access_token: 'mock-jwt-token-' + mockUserId,
          expires_in: 3600
        },
        user: {
          id: mockUserId,
          email: email,
          role: role,
          firstName: profile?.first_name || 'Mock',
          lastName: profile?.last_name || 'User'
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server login error' });
  }
});

// GET /api/auth/staff - List staff accounts (admin only)
router.get('/staff', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const profiles = await dbService.getProfiles();
    const staffProfiles = profiles.filter(profile => profile.role && ['manager', 'admin'].includes(profile.role));
    res.json(staffProfiles);
  } catch (error) {
    console.error('Staff listing error:', error);
    res.status(500).json({ error: 'Failed to fetch staff accounts' });
  }
});

// POST /api/auth/staff - Create a staff account (admin only)
router.post('/staff', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role = 'manager' } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    const normalizedRole = role === 'admin' ? 'admin' : 'manager';

    if (dbMode === 'supabase') {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

      if (authError || !authData.user) {
        return res.status(400).json({ error: authError?.message || 'Staff sign-up failed' });
      }

      const profile = await dbService.createProfile({
        id: authData.user.id,
        first_name,
        last_name,
        phone,
        role: normalizedRole
      });

      res.status(201).json({
        message: 'Staff account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name
        }
      });
    } else {
      const mockUserId = 'mock-staff-' + Math.random().toString(36).substr(2, 9);
      const profile = await dbService.createProfile({
        id: mockUserId,
        first_name,
        last_name,
        phone,
        role: normalizedRole
      });

      res.status(201).json({
        message: 'Staff account created successfully (MOCK MODE)',
        user: {
          id: mockUserId,
          email,
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name
        }
      });
    }
  } catch (error) {
    console.error('Staff account creation error:', error);
    res.status(500).json({ error: 'Failed to create staff account' });
  }
});

// GET /api/auth/me - Retrieve current logged-in profile
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile - Update profile details
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { first_name, last_name, phone, address_line1, address_line2, city, state, postal_code, country } = req.body;

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (phone !== undefined) updateData.phone = phone;
    if (address_line1 !== undefined) updateData.address_line1 = address_line1;
    if (address_line2 !== undefined) updateData.address_line2 = address_line2;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (country !== undefined) updateData.country = country;

    const updatedProfile = await dbService.updateProfile(req.user.id, updateData);
    
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
