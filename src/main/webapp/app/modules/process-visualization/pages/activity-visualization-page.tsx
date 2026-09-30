import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { LibraryEntityType } from 'app/modules/library/library.config';
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
import { UnifiedCatalogEntity } from 'app/modules/process-visualization/process-visualization-unified.model';
import { useVisualizationActivityRefParam } from 'app/modules/process-visualization/use-visualization-catalog-from-path';

const PHASE_COLORS = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#dc3545', '#20c997', '#0dcaf0', '#d63384'];

export const ActivityVisualizationPage = () => {
  const activityRef = useVisualizationActivityRefParam();
  const { basePath, processName, phases, activityByRef } = useProcessVisualization();

  const activity = activityRef ? activityByRef.get(activityRef) : undefined;

  const phaseIndex = useMemo(() => {
    if (!activity?.phaseRef) {
      return 0;
    }
    return phases.findIndex(p => p.ref === activity.phaseRef);
  }, [activity?.phaseRef, phases]);

  const phaseColor = PHASE_COLORS[(phaseIndex >= 0 ? phaseIndex : 0) % PHASE_COLORS.length];

  if (!activity) {
    return (
      <div className="process-visualization-page">
        <Alert color="warning">
          <Translate contentKey="processComposerApp.processDesign.visualization.activityNotFound">Activity not found.</Translate>
        </Alert>
        <Link to={processVisualizationOverviewPath(basePath)}>
          <Translate contentKey="processComposerApp.processDesign.visualization.backToOverview">Back to overview</Translate>
        </Link>
      </div>
    );
  }

  const mapLinks = (items: UnifiedCatalogEntity[], catalog: LibraryEntityType) =>
    items.map(item => (
      <ProcessEntityLink
        key={item.ref}
        to={processVisualizationEntityPath(basePath, catalog, item.ref)}
        name={item.name || translate('processComposerApp.processDesign.canvas.untitledActivity', 'Untitled')}
        optional={catalog === 'artifacts' ? item.optional : undefined}
      />
    ));

  const mapActivityLinks = (items: { ref: string; name: string }[]) =>
    items.map(item => <ProcessEntityLink key={item.ref} to={processVisualizationActivityPath(basePath, item.ref)} name={item.name} />);

  return (
    <article className="process-visualization-page activity-visualization-sheet" data-cy="visualization-activity">
      <div className="process-visualization-toolbar">
        <PrintButton />
      </div>
      <nav className="small text-muted mb-2">
        <Link to={processVisualizationOverviewPath(basePath)}>{processName}</Link>
        {activity.phaseName && (
          <>
            {' › '}
            <span>{activity.phaseName}</span>
          </>
        )}
      </nav>
      <header className="activity-visualization-sheet__header">
        {activity.phaseName && (
          <span className="activity-visualization-sheet__phase-badge" style={{ backgroundColor: phaseColor }}>
            {activity.phaseName}
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

      {(activity.predecessorActivities.length > 0 || activity.subActivities.length > 0) && (
        <div className="mt-4">
          <ActivityRelationGrid
            columns={[
              ...(activity.predecessorActivities.length > 0
                ? [
                    {
                      title: translate('processComposerApp.processDesign.drawer.dependencies.predecessors', 'Predecessor activities'),
                      items: mapActivityLinks(activity.predecessorActivities),
                    },
                  ]
                : []),
              ...(activity.subActivities.length > 0
                ? [
                    {
                      title: translate('processComposerApp.processDesign.drawer.dependencies.subActivities', 'Successor activities'),
                      items: mapActivityLinks(activity.subActivities),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </article>
  );
};

export default ActivityVisualizationPage;
