'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('faves', 'spotify_id', Sequelize.STRING);
  },
  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumns('faves', 'spotify_id');
  }
}; 
