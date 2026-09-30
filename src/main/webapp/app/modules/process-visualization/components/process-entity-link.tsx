import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';
import { Translate } from 'react-jhipster';

export interface ProcessEntityLinkProps {
  to: string;
  name: string;
  optional?: boolean | null;
}

export const ProcessEntityLink = ({ to, name, optional }: ProcessEntityLinkProps) => (
  <span>
    <Link to={to} className="process-entity-link">
      {name}
    </Link>
    {optional && (
      <Badge color="light" className="ms-1">
        <Translate contentKey="processComposerApp.processDesign.visualization.optional">Optional</Translate>
      </Badge>
    )}
  </span>
);
