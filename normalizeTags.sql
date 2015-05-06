UPDATE technology_video_map
  JOIN technologySynonyms
    ON technology_video_map.technologyName = technologySynonyms.sourcetechnologyName
SET 
  technologyName = technologySynonyms.targetTechnologyName;
    
DELETE
FROM technologies
WHERE technologyName NOT IN (
  SELECT technologyName
  FROM technology_video_map
  WHERE technology_video_map.technologyName = technologies.technologyName
);