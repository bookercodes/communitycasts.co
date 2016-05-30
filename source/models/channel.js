// @flow

export default function createChannelModel (connection: any, DataTypes: DataTypes) : any {
  const channel = connection.define('channel', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    name: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function (models): void {
        channel.hasMany(models.screencast)
      }
    }
  })
  return channel
}
