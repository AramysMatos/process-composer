import './process-canvas.scss';

import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, ButtonGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
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
import { Breadcrumb } from 'app/shared-ui/breadcrumb';
import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { ActivityCanvas } from 'app/modules/process-design/components/activity-canvas';
import { ActivityDetailDrawer } from 'app/modules/process-design/components/activity-detail-drawer/activity-detail-drawer';
import { ConfirmDeleteModal } from 'app/modules/process-design/components/confirm-delete-modal';
import { CreateActivityModal } from 'app/modules/process-design/components/create-activity-modal';
import { CreatePhaseModal } from 'app/modules/process-design/components/create-phase-modal';
import { PhaseDetailDrawer } from 'app/modules/process-design/components/phase-detail-drawer/phase-detail-drawer';
import { ProcessDetailDrawer } from 'app/modules/process-design/components/process-detail-drawer/process-detail-drawer';
import { ProcessTreeSidebar } from 'app/modules/process-design/components/process-tree-sidebar';
import { useProcessEntityDelete } from 'app/modules/process-design/hooks/use-process-entity-delete';
import { useProcessActivityDeepLink } from 'app/modules/process-design/hooks/use-process-activity-deep-link';
import { useSaveToLibrary } from 'app/modules/process-design/hooks/use-save-to-library';

export const ProcessCanvas = () => {
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
  const processMatches = process.id === processId;
  const processName = process.processName ?? translate('processComposerApp.processDesign.tree.untitledProcess', 'Untitled process');
  const readOnly = processMatches && isProcessReadOnlyForUser(process, isAdmin, account.id);
  const canPromoteToSystemTemplate = processMatches && canPromoteProcessToSystemTemplate(process, isAdmin, account.id);

  const phases = useMemo(
    () => phaseEntities.filter(phase => phase.process?.id === processId).sort((left, right) => (left.id ?? 0) - (right.id ?? 0)),
    [phaseEntities, processId]
  );
  const phaseIds = useMemo((): ReadonlySet<number> => {
    const ids = phases.flatMap(phase => (phase.id !== undefined ? [phase.id] : []));
    return new Set(ids);
  }, [phases]);
  const loading = processLoading || phaseLoading || activityLoading;

  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>();
  const [drawerActivityId, setDrawerActivityId] = useState<number | null>(null);
  const [drawerPhaseId, setDrawerPhaseId] = useState<number | null>(null);
  const [createModalPhaseId, setCreateModalPhaseId] = useState<number | null>(null);
  const [createPhaseModalOpen, setCreatePhaseModalOpen] = useState(false);
  const [deleteProcessTarget, setDeleteProcessTarget] = useState(false);
  const [deletingProcess, setDeletingProcess] = useState(false);
  const [duplicatingProcess, setDuplicatingProcess] = useState(false);
  const [downloadingStaticSite, setDownloadingStaticSite] = useState(false);
  const [processEditDrawerOpen, setProcessEditDrawerOpen] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState(false);
  const [promotingToSystemTemplate, setPromotingToSystemTemplate] = useState(false);

  const handleSelectActivity = useCallback((activityId: number) => {
    setSelectedActivityId(activityId);
    setDrawerActivityId(activityId);
  }, []);

  const handleOpenActivityFromDeepLink = useCallback((activityId: number, _phaseId: number) => {
    setSelectedActivityId(activityId);
    setDrawerActivityId(activityId);
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
    (_phaseId: number) => {
      dispatch(getPhaseEntities({}));
      dispatch(getActivityEntities({ eagerload: true }));
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

  const { deleteTarget, requestDelete, cancelDelete, confirmDelete, deleting } = useProcessEntityDelete({
    onActivityDeleted: handleActivityDeleted,
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
      navigate(`/processos/${newProcessId}/canvas`);
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

  if (!isValidProcessId) {
    return (
      <div className="process-canvas" data-cy="process-canvas">
        <Alert color="danger">
          <Translate contentKey="processComposerApp.processDesign.overview.invalidProcessId">Invalid process id</Translate>
        </Alert>
      </div>
    );
  }

  return (
    <div className="process-canvas" data-cy="process-canvas">
      <header className="process-canvas__header">
        <div className="process-canvas__header-main">
          <Breadcrumb
            items={[
              {
                label: translate('processComposerApp.processDesign.overview.breadcrumbProcesses', 'Processes'),
                path: '/processos',
              },
              {
                label: processMatches ? processName : translate('processComposerApp.processDesign.overview.loadingProcess', 'Loading...'),
                path: `/processos/${processId}`,
              },
              { label: translate('processComposerApp.processDesign.overview.viewCanvas', 'Canvas') },
            ]}
            data-cy="process-canvas-breadcrumb"
          />
        </div>
        {processMatches && <CardActionsMenu data-cy={`processCanvasMenu-${processId}`} items={headerMenuItems} />}
      </header>

      {readOnly && (
        <Alert color="info" className="mb-3 mx-3" data-cy="process-read-only-banner">
          <Translate contentKey="processComposerApp.processDesign.overview.readOnlyModel">
            This is a standard model method. You can view, export, and clone it, but not edit it.
          </Translate>
        </Alert>
      )}

      <div className="process-canvas__layout">
        <aside className="process-canvas__sidebar">
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

        <section
          className="process-canvas__content"
          aria-label={translate('processComposerApp.processDesign.canvas.contentAriaLabel', 'Activity canvas')}
        >
          <div className="process-canvas__toolbar">
            <ButtonGroup className="process-canvas__view-toggle" data-cy="process-view-toggle">
              <Button tag={Link} to={`/processos/${processId}`} color="primary" outline>
                <FontAwesomeIcon icon="list" className="me-1" />
                <Translate contentKey="processComposerApp.processDesign.overview.viewList">List</Translate>
              </Button>
              <Button color="primary" active>
                <FontAwesomeIcon icon="project-diagram" className="me-1" />
                <Translate contentKey="processComposerApp.processDesign.overview.viewCanvas">Canvas</Translate>
              </Button>
            </ButtonGroup>

            <Button color="secondary" outline size="sm" onClick={() => navigate(`/processos/${processId}`)}>
              <Translate contentKey="processComposerApp.processDesign.canvas.backToList">Back to list view</Translate>
            </Button>
          </div>

          <div className="process-canvas__canvas-area">
            <ActivityCanvas
              processId={processId}
              selectedActivityId={selectedActivityId}
              onSelectActivity={handleSelectActivity}
              readOnly={readOnly}
            />
          </div>
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
        <ModalHeader toggle={handleCancelPromote} data-cy="processCanvasPromoteDialogHeading">
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
            data-cy="processCanvasConfirmPromoteButton"
          >
            <FontAwesomeIcon icon="bookmark" />{' '}
            <Translate contentKey="processComposerApp.processDesign.list.actions.promoteToSystemTemplate">Save as system model</Translate>
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteProcessTarget} toggle={handleCancelDeleteProcess}>
        <ModalHeader toggle={handleCancelDeleteProcess} data-cy="processCanvasDeleteDialogHeading">
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
            data-cy="processCanvasConfirmDeleteButton"
          >
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProcessCanvas;
