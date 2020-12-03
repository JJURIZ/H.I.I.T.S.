'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.removeColumn('faves', 'trackId', Sequelize.INTEGER);
  },
  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumns('faves', 'trackId');
  }
}; 

