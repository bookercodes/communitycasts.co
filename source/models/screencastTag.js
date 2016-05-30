
// @flow

/**
 * Creates and returns a Sequelize screencast tag model. (This function is to be
 * called internally by the sequelize-connect module.)
 *
 * @param sequelize - A Sequelize connection
 * @param DataTypes - A quasi enumeration of SQL data types
 */
const createScreencastTagModel = function (sequelize: any, DataTypes: DataTypes) : any {
  const screencastTag: any = sequelize.define('screencastTag', {
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

export default createScreencastTagModel
