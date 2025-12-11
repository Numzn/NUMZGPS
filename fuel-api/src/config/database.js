import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection for fuel management data
const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 3
  }
});

// Test connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [PostgreSQL] Connection established successfully');
    }
    return true;
  } catch (error) {
    console.error('❌ [PostgreSQL] Unable to connect to the database:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        name: error.name,
        parent: error.parent?.message,
        original: error.original?.message
      });
    }
    return false;
  }
};

export default sequelize;











