import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardTitle } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IProcess } from 'app/shared/model/process.model';

export interface IProcessSummaryCardProps {
  process: IProcess;
  phaseCount: number;
  activityCount: number;
}

export const ProcessSummaryCard = ({ process, phaseCount, activityCount }: IProcessSummaryCardProps) => {
  return (
    <Card className="home-dashboard__summary-card shadow-sm" data-cy={`processSummaryCard-${process.id}`}>
      <CardBody>
        <CardTitle tag="h3" className="h5 mb-2">
          {process.processName}
        </CardTitle>
        <p className="text-muted small mb-3">
          <Translate contentKey="home.dashboard.process.phaseCount" interpolate={{ count: phaseCount }}>
            {`${phaseCount} phases`}
          </Translate>
          {' · '}
          <Translate contentKey="home.dashboard.process.activityCount" interpolate={{ count: activityCount }}>
            {`${activityCount} activities`}
          </Translate>
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Button tag={Link} to={`/processos/${process.id}`} color="info" size="sm" data-cy="processOpenButton">
            <FontAwesomeIcon icon="eye" /> <Translate contentKey="home.dashboard.process.open">Open</Translate>
          </Button>
          <Button tag={Link} to={`/projetos/novo?processId=${process.id}`} color="primary" size="sm" data-cy="processInstantiateButton">
            <FontAwesomeIcon icon="plus" />{' '}
            <Translate contentKey="home.dashboard.process.instantiateProject">Instantiate Project</Translate>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProcessSummaryCard;
