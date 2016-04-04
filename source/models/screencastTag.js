
// @flow

export default function(sequelize: any, DataTypes: any) : any {
  var ScreencastTag = sequelize.define('ScreencastTag', {
    screencastId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    tagId: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        // ScreencastTag.belongsTo(models.Screencast, {
        // })
      }
    }
  })
  return ScreencastTag
}
