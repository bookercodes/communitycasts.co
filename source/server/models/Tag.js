'use strict';

module.exports = function (sequelize, DataTypes) {
  var Tag = sequelize.define('tag', {
    tagName: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    tableName: 'tags'
  });
  return Tag;
};
