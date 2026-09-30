import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { processVisualizationActivityPath } from 'app/modules/process-visualization/process-visualization-paths';

export const ActivitiesListPage = () => {
  const { processId, phases, activitiesByPhaseId } = useProcessVisualization();
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredPhases = useMemo(() => {
    if (!normalizedQuery) {
      return phases;
    }
    return phases.filter(phase => {
      if (phase.id === undefined) {
        return false;
      }
      const list = activitiesByPhaseId.get(phase.id) ?? [];
      return list.some(a => (a.name ?? '').toLowerCase().includes(normalizedQuery));
    });
  }, [activitiesByPhaseId, normalizedQuery, phases]);

  return (
    <div className="process-visualization-page" data-cy="visualization-activities-list">
      <h1 className="h4 mb-3">
        <Translate contentKey="processComposerApp.processDesign.visualization.nav.activities">Activities</Translate>
      </h1>
      <Input
        type="search"
        className="mb-3"
        placeholder={translate('processComposerApp.processDesign.visualization.searchActivities', 'Search activities...')}
        value={query}
        onChange={e => setQuery(e.target.value)}
        data-cy="visualization-activities-search"
      />
      {filteredPhases.map(phase => {
        if (phase.id === undefined) {
          return null;
        }
        const list = (activitiesByPhaseId.get(phase.id) ?? []).filter(
          a => !normalizedQuery || (a.name ?? '').toLowerCase().includes(normalizedQuery)
        );
        if (list.length === 0) {
          return null;
        }
        return (
          <section key={phase.id} className="mb-4">
            <h2 className="h6 text-muted text-uppercase">{phase.name}</h2>
            <ul className="process-visualization-catalog-list">
              {list.map(activity => (
                <li key={activity.id} className="process-visualization-catalog-list__item">
                  <Link
                    to={processVisualizationActivityPath(processId, activity.id as number)}
                    className="process-visualization-catalog-list__link"
                  >
                    {activity.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default ActivitiesListPage;
