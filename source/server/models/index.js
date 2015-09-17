var Sequelize = require('Sequelize');
var config = require('config');

var sequelize = new Sequelize('communityCasts', 'root', config.databasePassword, {
  host: 'localhost',
  define: {
    timestamps: false
  }
});

var Channels = sequelize.define('channels', {
  channelId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  channelName: {
    type: Sequelize.STRING,
  }
});

var Screencasts =  sequelize.define('screencasts', {
  screencastId: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
  },
  durationInSeconds: {
    type: Sequelize.INTEGER(11),
  },
  description: {
    type: Sequelize.STRING,
  },
  submissionDate: {
    type: Sequelize.DATE,
  },
  referralCount: {
    type: Sequelize.INTEGER(11),
  },
  channelId: {
    type: Sequelize.STRING,
  },
  approved: {
    type: Sequelize.BOOLEAN,
  },
  featured: {
    type: Sequelize.BOOLEAN,
  }
});

var Tags = sequelize.define('tags', {
  tagName: {
    type: Sequelize.STRING,
    primaryKey: true
  }
});

var ScreencastTags = sequelize.define('screencasttags', {
  screencastId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  tagName: {
    type: Sequelize.STRING,
    primaryKey: true
  }
});

var Referrals = sequelize.define('referrals', {
  screencastId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  refereeRemoteAddress: {
    type: Sequelize.STRING,
    primaryKey: true
  }
});

Screencasts.belongsToMany(Tags, { through:ScreencastTags, foreignKey: 'screencastId' });
Tags.belongsToMany(Screencasts, { through:ScreencastTags, foreignKey:'tagName' });
ScreencastTags.belongsTo(Screencasts, { foreignKey: 'screencastId' });
Screencasts.belongsTo(Channels, { foreignKey:'channelId' });
Referrals.belongsTo(Screencasts, { foreignKey: 'screencastId' });

module.exports = {
  Screencasts: Screencasts,
  Tags: Tags,
  ScreencastTags: ScreencastTags,
  Channels: Channels,
  Referrals: Referrals,
  sequelize: sequelize
};
