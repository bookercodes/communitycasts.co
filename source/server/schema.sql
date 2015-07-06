DROP DATABASE IF EXISTS communityCasts;
CREATE DATABASE communityCasts;
USE communityCasts;

CREATE TABLE screencasts (
  screencastId        INT AUTO_INCREMENT,
  title               NVARCHAR(200) NOT NULL,
  durationInSeconds   INT           NOT NULL,
  submissionDate      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(screencastId)
);
