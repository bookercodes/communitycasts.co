'use strict';

module.exports = function(sequelize, DataTypes) {
  var Referral = sequelize.define('Referral', {
    screencastId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    refereeRemoteAddress: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    classMethods: {
      assocaite: function(models) {
        Referral.belongsTo(models.Screencast, {
          foreignKey: 'screencastId'
        });
      }
    }
  });
  return Referral;
};
