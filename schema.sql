DROP DATABASE videoHub;
CREATE DATABASE videoHub;
USE videoHub;

CREATE TABLE technologies (
  technologyName VARCHAR(25) NOT NULL PRIMARY KEY
);

CREATE TABLE channels (
  channelId INT AUTO_INCREMENT PRIMARY KEY,
  url       VARCHAR(24)  NOT NULL,
  name      VARCHAR(100) NOT NULL
);

CREATE TABLE videos (
  videoId           INT AUTO_INCREMENT PRIMARY KEY,
  channelId         INT REFERENCES channels(channelId),
  url               VARCHAR(11)  NOT NULL,
  title             VARCHAR(100) NOT NULL,
  description       TEXT         NOT NULL,
  thumbnailUrl      VARCHAR(48)  NOT NULL,
  durationInSeconds INT          NOT NULL,
  hd                BIT          NOT NULL,
  approved          BIT          NOT NULL DEFAULT 1,
  submissionDate    TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
  referrals         INT          NOT NULL
);

CREATE TABLE technologies_video_map (
  videoId        INT         REFERENCES videos(videoId),
  technologyName VARCHAR(25) REFERENCES technologies(technologyName),

  PRIMARY KEY (videoId, technologyName) 
);

CREATE TABLE referrals (
  videoId   INT         NOT NULL REFERENCES videos(videoId),
  refereeIp VARCHAR(20) NOT NULL,

  PRIMARY KEY (videoId, refereeIp)
);