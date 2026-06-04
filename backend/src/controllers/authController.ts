import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'store_rating_app_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const validatePasswordFormat = (password: string): string | null => {
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address } = req.body;

    // Field-level validations
    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({ error: 'Name must be between 20 and 60 characters.' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Must be a valid email address.' });
    }
    if (!address || address.trim().length > 400) {
      return res.status(400).json({ error: 'Address cannot exceed 400 characters.' });
    }
    
    const passwordError = validatePasswordFormat(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email address already in use.' });
    }

    // Create user (defaults to 'user' role)
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      address: address.trim(),
      role: 'user'
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as any
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as any
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error during login.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const passwordError = validatePasswordFormat(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Set new password (the model hook will hash it automatically on save)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error updating password.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error fetching session profile.' });
  }
};
