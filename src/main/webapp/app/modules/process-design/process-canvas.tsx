import './process-canvas.scss';

import React, { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';
import { ActivityCanvas } from 'app/modules/process-design/components/activity-canvas';
import { ActivityDetailDrawer } from 'app/modules/process-design/components/activity-detail-drawer/activity-detail-drawer';
import { ConfirmDeleteModal } from 'app/modules/process-design/components/confirm-delete-modal';
import { CreateActivityModal } from 'app/modules/process-design/components/create-activity-modal';
import { CreatePhaseModal } from 'app/modules/process-design/components/create-phase-modal';
import { ProcessTreeSidebar } from 'app/modules/process-design/components/process-tree-sidebar';
import { useProcessEntityDelete } from 'app/modules/process-design/hooks/use-process-entity-delete';

export const ProcessCanvas = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();

  const processId = Number(id);
  const isValidProcessId = Number.isFinite(processId) && processId > 0;

  const process = useAppSelector(state => state.process.entity);
  const processMatches = process.id === processId;
  const processName = process.processName ?? translate('processComposerApp.processDesign.tree.untitledProcess', 'Untitled process');

  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>();
  const [drawerActivityId, setDrawerActivityId] = useState<number | null>(null);
  const [createModalPhaseId, setCreateModalPhaseId] = useState<number | null>(null);
  const [createPhaseModalOpen, setCreatePhaseModalOpen] = useState(false);

  const handleSelectActivity = useCallback((activityId: number) => {
    setSelectedActivityId(activityId);
    setDrawerActivityId(activityId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerActivityId(null);
  }, []);

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
        isOpen={drawerActivityId !== null}
        onClose={handleCloseDrawer}
        onSaved={handleActivitySaved}
        onDelete={activity => requestDelete({ type: 'activity', id: activity.id, name: activity.name })}
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
    </div>
  );
};

export default ProcessCanvas;
