DROP DATABASE IF EXISTS communityCasts;
CREATE DATABASE communityCasts;
USE communityCasts;

CREATE TABLE screencasts (
  screencastId        INT AUTO_INCREMENT,
  title               NVARCHAR(200) NOT NULL,
  durationInSeconds   INT           NOT NULL,
  submissionDate      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  referralCount       INT           NOT NULL DEFAULT 0,
  PRIMARY KEY(screencastId)
);
