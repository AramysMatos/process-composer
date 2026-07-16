import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { partialUpdateEntity as partialUpdateProject } from 'app/entities/project/project.reducer';
import { validateGithubConnection } from 'app/modules/execution/execution.reducer';
import { IProject } from 'app/shared/model/project.model';

const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export interface GithubConnectModalProps {
  isOpen: boolean;
  project: IProject;
  onClose: () => void;
  onConnected?: () => void | Promise<void>;
}

export const GithubConnectModal = ({ isOpen, project, onClose, onConnected }: GithubConnectModalProps) => {
  const dispatch = useAppDispatch();
  const projectUpdating = useAppSelector(state => state.project.updating);
  const executionLoading = useAppSelector(state => state.execution.loading);

  const [token, setToken] = useState('');
  const [repository, setRepository] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [repositoryError, setRepositoryError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const busy = projectUpdating || executionLoading;

  useEffect(() => {
    if (!isOpen) {
      setToken('');
      setRepository(project.gitHubRepository ?? '');
      setTokenError(null);
      setRepositoryError(null);
      setSubmitError(null);
      return;
    }

    setRepository(project.gitHubRepository ?? '');
    setToken('');
    setTokenError(null);
    setRepositoryError(null);
    setSubmitError(null);
  }, [isOpen, project.gitHubRepository]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTokenError(null);
    setRepositoryError(null);
    setSubmitError(null);

    const trimmedToken = token.trim();
    const trimmedRepository = repository.trim();

    let hasError = false;
    if (!trimmedToken) {
      setTokenError('processComposerApp.execution.github.modal.validation.tokenRequired');
      hasError = true;
    }
    if (!trimmedRepository) {
      setRepositoryError('processComposerApp.execution.github.modal.validation.repositoryRequired');
      hasError = true;
    } else if (!REPOSITORY_PATTERN.test(trimmedRepository)) {
      setRepositoryError('processComposerApp.execution.github.modal.validation.repositoryFormat');
      hasError = true;
    }
    if (hasError || !project.id) {
      return;
    }

    try {
      await dispatch(
        partialUpdateProject({
          id: project.id,
          gitHubToken: trimmedToken,
          gitHubRepository: trimmedRepository,
        })
      ).unwrap();

      await dispatch(validateGithubConnection(project.id)).unwrap();

      await onConnected?.();
      onClose();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { title?: string; message?: string } } })?.response?.data?.title ??
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        translate('processComposerApp.execution.github.modal.submitError', 'Could not connect to GitHub. Check the token and repository.');
      setSubmitError(message);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} data-cy="github-connect-modal">
      <Form onSubmit={event => void handleSubmit(event)}>
        <ModalHeader toggle={onClose}>
          <Translate contentKey="processComposerApp.execution.github.modal.title">Connect to GitHub</Translate>
        </ModalHeader>
        <ModalBody>
          {submitError && (
            <Alert color="danger" className="mb-3" data-cy="github-connect-error">
              {submitError}
            </Alert>
          )}

          <FormGroup>
            <Label for="github-connect-token">
              <Translate contentKey="processComposerApp.execution.github.modal.tokenLabel">Personal Access Token</Translate>
            </Label>
            <Input
              id="github-connect-token"
              name="token"
              type="password"
              autoComplete="off"
              value={token}
              invalid={Boolean(tokenError)}
              onChange={event => setToken(event.target.value)}
              data-cy="github-connect-token"
            />
            {tokenError && (
              <FormFeedback>
                <Translate contentKey={tokenError}>Token is required.</Translate>
              </FormFeedback>
            )}
            <small className="form-text text-muted d-block mt-1">
              <Translate contentKey="processComposerApp.execution.github.modal.tokenHelp">
                The token is stored encrypted and used by the backend to communicate with GitHub on your behalf. It is never shown again
                after saving.
              </Translate>{' '}
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                <Translate contentKey="processComposerApp.execution.github.modal.tokenHelpLink">How to generate a token</Translate>
              </a>
              .{' '}
              <Translate contentKey="processComposerApp.execution.github.modal.tokenScope">
                Minimum required scope: <code>repo</code>.
              </Translate>
            </small>
          </FormGroup>

          <FormGroup>
            <Label for="github-connect-repository">
              <Translate contentKey="processComposerApp.execution.github.modal.repositoryLabel">Repository</Translate>
            </Label>
            <Input
              id="github-connect-repository"
              name="repository"
              type="text"
              placeholder="owner/repo"
              value={repository}
              invalid={Boolean(repositoryError)}
              onChange={event => setRepository(event.target.value)}
              data-cy="github-connect-repository"
            />
            {repositoryError && (
              <FormFeedback>
                <Translate contentKey={repositoryError}>Invalid repository format.</Translate>
              </FormFeedback>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button outline color="secondary" onClick={onClose} disabled={busy} data-cy="github-connect-cancel">
            <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="primary" type="submit" disabled={busy} data-cy="github-connect-submit">
            {busy ? <Spinner size="sm" /> : <Translate contentKey="processComposerApp.execution.github.modal.confirm">Connect</Translate>}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

function FormGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

export default GithubConnectModal;
