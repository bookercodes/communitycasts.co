DROP DATABASE videoHub;
CREATE DATABASE videoHub;
USE videoHub;

CREATE TABLE technologies (
  technologyName VARCHAR(50) NOT NULL PRIMARY KEY
);

CREATE TABLE channels (
  channelId   VARCHAR(48) PRIMARY KEY,
  channelName VARCHAR(200) NOT NULL
);

CREATE TABLE videos (
  videoId           VARCHAR(11) PRIMARY KEY,
  channelId         VARCHAR(48) REFERENCES channels(channelId),
  title             VARCHAR(200) NOT NULL,
  description       TEXT         NOT NULL,
  thumbnailUrl      VARCHAR(98)  NOT NULL,
  durationInSeconds INT          NOT NULL,
  hd                BIT          NOT NULL,
  referrals         INT          NOT NULL,
  approved          BIT       DEFAULT 1,
  submissionDate    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE videoTechnologies (
CREATE TABLE technology_video_map (
  videoId        VARCHAR(11) REFERENCES videos(videoId),
  technologyName VARCHAR(50) REFERENCES technologies(technologyName),

  PRIMARY KEY (videoId, technologyName) 
);

-- CREATE TABLE videoReferrals
CREATE TABLE referrals (
  videoId   INT         NOT NULL REFERENCES videos(videoId),
  refereeIp VARCHAR(20) NOT NULL,

  PRIMARY KEY (videoId, refereeIp)
);