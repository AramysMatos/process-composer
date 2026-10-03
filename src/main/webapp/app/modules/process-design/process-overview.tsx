import './process-overview.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
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
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { deleteEntity as deleteProcess, getEntity as getProcessEntity } from 'app/entities/process/process.reducer';
import { duplicateProcess } from 'app/modules/process-design/duplicate-process';
import { canPromoteProcessToSystemTemplate, isProcessReadOnlyForUser } from 'app/modules/process-design/process-edit-access';
import { promoteProcessToSystemTemplate } from 'app/modules/process-design/promote-process-to-system-template';
import { buildProcessHeaderMenuItems } from 'app/modules/process-design/process-header-menu-items';
import { AUTHORITIES } from 'app/config/constants';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { downloadStaticSiteForProcessId } from 'app/modules/process-visualization/download-static-site-for-process';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';
import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { ActivityDetailDrawer } from 'app/modules/process-design/components/activity-detail-drawer/activity-detail-drawer';
import { ConfirmDeleteModal } from 'app/modules/process-design/components/confirm-delete-modal';
import { CreateActivityModal } from 'app/modules/process-design/components/create-activity-modal';
import { CreatePhaseModal } from 'app/modules/process-design/components/create-phase-modal';
import { EntityDeleteButton } from 'app/modules/process-design/components/entity-delete-button';
import { EntityEditButton } from 'app/modules/process-design/components/entity-edit-button';
import { EntitySaveToLibraryButton } from 'app/modules/process-design/components/entity-save-to-library-button';
import { PhaseDetailDrawer } from 'app/modules/process-design/components/phase-detail-drawer/phase-detail-drawer';
import { ProcessDetailDrawer } from 'app/modules/process-design/components/process-detail-drawer/process-detail-drawer';
import { ProcessTreeSidebar } from 'app/modules/process-design/components/process-tree-sidebar';
import { useProcessEntityDelete } from 'app/modules/process-design/hooks/use-process-entity-delete';
import { useProcessActivityDeepLink } from 'app/modules/process-design/hooks/use-process-activity-deep-link';
import { useResizableSidebarWidth } from 'app/modules/process-design/hooks/use-resizable-sidebar-width';
import { useSaveToLibrary } from 'app/modules/process-design/hooks/use-save-to-library';
import { countArtifacts, countRoles } from 'app/shared/util/process-stats.utils';
import { sortActivitiesByFlow, sortPhasesByActivityFlow } from 'app/shared/util/sort-activities-by-flow.utils';

/** Rota `/processos/:id/canvas` registrada em `routes.tsx`. */
export const PROCESS_CANVAS_ROUTE_ENABLED = true;

type ViewMode = 'list' | 'canvas';

const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

export const ProcessOverview = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();

  const processId = Number(id);
  const isValidProcessId = Number.isFinite(processId) && processId > 0;

  const process = useAppSelector(state => state.process.entity);
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = hasAnyAuthority(account.authorities, [AUTHORITIES.ADMIN]);
  const processLoading = useAppSelector(state => state.process.loading);
  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>();
  const [drawerActivityId, setDrawerActivityId] = useState<number | null>(null);
  const [drawerPhaseId, setDrawerPhaseId] = useState<number | null>(null);
  const [createModalPhaseId, setCreateModalPhaseId] = useState<number | null>(null);
  const [createPhaseModalOpen, setCreatePhaseModalOpen] = useState(false);
  const [openPhaseIds, setOpenPhaseIds] = useState<Set<number>>(() => new Set());
  const [deleteProcessTarget, setDeleteProcessTarget] = useState(false);
  const [deletingProcess, setDeletingProcess] = useState(false);
  const [duplicatingProcess, setDuplicatingProcess] = useState(false);
  const [downloadingStaticSite, setDownloadingStaticSite] = useState(false);
  const [processEditDrawerOpen, setProcessEditDrawerOpen] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState(false);
  const [promotingToSystemTemplate, setPromotingToSystemTemplate] = useState(false);
  const accordionInitializedRef = React.useRef(false);

  const { widthPx: sidebarWidthPx, minWidthPx, maxWidthPx, isResizing, startResize, resetWidth } = useResizableSidebarWidth();

  const phases = useMemo(() => {
    if (!isValidProcessId) {
      return [];
    }
    const processPhases = phaseEntities.filter(phase => phase.process?.id === processId);
    const phaseIds = new Set(processPhases.flatMap(phase => (phase.id !== undefined ? [phase.id] : [])));
    const processActivities = activityEntities.filter(activity => activity.phase?.id !== undefined && phaseIds.has(activity.phase.id));
    return sortPhasesByActivityFlow(processPhases, processActivities);
  }, [activityEntities, isValidProcessId, phaseEntities, processId]);

  const activitiesByPhaseId = useMemo(() => {
    const grouped = new Map<number, IActivity[]>();

    phases.forEach(phase => {
      if (!phase.id) {
        return;
      }

      grouped.set(phase.id, sortActivitiesByFlow(activityEntities.filter(activity => activity.phase?.id === phase.id)));
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
  const readOnly = processMatches && isProcessReadOnlyForUser(process, isAdmin, account.id);
  const canPromoteToSystemTemplate = processMatches && canPromoteProcessToSystemTemplate(process, isAdmin, account.id);

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

  const handleEditPhase = useCallback((phaseId: number) => {
    setDrawerPhaseId(phaseId);
  }, []);

  const handleClosePhaseDrawer = useCallback(() => {
    setDrawerPhaseId(null);
  }, []);

  const handlePhaseSaved = useCallback(() => {
    dispatch(getPhaseEntities({}));
  }, [dispatch]);

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

  const { isSaving, handleSaveActivityToLibrary, handleSavePhaseToLibrary } = useSaveToLibrary();

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

  const handleOpenProcessEdit = useCallback(() => {
    setProcessEditDrawerOpen(true);
  }, []);

  const handleCloseProcessEdit = useCallback(() => {
    setProcessEditDrawerOpen(false);
  }, []);

  const handleProcessSaved = useCallback(() => {
    if (isValidProcessId) {
      dispatch(getProcessEntity(processId));
    }
  }, [dispatch, isValidProcessId, processId]);

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

  const handleDownloadStaticSite = useCallback(async () => {
    if (!processId || downloadingStaticSite) {
      return;
    }

    setDownloadingStaticSite(true);
    try {
      await downloadStaticSiteForProcessId(processId);
    } catch {
      // Error notification may be handled by axios interceptor.
    } finally {
      setDownloadingStaticSite(false);
    }
  }, [downloadingStaticSite, processId]);

  const handleRequestPromoteToSystemTemplate = useCallback(() => {
    setPromoteTarget(true);
  }, []);

  const handleCancelPromote = useCallback(() => {
    if (!promotingToSystemTemplate) {
      setPromoteTarget(false);
    }
  }, [promotingToSystemTemplate]);

  const handleConfirmPromote = useCallback(async () => {
    if (!processId || promotingToSystemTemplate) {
      return;
    }

    setPromotingToSystemTemplate(true);
    try {
      await promoteProcessToSystemTemplate(processId);
      toast.success(translate('processComposerApp.processDesign.list.promote.success', 'Process published as a system model.'));
      setPromoteTarget(false);
      dispatch(getProcessEntity(processId));
      dispatch(getPhaseEntities({}));
      dispatch(getActivityEntities({ eagerload: true }));
    } catch {
      // Error notification may be handled by axios interceptor.
    } finally {
      setPromotingToSystemTemplate(false);
    }
  }, [dispatch, processId, promotingToSystemTemplate]);

  const headerMenuItems = useMemo(
    () =>
      buildProcessHeaderMenuItems({
        processId,
        readOnly,
        onEdit: handleOpenProcessEdit,
        onDuplicate: () => {
          void handleDuplicateProcess();
        },
        onDownloadStaticSite: () => {
          void handleDownloadStaticSite();
        },
        duplicatingProcess,
        downloadingStaticSite,
        deletingProcess,
        onRequestDelete: handleRequestDeleteProcess,
        canPromoteToSystemTemplate,
        onPromoteToSystemTemplate: handleRequestPromoteToSystemTemplate,
        promotingToSystemTemplate,
      }),
    [
      canPromoteToSystemTemplate,
      deletingProcess,
      downloadingStaticSite,
      duplicatingProcess,
      handleDownloadStaticSite,
      handleDuplicateProcess,
      handleOpenProcessEdit,
      handleRequestDeleteProcess,
      handleRequestPromoteToSystemTemplate,
      processId,
      promotingToSystemTemplate,
      readOnly,
    ]
  );

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
          {!readOnly && (
            <>
              <EntityEditButton
                label={translate('processComposerApp.processDesign.edit.editActivity', 'Edit activity')}
                onClick={() => handleSelectActivity(activity.id as number)}
                data-cy={`edit-activity-${activity.id}`}
              />
              <EntitySaveToLibraryButton
                label={translate('processComposerApp.processDesign.library.saveActivity', 'Save activity to library')}
                onClick={() => {
                  void handleSaveActivityToLibrary(activity.id as number);
                }}
                disabled={isSaving('activity', activity.id as number)}
                data-cy={`save-activity-to-library-${activity.id}`}
              />
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
            </>
          )}
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
              {!readOnly && (
                <>
                  <EntityEditButton
                    label={translate('processComposerApp.processDesign.edit.editPhase', 'Edit phase')}
                    onClick={() => handleEditPhase(phase.id as number)}
                    data-cy={`edit-phase-${phase.id}`}
                  />
                  <EntitySaveToLibraryButton
                    label={translate('processComposerApp.processDesign.library.savePhase', 'Save phase to library')}
                    onClick={() => {
                      void handleSavePhaseToLibrary(phase.id as number);
                    }}
                    disabled={isSaving('phase', phase.id as number)}
                    data-cy={`save-phase-to-library-${phase.id}`}
                  />
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
                </>
              )}
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
        {processMatches && <CardActionsMenu data-cy={`processOverviewMenu-${processId}`} items={headerMenuItems} />}
      </header>

      {readOnly && (
        <Alert color="info" className="mb-3" data-cy="process-read-only-banner">
          <Translate contentKey="processComposerApp.processDesign.overview.readOnlyModel">
            This is a standard model method. You can view, export, and clone it, but not edit it.
          </Translate>
        </Alert>
      )}

      <div className={`process-overview__layout${isResizing ? ' process-overview__layout--sidebar-resizing' : ''}`}>
        <div className="process-overview__sidebar-shell" style={{ width: sidebarWidthPx }} data-cy="process-overview-sidebar-shell">
          <aside className="process-overview__sidebar">
            <ProcessTreeSidebar
              processId={processId}
              selectedActivityId={selectedActivityId}
              onSelectActivity={handleSelectActivity}
              onCreateActivity={readOnly ? undefined : handleCreateActivity}
              onCreatePhase={readOnly ? undefined : handleCreatePhase}
              onEditPhase={readOnly ? undefined : handleEditPhase}
              onSavePhaseToLibrary={readOnly ? undefined : handleSavePhaseToLibrary}
              onSaveActivityToLibrary={readOnly ? undefined : handleSaveActivityToLibrary}
              isSavingToLibrary={isSaving}
              onDeletePhase={
                readOnly ? undefined : (phaseId, name, activityCount) => requestDelete({ type: 'phase', id: phaseId, name, activityCount })
              }
              onDeleteActivity={readOnly ? undefined : (activityId, name) => requestDelete({ type: 'activity', id: activityId, name })}
            />
          </aside>
          <div
            className="process-overview__sidebar-resizer"
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={sidebarWidthPx}
            aria-valuemin={minWidthPx}
            aria-valuemax={maxWidthPx}
            aria-label={translate('processComposerApp.processDesign.overview.sidebarResize', 'Resize process tree sidebar')}
            data-cy="process-overview-sidebar-resizer"
            onPointerDown={startResize}
            onDoubleClick={resetWidth}
          />
        </div>

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

      <ProcessDetailDrawer
        processId={processId}
        isOpen={processEditDrawerOpen}
        onClose={handleCloseProcessEdit}
        onSaved={handleProcessSaved}
        readOnly={readOnly}
      />

      <PhaseDetailDrawer
        phaseId={drawerPhaseId}
        processId={processId}
        isOpen={drawerPhaseId !== null}
        onClose={handleClosePhaseDrawer}
        onSaved={handlePhaseSaved}
        onDelete={readOnly ? undefined : phase => requestDelete({ type: 'phase', id: phase.id, name: phase.name })}
        deleting={deleting}
        readOnly={readOnly}
      />

      <ActivityDetailDrawer
        activityId={drawerActivityId}
        processId={processId}
        isOpen={drawerActivityId !== null}
        onClose={handleCloseActivityDrawer}
        onSaved={handleActivitySaved}
        onDelete={readOnly ? undefined : activity => requestDelete({ type: 'activity', id: activity.id, name: activity.name })}
        onDuplicated={handleActivityDuplicated}
        deleting={deleting}
        readOnly={readOnly}
      />

      {!readOnly && (
        <>
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
        </>
      )}

      <ConfirmDeleteModal target={deleteTarget} deleting={deleting} onCancel={cancelDelete} onConfirm={confirmDelete} />

      <Modal isOpen={promoteTarget} toggle={handleCancelPromote}>
        <ModalHeader toggle={handleCancelPromote} data-cy="processOverviewPromoteDialogHeading">
          <Translate contentKey="processComposerApp.processDesign.list.actions.promoteToSystemTemplate">Save as system model</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.processDesign.list.promote.confirm" interpolate={{ name: processName }}>
            {`Save "${processName}" as a system model method?`}
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelPromote} disabled={promotingToSystemTemplate}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button
            color="primary"
            onClick={() => {
              void handleConfirmPromote();
            }}
            disabled={promotingToSystemTemplate}
            data-cy="processOverviewConfirmPromoteButton"
          >
            <FontAwesomeIcon icon="bookmark" />{' '}
            <Translate contentKey="processComposerApp.processDesign.list.actions.promoteToSystemTemplate">Save as system model</Translate>
          </Button>
        </ModalFooter>
      </Modal>

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
