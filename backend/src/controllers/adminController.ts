import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { Rating } from '../models/Rating';
import { sequelize } from '../config/db';

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

export const getStats = async (req: Request, res: Response) => {
  try {
    const userCount = await User.count();
    const storeCount = await Store.count();
    const ratingCount = await Rating.count();

    return res.status(200).json({
      users: userCount,
      stores: storeCount,
      ratings: ratingCount,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error fetching stats.' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or user.' });
    }

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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email address already in use.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      address: address.trim(),
      role,
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error creating user.' });
  }
};

export const createStore = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      storeName,
      storeEmail,
      storeAddress,
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerAddress,
    } = req.body;

    // Validate Store Inputs
    if (!storeName || storeName.trim().length < 20 || storeName.trim().length > 60) {
      return res.status(400).json({ error: 'Store name must be between 20 and 60 characters.' });
    }
    if (!storeEmail || !/\S+@\S+\.\S+/.test(storeEmail)) {
      return res.status(400).json({ error: 'Store email must be a valid email address.' });
    }
    if (!storeAddress || storeAddress.trim().length > 400) {
      return res.status(400).json({ error: 'Store address cannot exceed 400 characters.' });
    }

    // Validate Owner Inputs
    if (!ownerName || ownerName.trim().length < 20 || ownerName.trim().length > 60) {
      return res.status(400).json({ error: 'Owner name must be between 20 and 60 characters.' });
    }
    if (!ownerEmail || !/\S+@\S+\.\S+/.test(ownerEmail)) {
      return res.status(400).json({ error: 'Owner email must be a valid email address.' });
    }
    if (!ownerAddress || ownerAddress.trim().length > 400) {
      return res.status(400).json({ error: 'Owner address cannot exceed 400 characters.' });
    }
    const passwordError = validatePasswordFormat(ownerPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check availability
    const existingUser = await User.findOne({ where: { email: ownerEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'Owner email is already in use.' });
    }
    const existingStore = await Store.findOne({ where: { email: storeEmail } });
    if (existingStore) {
      return res.status(400).json({ error: 'Store email is already in use.' });
    }

    // Create Owner User
    const owner = await User.create(
      {
        name: ownerName.trim(),
        email: ownerEmail.trim().toLowerCase(),
        password: ownerPassword,
        address: ownerAddress.trim(),
        role: 'store_owner',
      },
      { transaction }
    );

    // Create Store
    const store = await Store.create(
      {
        name: storeName.trim(),
        email: storeEmail.trim().toLowerCase(),
        address: storeAddress.trim(),
        ownerId: owner.id,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: 'Store and Owner created successfully.',
      store,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      },
    });
  } catch (error: any) {
    await transaction.rollback();
    return res.status(500).json({ error: error.message || 'Internal server error creating store.' });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;

    const whereClause: any = {};
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [Op.like]: `%${address}%` };
    }
    if (role) {
      whereClause.role = role;
    }

    // Determine sorting
    let sortColumn: any = 'name';
    let sortOrder: any = 'ASC';
    if (sortBy && ['name', 'email', 'address', 'role'].includes(sortBy as string)) {
      sortColumn = sortBy;
    }
    if (order && ['ASC', 'DESC'].includes((order as string).toUpperCase())) {
      sortOrder = (order as string).toUpperCase();
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [[sortColumn, sortOrder]],
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating'],
            },
          ],
        },
      ],
    });

    const formattedUsers = users.map((user: any) => {
      const userJson = user.toJSON();
      if (userJson.role === 'store_owner' && userJson.store) {
        const ratings = userJson.store.ratings || [];
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
            : 0;
        userJson.storeRating = parseFloat(avgRating.toFixed(2));
      } else {
        userJson.storeRating = null;
      }
      return userJson;
    });

    return res.status(200).json(formattedUsers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error listing users.' });
  }
};

export const listStores = async (req: Request, res: Response) => {
  try {
    const { name, email, address, sortBy, order } = req.query;

    const whereClause: any = {};
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [Op.like]: `%${address}%` };
    }

    let sortColumn: any = 'name';
    let sortOrder: any = 'ASC';
    if (sortBy && ['name', 'email', 'address'].includes(sortBy as string)) {
      sortColumn = sortBy;
    }
    if (order && ['ASC', 'DESC'].includes((order as string).toUpperCase())) {
      sortOrder = (order as string).toUpperCase();
    }

    const stores = await Store.findAll({
      where: whereClause,
      order: sortColumn === 'rating' ? undefined : [[sortColumn, sortOrder]],
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['rating'],
        },
      ],
    });

    const formattedStores = stores.map((store: any) => {
      const storeJson = store.toJSON();
      const ratings = storeJson.ratings || [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
          : 0;
      storeJson.averageRating = parseFloat(avgRating.toFixed(2));
      storeJson.ratingsCount = ratings.length;
      return storeJson;
    });

    if (sortBy === 'rating') {
      formattedStores.sort((a, b) => {
        if (sortOrder === 'ASC') {
          return a.averageRating - b.averageRating;
        } else {
          return b.averageRating - a.averageRating;
        }
      });
    }

    return res.status(200).json(formattedStores);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error listing stores.' });
  }
};
