// @flow weak

'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return [
      queryInterface.createTable('ScreencastTag', {
        screencastId: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        tagId: {
          type: Sequelize.STRING,
          primaryKey: true
        }
      }),
      queryInterface.createTable('Tags', {
        id: {
          primaryKey: true,
          type: Sequelize.STRING
        }
      }),
      queryInterface.createTable('Screencasts', {
        id: {
          primaryKey: true,
          type: Sequelize.STRING
        },
        url: {
          type: Sequelize.TEXT
        },
        title: Sequelize.STRING,
        description: Sequelize.TEXT,
        durationInSeconds: Sequelize.INTEGER,
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
    ]
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Screencasts');
  }
};
