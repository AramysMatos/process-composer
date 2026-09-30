import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { ActivityRelationGrid } from 'app/modules/process-visualization/components/activity-relation-grid';
import { PrintButton } from 'app/modules/process-visualization/components/print-button';
import { ProcessDocBlock } from 'app/modules/process-visualization/components/process-doc-block';
import { ProcessEntityLink } from 'app/modules/process-visualization/components/process-entity-link';
import {
  processVisualizationActivityPath,
  processVisualizationEntityPath,
  processVisualizationOverviewPath,
} from 'app/modules/process-visualization/process-visualization-paths';

const PHASE_COLORS = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#dc3545', '#20c997', '#0dcaf0', '#d63384'];

export const ActivityVisualizationPage = () => {
  const { activityId } = useParams<'activityId'>();
  const { processId, process, phases, activities } = useProcessVisualization();
  const numericActivityId = Number(activityId);

  const activity = useMemo(() => activities.find(item => item.id === numericActivityId), [activities, numericActivityId]);

  const phaseIndex = useMemo(() => {
    const phaseId = activity?.phase?.id;
    if (phaseId === undefined) {
      return 0;
    }
    return phases.findIndex(p => p.id === phaseId);
  }, [activity?.phase?.id, phases]);

  const phaseColor = PHASE_COLORS[(phaseIndex >= 0 ? phaseIndex : 0) % PHASE_COLORS.length];

  if (!activity) {
    return (
      <div className="process-visualization-page">
        <Alert color="warning">
          <Translate contentKey="processComposerApp.processDesign.visualization.activityNotFound">Activity not found.</Translate>
        </Alert>
        <Link to={processVisualizationOverviewPath(processId)}>
          <Translate contentKey="processComposerApp.processDesign.visualization.backToOverview">Back to overview</Translate>
        </Link>
      </div>
    );
  }

  const mapLinks = (
    items: { id?: number; name?: string | null; optional?: boolean | null }[] | null | undefined,
    catalog: 'roles' | 'tools' | 'guidelines' | 'artifacts' | 'templates'
  ) =>
    (items ?? [])
      .filter(item => item.id !== undefined)
      .map(item => (
        <ProcessEntityLink
          key={item.id}
          to={processVisualizationEntityPath(processId, catalog, item.id as number)}
          name={item.name ?? translate('processComposerApp.processDesign.canvas.untitledActivity', 'Untitled')}
          optional={catalog === 'artifacts' ? item.optional : undefined}
        />
      ));

  const mapActivityLinks = (items: typeof activity.subActivities) =>
    (items ?? [])
      .filter(item => item.id !== undefined)
      .map(item => (
        <ProcessEntityLink key={item.id} to={processVisualizationActivityPath(processId, item.id as number)} name={item.name ?? ''} />
      ));

  return (
    <article className="process-visualization-page activity-visualization-sheet" data-cy="visualization-activity">
      <div className="process-visualization-toolbar">
        <PrintButton />
      </div>
      <nav className="small text-muted mb-2">
        <Link to={processVisualizationOverviewPath(processId)}>{process.processName}</Link>
        {activity.phase?.name && (
          <>
            {' › '}
            <span>{activity.phase.name}</span>
          </>
        )}
      </nav>
      <header className="activity-visualization-sheet__header">
        {activity.phase?.name && (
          <span className="activity-visualization-sheet__phase-badge" style={{ backgroundColor: phaseColor }}>
            {activity.phase.name}
          </span>
        )}
        <h1 className="activity-visualization-sheet__title">{activity.name}</h1>
      </header>

      <ProcessDocBlock
        label={translate('processComposerApp.processDesign.drawer.general.description', 'Description')}
        value={activity.description}
      />
      <ProcessDocBlock
        label={translate('processComposerApp.processDesign.drawer.general.inputCriterion', 'Input criterion')}
        value={activity.inputCriterion}
      />

      <ActivityRelationGrid
        columns={[
          {
            title: translate('processComposerApp.processDesign.drawer.artifacts.requiredArtifacts', 'Required artifacts'),
            items: mapLinks(activity.requiredArtifacts, 'artifacts'),
          },
          {
            title: translate('processComposerApp.processDesign.drawer.artifacts.producedArtifacts', 'Produced artifacts'),
            items: mapLinks(activity.producedArtifacts, 'artifacts'),
          },
          {
            title: translate('processComposerApp.processDesign.drawer.roles.participantRoles', 'Participant roles'),
            items: mapLinks(activity.participantRoles, 'roles'),
          },
          {
            title: translate('processComposerApp.processDesign.drawer.roles.responsibleRoles', 'Responsible roles'),
            items: mapLinks(activity.responsibleRoles, 'roles'),
          },
          {
            title: translate('processComposerApp.processDesign.drawer.dependencies.subActivities', 'Sub-activities'),
            items: mapActivityLinks(activity.subActivities),
          },
          {
            title: translate('processComposerApp.processDesign.drawer.resources.tools', 'Tools'),
            items: mapLinks(activity.tools, 'tools'),
          },
          {
            title: translate('processComposerApp.processDesign.drawer.resources.guidelines', 'Guidelines'),
            items: mapLinks(activity.guidelines, 'guidelines'),
          },
          {
            title: translate('processComposerApp.processDesign.drawer.resources.templates', 'Templates'),
            items: mapLinks(activity.templates, 'templates'),
          },
        ]}
      />

      {(activity.predecessorActivities?.length ?? 0) > 0 && (
        <div className="mt-4">
          <ActivityRelationGrid
            columns={[
              {
                title: translate('processComposerApp.processDesign.drawer.dependencies.predecessors', 'Predecessor activities'),
                items: mapActivityLinks(activity.predecessorActivities),
              },
            ]}
          />
        </div>
      )}
    </article>
  );
};

export default ActivityVisualizationPage;
