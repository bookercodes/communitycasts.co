INSERT INTO tags
 VALUES ('JavaScript'), ('Angular'), ('Python');

INSERT INTO channels (channelYoutubeId, channelName)
  VALUES ('derekbanas', 'Derek Banas');

INSERT INTO screencasts(youtubeId,title, durationInSeconds, channelId)
	VALUES ('_cLvpJY2deo', 'JavaScript Video Tutorial Pt 1', 1891, 1);
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(), 'JavaScript');

INSERT INTO screencasts(youtubeId,title, durationInSeconds, channelId)
	VALUES ('QETUuZ27N0w', 'Angularjs Tutorial for Beginners - learn Angular.js using UI-Router', 1891, 1);
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(), 'Angular');
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(), 'JavaScript');

INSERT INTO screencasts(youtubeId,title, durationInSeconds, channelId)
	VALUES ('PMfcsYzj-9M', 'he Definitive Guide to Object-Oriented JavaScript', 1891, 1);
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(), 'JavaScript');

INSERT INTO screencasts(youtubeId,title, durationInSeconds, channelId)
	VALUES ('N4mEzFDjqtA', 'Python Programming', 1891, 1);
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(), 'Python');

INSERT INTO screencasts(youtubeId,title, durationInSeconds, channelId)
	VALUES ('9uq3w6JJS00', 'Zero to Hero with Python', 1891, 1);
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(), 'Python');

INSERT INTO screencasts(youtubeId,title, durationInSeconds, channelId)
	VALUES ('cpPG0bKHYKc', 'Python Beginner Tutorial 1 (For Absolute Beginners)', 1891, 1);
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(), 'Python');

INSERT INTO screencasts(youtubeId,title, durationInSeconds, channelId)
	VALUES ('0r5QvzjjKDc', 'AngularJS Directives Tutorial', 1891, 1);
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(),'JavaScript');
INSERT INTO screencastTags
	VALUES (LAST_INSERT_ID(),'Angular');
