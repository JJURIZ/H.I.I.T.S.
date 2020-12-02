'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('tracks', 'spotify_id', Sequelize.STRING);
  },
  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumns('tracks', 'spotify_id');
  }
};
