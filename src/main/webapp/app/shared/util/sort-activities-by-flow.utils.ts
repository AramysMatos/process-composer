import { IActivity } from 'app/shared/model/activity.model';

export interface FlowEdge {
  source: string;
  target: string;
}

export const compareFlowNodeIds = (left: string, right: string): number => {
  const leftNum = Number(left);
  const rightNum = Number(right);
  if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
    return leftNum - rightNum;
  }
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
};

/** Same ordering as activity canvas layout (by phase). */
export const topologicalSortNodeIds = (nodeIds: string[], edges: FlowEdge[]): string[] => {
  const nodeSet = new Set(nodeIds);
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodeIds.forEach(id => {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  });

  edges.forEach(edge => {
    if (!nodeSet.has(edge.source) || !nodeSet.has(edge.target)) {
      return;
    }
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  });

  const queue = [...nodeIds].filter(id => (inDegree.get(id) ?? 0) === 0).sort(compareFlowNodeIds);
  const sorted: string[] = [];

  while (queue.length > 0) {
    queue.sort(compareFlowNodeIds);
    const current = queue.shift();
    if (!current) {
      break;
    }
    sorted.push(current);
    adjacency.get(current)?.forEach(next => {
      const degree = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, degree);
      if (degree === 0) {
        queue.push(next);
      }
    });
  }

  const remaining = nodeIds.filter(id => !sorted.includes(id)).sort(compareFlowNodeIds);
  return [...sorted, ...remaining];
};

export interface ActivityFlowNode {
  id: string;
  predecessorIds: string[];
  subActivityIds: string[];
}

export const buildIntraPhaseFlowEdges = (nodes: ActivityFlowNode[]): FlowEdge[] => {
  const idSet = new Set(nodes.map(node => node.id));
  const edges: FlowEdge[] = [];

  nodes.forEach(node => {
    node.predecessorIds.forEach(sourceId => {
      if (idSet.has(sourceId)) {
        edges.push({ source: sourceId, target: node.id });
      }
    });
    node.subActivityIds.forEach(targetId => {
      if (idSet.has(targetId)) {
        edges.push({ source: node.id, target: targetId });
      }
    });
  });

  return edges;
};

export const sortNodeIdsByFlow = (nodes: ActivityFlowNode[]): string[] => {
  const nodeIds = nodes.map(node => node.id);
  return topologicalSortNodeIds(nodeIds, buildIntraPhaseFlowEdges(nodes));
};

const toActivityFlowNodes = (activities: IActivity[]): ActivityFlowNode[] =>
  activities
    .filter((activity): activity is IActivity & { id: number } => activity.id !== undefined)
    .map(activity => ({
      id: String(activity.id),
      predecessorIds: (activity.predecessorActivities ?? [])
        .map(item => item.id)
        .filter((id): id is number => id !== undefined)
        .map(String),
      subActivityIds: (activity.subActivities ?? [])
        .map(item => item.id)
        .filter((id): id is number => id !== undefined)
        .map(String),
    }));

export const sortActivitiesByFlow = (activities: IActivity[]): IActivity[] => {
  const withId = activities.filter((activity): activity is IActivity & { id: number } => activity.id !== undefined);
  const orderedIds = sortNodeIdsByFlow(toActivityFlowNodes(withId));
  const byId = new Map(withId.map(activity => [String(activity.id), activity]));
  return orderedIds.map(id => byId.get(id)).filter((activity): activity is IActivity & { id: number } => activity !== undefined);
};

export const sortUnifiedActivitiesByFlow = <
  T extends { ref: string; predecessorActivities: { ref: string }[]; subActivities: { ref: string }[] }
>(
  activities: T[]
): T[] => {
  const orderedRefs = sortNodeIdsByFlow(
    activities.map(activity => ({
      id: activity.ref,
      predecessorIds: activity.predecessorActivities.map(item => item.ref),
      subActivityIds: activity.subActivities.map(item => item.ref),
    }))
  );
  const byRef = new Map(activities.map(activity => [activity.ref, activity]));
  return orderedRefs.map(ref => byRef.get(ref)).filter((activity): activity is T => activity !== undefined);
};
