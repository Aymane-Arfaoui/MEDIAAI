-- Find and delete duplicate Instagram posts
-- Keep only the first occurrence of each URL
WITH instagram_duplicates AS (
  SELECT 
    id,
    url,
    ROW_NUMBER() OVER (PARTITION BY url ORDER BY "createdAt") as rn
  FROM "contentItems"
  WHERE platform = 'instagram'
)
DELETE FROM "contentItems"
WHERE id IN (
  SELECT id FROM instagram_duplicates WHERE rn > 1
);

-- Show remaining Instagram posts
SELECT id, url, "createdAt" FROM "contentItems" WHERE platform = 'instagram' ORDER BY "createdAt";
