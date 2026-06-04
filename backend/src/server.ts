import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, sequelize } from './config/db';
import { User } from './models/User';

// Import routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import storeRoutes from './routes/storeRoutes';
import ratingRoutes from './routes/ratingRoutes';
import ownerRoutes from './routes/ownerRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owners', ownerRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Seed admin user
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@storerating.com';
    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator User', // 27 characters (passes len: 20-60)
        email: adminEmail,
        password: 'AdminPass123!', // Passes complexity check (length 13, uppercase, special char)
        address: 'System Administration Headquarters, Suite 101', // Under 400 chars
        role: 'admin',
      });
      console.log('Seed: Default System Administrator user created (admin@storerating.com / AdminPassword123!)');
    }
  } catch (err) {
    console.error('Seed Warning: Could not create default admin:', err);
  }
};

const startServer = async () => {
  try {
    // 1. Check and create database, then authenticate
    await initDb();

    // 2. Sync all models with database
    // Using alter: true to make development updates easier without data loss
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized.');

    // 3. Seed initial admin
    await seedAdmin();

    // 4. Listen
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
