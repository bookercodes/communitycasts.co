DROP DATABASE IF EXISTS communityCasts;
CREATE DATABASE communityCasts;
USE communityCasts;

CREATE TABLE channels (
  channelId   NVARCHAR(200) NOT NULL UNIQUE,
  channelName NVARCHAR(500) NOT NULL,

  PRIMARY KEY (channelId)
);

CREATE TABLE screencasts (
  screencastId        NVARCHAR(200) NOT NULL UNIQUE,
  title               NVARCHAR(500) NOT NULL,
  durationInSeconds   INT           NOT NULL,
  submissionDate      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  referralCount       INT           NOT NULL DEFAULT 0,
  channelId           NVARCHAR(200) NOT NULL,
  approved            BOOL          NOT NULL DEFAULT 0,
  PRIMARY KEY (screencastId),
  FOREIGN KEY (channelId)
    REFERENCES channels(channelId)
);

CREATE TABLE tags (
  tagName NVARCHAR(100),
  PRIMARY KEY (tagName)
);

CREATE TABLE screencastTags (
  screencastId NVARCHAR(200),
  tagName NVARCHAR(100),

  PRIMARY KEY (screencastId, tagName),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(screencastId),
  FOREIGN KEY (tagName)
    REFERENCES tags(tagName) ON UPDATE CASCADE
);

CREATE TABLE referrals (
  screencastId NVARCHAR(200),
  refereeRemoteAddress NVARCHAR(20) NOT NULL,

  PRIMARY KEY (screencastId, refereeRemoteAddress),
  FOREIGN KEY (screencastId)
    REFERENCES screencasts(screencastId)
);
