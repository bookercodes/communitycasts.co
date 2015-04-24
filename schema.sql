DROP DATABASE videoHub;
CREATE DATABASE videoHub;
USE videoHub;

CREATE TABLE technologies (
  technologyName VARCHAR(50) NOT NULL PRIMARY KEY
);

CREATE TABLE videos (
  videoId     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  description VARCHAR(300) NOT NULL,
  url         VARCHAR(300) NOT NULL,
  channelName VARCHAR(300) NOT NULL,
  referrals   INT          NOT NULL
);

CREATE TABLE technology_video_map (
  videoId        INT,
  technologyName VARCHAR(50),

  PRIMARY KEY (videoId, technologyName),
  FOREIGN KEY (videoId) REFERENCES videos(videoId),
  FOREIGN KEY (technologyName) REFERENCES technologies(technologyName)
);