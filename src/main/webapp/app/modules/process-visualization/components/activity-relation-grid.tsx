import React from 'react';
import { translate } from 'react-jhipster';

export interface ActivityRelationColumn {
  title: string;
  items: React.ReactNode[];
}

export interface ActivityRelationGridProps {
  columns: ActivityRelationColumn[];
}

export const ActivityRelationGrid = ({ columns }: ActivityRelationGridProps) => {
  const empty = translate('processComposerApp.processDesign.visualization.empty', '—');

  return (
    <div className="activity-relation-grid">
      {columns.map(column => (
        <div key={column.title} className="activity-relation-grid__cell">
          <div className="activity-relation-grid__title">{column.title}</div>
          {column.items.length === 0 ? (
            <div className="process-doc-block__body--empty">{empty}</div>
          ) : (
            <ul className="activity-relation-grid__list">
              {column.items.map((item, index) => (
                <li key={index} className="activity-relation-grid__item">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
