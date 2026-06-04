import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { User } from './User';
import { Store } from './Store';

export class Rating extends Model {
  public id!: number;
  public userId!: number;
  public storeId!: number;
  public rating!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Store,
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Rating must be at least 1.',
        },
        max: {
          args: [5],
          msg: 'Rating cannot exceed 5.',
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'ratings',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'storeId'],
        name: 'ratings_user_store_unique',
      },
    ],
  }
);

// Associations
Store.hasMany(Rating, { foreignKey: 'storeId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
