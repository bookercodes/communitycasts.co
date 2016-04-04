// @flow

export default function(sequelize: any, DataTypes: any) : any {
  var Tag = sequelize.define('Tag', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Tag.belongsToMany(models.Screencast, {
          through: models.ScreencastTag,
          foreignKey: 'tagId'
        })
      }
    }
  })
  return Tag
}
