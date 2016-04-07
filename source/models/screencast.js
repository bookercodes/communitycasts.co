// @flow

/**
 * Creates and returns a Sequelize screencast model. (This function is to be
 * called internally by the sequelize-connect module.)
 *
 * @param sequelize - A Sequelize connection
 * @param DataTypes - A quasi enumeration of SQL data types
 */
const createScreencastModel = function(sequelize: any, DataTypes: any) : any {
  const Screencast: any = sequelize.define('Screencast', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    url: DataTypes.TEXT,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    durationInSeconds: DataTypes.INTEGER,
  }, {
    classMethods: {
      associate: function(models: any): any {
        Screencast.belongsToMany(models.Tag, {
          through: models.ScreencastTag,
          foreignKey: 'screencastId'
        })
      }
    }
  });
  return Screencast;
};


export default createScreencastModel
