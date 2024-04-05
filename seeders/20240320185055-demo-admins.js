'use strict';
const bcrypt = require('bcrypt')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('admin123', salt)
    const hashedPassword1 = await bcrypt.hash('test123', salt)
    await queryInterface.bulkInsert('admins', [{
        name: "admin",
        email: "admin@admin.com",
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

    ])

    await queryInterface.bulkInsert('admins', [{
        name: "admin1",
        email: "test@test.com",
        password: hashedPassword1,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

    ])
  },



  // async down(queryInterface, Sequelize) {
  //   /**
  //    * Add commands to revert seed here.
  //    *
  //    * Example:
  //    * await queryInterface.bulkDelete('People', null, {});
  //    */
  // }

};