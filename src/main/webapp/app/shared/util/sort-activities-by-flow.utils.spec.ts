import { IActivity } from 'app/shared/model/activity.model';

import { IPhase } from 'app/shared/model/phase.model';

import { sortActivitiesByFlow, sortPhasesByActivityFlow, topologicalSortNodeIds } from './sort-activities-by-flow.utils';

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

describe('sortPhasesByActivityFlow', () => {
  it('orders newer phase before older when its activity precedes the first phase activity', () => {
    const phases: IPhase[] = [
      { id: 1, name: 'First' },
      { id: 99, name: 'New' },
    ];
    const activities: IActivity[] = [
      { id: 10, name: 'A1', phase: { id: 1 }, predecessorActivities: [{ id: 20, name: 'N1' }] },
      { id: 20, name: 'N1', phase: { id: 99 } },
    ];
    expect(sortPhasesByActivityFlow(phases, activities).map(phase => phase.id)).toEqual([99, 1]);
  });

  it('falls back to phase id when there are no cross-phase links', () => {
    const phases: IPhase[] = [
      { id: 5, name: 'B' },
      { id: 2, name: 'A' },
    ];
    const activities: IActivity[] = [
      { id: 1, phase: { id: 5 } },
      { id: 2, phase: { id: 2 } },
    ];
    expect(sortPhasesByActivityFlow(phases, activities).map(phase => phase.id)).toEqual([2, 5]);
  });
});
