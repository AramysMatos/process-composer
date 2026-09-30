import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

export const PrintButton = ({ className }: { className?: string }) => (
  <Button type="button" color="light" size="sm" className={className} onClick={() => window.print()} data-cy="visualization-print">
    <FontAwesomeIcon icon="print" className="me-1" />
    <Translate contentKey="processComposerApp.processDesign.visualization.print">Print</Translate>
  </Button>
);
