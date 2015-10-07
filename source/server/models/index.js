'use strict';

var Sequelize = require('sequelize');
var config = require('config');
var fs = require('fs');
var path = require('path');

var sequelize = new Sequelize(
  'communityCasts',
  'root',
  config.databasePassword,
  {
    host: 'localhost',
    define: {
      timestamps: false
    },
    logging: false
  });
var db = {};

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach(file => {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
