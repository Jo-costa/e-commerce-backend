const {
    Sequelize,
    DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
    const Cart = sequelize.define("Cart", {
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
            validate: {
                notEmpty: true
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            },
        },
        quantity: {
            type: DataTypes.INTEGER,

        },
        name: {
            type: DataTypes.STRING, // Assuming name is a string
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true,
            },
        },
        img_url: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            },
        }
    });

    return Cart;
}