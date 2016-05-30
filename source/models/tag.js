// @flow

/**
 * Creates and returns a Sequelize tag model. (This function is to be * called
 * internally by the sequelize-connect module.)
 *
 * @param sequelize - A Sequelize connection
 * @param DataTypes - A quasi enumeration of SQL data types
 */
const createTagModel = function (sequelize: any, DataTypes: DataTypes) : any {
  const tag = sequelize.define('tag', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function (models: any): any {
        tag.belongsToMany(models.screencast, {
          through: models.screencastTag,
          foreignKey: 'tagId'
        })
      }
    }
  })
  return tag
}

export default createTagModel
