import { IActivity } from 'app/shared/model/activity.model';

import { sortActivitiesByFlow, topologicalSortNodeIds } from './sort-activities-by-flow.utils';

function makeActivity(id: number, predecessors: number[], subActivities: number[]): IActivity {
  return {
    id,
    name: `Activity ${id}`,
    predecessorActivities: predecessors.map(pid => ({ id: pid, name: `P${pid}` })),
    subActivities: subActivities.map(sid => ({ id: sid, name: `S${sid}` })),
  };
}

describe('sortActivitiesByFlow', () => {
  it('orders a simple chain by predecessors', () => {
    const list = [makeActivity(3, [2], []), makeActivity(2, [1], []), makeActivity(1, [], [])];
    expect(sortActivitiesByFlow(list).map(a => a.id)).toEqual([1, 2, 3]);
  });

  it('orders sub-activities after parent', () => {
    const list = [makeActivity(2, [], []), makeActivity(1, [], [2])];
    expect(sortActivitiesByFlow(list).map(a => a.id)).toEqual([1, 2]);
  });

  it('ignores predecessor outside the sorted set', () => {
    const list = [makeActivity(2, [99], []), makeActivity(1, [], [])];
    expect(sortActivitiesByFlow(list).map(a => a.id)).toEqual([1, 2]);
  });

  it('appends nodes involved in a cycle after the acyclic part', () => {
    const ordered = topologicalSortNodeIds(
      ['1', '2'],
      [
        { source: '1', target: '2' },
        { source: '2', target: '1' },
      ]
    );
    expect(ordered).toHaveLength(2);
    expect(new Set(ordered)).toEqual(new Set(['1', '2']));
  });

  it('uses numeric id tie-break for parallel activities', () => {
    const list = [makeActivity(3, [], []), makeActivity(1, [], []), makeActivity(2, [], [])];
    expect(sortActivitiesByFlow(list).map(a => a.id)).toEqual([1, 2, 3]);
  });
});
