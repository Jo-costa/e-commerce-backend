const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
    const Images = sequelize.define("Images", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                notEmpty: true
            },
        },
        img_url: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,

        }
    });



    return Images;
}