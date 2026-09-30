import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Table } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import {
  useVisualizationCatalogFromPath,
  useVisualizationEntityRefParam,
} from 'app/modules/process-visualization/use-visualization-catalog-from-path';
import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { ActivityEntityRelationKind } from 'app/modules/process-visualization/process-visualization-indexes';
import { PrintButton } from 'app/modules/process-visualization/components/print-button';
import { ProcessDocBlock } from 'app/modules/process-visualization/components/process-doc-block';
import {
  processVisualizationActivityPath,
  processVisualizationCatalogPath,
} from 'app/modules/process-visualization/process-visualization-paths';

const RELATION_LABEL_KEYS: Record<ActivityEntityRelationKind, string> = {
  participantRole: 'processComposerApp.processDesign.visualization.relation.participantRole',
  responsibleRole: 'processComposerApp.processDesign.visualization.relation.responsibleRole',
  tool: 'processComposerApp.processDesign.visualization.relation.tool',
  guideline: 'processComposerApp.processDesign.visualization.relation.guideline',
  template: 'processComposerApp.processDesign.visualization.relation.template',
  requiredArtifact: 'processComposerApp.processDesign.visualization.relation.requiredArtifact',
  producedArtifact: 'processComposerApp.processDesign.visualization.relation.producedArtifact',
};

export const CatalogDetailPage = () => {
  const catalog = useVisualizationCatalogFromPath();
  const entityRef = useVisualizationEntityRefParam();
  const { basePath, indexes } = useProcessVisualization();

  const entry = useMemo(() => {
    if (!catalog || !entityRef) {
      return undefined;
    }
    return indexes[catalog].get(entityRef);
  }, [catalog, entityRef, indexes]);

  if (!catalog) {
    return null;
  }

  if (!entry) {
    return (
      <div className="process-visualization-page">
        <Alert color="warning">
          <Translate contentKey="processComposerApp.processDesign.visualization.entityNotFound">Item not found in this process.</Translate>
        </Alert>
        <Link to={processVisualizationCatalogPath(basePath, catalog)}>
          <Translate contentKey="processComposerApp.processDesign.visualization.backToCatalog">Back to list</Translate>
        </Link>
      </div>
    );
  }

  const optional = entry.entity.optional;

  return (
    <div className="process-visualization-page" data-cy="visualization-entity-detail">
      <div className="process-visualization-toolbar">
        <PrintButton />
      </div>
      <nav className="small text-muted mb-2">
        <Link to={processVisualizationCatalogPath(basePath, catalog)}>
          <Translate contentKey={`processComposerApp.processDesign.visualization.nav.${catalog}`}>{catalog}</Translate>
        </Link>
        {' › '}
        <span>{entry.entity.name}</span>
      </nav>
      <h1 className="h4 mb-2">{entry.entity.name}</h1>
      {optional && (
        <Badge color="light" className="mb-2">
          <Translate contentKey="processComposerApp.processDesign.visualization.optional">Optional</Translate>
        </Badge>
      )}
      <ProcessDocBlock
        label={translate('processComposerApp.processDesign.drawer.general.description', 'Description')}
        value={entry.entity.description}
      />
      <h2 className="h6 mt-4">
        <Translate contentKey="processComposerApp.processDesign.visualization.usedInTitle">Used in activities</Translate>
      </h2>
      <Table responsive className="process-visualization-ref-table">
        <thead>
          <tr>
            <th>
              <Translate contentKey="processComposerApp.processDesign.visualization.activityColumn">Activity</Translate>
            </th>
            <th>
              <Translate contentKey="processComposerApp.processDesign.visualization.relationColumn">Relation</Translate>
            </th>
          </tr>
        </thead>
        <tbody>
          {entry.refs.map(ref => (
            <tr key={`${ref.activityRef}-${ref.relationKind}`}>
              <td>
                <Link to={processVisualizationActivityPath(basePath, ref.activityRef)}>{ref.activityName}</Link>
              </td>
              <td>
                <Translate contentKey={RELATION_LABEL_KEYS[ref.relationKind]}>{ref.relationKind}</Translate>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CatalogDetailPage;
