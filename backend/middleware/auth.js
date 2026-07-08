import { supabase, dbMode } from '../config/db.js';
import { dbService } from '../config/dbService.js';

// Middleware to authenticate user session
export async function requireAuth(req, res, next) {
  try {
    let userId = null;
    let userEmail = null;

    if (dbMode === 'supabase') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      userId = user.id;
      userEmail = user.email;
    } else {
      // MOCK DB MODE - check for custom mock headers to simulate users
      const mockUserId = req.headers['x-mock-user-id'] || 'mock-customer-id';
      const profile = await dbService.getProfile(mockUserId);
      if (!profile) {
        return res.status(401).json({ error: 'Mock user session not found' });
      }
      userId = profile.id;
      userEmail = profile.id === 'mock-admin-id' ? 'admin@aurawear.com' : 'customer@aurawear.com';
    }

    // Fetch user profile to get details and roles
    const profile = await dbService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'User profile does not exist' });
    }

    // Attach user profile information to request object
    req.user = {
      id: userId,
      email: userEmail,
      role: profile.role || 'customer',
      firstName: profile.first_name,
      lastName: profile.last_name
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
}

// Middleware to authorize users by specific roles
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to roles: [${allowedRoles.join(', ')}]` });
    }

    next();
  };
}
