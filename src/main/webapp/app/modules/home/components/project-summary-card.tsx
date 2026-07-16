import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, CardBody, CardTitle } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { isGitHubConnected } from 'app/modules/execution/execution.utils';
import { IProject } from 'app/shared/model/project.model';

export interface IProjectSummaryCardProps {
  project: IProject;
}

export const ProjectSummaryCard = ({ project }: IProjectSummaryCardProps) => {
  const connected = isGitHubConnected(project);

  return (
    <Card
      tag={Link}
      to={`/projetos/${project.id}`}
      className="home-dashboard__summary-card home-dashboard__summary-card--clickable shadow-sm text-decoration-none"
      data-cy={`projectSummaryCard-${project.id}`}
    >
      <CardBody className="home-dashboard__summary-card-body">
        <CardTitle tag="h3" className="h5 mb-2 text-body">
          {project.name}
        </CardTitle>
        <p className="text-muted small mb-0">
          <Translate contentKey="home.dashboard.project.sourceProcess">Source process</Translate>:{' '}
          <span className="fw-semibold">{project.process?.processName ?? '—'}</span>
        </p>
        <Badge color={connected ? 'success' : 'secondary'} pill className="home-dashboard__summary-card-badge">
          {connected ? (
            <Translate contentKey="home.dashboard.project.githubConnected">GitHub connected</Translate>
          ) : (
            <Translate contentKey="home.dashboard.project.githubNotConnected">GitHub not connected</Translate>
          )}
        </Badge>
      </CardBody>
    </Card>
  );
};

export default ProjectSummaryCard;
