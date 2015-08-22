-- sample data used for development purposes ^_^

INSERT INTO tags
 VALUES ('JavaScript'), ('Angular'), ('Python');
INSERT INTO channels (channelName, channelLink)
  VALUES ('Derek Banas', 'https://www.youtube.com/channel/UCwRXb5dUK4cvsHbx-rGzSgw');

INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://www.youtube.com/watch?v=_cLvpJY2deo','JavaScript Video Tutorial Pt 1', 1891, 'YouTube', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(), 'JavaScript');

INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://www.youtube.com/watch?v=QETUuZ27N0w','Angularjs Tutorial for Beginners - learn Angular.js using UI-Router',0,'YouTube', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'Angular');
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'JavaScript');

INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://youtu.be/PMfcsYzj-9M','The Definitive Guide to Object-Oriented JavaScript', 1626,'YouTube', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'JavaScript');

INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://www.youtube.com/watch?v=N4mEzFDjqtA','Python Programming', 49, 'YouTube', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'Python');

INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://www.youtube.com/watch?v=9uq3w6JJS00','Zero to Hero with Python', 39996, 'YouTube', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'Python');

INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://www.youtube.com/watch?v=cpPG0bKHYKc','Python Beginner Tutorial 1 (For Absolute Beginners)', 545, 'YouTube', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'Python');

INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://www.youtube.com/watch?v=0r5QvzjjKDc','AngularJS Directives Tutorial', 1139, 'YouTube', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'JavaScript');
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'Angular');


INSERT INTO screencasts(link,title, durationInSeconds, hostService, channelId)
 VALUES ('https://vimeo.com/42848594', 'Building Maya Interfaces with Python: Video One', 3938, 'Vimeo', 1);
INSERT INTO screencastTags
 VALUES (LAST_INSERT_ID(),'Python');
