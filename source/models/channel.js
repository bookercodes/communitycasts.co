
// @flow

/**
 * Creates and returns a Sequelize channel model. (This function is to be
 * called internally by the sequelize-connect module.)
 *
 * @param sequelize - A Sequelize connection
 * @param DataTypes - A quasi enumeration of SQL data types
 */
const createChannelModel = function (sequelize: any, DataTypes: any) : any {
  const Channel: any = sequelize.define('Channel', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    name: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function (models: any): any {
        Channel.hasMany(models.Screencast)
      }
    }
  })
  return Channel
}

export default createChannelModel
