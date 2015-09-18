'use strict';
module.exports = function (sequelize, DataTypes) {
  var ScreencastTag = sequelize.define('screencastTag', {
    screencastId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    tagName: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    tableName: 'screencastTags'
  });
  return ScreencastTag;
};
