import './process-overview.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { deleteEntity as deleteProcess } from 'app/entities/process/process.reducer';
import { duplicateProcess } from 'app/modules/process-design/duplicate-process';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';
import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { ActivityDetailDrawer } from 'app/modules/process-design/components/activity-detail-drawer/activity-detail-drawer';
import { ConfirmDeleteModal } from 'app/modules/process-design/components/confirm-delete-modal';
import { CreateActivityModal } from 'app/modules/process-design/components/create-activity-modal';
import { CreatePhaseModal } from 'app/modules/process-design/components/create-phase-modal';
import { EntityDeleteButton } from 'app/modules/process-design/components/entity-delete-button';
import { ProcessTreeSidebar } from 'app/modules/process-design/components/process-tree-sidebar';
import { useProcessEntityDelete } from 'app/modules/process-design/hooks/use-process-entity-delete';
import { useProcessActivityDeepLink } from 'app/modules/process-design/hooks/use-process-activity-deep-link';
import { countArtifacts, countRoles } from 'app/shared/util/process-stats.utils';

/** Rota `/processos/:id/canvas` registrada em `routes.tsx`. */
export const PROCESS_CANVAS_ROUTE_ENABLED = true;

type ViewMode = 'list' | 'canvas';

const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

const sortActivities = (activities: IActivity[]): IActivity[] =>
  [...activities].sort((left, right) => {
    const nameCompare = (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' });
    if (nameCompare !== 0) {
      return nameCompare;
    }
    return (left.id ?? 0) - (right.id ?? 0);
  });

export const ProcessOverview = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();

  const processId = Number(id);
  const isValidProcessId = Number.isFinite(processId) && processId > 0;

  const process = useAppSelector(state => state.process.entity);
  const processLoading = useAppSelector(state => state.process.loading);
  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>();
  const [drawerActivityId, setDrawerActivityId] = useState<number | null>(null);
  const [createModalPhaseId, setCreateModalPhaseId] = useState<number | null>(null);
  const [createPhaseModalOpen, setCreatePhaseModalOpen] = useState(false);
  const [openPhaseIds, setOpenPhaseIds] = useState<Set<number>>(() => new Set());
  const [deleteProcessTarget, setDeleteProcessTarget] = useState(false);
  const [deletingProcess, setDeletingProcess] = useState(false);
  const [duplicatingProcess, setDuplicatingProcess] = useState(false);
  const accordionInitializedRef = React.useRef(false);

  const phases = useMemo(
    () => (isValidProcessId ? sortById(phaseEntities.filter(phase => phase.process?.id === processId)) : []),
    [isValidProcessId, phaseEntities, processId]
  );

  const activitiesByPhaseId = useMemo(() => {
    const grouped = new Map<number, IActivity[]>();

    phases.forEach(phase => {
      if (!phase.id) {
        return;
      }

      grouped.set(phase.id, sortActivities(activityEntities.filter(activity => activity.phase?.id === phase.id)));
    });

    return grouped;
  }, [activityEntities, phases]);

  const phaseIds = useMemo((): ReadonlySet<number> => {
    const ids = phases.flatMap(phase => (phase.id !== undefined ? [phase.id] : []));
    return new Set(ids);
  }, [phases]);

  useEffect(() => {
    accordionInitializedRef.current = false;
    setOpenPhaseIds(new Set());
    setSelectedActivityId(undefined);
    setViewMode('list');
  }, [processId]);

  useEffect(() => {
    if (accordionInitializedRef.current || phases.length === 0) {
      return;
    }

    const firstPhaseId = phases.find(phase => phase.id !== undefined)?.id;
    if (firstPhaseId !== undefined) {
      setOpenPhaseIds(new Set([firstPhaseId]));
    }
    accordionInitializedRef.current = true;
  }, [phases]);

  const loading = processLoading || phaseLoading || activityLoading;
  const processMatches = process.id === processId;
  const processName = process.processName ?? translate('processComposerApp.processDesign.tree.untitledProcess', 'Untitled process');

  const handleSelectActivity = useCallback((activityId: number) => {
    setSelectedActivityId(activityId);
    setDrawerActivityId(activityId);
  }, []);

  const handleOpenActivityFromDeepLink = useCallback((activityId: number, phaseId: number) => {
    setSelectedActivityId(activityId);
    setDrawerActivityId(activityId);
    setOpenPhaseIds(current => new Set([...current, phaseId]));
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerActivityId(null);
  }, []);

  const { clearActivityFromUrl } = useProcessActivityDeepLink({
    processId,
    loading,
    processMatches,
    activities: activityEntities,
    phaseIds,
    onOpenActivity: handleOpenActivityFromDeepLink,
  });

  const handleCloseActivityDrawer = useCallback(() => {
    handleCloseDrawer();
    clearActivityFromUrl();
  }, [clearActivityFromUrl, handleCloseDrawer]);

  const handleActivitySaved = useCallback(() => {
    dispatch(getActivityEntities({ eagerload: true }));
  }, [dispatch]);

  const handleCreateActivity = useCallback((phaseId: number) => {
    setCreateModalPhaseId(phaseId);
  }, []);

  const handleCreatePhase = useCallback(() => {
    setCreatePhaseModalOpen(true);
  }, []);

  const handleCloseCreatePhaseModal = useCallback(() => {
    setCreatePhaseModalOpen(false);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalPhaseId(null);
  }, []);

  const handleActivityCreated = useCallback(
    (activityId: number) => {
      dispatch(getActivityEntities({ eagerload: true }));
      setSelectedActivityId(activityId);
      setDrawerActivityId(activityId);
      setCreateModalPhaseId(null);
    },
    [dispatch]
  );

  const handleActivityDuplicated = useCallback(
    (activityId: number) => {
      dispatch(getActivityEntities({ eagerload: true }));
      setSelectedActivityId(activityId);
      setDrawerActivityId(activityId);
    },
    [dispatch]
  );

  const handlePhaseCreated = useCallback(
    (phaseId: number) => {
      dispatch(getPhaseEntities({}));
      dispatch(getActivityEntities({ eagerload: true }));
      setOpenPhaseIds(current => new Set([...current, phaseId]));
    },
    [dispatch]
  );

  const handleActivityDeleted = useCallback(
    (activityId: number) => {
      if (selectedActivityId === activityId) {
        setSelectedActivityId(undefined);
      }
      if (drawerActivityId === activityId) {
        setDrawerActivityId(null);
      }
    },
    [drawerActivityId, selectedActivityId]
  );

  const handlePhaseDeleted = useCallback((phaseId: number) => {
    setOpenPhaseIds(current => {
      const next = new Set(current);
      next.delete(phaseId);
      return next;
    });
  }, []);

  const { deleteTarget, requestDelete, cancelDelete, confirmDelete, deleting } = useProcessEntityDelete({
    onActivityDeleted: handleActivityDeleted,
    onPhaseDeleted: handlePhaseDeleted,
  });

  const handleRequestDeleteProcess = useCallback(() => {
    setDeleteProcessTarget(true);
  }, []);

  const handleCancelDeleteProcess = useCallback(() => {
    if (!deletingProcess) {
      setDeleteProcessTarget(false);
    }
  }, [deletingProcess]);

  const handleConfirmDeleteProcess = useCallback(async () => {
    if (!processId) {
      return;
    }

    setDeletingProcess(true);
    try {
      await dispatch(deleteProcess(processId)).unwrap();
      setDeleteProcessTarget(false);
      navigate('/processos');
    } catch {
      // Modal stays open so the user can retry or cancel.
    } finally {
      setDeletingProcess(false);
    }
  }, [dispatch, navigate, processId]);

  const handleDuplicateProcess = useCallback(async () => {
    if (!processId || duplicatingProcess) {
      return;
    }

    setDuplicatingProcess(true);
    try {
      const newProcessId = await duplicateProcess(dispatch, processId);
      navigate(`/processos/${newProcessId}`);
    } catch {
      // Error notification is handled by middleware.
    } finally {
      setDuplicatingProcess(false);
    }
  }, [dispatch, duplicatingProcess, navigate, processId]);

  const togglePhasePanel = (phaseId: number) => {
    setOpenPhaseIds(current => {
      const next = new Set(current);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const renderActivityRow = (activity: IActivity) => {
    if (!activity.id) {
      return null;
    }

    const roleCount = countRoles(activity);
    const artifactCount = countArtifacts(activity);
    const isSelected = selectedActivityId === activity.id;

    return (
      <li key={activity.id} className="process-overview__activity-item">
        <div className="process-overview__activity-row">
          <button
            type="button"
            className={`process-overview__activity-button${isSelected ? ' process-overview__activity-button--selected' : ''}`}
            onClick={() => handleSelectActivity(activity.id as number)}
          >
            <span className="process-overview__activity-name">{activity.name}</span>
            <span className="process-overview__activity-meta">
              <span>
                <Translate contentKey="processComposerApp.processDesign.overview.rolesCount" interpolate={{ count: roleCount }}>
                  {`${roleCount} roles`}
                </Translate>
              </span>
              <span>
                <Translate contentKey="processComposerApp.processDesign.overview.artifactsCount" interpolate={{ count: artifactCount }}>
                  {`${artifactCount} artifacts`}
                </Translate>
              </span>
            </span>
          </button>
          <EntityDeleteButton
            label={translate('processComposerApp.processDesign.delete.deleteActivity', 'Delete activity')}
            onClick={() =>
              requestDelete({
                type: 'activity',
                id: activity.id as number,
                name: activity.name ?? '',
              })
            }
            data-cy={`delete-activity-${activity.id}`}
          />
        </div>
      </li>
    );
  };

  const renderPhasePanel = (phase: IPhase) => {
    if (!phase.id) {
      return null;
    }

    const phaseActivities = activitiesByPhaseId.get(phase.id) ?? [];
    const isOpen = openPhaseIds.has(phase.id);
    const panelId = `process-phase-panel-${phase.id}`;

    return (
      <Card key={phase.id} className="process-overview__phase-card">
        <CardHeader
          className="process-overview__phase-trigger"
          onClick={() => togglePhasePanel(phase.id as number)}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              togglePhasePanel(phase.id as number);
            }
          }}
        >
          <div className="process-overview__phase-header">
            <span className="process-overview__phase-title">
              <FontAwesomeIcon icon={isOpen ? 'chevron-down' : 'chevron-right'} className="me-2 text-muted" />
              {phase.name}
            </span>
            <div className="process-overview__phase-actions">
              <span className="process-overview__phase-count">
                <Translate
                  contentKey="processComposerApp.processDesign.overview.activityCount"
                  interpolate={{ count: phaseActivities.length }}
                >
                  {`${phaseActivities.length} activities`}
                </Translate>
              </span>
              <EntityDeleteButton
                label={translate('processComposerApp.processDesign.delete.deletePhase', 'Delete phase')}
                onClick={() =>
                  requestDelete({
                    type: 'phase',
                    id: phase.id as number,
                    name: phase.name ?? '',
                    activityCount: phaseActivities.length,
                  })
                }
                data-cy={`delete-phase-${phase.id}`}
              />
            </div>
          </div>
        </CardHeader>
        <Collapse isOpen={isOpen}>
          <CardBody id={panelId} className="p-0">
            {phaseActivities.length === 0 ? (
              <p className="process-overview__empty px-3 py-2 mb-0">
                <Translate contentKey="processComposerApp.processDesign.tree.noActivities">No activities yet</Translate>
              </p>
            ) : (
              <ul className="process-overview__activity-list">{phaseActivities.map(renderActivityRow)}</ul>
            )}
          </CardBody>
        </Collapse>
      </Card>
    );
  };

  if (!isValidProcessId) {
    return (
      <div className="process-overview" data-cy="process-overview">
        <Alert color="danger">
          <Translate contentKey="processComposerApp.processDesign.overview.invalidProcessId">Invalid process id</Translate>
        </Alert>
      </div>
    );
  }

  return (
    <div className="process-overview" data-cy="process-overview">
      <header className="process-overview__header">
        <div className="process-overview__header-main">
          <Breadcrumb
            items={[
              {
                label: translate('processComposerApp.processDesign.overview.breadcrumbProcesses', 'Processes'),
                path: '/processos',
              },
              { label: processMatches ? processName : translate('processComposerApp.processDesign.overview.loadingProcess', 'Loading...') },
            ]}
            data-cy="process-overview-breadcrumb"
          />
        </div>
        {processMatches && (
          <CardActionsMenu
            data-cy={`processOverviewMenu-${processId}`}
            items={[
              {
                key: 'duplicate',
                label: (
                  <>
                    <FontAwesomeIcon icon="copy" className="me-2" />
                    <Translate contentKey="processComposerApp.processDesign.list.actions.duplicate">Duplicate process</Translate>
                  </>
                ),
                onClick() {
                  void handleDuplicateProcess();
                },
                disabled: duplicatingProcess,
                'data-cy': `processDuplicate-${processId}`,
              },
              {
                key: 'export',
                label: (
                  <>
                    <FontAwesomeIcon icon="file-code" className="me-2" />
                    <Translate contentKey="processComposerApp.processDesign.list.actions.exportYaml">Export YAML</Translate>
                  </>
                ),
                to: `/processos/${processId}/exportar`,
                'data-cy': `processExportYaml-${processId}`,
              },
              {
                key: 'delete',
                label: (
                  <>
                    <FontAwesomeIcon icon="trash" className="me-2" />
                    <Translate contentKey="entity.action.delete">Delete</Translate>
                  </>
                ),
                onClick: handleRequestDeleteProcess,
                danger: true,
                disabled: deletingProcess,
                'data-cy': `processDelete-${processId}`,
              },
            ]}
          />
        )}
      </header>

      <div className="process-overview__layout">
        <aside className="process-overview__sidebar">
          <ProcessTreeSidebar
            processId={processId}
            selectedActivityId={selectedActivityId}
            onSelectActivity={handleSelectActivity}
            onCreateActivity={handleCreateActivity}
            onCreatePhase={handleCreatePhase}
            onDeletePhase={(phaseId, name, activityCount) => requestDelete({ type: 'phase', id: phaseId, name, activityCount })}
            onDeleteActivity={(activityId, name) => requestDelete({ type: 'activity', id: activityId, name })}
          />
        </aside>

        <section
          className="process-overview__content"
          aria-label={translate('processComposerApp.processDesign.overview.contentAriaLabel', 'Process content')}
        >
          <div className="process-overview__toolbar">
            <ButtonGroup className="process-overview__view-toggle" data-cy="process-view-toggle">
              <Button color="primary" outline={viewMode !== 'list'} active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                <FontAwesomeIcon icon="list" className="me-1" />
                <Translate contentKey="processComposerApp.processDesign.overview.viewList">List</Translate>
              </Button>
              <Button
                tag={Link}
                to={`/processos/${processId}/canvas`}
                id="process-overview-canvas-toggle"
                color="primary"
                outline={viewMode !== 'canvas'}
                active={viewMode === 'canvas'}
                disabled={!PROCESS_CANVAS_ROUTE_ENABLED}
              >
                <FontAwesomeIcon icon="project-diagram" className="me-1" />
                <Translate contentKey="processComposerApp.processDesign.overview.viewCanvas">Canvas</Translate>
              </Button>
            </ButtonGroup>

            {!PROCESS_CANVAS_ROUTE_ENABLED && (
              <UncontrolledTooltip target="process-overview-canvas-toggle">
                <Translate contentKey="processComposerApp.processDesign.overview.canvasUnavailable">
                  Canvas view will be available soon
                </Translate>
              </UncontrolledTooltip>
            )}
          </div>

          {loading && (
            <div className="process-overview__loading">
              <Spinner color="primary" />
            </div>
          )}

          {!loading && !processMatches && (
            <Alert color="warning">
              <Translate contentKey="processComposerApp.processDesign.tree.processNotFound">Process not found</Translate>
            </Alert>
          )}

          {!loading && processMatches && viewMode === 'list' && (
            <>
              {phases.length === 0 ? (
                <Alert color="info">
                  <Translate contentKey="processComposerApp.processDesign.tree.noPhases">No phases defined yet</Translate>
                </Alert>
              ) : (
                <div className="process-overview__accordion">{phases.map(renderPhasePanel)}</div>
              )}
            </>
          )}
        </section>
      </div>

      <ActivityDetailDrawer
        activityId={drawerActivityId}
        processId={processId}
        isOpen={drawerActivityId !== null}
        onClose={handleCloseActivityDrawer}
        onSaved={handleActivitySaved}
        onDelete={activity => requestDelete({ type: 'activity', id: activity.id, name: activity.name })}
        onDuplicated={handleActivityDuplicated}
        deleting={deleting}
      />

      <CreateActivityModal
        isOpen={createModalPhaseId !== null}
        phaseId={createModalPhaseId}
        processId={processId}
        onClose={handleCloseCreateModal}
        onCreated={handleActivityCreated}
      />

      <CreatePhaseModal
        isOpen={createPhaseModalOpen}
        processId={processId}
        onClose={handleCloseCreatePhaseModal}
        onCreated={handlePhaseCreated}
      />

      <ConfirmDeleteModal target={deleteTarget} deleting={deleting} onCancel={cancelDelete} onConfirm={confirmDelete} />

      <Modal isOpen={deleteProcessTarget} toggle={handleCancelDeleteProcess}>
        <ModalHeader toggle={handleCancelDeleteProcess} data-cy="processOverviewDeleteDialogHeading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.processDesign.list.delete.confirm" interpolate={{ name: processName }}>
            {`Are you sure you want to delete the process "${processName}"?`}
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelDeleteProcess} disabled={deletingProcess}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button
            color="danger"
            onClick={() => {
              void handleConfirmDeleteProcess();
            }}
            disabled={deletingProcess}
            data-cy="processOverviewConfirmDeleteButton"
          >
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProcessOverview;
