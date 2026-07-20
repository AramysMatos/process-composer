import { applyClonedActivityDependencies, cloneActivitiesForPhase } from './clone-activities-for-phase';
import * as activityReducer from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';

const createDispatch = () => {
  const dispatch = jest.fn(action => {
    const response = typeof action === 'function' ? Promise.resolve(action(dispatch, () => ({}), undefined)) : Promise.resolve(action);

    return {
      unwrap: () => response,
    };
  });

  return dispatch;
};

describe('cloneActivitiesForPhase', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('remaps cross-phase dependencies when using a shared activity id map', async () => {
    const updateEntitySilent = jest.spyOn(activityReducer, 'updateEntitySilent').mockImplementation(() => async () => ({ data: {} }));

    let nextActivityId = 100;
    jest.spyOn(activityReducer, 'createEntitySilent').mockImplementation(() => async () => {
      nextActivityId += 1;
      return { data: { id: nextActivityId } };
    });

    const phaseOneActivities: IActivity[] = [
      {
        id: 1,
        name: 'Activity A',
        phase: { id: 10 },
        predecessorActivities: [{ id: 2, name: 'Activity B' }],
      },
    ];

    const phaseTwoActivities: IActivity[] = [
      {
        id: 2,
        name: 'Activity B',
        phase: { id: 20 },
      },
    ];

    const dispatch = createDispatch();
    const activityIdMap = new Map<number, number>();
    const clonedActivities = [];

    await cloneActivitiesForPhase(dispatch, phaseOneActivities, 110, {
      activityIdMap,
      skipDependencyUpdate: true,
    });
    clonedActivities.push({ sourceActivity: phaseOneActivities[0], targetPhaseId: 110 });

    await cloneActivitiesForPhase(dispatch, phaseTwoActivities, 120, {
      activityIdMap,
      skipDependencyUpdate: true,
    });
    clonedActivities.push({ sourceActivity: phaseTwoActivities[0], targetPhaseId: 120 });

    await applyClonedActivityDependencies(dispatch, clonedActivities, activityIdMap);

    expect(updateEntitySilent).toHaveBeenCalledTimes(1);
    expect(updateEntitySilent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 101,
        predecessorActivities: [{ id: 102 }],
      })
    );
  });
});
