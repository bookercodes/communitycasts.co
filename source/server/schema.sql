DROP DATABASE IF EXISTS communityCasts;
CREATE DATABASE communityCasts;
USE communityCasts;

CREATE TABLE hostServices (
  hostService NVARCHAR(100) NOT NULL,
  PRIMARY KEY (hostService)
);
INSERT INTO hostServices
  VALUES ('Vimeo'), ('YouTube');

CREATE TABLE channels (
  channelId INT AUTO_INCREMENT,
  name      NVARCHAR(500) NOT NULL,
  link      NVARCHAR(500) NOT NULL,

  PRIMARY KEY (channelId)
);

CREATE TABLE screencasts (
  screencastId        INT AUTO_INCREMENT,
  link                NVARCHAR(500) NOT NULL,
  title               NVARCHAR(500) NOT NULL,
  durationInSeconds   INT           NOT NULL,
  submissionDate      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  referralCount       INT           NOT NULL DEFAULT 0,
  hostService         NVARCHAR(100) NOT NULL,
  channelId           INT           NOT NULL,
  PRIMARY KEY (screencastId),
  FOREIGN KEY (channelId)
    REFERENCES channels(channelId),
  FOREIGN KEY (hostService)
    REFERENCES hostServices(hostService)
);

CREATE TABLE tags (
  tagName NVARCHAR(100),
  PRIMARY KEY (tagName)
);


CREATE TABLE screencastTags (
  screencastId INT,
  tagName NVARCHAR(100),

  PRIMARY KEY (screencastId, tagName),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(screencastId),
  FOREIGN KEY (tagName)
    REFERENCES tags(tagName) ON UPDATE CASCADE
);

CREATE TABLE referrals (
  screencastId INT,
  refereeRemoteAddress NVARCHAR(20) NOT NULL,

  PRIMARY KEY (screencastId, refereeRemoteAddress),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(screencastId)
);
