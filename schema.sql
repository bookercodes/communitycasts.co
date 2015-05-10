DROP DATABASE IF EXISTS screencastHub;
CREATE DATABASE screencastHub;
USE screencastHub;

CREATE TABLE channels (
  channelId   NVARCHAR(48),
  channelName NVARCHAR(200) NOT NULL,

  PRIMARY KEY (channelId)
);

CREATE TABLE tags (
  tagName      NVARCHAR(50),
  creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (tagName)
);

CREATE TABLE screencastStatus (
  status NVARCHAR(50),

  PRIMARY KEY (status)
);

INSERT INTO screencastStatus 
  VALUES ('approved'), ('pending'), ('denied');

CREATE TABLE screencasts (
  screencastId      NVARCHAR(11),
  channelId         NVARCHAR(48),
  title             NVARCHAR(200) NOT NULL,
  durationInSeconds INT          NOT NULL,
  referralCount     INT         DEFAULT 0,
  status            NVARCHAR(50) DEFAULT 'pending',
  submissionDate    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY(screencastId),
  FOREIGN KEY (channelId)
    REFERENCES channels(channelId),
  FOREIGN KEY (status)
    REFERENCES screencastStatus(status)
);

CREATE TABLE screencastTags (
  screencastId NVARCHAR(11),
  tagName      NVARCHAR(50),

  PRIMARY KEY (screencastId, tagName),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(screencastId),
  FOREIGN KEY (tagName)
    REFERENCES tags(tagName)
);

CREATE TABLE referrals (
  screencastId  NVARCHAR(11),
  refereeRemoteAddress NVARCHAR(20) NOT NULL,

  PRIMARY KEY (screencastId, refereeRemoteAddress),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(ScreencastId)
);

CREATE TABLE tagSynonyms (
  sourceTagName NVARCHAR(50),
  targetTagName NVARCHAR(50),

  PRIMARY KEY (sourceTagName),
  FOREIGN KEY (targetTagName)
    REFERENCES tags(tagName)
);