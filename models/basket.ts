/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type NonAttribute,
  type Sequelize
} from 'sequelize'
import { type ProductModel } from './product'

// Coupon usage is enforced to a per-user limit via CouponUsageModel (CWE-799)
export const COUPON_MAX_USES_PER_USER = 1

class Basket extends Model<
InferAttributes<Basket>,
InferCreationAttributes<Basket>
> {
  declare UserId: CreationOptional<number>
  declare id: CreationOptional<number>
  declare coupon: CreationOptional<string> | null
  declare Products?: NonAttribute<ProductModel[]>
}

const BasketModelInit = (sequelize: Sequelize) => {
  Basket.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      coupon: DataTypes.STRING,
      UserId: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'Baskets',
      sequelize
    }
  )
}

export { Basket as BasketModel, BasketModelInit }
