import React from 'react';
import { Translate } from 'react-jhipster';

import { IActivity } from 'app/shared/model/activity.model';

export interface DependenciesTabProps {
  draft: IActivity;
}

const renderReadOnlyList = (items: IActivity[] | null | undefined, emptyKey: string, emptyDefault: string) => {
  if (!items?.length) {
    return (
      <p className="dependencies-tab__empty">
        <Translate contentKey={emptyKey}>{emptyDefault}</Translate>
      </p>
    );
  }

  return (
    <ul className="dependencies-tab__list">
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};

export const DependenciesTab = ({ draft }: DependenciesTabProps) => (
  <div className="activity-detail-drawer__dependencies-tab">
    <section className="dependencies-tab__section">
      <h6 className="dependencies-tab__title">
        <Translate contentKey="processComposerApp.processDesign.drawer.dependencies.predecessors">Predecessor activities</Translate>
      </h6>
      {renderReadOnlyList(
        draft.predecessorActivities,
        'processComposerApp.processDesign.drawer.dependencies.noPredecessors',
        'No predecessor activities defined'
      )}
    </section>

    <section className="dependencies-tab__section">
      <h6 className="dependencies-tab__title">
        <Translate contentKey="processComposerApp.processDesign.drawer.dependencies.subActivities">Sub-activities</Translate>
      </h6>
      {renderReadOnlyList(
        draft.subActivities,
        'processComposerApp.processDesign.drawer.dependencies.noSubActivities',
        'No sub-activities defined'
      )}
    </section>

    <p className="dependencies-tab__hint">
      <Translate contentKey="processComposerApp.processDesign.drawer.dependencies.canvasHint">
        Edit dependencies by connecting nodes on the canvas.
      </Translate>
    </p>
  </div>
);

export default DependenciesTab;
