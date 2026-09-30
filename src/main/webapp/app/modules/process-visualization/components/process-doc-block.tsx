import React from 'react';
import { translate } from 'react-jhipster';

export interface ProcessDocBlockProps {
  label: string;
  value?: string | null;
  emptyKey?: string;
}

export const ProcessDocBlock = ({
  label,
  value,
  emptyKey = 'processComposerApp.processDesign.visualization.empty',
}: ProcessDocBlockProps) => {
  const trimmed = value?.trim();
  const emptyText = translate(emptyKey, '—');

  return (
    <div className="process-doc-block">
      <div className="process-doc-block__label">{label}</div>
      <div className={`process-doc-block__body${trimmed ? '' : ' process-doc-block__body--empty'}`}>{trimmed || emptyText}</div>
    </div>
  );
};
