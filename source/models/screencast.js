// @flow
import db from 'sequelize-connect'

const createScreencastModel = (sequelize: any, DataTypes: any) : any => {
  const screencast = sequelize.define('screencast', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    url: DataTypes.TEXT,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    durationInSeconds: DataTypes.INTEGER,
    referralCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate (models: any): any {
        screencast.belongsTo(models.channel)
        screencast.belongsToMany(models.tag, {
          through: models.screencastTag,
          foreignKey: 'screencastId'
        })
      },

      async paginate (limit, page = 1): any {
        const {rows, count} = await screencast.findAndCountAll({
          include: [
            { model: db.models.channel },
            { model: db.models.tag }
          ],
          limit,
          order: [['createdAt', 'DESC']],
          offset: (page - 1) * limit
        })
        return {
          screencasts: rows,
          hasMore: page < Math.ceil(count / limit)
        }
      },

      async createScreencast (screencast): any {
        await db.sequelize.transaction(async transaction => {
          const createdChannel = await db.models.channel.create({
            id: screencast.channel.id,
            name: screencast.channel.title
          })
          await createdChannel.createScreencast({
            ...screencast
          }, {
            transaction
          })
          await db.models.tag.bulkCreate(screencast.tags, {
            transaction
          })
          const screencastTags = screencast.tags.map(tag => {
            return {
              screencastId: screencast.id,
              tagId: tag.id
            }
          })
          await db.models.screencastTag.bulkCreate(screencastTags, {
            transaction
          })
        })
      }
    }
  })
  return screencast
}

export default createScreencastModel
