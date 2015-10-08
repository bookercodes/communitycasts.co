'use strict';

export default function(sequelize, DataTypes) {
  const Referral = sequelize.define('Referral', {
    screencastId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    refereeRemoteAddress: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    tableName: 'referrals',
    classMethods: {
      assocaite: function(models) {
        Referral.belongsTo(models.Screencast, {
          foreignKey: 'screencastId'
        });
      }
    }
  });
  return Referral;
}
