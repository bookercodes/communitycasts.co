import models from '../models';
import assert from 'assert';

class Screencast {
  constructor(screencast) {
    assert.ok(screencast.id);
    assert.ok(screencast.title);
    assert.ok(screencast.description);
    assert.ok(screencast.duration);
    assert.ok(screencast.tags);
    assert.ok(screencast.channel);
    assert.ok(screencast.channel.name);
    assert.ok(screencast.channel.id);

    this.screencast = screencast;
  }

  add() {
    return models.sequelize.transaction(function(transaction) {
      return models
        .Tag
        .bulkCreate(this.screencast.tags, {
          transaction: transaction,
          ignoreDuplicates: true
      }).then(function() {
        return models
          .Channel
          .create(this.screencast.channel, {
            transaction: transaction
          })
          .catch(models.Sequelize.UniqueConstraintError, () => undefined);
      }).then(function() {
        return models
          .Screencast
          .create(this.screencast, {
            transaction: transaction
          });
      }).then(function() {
        const map = this.screencast.tags.map(function(tag) {
          return {
            screencastId: this.screencast.id,
            tagName:tag.tagName
          };
        });
        return models
          .ScreencastTag
          .bulkCreate(map, {
            transaction: transaction
          });
      });
    });
  }

}
export default Screencast;
