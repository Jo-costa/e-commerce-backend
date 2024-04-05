const {
    DataTypes
} = require('sequelize');


module.exports = (sequelize) => {
    const Inventory = sequelize.define("Inventory", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                notEmpty: true
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,

        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            },
        },
    });



    return Inventory;
}