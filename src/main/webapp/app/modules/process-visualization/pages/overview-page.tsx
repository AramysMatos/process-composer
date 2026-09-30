import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { PrintButton } from 'app/modules/process-visualization/components/print-button';
import { processVisualizationActivityPath } from 'app/modules/process-visualization/process-visualization-paths';
import { sortedIndexedEntities } from 'app/modules/process-visualization/process-visualization-indexes';

export const OverviewPage = () => {
  const { process, processId, phases, activities, activitiesByPhaseId, indexes } = useProcessVisualization();
  const [openPhaseIds, setOpenPhaseIds] = useState<Set<number>>(
    () => new Set(phases.map(p => p.id).filter((id): id is number => id !== undefined))
  );

  const togglePhase = (phaseId: number) => {
    setOpenPhaseIds(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const roleCount = sortedIndexedEntities(indexes.roles).length;
  const toolCount = sortedIndexedEntities(indexes.tools).length;

  return (
    <div className="process-visualization-page" data-cy="visualization-overview">
      <div className="process-visualization-toolbar">
        <PrintButton />
      </div>
      <div className="process-visualization-hero">
        <h1 className="process-visualization-hero__title">{process.processName}</h1>
        {process.processDescription && <p className="process-visualization-hero__description">{process.processDescription}</p>}
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
          if (phase.id === undefined) {
            return null;
          }
          const phaseActivities = activitiesByPhaseId.get(phase.id) ?? [];
          const isOpen = openPhaseIds.has(phase.id);
          return (
            <div key={phase.id} className="mb-2 border rounded">
              <button
                type="button"
                className="btn w-100 text-start d-flex align-items-center justify-content-between process-visualization-phase-accordion__header px-3 py-2"
                onClick={() => togglePhase(phase.id)}
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
                    <div key={activity.id} className="process-visualization-activity-row">
                      <Link to={processVisualizationActivityPath(processId, activity.id as number)}>{activity.name}</Link>
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
