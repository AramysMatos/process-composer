import { cloneActivity } from './clone-activity';
import { duplicateActivity } from './duplicate-activity';
import * as activityReducer from 'app/entities/activity/activity.reducer';

const sourceActivity = {
  id: 10,
  name: 'Source activity',
  description: 'Description',
  inputCriterion: 'Criterion',
  phase: { id: 99 },
  templates: [{ id: 1 }],
  guidelines: [{ id: 2 }],
  participantRoles: [{ id: 3 }],
  responsibleRoles: [{ id: 4 }],
  tools: [{ id: 5 }],
  requiredArtifacts: [{ id: 6 }],
  producedArtifacts: [{ id: 7 }],
  predecessorActivities: [{ id: 20 }],
  subActivities: [{ id: 30 }],
};

const createDispatch = () => {
  const dispatch = jest.fn(action => {
    const response = typeof action === 'function' ? Promise.resolve(action(dispatch, () => ({}), undefined)) : Promise.resolve(action);

    return {
      unwrap: () => response,
    };
  });

  return dispatch;
};

describe('cloneActivity', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a copy in the target phase without dependencies by default', async () => {
    jest.spyOn(activityReducer, 'getEntity').mockImplementation(() => async () => ({ data: sourceActivity }));
    jest.spyOn(activityReducer, 'createEntitySilent').mockImplementation(() => async () => ({ data: { id: 50, name: 'Custom name' } }));
    const updateSpy = jest.spyOn(activityReducer, 'updateEntitySilent');

    const dispatch = createDispatch();
    const newId = await cloneActivity(dispatch, {
      sourceActivityId: 10,
      targetPhaseId: 5,
      name: 'Custom name',
    });

    expect(newId).toBe(50);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('copies dependencies when copyDependencies is true', async () => {
    jest.spyOn(activityReducer, 'getEntity').mockImplementation(() => async () => ({ data: sourceActivity }));
    jest
      .spyOn(activityReducer, 'createEntitySilent')
      .mockImplementation(() => async () => ({ data: { id: 50, name: 'Source activity (cópia)' } }));
    const updateSpy = jest.spyOn(activityReducer, 'updateEntitySilent').mockImplementation(() => async () => ({ data: { id: 50 } }));

    const dispatch = createDispatch();
    const newId = await cloneActivity(dispatch, {
      sourceActivityId: 10,
      targetPhaseId: 99,
      copyDependencies: true,
    });

    expect(newId).toBe(50);
    expect(updateSpy).toHaveBeenCalled();
  });
});

describe('duplicateActivity', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('clones with dependencies in the source phase', async () => {
    jest.spyOn(activityReducer, 'getEntity').mockImplementation(() => async () => ({
      data: {
        id: 10,
        name: 'Source activity',
        phase: { id: 7 },
        predecessorActivities: [{ id: 20 }],
        subActivities: [],
      },
    }));
    jest
      .spyOn(activityReducer, 'createEntitySilent')
      .mockImplementation(() => async () => ({ data: { id: 80, name: 'Source activity (cópia)' } }));
    const updateSpy = jest.spyOn(activityReducer, 'updateEntitySilent').mockImplementation(() => async () => ({ data: { id: 80 } }));

    const dispatch = createDispatch();
    const newId = await duplicateActivity(dispatch, 10);

    expect(newId).toBe(80);
    expect(updateSpy).toHaveBeenCalled();
  });
});
