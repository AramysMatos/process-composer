import './process-canvas.scss';

import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, ButtonGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { deleteEntity as deleteProcess } from 'app/entities/process/process.reducer';
import { duplicateProcess } from 'app/modules/process-design/duplicate-process';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';
import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { ActivityCanvas } from 'app/modules/process-design/components/activity-canvas';
import { ActivityDetailDrawer } from 'app/modules/process-design/components/activity-detail-drawer/activity-detail-drawer';
import { ConfirmDeleteModal } from 'app/modules/process-design/components/confirm-delete-modal';
import { CreateActivityModal } from 'app/modules/process-design/components/create-activity-modal';
import { CreatePhaseModal } from 'app/modules/process-design/components/create-phase-modal';
import { ProcessTreeSidebar } from 'app/modules/process-design/components/process-tree-sidebar';
import { useProcessEntityDelete } from 'app/modules/process-design/hooks/use-process-entity-delete';
import { useProcessActivityDeepLink } from 'app/modules/process-design/hooks/use-process-activity-deep-link';

export const ProcessCanvas = () => {
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
  const processMatches = process.id === processId;
  const processName = process.processName ?? translate('processComposerApp.processDesign.tree.untitledProcess', 'Untitled process');

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
  const [createModalPhaseId, setCreateModalPhaseId] = useState<number | null>(null);
  const [createPhaseModalOpen, setCreatePhaseModalOpen] = useState(false);
  const [deleteProcessTarget, setDeleteProcessTarget] = useState(false);
  const [deletingProcess, setDeletingProcess] = useState(false);
  const [duplicatingProcess, setDuplicatingProcess] = useState(false);

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
      navigate(`/processos/${newProcessId}/canvas`);
    } catch {
      // Error notification is handled by middleware.
    } finally {
      setDuplicatingProcess(false);
    }
  }, [dispatch, duplicatingProcess, navigate, processId]);

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
        {processMatches && (
          <CardActionsMenu
            data-cy={`processCanvasMenu-${processId}`}
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

      <div className="process-canvas__layout">
        <aside className="process-canvas__sidebar">
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
            <ActivityCanvas processId={processId} selectedActivityId={selectedActivityId} onSelectActivity={handleSelectActivity} />
          </div>
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
