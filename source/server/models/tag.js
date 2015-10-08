'use strict';

export default function(sequelize, DataTypes) {
  const Tag = sequelize.define('Tag', {
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
}
