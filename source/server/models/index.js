var Sequelize = require('Sequelize');
var config = require('config');

var sequelize = new Sequelize('communityCasts', 'root', config.databasePassword, {
  host: 'localhost',
  define: {
    timestamps: false
  }
});

var Screencast = require('./Screencast')(sequelize, Sequelize);
var Tag = require('./Tag')(sequelize, Sequelize);
var Referral = require('./Referral')(sequelize, Sequelize);
var ScreencastTag = require('./ScreencastTag')(sequelize, Sequelize);
var Channel = require('./Channel')(sequelize, Sequelize);

Screencast.belongsToMany(Tag, { through:ScreencastTag, foreignKey: 'screencastId' });
Tag.belongsToMany(Screencast, { through:ScreencastTag, foreignKey:'tagName' });
ScreencastTag.belongsTo(Screencast, { foreignKey: 'screencastId' });
Screencast.belongsTo(Channel, { foreignKey:'channelId' });
Referral.belongsTo(Screencast, { foreignKey: 'screencastId' });

module.exports = {
  Screencast: Screencast,
  Tag: Tag,
  ScreencastTag: ScreencastTag,
  Channel: Channel,
  Referral: Referral,
  sequelize: sequelize
};
