import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { processVisualizationActivityPath } from 'app/modules/process-visualization/process-visualization-paths';

export const ActivitiesListPage = () => {
  const { basePath, phases, activitiesByPhaseRef } = useProcessVisualization();
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredPhases = useMemo(() => {
    if (!normalizedQuery) {
      return phases;
    }
    return phases.filter(phase => {
      const list = activitiesByPhaseRef.get(phase.ref) ?? [];
      return list.some(a => a.name.toLowerCase().includes(normalizedQuery));
    });
  }, [activitiesByPhaseRef, normalizedQuery, phases]);

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
        const list = (activitiesByPhaseRef.get(phase.ref) ?? []).filter(
          a => !normalizedQuery || a.name.toLowerCase().includes(normalizedQuery)
        );
        if (list.length === 0) {
          return null;
        }
        return (
          <section key={phase.ref} className="mb-4">
            <h2 className="h6 text-muted text-uppercase">{phase.name}</h2>
            <ul className="process-visualization-catalog-list">
              {list.map(activity => (
                <li key={activity.ref} className="process-visualization-catalog-list__item">
                  <Link to={processVisualizationActivityPath(basePath, activity.ref)} className="process-visualization-catalog-list__link">
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
