import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { User } from './User';

export class Store extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public address!: string;
  public ownerId!: number;
  public ratings?: any[];
  public owner?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [20, 60],
          msg: 'Store name must be between 20 and 60 characters.',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'stores_email_unique',
        msg: 'Store email address already in use.',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address.',
        },
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        len: {
          args: [0, 400],
          msg: 'Address cannot exceed 400 characters.',
        },
      },
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        name: 'stores_owner_unique',
        msg: 'This owner already owns a store.',
      },
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'stores',
  }
);

// Establish 1-to-1 association: User (store_owner) has one Store, Store belongs to User
User.hasOne(Store, { foreignKey: 'ownerId', as: 'store', onDelete: 'CASCADE' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
