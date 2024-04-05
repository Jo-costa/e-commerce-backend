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
    const hashedPassword = await bcrypt.hash('test123', salt)
    const hashedPassword1 = await bcrypt.hash('test123', salt)
    await queryInterface.bulkInsert('users', [{
        name: "user1",
        email: "user1@user1.com",
        password: hashedPassword,
        isUser: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

    ])

    await queryInterface.bulkInsert('users', [{
        name: "user2",
        email: "user2@user2.com",
        password: hashedPassword1,
        isUser: true,
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