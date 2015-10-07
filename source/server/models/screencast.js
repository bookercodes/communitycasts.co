'use strict';

module.exports = function(sequelize, DataTypes) {
  var Screencast = sequelize.define('Screencast', {
    screencastId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
    },
    durationInSeconds: {
      type: DataTypes.INTEGER(11),
    },
    description: {
      type: DataTypes.STRING,
    },
    submissionDate: {
      type: DataTypes.DATE,
    },
    referralCount: {
      type: DataTypes.INTEGER(11),
    },
    channelId: {
      type: DataTypes.STRING,
    },
    approved: {
      type: DataTypes.BOOLEAN,
    },
    featured: {
      type: DataTypes.BOOLEAN,
    }
  }, {
    tableName: 'screencasts',
    classMethods: {
      associate: function(models) {
        Screencast.belongsTo(models.Channel, {
          foreignKey: 'channelId'
        });
        Screencast.belongsToMany(models.Tag, {
          through: models.ScreencastTag,
          foreignKey: 'screencastId'
        });
      }
    }
  });
  return Screencast;
};
