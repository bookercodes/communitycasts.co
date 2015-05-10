DROP DATABASE IF EXISTS screencastHub;
CREATE DATABASE screencastHub;
USE screencastHub;

CREATE TABLE channels (
  channelId   VARCHAR(48),
  channelName VARCHAR(200) NOT NULL,

  PRIMARY KEY (channelId)
);

CREATE TABLE tags (
  tagName      VARCHAR(50),
  creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (tagName)
);

CREATE TABLE screencastStatus (
  status VARCHAR(50),

  PRIMARY KEY (status)
);

INSERT INTO screencastStatus 
  VALUES ('approved'), ('pending'), ('denied');

CREATE TABLE screencasts (
  screencastId      VARCHAR(11),
  channelId         VARCHAR(48),
  title             VARCHAR(200) NOT NULL,
  durationInSeconds INT          NOT NULL,
  referralCount     INT         DEFAULT 0,
  status            VARCHAR(50) DEFAULT 'pending',
  submissionDate    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY(screencastId),
  FOREIGN KEY (channelId)
    REFERENCES channels(channelId),
  FOREIGN KEY (status)
    REFERENCES screencastStatus(status)
);

CREATE TABLE screencastTags (
  screencastId VARCHAR(11),
  tagName      VARCHAR(50),

  PRIMARY KEY (screencastId, tagName),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(screencastId),
  FOREIGN KEY (tagName)
    REFERENCES tags(tagName)
);

CREATE TABLE referrals (
  screencastId  VARCHAR(11),
  refereeRemoteAddress VARCHAR(20) NOT NULL,

  PRIMARY KEY (screencastId, refereeRemoteAddress),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(ScreencastId)
);

CREATE TABLE tagSynonyms (
  sourceTagName VARCHAR(50),
  targetTagName VARCHAR(50),

  PRIMARY KEY (sourceTagName),
  FOREIGN KEY (targetTagName)
    REFERENCES tags(tagName)
);