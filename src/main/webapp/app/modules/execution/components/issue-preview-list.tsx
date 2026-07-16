import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, CardBody, Collapse, FormGroup, Input, Label, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { updateEntity as updateTask } from 'app/entities/task/task.reducer';
import { GithubIssuePreview, publishGithubIssues } from 'app/modules/execution/execution.reducer';
import { ITask } from 'app/shared/model/task.model';

export interface EditableIssuePreview extends GithubIssuePreview {
  included: boolean;
}

export interface IssuePreviewListProps {
  previews: GithubIssuePreview[];
  projectId: number;
  tasks: ITask[];
  onPublished?: () => void;
}

export const IssuePreviewList = ({ previews, projectId, tasks, onPublished }: IssuePreviewListProps) => {
  const dispatch = useAppDispatch();
  const publishing = useAppSelector(state => state.execution.publishing);
  const taskUpdating = useAppSelector(state => state.task.updating);

  const tasksById = useMemo(() => new Map(tasks.filter(task => task.id !== undefined).map(task => [task.id as number, task])), [tasks]);

  const [items, setItems] = useState<EditableIssuePreview[]>([]);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(new Set());
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    setItems(
      previews.map(preview => {
        const task = tasksById.get(preview.taskId);
        const alreadyPublished = Boolean(task?.gitHubUrl?.trim());
        return {
          ...preview,
          included: !alreadyPublished,
        };
      })
    );
    setExpandedTaskIds(new Set(previews.map(preview => preview.taskId)));
    setPublishError(null);
  }, [previews, tasksById]);

  const selectedItems = items.filter(item => item.included);

  const toggleExpanded = useCallback((taskId: number) => {
    setExpandedTaskIds(current => {
      const next = new Set(current);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const updateItem = useCallback((taskId: number, patch: Partial<EditableIssuePreview>) => {
    setItems(current => current.map(item => (item.taskId === taskId ? { ...item, ...patch } : item)));
  }, []);

  const handlePublish = async () => {
    setPublishError(null);

    if (selectedItems.length === 0) {
      setPublishError(translate('processComposerApp.execution.github.preview.noSelection', 'Select at least one issue to publish.'));
      return;
    }

    try {
      const results = await dispatch(
        publishGithubIssues({
          projectId,
          issues: selectedItems.map(item => ({
            taskId: item.taskId,
            title: item.title.trim(),
            body: item.body,
          })),
        })
      ).unwrap();

      let successCount = 0;
      for (const result of results) {
        const task = tasksById.get(result.taskId);
        if (!task) {
          continue;
        }

        await dispatch(
          updateTask({
            ...task,
            gitHubUrl: result.gitHubUrl,
            gitHubNodeId: result.gitHubNodeId,
          })
        ).unwrap();
        successCount += 1;
      }

      toast.success(
        translate('processComposerApp.execution.github.preview.publishSuccess', `${successCount} issue(s) published on GitHub.`)
      );
      onPublished?.();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { title?: string; message?: string } } })?.response?.data?.title ??
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        translate('processComposerApp.execution.github.preview.publishError', 'Failed to publish issues on GitHub.');
      setPublishError(message);
      toast.error(message);
    }
  };

  const busy = publishing || taskUpdating;

  return (
    <div className="issue-preview-list mt-4" data-cy="issue-preview-list">
      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
        <h2 className="h5 mb-0">
          <Translate contentKey="processComposerApp.execution.github.preview.title">Issue preview</Translate>
        </h2>
        <Button color="primary" onClick={() => void handlePublish()} disabled={busy} data-cy="github-publish-button">
          {busy ? (
            <Spinner size="sm" />
          ) : (
            <>
              <FontAwesomeIcon icon="upload" className="me-2" aria-hidden="true" />
              <Translate contentKey="processComposerApp.execution.github.preview.publish">Publish on GitHub</Translate>
            </>
          )}
        </Button>
      </div>

      {publishError && (
        <Alert color="danger" className="mb-3" data-cy="github-publish-error">
          {publishError}
        </Alert>
      )}

      {items.map(item => {
        const task = tasksById.get(item.taskId);
        const alreadyPublished = Boolean(task?.gitHubUrl?.trim());
        const expanded = expandedTaskIds.has(item.taskId);

        return (
          <Card key={item.taskId} className="mb-3 shadow-sm" data-cy={`issue-preview-card-${item.taskId}`}>
            <CardBody>
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
                <div className="flex-grow-1">
                  <FormGroup check className="mb-2">
                    <Input
                      id={`issue-include-${item.taskId}`}
                      type="checkbox"
                      checked={item.included}
                      disabled={alreadyPublished}
                      onChange={event => updateItem(item.taskId, { included: event.target.checked })}
                      data-cy={`issue-preview-include-${item.taskId}`}
                    />
                    <Label check for={`issue-include-${item.taskId}`} className="ms-2">
                      <Translate contentKey="processComposerApp.execution.github.preview.include">Include</Translate>
                    </Label>
                  </FormGroup>

                  <Label for={`issue-title-${item.taskId}`} className="form-label">
                    <Translate contentKey="processComposerApp.execution.github.preview.issueTitle">Title</Translate>
                  </Label>
                  <Input
                    id={`issue-title-${item.taskId}`}
                    type="text"
                    value={item.title}
                    disabled={alreadyPublished}
                    onChange={event => updateItem(item.taskId, { title: event.target.value })}
                    data-cy={`issue-preview-title-${item.taskId}`}
                  />
                </div>

                <Button color="link" className="p-0" onClick={() => toggleExpanded(item.taskId)}>
                  <FontAwesomeIcon icon={expanded ? 'chevron-up' : 'chevron-down'} aria-hidden="true" />
                </Button>
              </div>

              {alreadyPublished && task?.gitHubUrl && (
                <p className="text-muted small mb-2">
                  <Translate contentKey="processComposerApp.execution.github.preview.alreadyPublished">Already published:</Translate>{' '}
                  <a href={task.gitHubUrl} target="_blank" rel="noopener noreferrer">
                    {task.gitHubUrl}
                  </a>
                </p>
              )}

              <Collapse isOpen={expanded}>
                <Label for={`issue-body-${item.taskId}`} className="form-label">
                  <Translate contentKey="processComposerApp.execution.github.preview.issueBody">Body</Translate>
                </Label>
                <Input
                  id={`issue-body-${item.taskId}`}
                  type="textarea"
                  rows={8}
                  value={item.body}
                  disabled={alreadyPublished}
                  onChange={event => updateItem(item.taskId, { body: event.target.value })}
                  data-cy={`issue-preview-body-${item.taskId}`}
                />
              </Collapse>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

export default IssuePreviewList;
