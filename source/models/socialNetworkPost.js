// @flow

export default (connection: any, dataTypes: any) => {
  const socialNetworkPost = connection.define('socialNetworkPost', {
  }, {
    classMethods: {
      associate (models) {
        socialNetworkPost.belongsTo(models.screencast)
      }
    }
  })
  return socialNetworkPost
}
