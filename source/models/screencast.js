// @flow
import db from 'sequelize-connect'

const createScreencastModel = (sequelize: any, DataTypes: DataTypes) : any => {
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

      async paginate (limit, page = 1, sort = 'new'): any {
        const options = {
          include: [
            { model: db.models.channel },
            { model: db.models.tag }
          ],
          limit,
          order: [['createdAt', 'DESC']],
          offset: (page - 1) * limit
        }
        if (sort === 'popular') {
          options.order = [
            [db.sequelize.literal('screencast.referralCount / POW(((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(screencast.createdAt)) / 3600) + 2, 1.5) DESC')]
          ]
        }
        const {rows, count} = await screencast.findAndCountAll(options)
        return {
          screencasts: rows,
          hasMore: page < Math.ceil(count / limit)
        }
      },

      async createScreencast (screencast): any {
        await db.sequelize.transaction(async transaction => {
          const results = await db.models.channel.findOrCreate({
            where: {
              id: screencast.channel.id
            },
            defaults: {
              name: screencast.channel.title
            }
          })
          const channel = results[0]
          await channel.createScreencast({
            ...screencast
          }, {
            transaction
          })
          await db.models.tag.bulkCreate(screencast.tags, {
            transaction,
            ignoreDuplicates: true
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
