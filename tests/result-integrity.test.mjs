import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('hardware pipeline migration creates schema without seeding bid results', async () => {
  const migration = await readFile(
    new URL('../supabase/migrations/20260908020000_hardware_bid_sourcing_pipeline.sql', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(migration, /insert\s+into\s+public\.hardware_opportunities/i);
  assert.doesNotMatch(migration, /fit_score\s*,\s*assigned_to/i);
  assert.match(migration, /must not create scores, assignments, stages, or actions/i);
});
