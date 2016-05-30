// @flow

export default function createSocialNetworkPostModel (connection: any) {
  const socialNetworkPost = connection.define('socialNetworkPost', {
  }, {
    classMethods: {
      associate (models): void {
        socialNetworkPost.belongsTo(models.screencast)
      }
    }
  })
  return socialNetworkPost
}
