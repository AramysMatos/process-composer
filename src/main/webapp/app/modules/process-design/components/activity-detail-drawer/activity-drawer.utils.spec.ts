import { collectDependencySyncUpdates } from './activity-drawer.utils';

describe('collectDependencySyncUpdates', () => {
  const activitiesById = new Map([
    [1, { id: 1, name: 'Parent A', subActivities: [] }],
    [2, { id: 2, name: 'Current', predecessorActivities: [], subActivities: [] }],
    [3, { id: 3, name: 'Child C', predecessorActivities: [] }],
  ]);

  it('updates parent subActivities when a predecessor is added', () => {
    const original = { id: 2, name: 'Current', predecessorActivities: [], subActivities: [] };
    const draft = { id: 2, name: 'Current', predecessorActivities: [{ id: 1, name: 'Parent A' }], subActivities: [] };

    const updates = collectDependencySyncUpdates(original, draft, activitiesById);

    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe(1);
    expect(updates[0].subActivities).toEqual([{ id: 2, name: 'Current' }]);
  });

  it('updates parent subActivities when a predecessor is removed', () => {
    const original = {
      id: 2,
      name: 'Current',
      predecessorActivities: [{ id: 1, name: 'Parent A' }],
      subActivities: [],
    };
    const draft = { id: 2, name: 'Current', predecessorActivities: [], subActivities: [] };
    const map = new Map(activitiesById);
    map.set(1, { id: 1, name: 'Parent A', subActivities: [{ id: 2, name: 'Current' }] });

    const updates = collectDependencySyncUpdates(original, draft, map);

    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe(1);
    expect(updates[0].subActivities).toEqual([]);
  });

  it('updates child predecessorActivities when a sub-activity is added', () => {
    const original = { id: 2, name: 'Current', predecessorActivities: [], subActivities: [] };
    const draft = { id: 2, name: 'Current', predecessorActivities: [], subActivities: [{ id: 3, name: 'Child C' }] };

    const updates = collectDependencySyncUpdates(original, draft, activitiesById);

    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe(3);
    expect(updates[0].predecessorActivities).toEqual([{ id: 2, name: 'Current' }]);
  });

  it('does not include the current activity in related updates', () => {
    const original = { id: 2, name: 'Current', predecessorActivities: [], subActivities: [] };
    const draft = {
      id: 2,
      name: 'Current',
      predecessorActivities: [{ id: 1, name: 'Parent A' }],
      subActivities: [{ id: 3, name: 'Child C' }],
    };

    const updates = collectDependencySyncUpdates(original, draft, activitiesById);

    expect(updates.every(item => item.id !== 2)).toBe(true);
  });
});
