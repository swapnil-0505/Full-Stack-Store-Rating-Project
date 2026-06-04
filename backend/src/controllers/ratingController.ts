import { Response } from 'express';
import { Rating } from '../models/Rating';
import { Store } from '../models/Store';
import { AuthRequest } from '../middleware/auth';

export const submitRating = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!storeId || rating === undefined) {
      return res.status(400).json({ error: 'Store ID and rating are required.' });
    }

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    const existingRating = await Rating.findOne({ where: { userId, storeId } });
    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this store.' });
    }

    const newRating = await Rating.create({
      userId,
      storeId,
      rating: ratingVal,
    });

    return res.status(201).json({
      message: 'Rating submitted successfully.',
      rating: newRating,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error submitting rating.' });
  }
};

export const modifyRating = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!storeId || rating === undefined) {
      return res.status(400).json({ error: 'Store ID and rating are required.' });
    }

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const existingRating = await Rating.findOne({ where: { userId, storeId } });
    if (!existingRating) {
      return res.status(404).json({ error: 'Rating not found.' });
    }

    existingRating.rating = ratingVal;
    await existingRating.save();

    return res.status(200).json({
      message: 'Rating modified successfully.',
      rating: existingRating,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error modifying rating.' });
  }
};
export const deleteRating = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const existingRating = await Rating.findOne({ where: { userId, storeId } });
    if (!existingRating) {
      return res.status(404).json({ error: 'Rating not found.' });
    }

    await existingRating.destroy();
    return res.status(200).json({ message: 'Rating deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error deleting rating.' });
  }
};
