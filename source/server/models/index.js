var Sequelize = require('Sequelize');
var config = require('config');

var sequelize = new Sequelize('communityCasts', 'root', config.databasePassword, {
  host: 'localhost',
  define: {
    timestamps: false
  }
});

var Channel = sequelize.define('Channel', {
  channelId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  channelName: {
    type: Sequelize.STRING,
  }
}, {
  tableName: 'channels'
});

var Screencast = sequelize.define('Screencast', {
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
  tableName:'screencasts'
});

var Tag = sequelize.define('tag', {
  tagName: {
    type: Sequelize.STRING,
    primaryKey: true
  }
}, {
  tableName: 'tags'
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

Screencast.belongsToMany(Tag, { through:ScreencastTags, foreignKey: 'screencastId' });
Tag.belongsToMany(Screencast, { through:ScreencastTags, foreignKey:'tagName' });
ScreencastTags.belongsTo(Screencast, { foreignKey: 'screencastId' });
Screencast.belongsTo(Channel, { foreignKey:'channelId' });
Referrals.belongsTo(Screencast, { foreignKey: 'screencastId' });

module.exports = {
  Screencast: Screencast,
  Tag: Tag,
  ScreencastTags: ScreencastTags,
  Channel: Channel,
  Referrals: Referrals,
  sequelize: sequelize
};
