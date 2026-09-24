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
  type Sequelize
} from 'sequelize'

export const MAX_COUPON_USES_PER_USER = 1

class CouponUsage extends Model<
InferAttributes<CouponUsage>,
InferCreationAttributes<CouponUsage>
> {
  declare id: CreationOptional<number>
  declare UserId: number
  declare coupon: string
}

const CouponUsageModelInit = (sequelize: Sequelize) => {
  CouponUsage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      coupon: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'CouponUsages',
      sequelize,
      indexes: [
        {
          unique: true,
          fields: ['UserId', 'coupon']
        }
      ]
    }
  )
}

export { CouponUsage as CouponUsageModel, CouponUsageModelInit }
