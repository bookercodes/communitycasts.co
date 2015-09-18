'use strict';

module.exports = function (sequelize, DataTypes) {
  var Referral = sequelize.define('referrals', {
    screencastId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    refereeRemoteAddress: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  });
  return Referral;
};
