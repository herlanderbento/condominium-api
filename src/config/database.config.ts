import { registerAs } from '@nestjs/config';
import { Dialect } from 'sequelize';

export default registerAs('database', () => ({
  dialect: 'postgres' as Dialect,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'condominium',
  autoLoadModels: true,
  synchronize: true,
}));
