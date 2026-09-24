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

class Delivery extends Model<
InferAttributes<Delivery>,
InferCreationAttributes<Delivery>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare price: number
  declare deluxePrice: number
  declare eta: number
  declare icon: string
}

const DeliveryModelInit = (sequelize: Sequelize) => {
  Delivery.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      price: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0
        },
        set (value: number) {
          this.setDataValue('price', Math.max(0, value))
        }
      },
      deluxePrice: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0
        },
        set (value: number) {
          this.setDataValue('deluxePrice', Math.max(0, value))
        }
      },
      eta: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0
        }
      },
      icon: DataTypes.STRING
    },
    {
      tableName: 'Deliveries',
      sequelize
    }
  )
}

export { Delivery as DeliveryModel, DeliveryModelInit }
