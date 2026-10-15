import './process-description-summary.scss';

import React, { useEffect, useRef, useState } from 'react';
import { Translate } from 'react-jhipster';

export interface ProcessDescriptionSummaryProps {
  description?: string | null;
  'data-cy'?: string;
}

export const ProcessDescriptionSummary = ({ description, 'data-cy': dataCy }: ProcessDescriptionSummaryProps) => {
  const trimmed = description?.trim();
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  if (!trimmed) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={`process-description-summary${expanded ? ' process-description-summary--expanded' : ''}`}
      data-cy={dataCy}
    >
      <button
        type="button"
        className="process-description-summary__trigger"
        aria-expanded={expanded}
        onClick={() => setExpanded(current => !current)}
        data-cy={dataCy ? `${dataCy}-toggle` : 'process-description-toggle'}
      >
        <Translate contentKey="processComposerApp.processDesign.overview.descriptionShow">View description</Translate>
      </button>
      {expanded && (
        <p className="process-description-summary__text" role="region">
          {trimmed}
        </p>
      )}
    </div>
  );
};

export default ProcessDescriptionSummary;
