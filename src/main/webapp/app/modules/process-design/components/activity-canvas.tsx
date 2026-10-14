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
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link } from 'react-router-dom';
import { Alert, Button, ButtonGroup, DropdownItem, DropdownMenu, DropdownToggle, Spinner, UncontrolledDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities, updateEntitySilent as updateActivityEntity } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { sortPhasesByActivityFlow } from 'app/shared/util/sort-activities-by-flow.utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { countArtifacts, countRoles } from 'app/shared/util/process-stats.utils';
import { ActivityNode, ActivityNodeData } from './activity-node';
import { ActivityRelationEdge } from './activity-relation-edge';
import {
  annotateRelationEdges,
  applyNodePositions,
  CanvasLayoutMode,
  loadCanvasLayoutMode,
  saveCanvasLayoutMode,
} from './activity-canvas-layout';

const NODE_TYPE = 'activity';
const EDGE_TYPE = 'activityRelation';

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
  readOnly?: boolean;
  embeddedActivities?: IActivity[];
  embeddedPhases?: IPhase[];
  /** When set, shows process-design chrome (sidebar toggle, list/canvas, create actions). */
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
  onCreatePhase?: () => void;
  onCreateActivity?: (phaseId: number) => void;
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

const buildGraphNodesAndEdges = (
  activities: IActivity[],
  phaseColorById: Map<number, string>,
  phaseNameById: Map<number, string>,
  selectedActivityId?: number,
  readOnly = false
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
        deletable: !readOnly,
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

interface ActivityCanvasToolbarProps {
  processId: number;
  sidebarVisible: boolean;
  onToggleSidebar?: () => void;
  readOnly: boolean;
  phases: IPhase[];
  layoutMode: CanvasLayoutMode;
  onLayoutModeChange: (mode: CanvasLayoutMode) => void;
  onCreatePhase?: () => void;
  onCreateActivity?: (phaseId: number) => void;
}

const ActivityCanvasToolbar = ({
  processId,
  sidebarVisible,
  onToggleSidebar,
  readOnly,
  phases,
  layoutMode,
  onLayoutModeChange,
  onCreatePhase,
  onCreateActivity,
}: ActivityCanvasToolbarProps) => {
  const isProcessDesign = Boolean(onToggleSidebar);

  const showLeftCluster = Boolean(onToggleSidebar || isProcessDesign);

  return (
    <div className="activity-canvas__toolbar" data-cy="activity-canvas-toolbar">
      {showLeftCluster && (
        <div className="activity-canvas__toolbar-start">
          <div className="activity-canvas__float-group">
            {onToggleSidebar && (
              <Button
                type="button"
                color="light"
                className="activity-canvas__toolbar-control activity-canvas__sidebar-toggle"
                onClick={onToggleSidebar}
                title={
                  sidebarVisible
                    ? translate('processComposerApp.processDesign.overview.hideSidebar', 'Hide tree')
                    : translate('processComposerApp.processDesign.overview.showSidebar', 'Show tree')
                }
                aria-label={
                  sidebarVisible
                    ? translate('processComposerApp.processDesign.overview.hideSidebar', 'Hide tree')
                    : translate('processComposerApp.processDesign.overview.showSidebar', 'Show tree')
                }
                data-cy="process-canvas-sidebar-toggle"
              >
                <FontAwesomeIcon icon={sidebarVisible ? 'chevron-left' : 'sitemap'} />
              </Button>
            )}
            {isProcessDesign && (
              <ButtonGroup className="activity-canvas__view-toggle" data-cy="process-view-toggle">
                <Button tag={Link} to={`/processos/${processId}`} color="primary" outline className="activity-canvas__view-toggle-btn">
                  <FontAwesomeIcon icon="list" className="me-1" />
                  <Translate contentKey="processComposerApp.processDesign.overview.viewList">List</Translate>
                </Button>
                <Button color="primary" active className="activity-canvas__view-toggle-btn">
                  <FontAwesomeIcon icon="project-diagram" className="me-1" />
                  <Translate contentKey="processComposerApp.processDesign.overview.viewCanvas">Canvas</Translate>
                </Button>
              </ButtonGroup>
            )}
          </div>
        </div>
      )}
      <div className="activity-canvas__toolbar-end">
        <div className="activity-canvas__float-group activity-canvas__float-group--actions">
          {isProcessDesign && !readOnly && onCreatePhase && (
            <Button
              color="primary"
              outline
              className="activity-canvas__toolbar-control"
              onClick={onCreatePhase}
              data-cy="canvas-create-phase"
              title={translate('processComposerApp.processDesign.tree.newPhase', 'New phase')}
            >
              <FontAwesomeIcon icon="plus" className="activity-canvas__action-icon" />
              <span className="activity-canvas__action-label">
                <Translate contentKey="processComposerApp.processDesign.tree.newPhase">New phase</Translate>
              </span>
            </Button>
          )}
          {isProcessDesign && !readOnly && onCreateActivity && (
            <UncontrolledDropdown>
              <DropdownToggle
                color="primary"
                outline
                caret
                className="activity-canvas__toolbar-control activity-canvas__toolbar-control--dropdown"
                disabled={phases.length === 0}
                data-cy="canvas-create-activity"
                title={translate('processComposerApp.processDesign.tree.newActivity', 'New activity')}
              >
                <FontAwesomeIcon icon="plus" className="activity-canvas__action-icon" />
                <span className="activity-canvas__action-label">
                  <Translate contentKey="processComposerApp.processDesign.tree.newActivity">New activity</Translate>
                </span>
              </DropdownToggle>
              <DropdownMenu end>
                {phases.map(phase =>
                  phase.id ? (
                    <DropdownItem key={phase.id} onClick={() => onCreateActivity(phase.id as number)}>
                      {phase.name}
                    </DropdownItem>
                  ) : null
                )}
              </DropdownMenu>
            </UncontrolledDropdown>
          )}
          <div
            className="activity-canvas__layout-mode"
            role="group"
            aria-label={translate('processComposerApp.processDesign.canvas.layoutMode.label', 'Layout')}
          >
            <ButtonGroup className="activity-canvas__layout-toggle" data-cy="canvas-layout-toggle">
              <Button
                type="button"
                color="light"
                className="activity-canvas__toolbar-control"
                active={layoutMode === 'byPhase'}
                onClick={() => onLayoutModeChange('byPhase')}
                data-cy="canvas-layout-by-phase"
              >
                <FontAwesomeIcon icon="layer-group" className="activity-canvas__layout-icon" />
                <span className="activity-canvas__layout-label">
                  <Translate contentKey="processComposerApp.processDesign.canvas.layoutMode.byPhase">By phase</Translate>
                </span>
              </Button>
              <Button
                type="button"
                color="light"
                className="activity-canvas__toolbar-control"
                active={layoutMode === 'horizontal'}
                onClick={() => onLayoutModeChange('horizontal')}
                data-cy="canvas-layout-horizontal"
              >
                <FontAwesomeIcon icon="left-right" className="activity-canvas__layout-icon" />
                <span className="activity-canvas__layout-label">
                  <Translate contentKey="processComposerApp.processDesign.canvas.layoutMode.horizontal">Horizontal</Translate>
                </span>
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityCanvasInner = ({
  processId,
  onSelectActivity,
  selectedActivityId,
  readOnly = false,
  embeddedActivities,
  embeddedPhases,
  sidebarVisible = true,
  onToggleSidebar,
  onCreatePhase,
  onCreateActivity,
}: ActivityCanvasProps) => {
  const dispatch = useAppDispatch();
  const { fitView } = useReactFlow();

  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ActivityNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<CanvasLayoutMode>(() => loadCanvasLayoutMode(processId));
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const shouldFitViewRef = useRef(true);

  useEffect(() => {
    nodePositionsRef.current = new Map();
    shouldFitViewRef.current = true;
    setLayoutMode(loadCanvasLayoutMode(processId));
  }, [processId]);

  const handleLayoutModeChange = useCallback(
    (nextMode: CanvasLayoutMode) => {
      if (nextMode === layoutMode) {
        return;
      }
      nodePositionsRef.current.clear();
      shouldFitViewRef.current = true;
      if (!readOnly) {
        saveCanvasLayoutMode(processId, nextMode);
      }
      setLayoutMode(nextMode);
    },
    [layoutMode, processId, readOnly]
  );

  useEffect(() => {
    if (embeddedActivities !== undefined) {
      return;
    }
    dispatch(getPhaseEntities({}));
    dispatch(getActivityEntities({ eagerload: true }));
  }, [dispatch, embeddedActivities, processId]);

  const phases = useMemo(() => {
    if (embeddedPhases !== undefined) {
      return sortPhasesByActivityFlow(embeddedPhases, embeddedActivities ?? []);
    }
    const processPhases = phaseEntities.filter(phase => phase.process?.id === processId);
    const phaseIds = new Set(processPhases.flatMap(phase => (phase.id !== undefined ? [phase.id] : [])));
    const processActivities = activityEntities.filter(activity => activity.phase?.id !== undefined && phaseIds.has(activity.phase.id));
    return sortPhasesByActivityFlow(processPhases, processActivities);
  }, [activityEntities, embeddedActivities, embeddedPhases, phaseEntities, processId]);

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

  const processActivities = useMemo(() => {
    if (embeddedActivities !== undefined) {
      return sortById<IActivity>(embeddedActivities);
    }
    return sortById<IActivity>(
      activityEntities.filter(activity => activity.phase?.id !== undefined && orderedPhaseIds.includes(activity.phase.id))
    );
  }, [activityEntities, embeddedActivities, orderedPhaseIds]);

  const activitiesById = useMemo(() => {
    const map = new Map<number, IActivity>();
    processActivities.forEach(activity => {
      if (activity.id !== undefined) {
        map.set(activity.id, activity);
      }
    });
    return map;
  }, [processActivities]);

  const phaseIdByActivityId = useMemo(() => {
    const map = new Map<number, number>();
    processActivities.forEach(activity => {
      if (activity.id !== undefined && activity.phase?.id !== undefined) {
        map.set(activity.id, activity.phase.id);
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
      selectedActivityId,
      readOnly
    );

    const currentNodeIds = new Set(baseNodes.map(node => node.id));
    nodePositionsRef.current.forEach((_, nodeId) => {
      if (!currentNodeIds.has(nodeId)) {
        nodePositionsRef.current.delete(nodeId);
      }
    });

    const nextNodes = applyNodePositions(baseNodes, nextEdges, nodePositionsRef.current, layoutMode, orderedPhaseIds, phaseIdByActivityId);
    const annotatedEdges = annotateRelationEdges(nextEdges, phaseIdByActivityId, layoutMode);
    const isInitialLayout = shouldFitViewRef.current;

    setNodes(nextNodes);
    setEdges(annotatedEdges);

    if (isInitialLayout && nextNodes.length > 0) {
      shouldFitViewRef.current = false;
      requestAnimationFrame(() => {
        void fitView({ padding: 0.2 });
      });
    }
  }, [
    activityLoading,
    processActivities,
    phaseColorById,
    phaseNameById,
    orderedPhaseIds,
    phaseIdByActivityId,
    layoutMode,
    selectedActivityId,
    readOnly,
    setNodes,
    setEdges,
    fitView,
  ]);

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

  const loading = embeddedActivities !== undefined ? false : phaseLoading || activityLoading;

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

      {(phases.length > 0 || onToggleSidebar) && (
        <ActivityCanvasToolbar
          processId={processId}
          sidebarVisible={sidebarVisible}
          onToggleSidebar={onToggleSidebar}
          readOnly={readOnly}
          phases={phases}
          layoutMode={layoutMode}
          onLayoutModeChange={handleLayoutModeChange}
          onCreatePhase={onCreatePhase}
          onCreateActivity={onCreateActivity}
        />
      )}

      {phases.length === 0 ? (
        <Alert color="info" className="activity-canvas__empty">
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
            onConnect={readOnly ? undefined : handleConnect}
            onEdgesDelete={readOnly ? undefined : handleEdgesDelete}
            isValidConnection={readOnly ? undefined : isValidConnection}
            onNodeClick={(_, node) => onSelectActivity(Number(node.id))}
            defaultEdgeOptions={{ deletable: !readOnly, type: EDGE_TYPE }}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable
            edgesFocusable={!readOnly}
            deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
          >
            <Background gap={16} size={1} />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </>
      )}
    </div>
  );
};

export const ActivityCanvas = (props: ActivityCanvasProps) => (
  <ReactFlowProvider>
    <ActivityCanvasInner {...props} />
  </ReactFlowProvider>
);

export default ActivityCanvas;
