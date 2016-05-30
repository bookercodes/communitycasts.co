// @flow

export default function createTagModel (connection: any, DataTypes: DataTypes) : any {
  const tag = connection.define('tag', {
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
