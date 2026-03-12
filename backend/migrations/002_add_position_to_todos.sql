ALTER TABLE todos ADD COLUMN IF NOT EXISTS position INTEGER;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS pos
  FROM todos
  WHERE position IS NULL
)
UPDATE todos
SET position = ordered.pos
FROM ordered
WHERE todos.id = ordered.id;

ALTER TABLE todos ALTER COLUMN position SET NOT NULL;
ALTER TABLE todos ALTER COLUMN position SET DEFAULT 0;
