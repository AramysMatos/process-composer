import './process-description-summary.scss';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Translate } from 'react-jhipster';

export interface ProcessDescriptionSummaryProps {
  description?: string | null;
  'data-cy'?: string;
}

export const ProcessDescriptionSummary = ({ description, 'data-cy': dataCy }: ProcessDescriptionSummaryProps) => {
  const trimmed = description?.trim();
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (expanded || !trimmed) {
      return;
    }
    const element = textRef.current;
    if (!element) {
      return;
    }
    setCanExpand(element.scrollHeight > element.clientHeight + 1);
  }, [expanded, trimmed]);

  if (!trimmed) {
    return null;
  }

  const showToggle = canExpand || expanded;

  return (
    <div className="process-description-summary" data-cy={dataCy}>
      <p ref={textRef} className={`process-description-summary__text${expanded ? '' : ' process-description-summary__text--clamped'}`}>
        {trimmed}
      </p>
      {showToggle && (
        <button
          type="button"
          className="process-description-summary__toggle"
          onClick={() => setExpanded(current => !current)}
          data-cy={dataCy ? `${dataCy}-toggle` : 'process-description-toggle'}
        >
          {expanded ? (
            <Translate contentKey="processComposerApp.processDesign.overview.descriptionSeeLess">See less</Translate>
          ) : (
            <Translate contentKey="processComposerApp.processDesign.overview.descriptionSeeMore">See more</Translate>
          )}
        </button>
      )}
    </div>
  );
};

export default ProcessDescriptionSummary;
