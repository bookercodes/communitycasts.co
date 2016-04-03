// @flow

export default function(sequelize: any, DataTypes: any) : any {
  var Screencast = sequelize.define('Screencast', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    url: DataTypes.TEXT,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    durationInSeconds: DataTypes.INTEGER,
  });
  return Screencast;
};
