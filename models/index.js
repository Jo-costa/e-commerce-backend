'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const User = require('./User.js')(sequelize);
const Wishlist = require('./Wishlist.js')(sequelize);
const Session = require('./Session.js')(sequelize);
const Cart = require('./Cart.js')(sequelize);
const Products = require('./Products.js')(sequelize);
const Inventory = require('./Inventory.js')(sequelize);
const Images = require('./Images.js')(sequelize);

User.hasOne(Wishlist, {
  foreignKey: 'user_id'
})
Wishlist.belongsTo(User, {
  foreignKey: 'user_id'
})

Products.hasMany(Wishlist, {
  foreignKey: 'product_id'
})
Wishlist.hasMany(Products, {
  foreignKey: 'product_id'
})

User.hasOne(Cart, {
  foreignKey: 'user_id'
})

Cart.belongsTo(User, {
  foreignKey: 'user_id'
})

Products.hasMany(Cart, {
  foreignKey: 'product_id',
});

Cart.belongsTo(Products, {
  foreignKey: 'product_id'
})


User.hasOne(Session, {
  foreignKey: 'user_id'
})

Session.belongsTo(User, {
  foreignKey: 'user_id'
})

Products.hasOne(Inventory, {
  foreignKey: "product_id",
});
Inventory.belongsTo(Products, {
  foreignKey: "product_id"
});

Products.hasMany(Images, {
  foreignKey: "product_id"
})
Images.belongsTo(Products, {
  foreignKey: "product_id"
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;