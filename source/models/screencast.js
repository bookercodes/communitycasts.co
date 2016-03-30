'use strict';

module.exports = function(sequelize, DataTypes) {
  var Screencast = sequelize.define('Screencast', {
    url: DataTypes.TEXT
  });
  return Screencast;
};
