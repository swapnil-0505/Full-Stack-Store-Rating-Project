import { Response } from 'express';
import { Store } from '../models/Store';
import { Rating } from '../models/Rating';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getOwnerStoreStats = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const store = await Store.findOne({
      where: { ownerId },
      include: [
        {
          model: Rating,
          as: 'ratings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email', 'address'],
            },
          ],
        },
      ],
    });

    if (!store) {
      return res.status(404).json({ error: 'No store associated with this store owner account.' });
    }

    const ratings = store.ratings || [];
    const totalRatings = ratings.length;
    const avgRating =
      totalRatings > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings
        : 0;

    const reviews = ratings.map((r: any) => ({
      ratingId: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: {
        name: r.user?.name || 'Anonymous User',
        email: r.user?.email || 'N/A',
        address: r.user?.address || 'N/A',
      },
    }));

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalRatings,
      reviews,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error fetching store metrics.' });
  }
};
