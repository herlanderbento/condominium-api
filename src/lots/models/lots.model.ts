import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Bill } from '../../bills/models/bill.model';

@Table({
  tableName: 'lots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class Lot extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @HasMany(() => Bill)
  bills: Bill[];
}