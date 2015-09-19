'use strict';

module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define('Tag', {
    tagName: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    tableName: 'tags',
    classMethods: {
      associate: function(models) {
        Tag.belongsToMany(models.Screencast, {
          through: models.ScreencastTag,
          foreignKey: 'tagName'
        });
      }
    }
  });
  return Tag;
};
