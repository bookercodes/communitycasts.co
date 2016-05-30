
// @flow

const createChannelModel = function (sequelize: any, DataTypes: DataTypes) : any {
  const channel: any = sequelize.define('channel', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    name: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function (models: any): any {
        channel.hasMany(models.screencast)
      }
    }
  })
  return channel
}

export default createChannelModel
