import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { PrintButton } from 'app/modules/process-visualization/components/print-button';
import { processVisualizationActivityPath } from 'app/modules/process-visualization/process-visualization-paths';
import { sortedUnifiedIndexedEntities } from 'app/modules/process-visualization/process-visualization-unified.model';

export const OverviewPage = () => {
  const { basePath, processName, processDescription, phases, activities, activitiesByPhaseRef, indexes } = useProcessVisualization();
  const [openPhaseRefs, setOpenPhaseRefs] = useState<Set<string>>(() => new Set(phases.map(p => p.ref)));

  const togglePhase = (phaseRef: string) => {
    setOpenPhaseRefs(prev => {
      const next = new Set(prev);
      if (next.has(phaseRef)) {
        next.delete(phaseRef);
      } else {
        next.add(phaseRef);
      }
      return next;
    });
  };

  const roleCount = sortedUnifiedIndexedEntities(indexes.roles).length;
  const toolCount = sortedUnifiedIndexedEntities(indexes.tools).length;

  return (
    <div className="process-visualization-page" data-cy="visualization-overview">
      <div className="process-visualization-toolbar">
        <PrintButton />
      </div>
      <div className="process-visualization-hero">
        <h1 className="process-visualization-hero__title">{processName}</h1>
        {processDescription && <p className="process-visualization-hero__description">{processDescription}</p>}
        <div className="process-visualization-stats">
          <span className="process-visualization-stat-chip">
            <Translate
              contentKey="processComposerApp.processDesign.visualization.stats.phases"
              interpolate={{ count: String(phases.length) }}
            />
          </span>
          <span className="process-visualization-stat-chip">
            <Translate
              contentKey="processComposerApp.processDesign.visualization.stats.activities"
              interpolate={{ count: String(activities.length) }}
            />
          </span>
          <span className="process-visualization-stat-chip">
            <Translate contentKey="processComposerApp.processDesign.visualization.stats.roles" interpolate={{ count: String(roleCount) }} />
          </span>
          <span className="process-visualization-stat-chip">
            <Translate contentKey="processComposerApp.processDesign.visualization.stats.tools" interpolate={{ count: String(toolCount) }} />
          </span>
        </div>
      </div>

      <div className="process-visualization-phase-accordion">
        <h2 className="h5 mb-3">
          <Translate contentKey="processComposerApp.processDesign.visualization.phasesTitle">Phases and activities</Translate>
        </h2>
        {phases.map(phase => {
          const phaseActivities = activitiesByPhaseRef.get(phase.ref) ?? [];
          const isOpen = openPhaseRefs.has(phase.ref);
          return (
            <div key={phase.ref} className="mb-2 border rounded">
              <button
                type="button"
                className="btn w-100 text-start d-flex align-items-center justify-content-between process-visualization-phase-accordion__header px-3 py-2"
                onClick={() => togglePhase(phase.ref)}
              >
                <span>
                  <span className="badge process-visualization-phase-badge me-2">{phase.name}</span>
                  <span className="text-muted small">
                    {phaseActivities.length}{' '}
                    <Translate contentKey="processComposerApp.processDesign.visualization.activityCountLabel">activities</Translate>
                  </span>
                </span>
                <FontAwesomeIcon icon={isOpen ? 'chevron-up' : 'chevron-down'} />
              </button>
              <Collapse isOpen={isOpen}>
                <div className="px-3 pb-2">
                  {phase.description && <p className="small text-muted mb-2">{phase.description}</p>}
                  {phaseActivities.map(activity => (
                    <div key={activity.ref} className="process-visualization-activity-row">
                      <Link to={processVisualizationActivityPath(basePath, activity.ref)}>{activity.name}</Link>
                    </div>
                  ))}
                  {phaseActivities.length === 0 && (
                    <p className="small text-muted mb-0">
                      <Translate contentKey="processComposerApp.processDesign.visualization.noActivitiesInPhase">
                        No activities in this phase.
                      </Translate>
                    </p>
                  )}
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverviewPage;
