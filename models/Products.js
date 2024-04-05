const {
    DataTypes,
} = require('sequelize');

module.exports = (sequelize) => {
    const Products = sequelize.define("Products", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                notEmpty: true
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            },
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true,
            },
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.STRING(100000),
            allowNull: false,
            validate: {
                notEmpty: true
            },
        }
    });

    return Products;
}