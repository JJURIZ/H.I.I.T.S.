'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class track extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.track.belongsToMany(models.user, { through: "fave" })
    }
  };
  track.init({
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    tempo: DataTypes.FLOAT,
    explicit: DataTypes.BOOLEAN,
    durationMs: DataTypes.INTEGER,
    spotify_id: DataTypes.STRING,
    preview_url: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'track',
  });
  return track;
};