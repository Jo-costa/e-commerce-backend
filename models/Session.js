const {
    Sequelize,
    DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
    const Session = sequelize.define("Session", {
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
        session_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            },
        }
    });

    return Session;
}