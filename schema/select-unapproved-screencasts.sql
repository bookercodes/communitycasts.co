USE communityCasts;
SELECT 
  CONCAT('https://www.youtube.com/watch?v=', s.screencastId) AS url,
  s.title,
  GROUP_CONCAT(st. tagName) AS tags
FROM screencasts s
JOIN screencastTags st
  ON s.screencastId = st.screencastId
WHERE status = 'pending'
GROUP BY s.screencastId
ORDER BY s.submissionDate