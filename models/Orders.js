const {
    Sequelize,
    DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
    const Orders = sequelize.define("Orders", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                notEmpty: true
            },
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            },
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            },
        },
        payment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            },
        },
        status: {
            type: DataTypes.STRING,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true,
            },
        },
        created_by: {
            type: DataTypes.STRING,
        },
        updated_by: {
            type: DataTypes.STRING,
        }

    });

    return Orders;
}