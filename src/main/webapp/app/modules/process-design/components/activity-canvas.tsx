import './activity-canvas.scss';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  NodeChange,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  createEntitySilent as createActivityEntity,
  getEntities as getActivityEntities,
  updateEntitySilent as updateActivityEntity,
} from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { mapIdList } from 'app/shared/util/entity-utils';
import { countArtifacts, countRoles } from 'app/shared/util/process-stats.utils';
import { ActivityNode, ActivityNodeData } from './activity-node';
import { ActivityRelationEdge } from './activity-relation-edge';

const NODE_TYPE = 'activity';
const EDGE_TYPE = 'activityRelation';
const NODE_WIDTH = 220;
const NODE_HEIGHT = 88;

type NodePosition = { x: number; y: number };

const PHASE_COLORS = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#dc3545', '#20c997', '#0dcaf0', '#d63384'];

const nodeTypes = {
  [NODE_TYPE]: ActivityNode,
};

const edgeTypes = {
  [EDGE_TYPE]: ActivityRelationEdge,
};

export interface ActivityCanvasProps {
  processId: number;
  onSelectActivity: (activityId: number) => void;
  selectedActivityId?: number;
}

const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

const toActivityUpdatePayload = (activity: IActivity): IActivity => ({
  ...activity,
  subActivities: mapIdList(activity.subActivities?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  predecessorActivities: mapIdList(
    activity.predecessorActivities?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []
  ),
  templates: mapIdList(activity.templates?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  guidelines: mapIdList(activity.guidelines?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  participantRoles: mapIdList(activity.participantRoles?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  responsibleRoles: mapIdList(activity.responsibleRoles?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  tools: mapIdList(activity.tools?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  requiredArtifacts: mapIdList(activity.requiredArtifacts?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  producedArtifacts: mapIdList(activity.producedArtifacts?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  phase: activity.phase?.id ? { id: activity.phase.id, name: activity.phase.name } : activity.phase,
});

const getPhaseColor = (phaseId: number | undefined, orderedPhaseIds: number[]): string => {
  if (phaseId === undefined) {
    return PHASE_COLORS[0];
  }
  const index = orderedPhaseIds.indexOf(phaseId);
  return PHASE_COLORS[(index >= 0 ? index : 0) % PHASE_COLORS.length];
};

const layoutElements = (nodes: Node<ActivityNodeData>[], edges: Edge[]): { nodes: Node<ActivityNodeData>[]; edges: Edge[] } => {
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

  const layoutedNodes = nodes.map(node => {
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

  return { nodes: layoutedNodes, edges };
};

const getNewNodeOffset = (savedPositions: Map<string, NodePosition>): NodePosition => {
  let maxY = 0;
  savedPositions.forEach(pos => {
    maxY = Math.max(maxY, pos.y + NODE_HEIGHT + 70);
  });
  return { x: 0, y: maxY };
};

const applyNodePositions = (
  nodes: Node<ActivityNodeData>[],
  edges: Edge[],
  savedPositions: Map<string, NodePosition>
): Node<ActivityNodeData>[] => {
  const unknownNodes = nodes.filter(node => !savedPositions.has(node.id));

  if (unknownNodes.length === nodes.length) {
    const { nodes: layoutedNodes } = layoutElements(nodes, edges);
    layoutedNodes.forEach(node => savedPositions.set(node.id, node.position));
    return layoutedNodes;
  }

  if (unknownNodes.length > 0) {
    const offset = getNewNodeOffset(savedPositions);
    const { nodes: layoutedNewNodes } = layoutElements(unknownNodes, []);
    layoutedNewNodes.forEach(node => {
      savedPositions.set(node.id, {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
      });
    });
  }

  return nodes.map(node => ({
    ...node,
    position: savedPositions.get(node.id) ?? { x: 0, y: 0 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  }));
};

const buildGraphNodesAndEdges = (
  activities: IActivity[],
  phaseColorById: Map<number, string>,
  phaseNameById: Map<number, string>,
  selectedActivityId?: number
): { nodes: Node<ActivityNodeData>[]; edges: Edge[] } => {
  const nodes: Node<ActivityNodeData>[] = activities
    .filter(activity => activity.id !== undefined)
    .map(activity => {
      const phaseId = activity.phase?.id;
      return {
        id: String(activity.id),
        type: NODE_TYPE,
        position: { x: 0, y: 0 },
        data: {
          activityId: activity.id as number,
          name: activity.name ?? translate('processComposerApp.processDesign.canvas.untitledActivity', 'Untitled activity'),
          phaseName: phaseId !== undefined ? phaseNameById.get(phaseId) ?? '' : '',
          phaseColor: phaseId !== undefined ? phaseColorById.get(phaseId) ?? PHASE_COLORS[0] : PHASE_COLORS[0],
          roleCount: countRoles(activity),
          artifactCount: countArtifacts(activity),
        },
        selected: selectedActivityId === activity.id,
      };
    });

  const edgeMap = new Map<string, Edge>();

  activities.forEach(activity => {
    if (!activity.id) {
      return;
    }

    const addRelationEdge = (parentId: number, childId: number) => {
      const edgeId = `rel-${parentId}-${childId}`;
      if (edgeMap.has(edgeId)) {
        return;
      }
      edgeMap.set(edgeId, {
        id: edgeId,
        source: String(parentId),
        target: String(childId),
        type: EDGE_TYPE,
        deletable: true,
        selectable: true,
        focusable: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#0d6efd' },
      });
    };

    activity.subActivities?.forEach(subActivity => {
      if (subActivity.id) {
        addRelationEdge(activity.id as number, subActivity.id);
      }
    });

    activity.predecessorActivities?.forEach(predecessor => {
      if (predecessor.id) {
        addRelationEdge(predecessor.id, activity.id as number);
      }
    });
  });

  return { nodes, edges: Array.from(edgeMap.values()) };
};

const ActivityCanvasInner = ({ processId, onSelectActivity, selectedActivityId }: ActivityCanvasProps) => {
  const dispatch = useAppDispatch();
  const { fitView } = useReactFlow();

  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);
  const activityUpdating = useAppSelector(state => state.activity.updating);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ActivityNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityPhaseId, setNewActivityPhaseId] = useState<number | ''>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const nodePositionsRef = useRef<Map<string, NodePosition>>(new Map());
  const shouldFitViewRef = useRef(true);

  useEffect(() => {
    nodePositionsRef.current = new Map();
    shouldFitViewRef.current = true;
  }, [processId]);

  useEffect(() => {
    dispatch(getPhaseEntities({}));
    dispatch(getActivityEntities({ eagerload: true }));
  }, [dispatch, processId]);

  const phases = useMemo(
    () => sortById<IPhase>(phaseEntities.filter(phase => phase.process?.id === processId)),
    [phaseEntities, processId]
  );

  const orderedPhaseIds = useMemo(() => phases.map(phase => phase.id).filter((id): id is number => id !== undefined), [phases]);

  const phaseColorById = useMemo(() => {
    const map = new Map<number, string>();
    orderedPhaseIds.forEach(phaseId => {
      map.set(phaseId, getPhaseColor(phaseId, orderedPhaseIds));
    });
    return map;
  }, [orderedPhaseIds]);

  const phaseNameById = useMemo(() => {
    const map = new Map<number, string>();
    phases.forEach(phase => {
      if (phase.id !== undefined) {
        map.set(phase.id, phase.name ?? '');
      }
    });
    return map;
  }, [phases]);

  const processActivities = useMemo(
    () =>
      sortById<IActivity>(
        activityEntities.filter(activity => activity.phase?.id !== undefined && orderedPhaseIds.includes(activity.phase.id))
      ),
    [activityEntities, orderedPhaseIds]
  );

  const activitiesById = useMemo(() => {
    const map = new Map<number, IActivity>();
    processActivities.forEach(activity => {
      if (activity.id !== undefined) {
        map.set(activity.id, activity);
      }
    });
    return map;
  }, [processActivities]);

  const refreshActivities = useCallback(async () => {
    await dispatch(getActivityEntities({ eagerload: true })).unwrap();
  }, [dispatch]);

  useEffect(() => {
    if (activityLoading) {
      return;
    }

    const { nodes: baseNodes, edges: nextEdges } = buildGraphNodesAndEdges(
      processActivities,
      phaseColorById,
      phaseNameById,
      selectedActivityId
    );

    const currentNodeIds = new Set(baseNodes.map(node => node.id));
    nodePositionsRef.current.forEach((_, nodeId) => {
      if (!currentNodeIds.has(nodeId)) {
        nodePositionsRef.current.delete(nodeId);
      }
    });

    const nextNodes = applyNodePositions(baseNodes, nextEdges, nodePositionsRef.current);
    const isInitialLayout = shouldFitViewRef.current;

    setNodes(nextNodes);
    setEdges(nextEdges);

    if (isInitialLayout && nextNodes.length > 0) {
      shouldFitViewRef.current = false;
      requestAnimationFrame(() => {
        void fitView({ padding: 0.2 });
      });
    }
  }, [activityLoading, processActivities, phaseColorById, phaseNameById, selectedActivityId, setNodes, setEdges, fitView]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<ActivityNodeData>>[]) => {
      onNodesChange(changes);
      changes.forEach(change => {
        if (change.type === 'position' && change.position && !change.dragging) {
          nodePositionsRef.current.set(change.id, change.position);
        }
      });
    },
    [onNodesChange]
  );

  const persistActivities = useCallback(
    async (activities: IActivity[]) => {
      for (const activity of activities) {
        await dispatch(updateActivityEntity(toActivityUpdatePayload(activity))).unwrap();
      }
      await refreshActivities();
    },
    [dispatch, refreshActivities]
  );

  const linkActivities = useCallback(
    async (parentId: number, childId: number) => {
      const parent = activitiesById.get(parentId);
      const child = activitiesById.get(childId);
      if (!parent?.id || !child?.id) {
        return;
      }

      const parentHasChild = (parent.subActivities ?? []).some(item => item.id === childId);
      const childHasParent = (child.predecessorActivities ?? []).some(item => item.id === parentId);
      if (parentHasChild && childHasParent) {
        return;
      }

      const updates: IActivity[] = [];
      if (!parentHasChild) {
        updates.push({
          ...parent,
          subActivities: [...(parent.subActivities ?? []), { id: child.id, name: child.name }],
        });
      }
      if (!childHasParent) {
        updates.push({
          ...child,
          predecessorActivities: [...(child.predecessorActivities ?? []), { id: parent.id, name: parent.name }],
        });
      }

      if (updates.length === 0) {
        return;
      }

      try {
        await persistActivities(updates);
      } catch {
        setSubmitError(translate('processComposerApp.processDesign.canvas.relationError', 'Could not save the relationship.'));
      }
    },
    [activitiesById, persistActivities]
  );

  const unlinkActivities = useCallback(
    async (parentId: number, childId: number) => {
      const parent = activitiesById.get(parentId);
      const child = activitiesById.get(childId);
      if (!parent?.id || !child?.id) {
        return;
      }

      try {
        await persistActivities([
          {
            ...parent,
            subActivities: (parent.subActivities ?? []).filter(item => item.id !== childId),
          },
          {
            ...child,
            predecessorActivities: (child.predecessorActivities ?? []).filter(item => item.id !== parentId),
          },
        ]);
      } catch {
        setSubmitError(translate('processComposerApp.processDesign.canvas.relationError', 'Could not save the relationship.'));
      }
    },
    [activitiesById, persistActivities]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) {
        return;
      }
      void linkActivities(Number(connection.source), Number(connection.target));
    },
    [linkActivities]
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) {
        const parentId = Number(edge.source);
        const childId = Number(edge.target);
        if (!parentId || !childId) {
          continue;
        }
        void unlinkActivities(parentId, childId);
      }
    },
    [unlinkActivities]
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) {
        return false;
      }
      const parentId = Number(connection.source);
      const childId = Number(connection.target);
      const parent = activitiesById.get(parentId);
      const child = activitiesById.get(childId);
      if (!parent || !child) {
        return false;
      }
      const alreadyLinked =
        (parent.subActivities ?? []).some(item => item.id === childId) ||
        (child.predecessorActivities ?? []).some(item => item.id === parentId);
      return !alreadyLinked;
    },
    [activitiesById]
  );

  const handleCreateActivity = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmedName = newActivityName.trim();
    if (!trimmedName || newActivityPhaseId === '') {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createValidation', 'Name and phase are required.'));
      return;
    }

    const phase = phases.find(item => item.id === newActivityPhaseId);
    if (!phase?.id) {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createValidation', 'Name and phase are required.'));
      return;
    }

    try {
      await dispatch(
        createActivityEntity({
          name: trimmedName,
          phase: { id: phase.id, name: phase.name },
          subActivities: [],
          predecessorActivities: [],
        })
      ).unwrap();
      await refreshActivities();
      setCreateModalOpen(false);
      setNewActivityName('');
      setNewActivityPhaseId('');
    } catch {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createError', 'Could not create the activity.'));
    }
  };

  const loading = phaseLoading || activityLoading;

  if (loading) {
    return (
      <div className="activity-canvas" data-cy="activity-canvas">
        <div className="activity-canvas__loading">
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="activity-canvas" data-cy="activity-canvas">
      {submitError && (
        <Alert color="danger" className="m-2" toggle={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {phases.length === 0 ? (
        <Alert color="info" className="m-3">
          <Translate contentKey="processComposerApp.processDesign.tree.noPhases">No phases defined yet</Translate>
        </Alert>
      ) : (
        <>
          <ReactFlow
            className="activity-canvas__flow"
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onConnect={handleConnect}
            onEdgesDelete={handleEdgesDelete}
            isValidConnection={isValidConnection}
            onNodeClick={(_, node) => onSelectActivity(Number(node.id))}
            defaultEdgeOptions={{ deletable: true, type: EDGE_TYPE }}
            elementsSelectable
            edgesFocusable
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background gap={16} size={1} />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>

          <Button
            type="button"
            color="primary"
            className="activity-canvas__fab"
            onClick={() => {
              setSubmitError(null);
              setNewActivityPhaseId(orderedPhaseIds[0] ?? '');
              setCreateModalOpen(true);
            }}
            data-cy="create-activity-fab"
          >
            <FontAwesomeIcon icon="plus" className="me-1" />
            <Translate contentKey="processComposerApp.processDesign.canvas.newActivity">New activity</Translate>
          </Button>
        </>
      )}

      <Modal isOpen={createModalOpen} toggle={() => setCreateModalOpen(false)}>
        <Form onSubmit={handleCreateActivity}>
          <ModalHeader toggle={() => setCreateModalOpen(false)}>
            <Translate contentKey="processComposerApp.processDesign.canvas.createTitle">New activity</Translate>
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="new-activity-name">
                <Translate contentKey="processComposerApp.processDesign.canvas.activityName">Activity name</Translate>
              </Label>
              <Input
                id="new-activity-name"
                value={newActivityName}
                onChange={event => setNewActivityName(event.target.value)}
                data-cy="new-activity-name"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="new-activity-phase">
                <Translate contentKey="processComposerApp.processDesign.canvas.targetPhase">Target phase</Translate>
              </Label>
              <Input
                id="new-activity-phase"
                type="select"
                value={newActivityPhaseId}
                onChange={event => setNewActivityPhaseId(event.target.value === '' ? '' : Number(event.target.value))}
                data-cy="new-activity-phase"
                required
              >
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={() => setCreateModalOpen(false)}>
              <Translate contentKey="entity.action.cancel">Cancel</Translate>
            </Button>
            <Button color="primary" type="submit" disabled={activityUpdating} data-cy="confirm-create-activity">
              <Translate contentKey="entity.action.save">Save</Translate>
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export const ActivityCanvas = (props: ActivityCanvasProps) => (
  <ReactFlowProvider>
    <ActivityCanvasInner {...props} />
  </ReactFlowProvider>
);

export default ActivityCanvas;
