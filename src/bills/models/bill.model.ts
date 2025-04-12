import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Lot } from '../../lots/models/lots.model';
  
@Table({
  tableName: 'bills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class Bill extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  payer_name: string;

  @ForeignKey(() => Lot)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  lot_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  digitable_line: string;

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

  @BelongsTo(() => Lot)
  lot: Lot;
}