import { Edge, Node, Position } from '@xyflow/react';
import dagre from 'dagre';

import { ActivityNodeData } from './activity-node';

export type CanvasLayoutMode = 'byPhase' | 'horizontal';

export const CANVAS_LAYOUT_STORAGE_KEY = (processId: number): string => `process-canvas-layout-${processId}`;

export const loadCanvasLayoutMode = (processId: number): CanvasLayoutMode => {
  try {
    const stored = localStorage.getItem(CANVAS_LAYOUT_STORAGE_KEY(processId));
    return stored === 'horizontal' ? 'horizontal' : 'byPhase';
  } catch {
    return 'byPhase';
  }
};

export const saveCanvasLayoutMode = (processId: number, mode: CanvasLayoutMode): void => {
  try {
    localStorage.setItem(CANVAS_LAYOUT_STORAGE_KEY(processId), mode);
  } catch {
    // ignore storage errors
  }
};

type NodePosition = { x: number; y: number };

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 88;
export const HORIZONTAL_GAP = 90;
export const PHASE_ROW_GAP = 120;
export const ROUTE_Y_OFFSET = 8;
export const ALIGN_THRESHOLD = 2;

export const HANDLE_IDS = {
  intraSource: 'right',
  intraTarget: 'left',
  crossSource: 'bottom',
  crossTarget: 'top',
} as const;

export interface ActivityRelationEdgeData extends Record<string, unknown> {
  crossPhase?: boolean;
  routeIndex?: number;
}

type PositionedNode = { position: { x: number; y: number } };
type PathPoint = [number, number];

const isSameCoordinate = (left: number, right: number): boolean => Math.abs(left - right) <= ALIGN_THRESHOLD;

export const isCrossPhaseEdge = (sourceId: string, targetId: string, phaseIdByActivityId: Map<number, number>): boolean =>
  phaseIdByActivityId.get(Number(sourceId)) !== phaseIdByActivityId.get(Number(targetId));

export const getRowIndexFromY = (y: number): number => Math.max(0, Math.round(y / (NODE_HEIGHT + PHASE_ROW_GAP)));

export const gapCenterY = (rowIndex: number): number => rowIndex * (NODE_HEIGHT + PHASE_ROW_GAP) + NODE_HEIGHT + PHASE_ROW_GAP / 2;

export const listColumnGapCenters = (nodes: PositionedNode[]): number[] => {
  if (nodes.length === 0) {
    return [0];
  }

  const sortedXs = [...new Set(nodes.map(node => node.position.x))].sort((left, right) => left - right);
  const minX = sortedXs[0];
  const maxX = Math.max(...nodes.map(node => node.position.x)) + NODE_WIDTH;
  const gaps = [minX - HORIZONTAL_GAP / 2];

  for (let index = 0; index < sortedXs.length - 1; index += 1) {
    gaps.push(sortedXs[index] + NODE_WIDTH + HORIZONTAL_GAP / 2);
  }

  gaps.push(maxX + HORIZONTAL_GAP / 2);
  return gaps;
};

export const pickChannelX = (sourceX: number, targetX: number, nodes: PositionedNode[], routeIndex: number): number => {
  const minX = Math.min(sourceX, targetX);
  const maxX = Math.max(sourceX, targetX);
  const midX = (sourceX + targetX) / 2;
  const candidates = listColumnGapCenters(nodes);
  const inRangeCandidates = candidates.filter(candidate => candidate >= minX && candidate <= maxX);
  const candidatePool = inRangeCandidates.length > 0 ? inRangeCandidates : candidates;
  const sortedCandidates = [...candidatePool].sort((left, right) => Math.abs(left - midX) - Math.abs(right - midX) || left - right);
  const candidateIndex = Math.min(routeIndex, sortedCandidates.length - 1);
  return sortedCandidates[candidateIndex];
};

const buildVerticalAlignedPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourceGapY: number,
  targetGapY: number
): PathPoint[] => {
  const points: PathPoint[] = [
    [sourceX, sourceY],
    [sourceX, sourceGapY],
  ];

  if (!isSameCoordinate(targetGapY, sourceGapY)) {
    points.push([sourceX, targetGapY]);
  }

  points.push([targetX, targetY]);
  return points;
};

const buildSameGapPath = (sourceX: number, sourceY: number, targetX: number, targetY: number, gapY: number): PathPoint[] => [
  [sourceX, sourceY],
  [sourceX, gapY],
  [targetX, gapY],
  [targetX, targetY],
];

const buildChannelPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourceGapY: number,
  targetGapY: number,
  channelX: number
): PathPoint[] => {
  const points: PathPoint[] = [
    [sourceX, sourceY],
    [sourceX, sourceGapY],
  ];

  if (!isSameCoordinate(channelX, sourceX)) {
    points.push([channelX, sourceGapY]);
  }

  if (!isSameCoordinate(targetGapY, sourceGapY)) {
    points.push([channelX, targetGapY]);
  }

  if (!isSameCoordinate(targetX, channelX) || !isSameCoordinate(targetGapY, sourceGapY)) {
    points.push([targetX, targetGapY]);
  }

  points.push([targetX, targetY]);
  return points;
};

const simplifyPathPoints = (points: PathPoint[]): PathPoint[] => {
  if (points.length <= 1) {
    return points;
  }

  const withoutDuplicates: PathPoint[] = [points[0]];
  for (let index = 1; index < points.length; index += 1) {
    const previous = withoutDuplicates[withoutDuplicates.length - 1];
    const point = points[index];
    if (!isSameCoordinate(point[0], previous[0]) || !isSameCoordinate(point[1], previous[1])) {
      withoutDuplicates.push(point);
    }
  }

  if (withoutDuplicates.length <= 2) {
    return withoutDuplicates;
  }

  const withoutCollinear: PathPoint[] = [withoutDuplicates[0]];
  for (let index = 1; index < withoutDuplicates.length - 1; index += 1) {
    const previous = withoutCollinear[withoutCollinear.length - 1];
    const current = withoutDuplicates[index];
    const next = withoutDuplicates[index + 1];
    const collinearHorizontal = isSameCoordinate(previous[1], current[1]) && isSameCoordinate(current[1], next[1]);
    const collinearVertical = isSameCoordinate(previous[0], current[0]) && isSameCoordinate(current[0], next[0]);

    if (!collinearHorizontal && !collinearVertical) {
      withoutCollinear.push(current);
    }
  }

  withoutCollinear.push(withoutDuplicates[withoutDuplicates.length - 1]);
  return withoutCollinear;
};

const getPathLabelPosition = (points: PathPoint[]): PathPoint => {
  if (points.length < 2) {
    return points[0] ?? [0, 0];
  }

  let longestSegment = 0;
  let label: PathPoint = [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2];

  for (let index = 0; index < points.length - 1; index += 1) {
    const deltaX = points[index + 1][0] - points[index][0];
    const deltaY = points[index + 1][1] - points[index][1];
    const segmentLength = deltaX * deltaX + deltaY * deltaY;
    if (segmentLength > longestSegment) {
      longestSegment = segmentLength;
      label = [(points[index][0] + points[index + 1][0]) / 2, (points[index][1] + points[index + 1][1]) / 2];
    }
  }

  return label;
};

export const getCrossPhaseEdgePath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourceRowIndex: number,
  targetRowIndex: number,
  channelX: number,
  routeIndex: number
): [path: string, labelX: number, labelY: number] => {
  const yOffset = routeIndex * ROUTE_Y_OFFSET;
  const sourceGapY = gapCenterY(sourceRowIndex) + yOffset;
  const targetGapY = gapCenterY(Math.max(sourceRowIndex, targetRowIndex - 1)) + yOffset;

  let points: PathPoint[];

  if (isSameCoordinate(sourceX, targetX)) {
    points = buildVerticalAlignedPath(sourceX, sourceY, targetX, targetY, sourceGapY, targetGapY);
  } else if (isSameCoordinate(sourceGapY, targetGapY)) {
    points = buildSameGapPath(sourceX, sourceY, targetX, targetY, sourceGapY);
  } else {
    points = buildChannelPath(sourceX, sourceY, targetX, targetY, sourceGapY, targetGapY, channelX);
  }

  const simplifiedPoints = simplifyPathPoints(points);
  const path = simplifiedPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]},${point[1]}`).join(' ');
  const [labelX, labelY] = getPathLabelPosition(simplifiedPoints);

  return [path, labelX, labelY];
};

const topologicalSort = (nodeIds: string[], edges: Edge[]): string[] => {
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

  const queue = [...nodeIds].filter(id => (inDegree.get(id) ?? 0) === 0).sort((left, right) => Number(left) - Number(right));
  const sorted: string[] = [];

  while (queue.length > 0) {
    queue.sort((left, right) => Number(left) - Number(right));
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

  const remaining = nodeIds.filter(id => !sorted.includes(id)).sort((left, right) => Number(left) - Number(right));
  return [...sorted, ...remaining];
};

const getPhaseRowY = (phaseId: number | undefined, orderedPhaseIds: number[]): number => {
  if (phaseId === undefined) {
    return orderedPhaseIds.length * (NODE_HEIGHT + PHASE_ROW_GAP);
  }
  const rowIndex = orderedPhaseIds.indexOf(phaseId);
  return (rowIndex >= 0 ? rowIndex : orderedPhaseIds.length) * (NODE_HEIGHT + PHASE_ROW_GAP);
};

export const layoutElementsByPhase = (
  nodes: Node<ActivityNodeData>[],
  edges: Edge[],
  orderedPhaseIds: number[],
  phaseIdByActivityId: Map<number, number>
): Node<ActivityNodeData>[] => {
  const positioned = new Map<string, NodePosition>();

  orderedPhaseIds.forEach((phaseId, rowIndex) => {
    const phaseNodeIds = nodes.filter(node => phaseIdByActivityId.get(Number(node.id)) === phaseId).map(node => node.id);

    if (phaseNodeIds.length === 0) {
      return;
    }

    const intraPhaseEdges = edges.filter(edge => {
      const sourcePhaseId = phaseIdByActivityId.get(Number(edge.source));
      const targetPhaseId = phaseIdByActivityId.get(Number(edge.target));
      return sourcePhaseId === phaseId && targetPhaseId === phaseId;
    });

    const orderedIds = topologicalSort(phaseNodeIds, intraPhaseEdges);
    const rowY = rowIndex * (NODE_HEIGHT + PHASE_ROW_GAP);

    orderedIds.forEach((nodeId, colIndex) => {
      positioned.set(nodeId, {
        x: colIndex * (NODE_WIDTH + HORIZONTAL_GAP),
        y: rowY,
      });
    });
  });

  const fallbackRowY = orderedPhaseIds.length * (NODE_HEIGHT + PHASE_ROW_GAP);
  nodes.forEach(node => {
    if (!positioned.has(node.id)) {
      positioned.set(node.id, { x: 0, y: fallbackRowY });
    }
  });

  return nodes.map(node => ({
    ...node,
    position: positioned.get(node.id) ?? { x: 0, y: 0 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  }));
};

export const layoutElementsHorizontal = (nodes: Node<ActivityNodeData>[], edges: Edge[]): Node<ActivityNodeData>[] => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'LR', nodesep: 70, ranksep: 90 });

  nodes.forEach(node => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach(edge => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map(node => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    };
  });
};

const getNewNodeOffset = (savedPositions: Map<string, NodePosition>): NodePosition => {
  let maxY = 0;
  savedPositions.forEach(pos => {
    maxY = Math.max(maxY, pos.y + NODE_HEIGHT + 70);
  });
  return { x: 0, y: maxY };
};

const getNewNodePositionInPhase = (
  node: Node<ActivityNodeData>,
  savedPositions: Map<string, NodePosition>,
  phaseIdByActivityId: Map<number, number>,
  orderedPhaseIds: number[]
): NodePosition => {
  const phaseId = phaseIdByActivityId.get(Number(node.id));
  const rowY = getPhaseRowY(phaseId, orderedPhaseIds);

  let maxX = -HORIZONTAL_GAP;
  savedPositions.forEach((pos, nodeId) => {
    if (phaseIdByActivityId.get(Number(nodeId)) === phaseId) {
      maxX = Math.max(maxX, pos.x);
    }
  });

  if (maxX < 0) {
    return { x: 0, y: rowY };
  }

  return { x: maxX + NODE_WIDTH + HORIZONTAL_GAP, y: rowY };
};

export const applyNodePositions = (
  nodes: Node<ActivityNodeData>[],
  edges: Edge[],
  savedPositions: Map<string, NodePosition>,
  layoutMode: CanvasLayoutMode,
  orderedPhaseIds: number[],
  phaseIdByActivityId: Map<number, number>
): Node<ActivityNodeData>[] => {
  const unknownNodes = nodes.filter(node => !savedPositions.has(node.id));

  if (unknownNodes.length === nodes.length) {
    const layoutedNodes =
      layoutMode === 'horizontal'
        ? layoutElementsHorizontal(nodes, edges)
        : layoutElementsByPhase(nodes, edges, orderedPhaseIds, phaseIdByActivityId);
    layoutedNodes.forEach(node => savedPositions.set(node.id, node.position));
    return layoutedNodes;
  }

  if (unknownNodes.length > 0) {
    if (layoutMode === 'horizontal') {
      const offset = getNewNodeOffset(savedPositions);
      const layoutedNewNodes = layoutElementsHorizontal(unknownNodes, []);
      layoutedNewNodes.forEach(node => {
        savedPositions.set(node.id, {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        });
      });
    } else {
      unknownNodes.forEach(node => {
        savedPositions.set(node.id, getNewNodePositionInPhase(node, savedPositions, phaseIdByActivityId, orderedPhaseIds));
      });
    }
  }

  return nodes.map(node => ({
    ...node,
    position: savedPositions.get(node.id) ?? { x: 0, y: 0 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  }));
};

export const annotateRelationEdges = (
  edges: Edge[],
  phaseIdByActivityId: Map<number, number>,
  layoutMode: CanvasLayoutMode = 'byPhase'
): Edge<ActivityRelationEdgeData>[] => {
  if (layoutMode === 'horizontal') {
    return edges.map(edge => ({
      ...edge,
      sourceHandle: HANDLE_IDS.intraSource,
      targetHandle: HANDLE_IDS.intraTarget,
      data: { crossPhase: false },
    }));
  }

  const crossPhaseEdges = edges.filter(edge => isCrossPhaseEdge(edge.source, edge.target, phaseIdByActivityId));
  const sortedCrossPhaseEdges = [...crossPhaseEdges].sort((left, right) => {
    const sourceCompare = Number(left.source) - Number(right.source);
    return sourceCompare !== 0 ? sourceCompare : Number(left.target) - Number(right.target);
  });
  const routeIndexByEdgeId = new Map(sortedCrossPhaseEdges.map((edge, index) => [edge.id, index]));

  return edges.map(edge => {
    if (!isCrossPhaseEdge(edge.source, edge.target, phaseIdByActivityId)) {
      return {
        ...edge,
        sourceHandle: HANDLE_IDS.intraSource,
        targetHandle: HANDLE_IDS.intraTarget,
        data: { crossPhase: false },
      };
    }

    return {
      ...edge,
      sourceHandle: HANDLE_IDS.crossSource,
      targetHandle: HANDLE_IDS.crossTarget,
      data: {
        crossPhase: true,
        routeIndex: routeIndexByEdgeId.get(edge.id) ?? 0,
      },
    };
  });
};
