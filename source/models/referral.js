// @flow

const createReferralModel = function (sequelize: any, DataTypes: DataTypes) : any {
  const referral: any = sequelize.define('referral', {
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
      associate (models) {
        referral.belongsTo(models.screencast, {
          foreignKey: 'screencastId'
        })
      }
    }
  })
  return referral
}

export default createReferralModel
