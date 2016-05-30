// @flow

export default (connection: any) => {
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
