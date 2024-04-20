const {
    Sequelize,
    DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
    const OrderItems = sequelize.define("OrderItems", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                notEmpty: true
            },
        },
        url_id: {
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
        quantity: {
            type: DataTypes.INTEGER,
        }
    });

    return OrderItems;
}