'use strict';

module.exports = function (sequelize, DataTypes) {
  var Channel = sequelize.define('channel', {
    channelId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    channelName: {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'channels'
  });
  return Channel;
};
