'use strict';

export default function(sequelize, DataTypes) {
  const Channel = sequelize.define('Channel', {
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
}
