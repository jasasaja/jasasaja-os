import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_ACTIVITY_ITEMS,
  computeOperationalSummary,
  createSampleActivityPreview,
  filterActivityByWidget,
  getPriorityFocusItem,
} from './dashboardActivity.ts';

test('DEMO_ACTIVITY_ITEMS marks all preview records as sample data across the three domains', () => {
  assert.equal(DEMO_ACTIVITY_ITEMS.length, 9);
  assert.ok(DEMO_ACTIVITY_ITEMS.every((item) => item.isSample === true));

  const sources = new Set(DEMO_ACTIVITY_ITEMS.map((item) => item.sourceModule));
  assert.deepEqual(sources, new Set(['Learning Center', 'Engineering Handbook', 'Project Workspace']));
});

test('filterActivityByWidget partitions sample items by widget, search query, and status filter', () => {
  const allLearning = filterActivityByWidget(DEMO_ACTIVITY_ITEMS, 'learning', '');
  assert.equal(allLearning.length, 3);

  const matched = filterActivityByWidget(DEMO_ACTIVITY_ITEMS, 'learning', 'raft');
  assert.equal(matched.length, 1);
  assert.match(matched[0].title, /Raft/i);

  const attentionOnly = filterActivityByWidget(DEMO_ACTIVITY_ITEMS, 'handbook', '', 'attention');
  assert.equal(attentionOnly.length, 1);
  assert.equal(attentionOnly[0].id, 'doc-3');

  const none = filterActivityByWidget(DEMO_ACTIVITY_ITEMS, 'handbook', 'nonexistent-xyz');
  assert.equal(none.length, 0);
});

test('computeOperationalSummary calculates accurate counts across aggregated streams', () => {
  const summary = computeOperationalSummary(DEMO_ACTIVITY_ITEMS);
  assert.equal(summary.total, 9);
  assert.equal(summary.activeCount, 4);
  assert.equal(summary.attentionCount, 3);
  assert.equal(summary.completedCount, 2);
  assert.equal(summary.byWidget.learning.active, 1);
  assert.equal(summary.byWidget.handbook.attention, 1);
  assert.equal(summary.byWidget.projects.completed, 1);
});

test('getPriorityFocusItem picks active item first, then queued/warning, then null', () => {
  assert.equal(getPriorityFocusItem(DEMO_ACTIVITY_ITEMS, 'learning')?.id, 'learn-1');
  assert.equal(getPriorityFocusItem(DEMO_ACTIVITY_ITEMS, 'projects')?.id, 'proj-1');

  const withoutActive = DEMO_ACTIVITY_ITEMS.filter((item) => item.id !== 'learn-1');
  assert.equal(getPriorityFocusItem(withoutActive, 'learning')?.id, 'learn-2');

  const onlyCompleted = DEMO_ACTIVITY_ITEMS.filter(
    (item) => item.widget === 'learning' && item.status === 'inactive',
  );
  assert.equal(getPriorityFocusItem(onlyCompleted, 'learning'), null);
});

test('createSampleActivityPreview builds non-persistent sample entry mapped to owning domain', () => {
  const created = createSampleActivityPreview({
    widget: 'projects',
    title: '  Prototype API Contract  ',
    status: 'warning',
  });
  assert.equal(created.isSample, true);
  assert.equal(created.sourceModule, 'Project Workspace');
  assert.equal(created.title, 'Prototype API Contract');
  assert.equal(created.statusLabel, 'Draft (Contoh)');
});
