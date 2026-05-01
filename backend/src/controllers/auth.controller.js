import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { success, error } from '../utils/response.js';
import logger from '../utils/logger.js';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json(error('Username and password required', 400));
    }

    // Query based on role
    let table = 'guru';
    if (role === 'siswa') table = 'siswa';
    if (role === 'wali') table = 'guru';
    if (role === 'admin') table = 'guru';

    const result = await query(
      `SELECT id, username, password, nama, role FROM ${table} WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      logger.warn(`Login failed: User not found - ${username}`);
      return res.status(401).json(error('Invalid credentials', 401));
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password - ${username}`);
      return res.status(401).json(error('Invalid credentials', 401));
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(403).json(error('Role mismatch', 403));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update last login
    await query(
      `UPDATE ${table} SET last_login = NOW() WHERE id = $1`,
      [user.id]
    );

    logger.info(`User logged in: ${username} (${user.role})`);

    res.json(
      success(
        {
          id: user.id,
          username: user.username,
          nama: user.nama,
          role: user.role,
          accessToken,
          refreshToken,
        },
        'Login successful'
      )
    );
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json(error('Login failed'));
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json(error('Refresh token required', 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
    const result = await query(
      'SELECT id, username, nama, role FROM guru WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json(error('User not found', 401));
    }

    const user = result.rows[0];
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json(
      success(
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        'Token refreshed'
      )
    );
  } catch (err) {
    logger.error('Refresh token error:', err);
    res.status(401).json(error('Invalid refresh token'));
  }
};

export const logout = (req, res) => {
  // In stateless JWT, logout is typically handled on client side
  // You can optionally add token to blacklist in Redis
  logger.info(`User logged out: ${req.user.username}`);
  res.json(success(null, 'Logout successful'));
};

export const profile = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, nama, role, created_at FROM guru WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(error('User not found', 404));
    }

    res.json(success(result.rows[0], 'Profile retrieved'));
  } catch (err) {
    logger.error('Get profile error:', err);
    res.status(500).json(error('Failed to get profile'));
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json(error('Old and new passwords required', 400));
    }

    if (newPassword.length < 8) {
      return res.status(400).json(error('New password must be at least 8 characters', 400));
    }

    // Get user
    const result = await query(
      'SELECT password FROM guru WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(error('User not found', 404));
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!isValid) {
      return res.status(401).json(error('Invalid old password', 401));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE guru SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    logger.info(`Password changed for user: ${req.user.username}`);
    res.json(success(null, 'Password changed successfully'));
  } catch (err) {
    logger.error('Change password error:', err);
    res.status(500).json(error('Failed to change password'));
  }
};
