var Sequelize = require('Sequelize');
var config = require('config');

var sequelize = new Sequelize('communityCasts', 'root', config.databasePassword, {
  host: 'localhost',
});

var Channels = sequelize.define('channels', {
  channelId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  channelName: {
    type: Sequelize.STRING,
  }
}, {
  timestamps: false
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
}, {
  timestamps: false
});

var Tags = sequelize.define('tags', {
  tagName: {
    type: Sequelize.STRING,
    primaryKey: true
  }
}, {
  timestamps: false
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
}, {
  timestamps: false
});

Screencasts.belongsToMany(Tags, { through:ScreencastTags, foreignKey: 'screencastId' });
Tags.belongsToMany(Screencasts, { through:ScreencastTags, foreignKey:'tagName' });
ScreencastTags.belongsTo(Screencasts, { foreignKey: 'screencastId' });
Screencasts.belongsTo(Channels, { foreignKey:'channelId' });

module.exports = {
  Screencasts: Screencasts,
  Tags: Tags,
  ScreencastTags: ScreencastTags,
  Channels: Channels
};
