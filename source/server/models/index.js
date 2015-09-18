'use strict';

var Sequelize = require('Sequelize');
var config = require('config');
var fs        = require('fs');
var path      = require('path');
var db        = {};

var sequelize = new Sequelize('communityCasts', 'root', config.databasePassword, {
  host: 'localhost',
  define: {
    timestamps: false
  }
});

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
// var Screencast = require('./Screencast')(sequelize, Sequelize);
// var Tag = require('./Tag')(sequelize, Sequelize);
// var Referral = require('./Referral')(sequelize, Sequelize);
// var ScreencastTag = require('./ScreencastTag')(sequelize, Sequelize);
// var Channel = require('./Channel')(sequelize, Sequelize);
//

// module.exports = {
//   Screencast: Screencast,
//   Tag: Tag,
//   ScreencastTag: ScreencastTag,
//   Channel: Channel,
//   Referral: Referral,
//   sequelize: sequelize
// };
