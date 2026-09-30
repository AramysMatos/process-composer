import { buildProcessVisualizationIndexes, sortedIndexedEntities } from './process-visualization-indexes';
import { IActivity } from 'app/shared/model/activity.model';

describe('process-visualization-indexes', () => {
  const activities: IActivity[] = [
    {
      id: 1,
      name: 'Activity A',
      participantRoles: [{ id: 10, name: 'Architect' }],
      responsibleRoles: [{ id: 11, name: 'Analyst' }],
      tools: [{ id: 20, name: 'Docs' }],
      requiredArtifacts: [{ id: 30, name: 'Backlog', optional: false }],
      producedArtifacts: [{ id: 31, name: 'Spec', optional: true }],
    },
    {
      id: 2,
      name: 'Activity B',
      participantRoles: [{ id: 10, name: 'Architect' }],
      tools: [{ id: 20, name: 'Docs' }],
    },
  ];

  it('deduplicates roles and aggregates activity refs', () => {
    const indexes = buildProcessVisualizationIndexes(activities);
    const roles = sortedIndexedEntities(indexes.roles);
    expect(roles).toHaveLength(2);
    const architect = indexes.roles.get(10);
    expect(architect?.refs).toHaveLength(2);
    expect(architect?.refs.filter(r => r.relationKind === 'participantRole')).toHaveLength(2);
  });

  it('tracks participant vs responsible relations separately', () => {
    const indexes = buildProcessVisualizationIndexes(activities);
    const analyst = indexes.roles.get(11);
    expect(analyst?.refs[0].relationKind).toBe('responsibleRole');
  });

  it('indexes tools and artifacts with relation kinds', () => {
    const indexes = buildProcessVisualizationIndexes(activities);
    expect(indexes.tools.get(20)?.refs).toHaveLength(2);
    expect(indexes.artifacts.get(30)?.refs[0].relationKind).toBe('requiredArtifact');
    expect(indexes.artifacts.get(31)?.refs[0].relationKind).toBe('producedArtifact');
  });
});
