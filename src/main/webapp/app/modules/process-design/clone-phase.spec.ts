import { clonePhase } from './clone-phase';
import { duplicatePhase } from './duplicate-phase';
import * as phaseReducer from 'app/entities/phase/phase.reducer';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('app/modules/process-design/clone-activities-for-phase', () => ({
  cloneActivitiesForPhase: jest.fn().mockResolvedValue(new Map()),
}));

import axios from 'axios';
import { cloneActivitiesForPhase } from 'app/modules/process-design/clone-activities-for-phase';

const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>;
const mockedCloneActivitiesForPhase = cloneActivitiesForPhase as jest.MockedFunction<typeof cloneActivitiesForPhase>;

const createDispatch = () => {
  const dispatch = jest.fn(action => {
    const response = typeof action === 'function' ? Promise.resolve(action(dispatch, () => ({}), undefined)) : Promise.resolve(action);

    return {
      unwrap: () => response,
    };
  });

  return dispatch;
};

describe('clonePhase', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockedAxiosGet.mockReset();
    mockedCloneActivitiesForPhase.mockClear();
  });

  it('creates a phase copy in the target process and clones activities', async () => {
    jest.spyOn(phaseReducer, 'getEntity').mockImplementation(() => async () => ({
      data: { id: 10, name: 'Source phase', description: 'Description' },
    }));
    jest.spyOn(phaseReducer, 'createEntitySilent').mockImplementation(() => async () => ({ data: { id: 50, name: 'Custom name' } }));
    mockedAxiosGet.mockResolvedValue({ data: [{ id: 1, name: 'Activity 1' }] });

    const dispatch = createDispatch();
    const newId = await clonePhase(dispatch, {
      sourcePhaseId: 10,
      targetProcessId: 5,
      name: 'Custom name',
      copyActivities: true,
    });

    expect(newId).toBe(50);
    expect(mockedAxiosGet).toHaveBeenCalledWith('api/activities?phaseId=10&eagerload=true');
    expect(mockedCloneActivitiesForPhase).toHaveBeenCalledWith(dispatch, [{ id: 1, name: 'Activity 1' }], 50, {
      activityIdMap: undefined,
      skipDependencyUpdate: undefined,
    });
  });

  it('skips activity cloning when copyActivities is false', async () => {
    jest.spyOn(phaseReducer, 'getEntity').mockImplementation(() => async () => ({
      data: { id: 10, name: 'Source phase' },
    }));
    jest.spyOn(phaseReducer, 'createEntitySilent').mockImplementation(() => async () => ({ data: { id: 60, name: 'Copy' } }));

    const dispatch = createDispatch();
    await clonePhase(dispatch, {
      sourcePhaseId: 10,
      targetProcessId: null,
      copyActivities: false,
    });

    expect(mockedAxiosGet).not.toHaveBeenCalled();
    expect(mockedCloneActivitiesForPhase).not.toHaveBeenCalled();
  });
});

describe('duplicatePhase', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockedAxiosGet.mockReset();
    mockedCloneActivitiesForPhase.mockClear();
  });

  it('clones phase in the same process with activities', async () => {
    jest.spyOn(phaseReducer, 'getEntity').mockImplementation(() => async () => ({
      data: { id: 10, name: 'Source phase', process: { id: 7 } },
    }));
    jest
      .spyOn(phaseReducer, 'createEntitySilent')
      .mockImplementation(() => async () => ({ data: { id: 80, name: 'Source phase (cópia)' } }));
    mockedAxiosGet.mockResolvedValue({ data: [] });

    const dispatch = createDispatch();
    const newId = await duplicatePhase(dispatch, 10);

    expect(newId).toBe(80);
    expect(mockedCloneActivitiesForPhase).toHaveBeenCalled();
  });
});
