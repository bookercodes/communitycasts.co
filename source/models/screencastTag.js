
// @flow

export default function createScreencastTagModel (connection: any, DataTypes: DataTypes) : any {
  const screencastTag = connection.define('screencastTag', {
    screencastId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    tagId: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  })
  return screencastTag
}
