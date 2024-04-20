const {
    Sequelize,
    DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
    const Payments = sequelize.define("Payments", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
            type: DataTypes.INTEGER,
        },
        updated_by: {
            type: DataTypes.INTEGER,
        }

    });

    return Payments;
}