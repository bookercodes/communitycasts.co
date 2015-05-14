UPDATE screencastTags
  JOIN tagSynonyms
    ON screencastTags.tagName = tagSynonyms.sourceTagName
SET 
  tagName = technologySynonyms.targetTagName;
    
DELETE
FROM tags
WHERE tagName NOT IN (
  SELECT tagName
  FROM screencastTags
  WHERE screencastTags.tagName = tags.tagName
);