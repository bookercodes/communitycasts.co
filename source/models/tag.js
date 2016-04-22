// @flow

/**
 * Creates and returns a Sequelize tag model. (This function is to be * called
 * internally by the sequelize-connect module.)
 *
 * @param sequelize - A Sequelize connection
 * @param DataTypes - A quasi enumeration of SQL data types
 */
const createTagModel = function (sequelize: any, DataTypes: any) : any {
  const Tag = sequelize.define('Tag', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function (models: any): any {
        Tag.belongsToMany(models.Screencast, {
          through: models.ScreencastTag,
          foreignKey: 'tagId'
        })
      }
    }
  })
  return Tag
}

export default createTagModel
