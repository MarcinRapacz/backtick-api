import { Sequelize } from 'sequelize';

const {
  SEQUELIZE_DATABASE,
  SEQUELIZE_DIALECT,
  SEQUELIZE_HOST,
  SEQUELIZE_PASSWORD,
  SEQUELIZE_USERNAME,
} = process.env;

const sequelize = new Sequelize(
  SEQUELIZE_DATABASE,
  SEQUELIZE_USERNAME,
  SEQUELIZE_PASSWORD,
  {
    host: SEQUELIZE_HOST,
    dialect: SEQUELIZE_DIALECT,
  }
);

export { sequelize };
