import React from 'react';
import { Badge, Button, Card, CardBody, CardTitle } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { isGitHubConnected } from 'app/modules/execution/execution.utils';
import { IProject } from 'app/shared/model/project.model';

export interface GithubStatusCardProps {
  project: IProject;
  onConnect: () => void;
  onReconnect: () => void;
}

export const GithubStatusCard = ({ project, onConnect, onReconnect }: GithubStatusCardProps) => {
  const connected = isGitHubConnected(project);

  return (
    <Card className="shadow-sm" data-cy="github-status-card">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <CardTitle tag="h2" className="h5 mb-2">
              <FontAwesomeIcon icon={['fab', 'github']} className="me-2" aria-hidden="true" />
              <Translate contentKey="processComposerApp.execution.github.status.title">GitHub connection</Translate>
            </CardTitle>

            {connected ? (
              <>
                <p className="mb-2" data-cy="github-status-repository">
                  <strong>
                    <Translate contentKey="processComposerApp.execution.github.status.repository">Repository</Translate>:
                  </strong>{' '}
                  {project.gitHubRepository}
                </p>
                <p className="mb-2 text-muted" data-cy="github-status-token">
                  <Translate contentKey="processComposerApp.execution.github.status.tokenConfigured">
                    Personal Access Token configured. The backend uses it to communicate with GitHub on your behalf.
                  </Translate>
                </p>
                <Badge color="success" data-cy="github-status-badge">
                  <Translate contentKey="processComposerApp.execution.github.status.connected">Connected</Translate>
                </Badge>
              </>
            ) : (
              <>
                <p className="mb-3 text-muted">
                  <Translate contentKey="processComposerApp.execution.github.status.disconnectedHint">
                    Connect a GitHub repository to generate issues from project tasks.
                  </Translate>
                </p>
                <Badge color="secondary" data-cy="github-status-badge">
                  <Translate contentKey="processComposerApp.execution.github.status.disconnected">Not connected</Translate>
                </Badge>
              </>
            )}
          </div>

          <div>
            {connected ? (
              <Button color="primary" outline onClick={onReconnect} data-cy="github-reconnect-button">
                <Translate contentKey="processComposerApp.execution.github.status.reconnect">Change token</Translate>
              </Button>
            ) : (
              <Button color="primary" onClick={onConnect} data-cy="github-connect-button">
                <Translate contentKey="processComposerApp.execution.github.status.connect">Connect to GitHub</Translate>
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default GithubStatusCard;
