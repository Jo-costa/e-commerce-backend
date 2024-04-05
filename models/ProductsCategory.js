const {
    Sequelize,
    DataTypes
} = require('sequelize');

const Products = require('./Products')

module.exports = (sequelize) => {
    const ProductsCategory = sequelize.define("Products_category", {
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
        general_info: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        specification: {
            type: DataTypes.STRING,
        },
    });



    return ProductsCategory;
}