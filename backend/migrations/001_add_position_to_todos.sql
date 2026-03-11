-- Add position column for manual ordering (nullable first so we can back-fill)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS position INTEGER;

-- Seed positions from existing created_at order so no rows are lost/reordered unexpectedly
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS pos
  FROM todos
  WHERE position IS NULL
)
UPDATE todos
SET position = ordered.pos
FROM ordered
WHERE todos.id = ordered.id;

-- Now enforce NOT NULL with a safe default of 0 (app always sets real values)
ALTER TABLE todos ALTER COLUMN position SET NOT NULL;
ALTER TABLE todos ALTER COLUMN position SET DEFAULT 0;
