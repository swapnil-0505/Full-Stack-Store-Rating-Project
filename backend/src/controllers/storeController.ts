import { Response } from 'express';
import { Op } from 'sequelize';
import { Store } from '../models/Store';
import { Rating } from '../models/Rating';
import { AuthRequest } from '../middleware/auth';

export const listStoresForUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, sortBy, order } = req.query;
    const userId = req.user?.id;

    const whereClause: any = {};
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (address) {
      whereClause.address = { [Op.like]: `%${address}%` };
    }

    let sortColumn: any = 'name';
    let sortOrder: any = 'ASC';
    if (sortBy && ['name', 'address'].includes(sortBy as string)) {
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
          attributes: ['rating', 'userId'],
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
          
      const userRatingObj = ratings.find((r: any) => r.userId === userId);
      const userRating = userRatingObj ? userRatingObj.rating : null;

      storeJson.averageRating = parseFloat(avgRating.toFixed(2));
      storeJson.ratingsCount = ratings.length;
      storeJson.userRating = userRating;
      
      delete storeJson.ratings;
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
