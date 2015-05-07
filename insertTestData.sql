INSERT INTO tags(tagName) VALUES 
  ('Python'),
  ('Html'),
  ('Java'),
  ('Android'),
  ('Sass'),
  ('Go'),
  ('PHP'),
  ('Bowery'),
  ('jQuery'),
  ('Git');

INSERT INTO channels VALUES 
  ('UCwRXb5dUK4cvsHbx-rGzSgw', 'Derek Banas'),
  ('UCpOIUW62tnJTtpWFABxWZ8g', 'phpacademy');
    
INSERT INTO screencasts (screencastId, channelId, title, durationInSeconds) VALUES 
  ('N4mEzFDjqtA', 'UCwRXb5dUK4cvsHbx-rGzSgw', 'Python Programming', 100),
  ('Ggh_y-33Eso', 'UCwRXb5dUK4cvsHbx-rGzSgw', 'Learn HTML in 15 Minutes', 100),
  ('WPvGqX-TXP0', 'UCwRXb5dUK4cvsHbx-rGzSgw', 'Java Programming', 100),
  ('ef-6NZjBtW0', 'UCwRXb5dUK4cvsHbx-rGzSgw', 'How to Make Android Apps', 100),
  ('wz3kElLbEHE', 'UCpOIUW62tnJTtpWFABxWZ8g', 'SASS Tutorial', 100),
  ('CF9S4QZuV30', 'UCpOIUW62tnJTtpWFABxWZ8g', 'Go Programming', 100),
  ('QRmmISj6Rrw', 'UCpOIUW62tnJTtpWFABxWZ8g', 'Learn PHP: Your first file', 100),
  ('Xx-XZwJT76w', 'UCpOIUW62tnJTtpWFABxWZ8g', 'Setting Up A Development Environment With Bowery', 100),
  ('GrycH6F-ksY', 'UCpOIUW62tnJTtpWFABxWZ8g', 'jQuery Tutorials: Submitting a Form with AJAX', 100),
  ('F3WpBsc0QEw', 'UCpOIUW62tnJTtpWFABxWZ8g', 'Git & GitHub: Creating a Repository (2/11)', 100);

UPDATE screencasts SET
  approved = 1;

INSERT INTO screencastTags VALUES   
  ('N4mEzFDjqtA', 'Python'),
  ('Ggh_y-33Eso', 'Html'),
  ('WPvGqX-TXP0', 'Java'),
  ('ef-6NZjBtW0', 'Android'),
  ('ef-6NZjBtW0', 'Java'),
  ('wz3kElLbEHE', 'Sass'),
  ('CF9S4QZuV30', 'Go'),
  ('QRmmISj6Rrw', 'PHP'),
  ('Xx-XZwJT76w', 'Bowery'),
  ('GrycH6F-ksY', 'JQuery'),
  ('F3WpBsc0QEw', 'Git');