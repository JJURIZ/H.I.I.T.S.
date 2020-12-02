'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('tracks', 'preview_url', Sequelize.STRING);
  },
  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumns('tracks', 'preview_url');
  }
}; 

