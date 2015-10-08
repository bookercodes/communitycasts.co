import models from '../models';

class TagStore {
  get(limit) {
    return models.ScreencastTag.findAll({
      group: ['tagName'],
      limit: limit,
      attributes: [
        'tagName', [models.Sequelize.fn('count', 'tagName'), 'count']
      ],
      order: 'count DESC',
      include: [{
        model: models.Screencast,
        where: {
          approved: true
        },
        attributes: []
      }]
    });
  }
}

export default new TagStore();
