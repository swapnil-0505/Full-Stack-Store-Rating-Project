import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import bcrypt from 'bcryptjs';

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public address!: string;
  public role!: 'admin' | 'user' | 'store_owner';
  public store?: any;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
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
          msg: 'Name must be between 20 and 60 characters.',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address already in use.',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address.',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
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
    role: {
      type: DataTypes.ENUM('admin', 'user', 'store_owner'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeSave: async (user: User) => {
        if (user.changed('password')) {
          const rawPassword = user.password;
          // Validate raw password structure
          if (rawPassword.length < 8 || rawPassword.length > 16) {
            throw new Error('Password must be between 8 and 16 characters.');
          }
          if (!/[A-Z]/.test(rawPassword)) {
            throw new Error('Password must contain at least one uppercase letter.');
          }
          // Match any character that is NOT a letter or number
          const specialCharRegex = /[^a-zA-Z0-9]/;
          if (!specialCharRegex.test(rawPassword)) {
            throw new Error('Password must contain at least one special character.');
          }
          // Hash password
          user.password = await bcrypt.hash(rawPassword, 10);
        }
      },
    },
  }
);
