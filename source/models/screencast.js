// @flow

/**
 * Creates and returns a Sequelize screencast model. (This function is to be
 * called internally by the sequelize-connect module.)
 *
 * @param sequelize - A Sequelize connection
 * @param DataTypes - A quasi enumeration of SQL data types
 */
const createScreencastModel = function (sequelize: any, DataTypes: any) : any {
  const screencast: any = sequelize.define('screencast', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    url: DataTypes.TEXT,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    durationInSeconds: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models: any): any {
        screencast.belongsTo(models.channel)
        screencast.belongsToMany(models.tag, {
          through: models.screencastTag,
          foreignKey: 'screencastId'
        })
      }
    }
  })
  return screencast
}

export default createScreencastModel
