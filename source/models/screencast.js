// @flow

'use strict';

module.exports = function(sequelize, DataTypes) {
  var Screencast = sequelize.define('Screencast', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    url: DataTypes.TEXT,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    durationInSeconds: DataTypes.INTEGER,
  });
  return Screencast;
};
