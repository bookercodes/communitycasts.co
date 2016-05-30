// @flow

export default function createReferralModel (connection: any, DataTypes: DataTypes) : any {
  const referral = connection.define('referral', {
    screencastId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    refereeIp: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate (models): void {
        referral.belongsTo(models.screencast, {
          foreignKey: 'screencastId'
        })
      }
    }
  })
  return referral
}
