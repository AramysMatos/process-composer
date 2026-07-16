import './issue-preview-list.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { updateEntity as updateTask } from 'app/entities/task/task.reducer';
import { IssuePreviewCard, EditableIssuePreview } from 'app/modules/execution/components/issue-preview-card';
import { GithubIssuePreview, publishGithubIssues } from 'app/modules/execution/execution.reducer';
import { ITask } from 'app/shared/model/task.model';

export type { EditableIssuePreview };

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
  const [editingBodyTaskIds, setEditingBodyTaskIds] = useState<Set<number>>(new Set());
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
    setExpandedTaskIds(new Set());
    setEditingBodyTaskIds(new Set());
    setPublishError(null);
  }, [previews, tasksById]);

  const publishedTaskIds = useMemo(
    () => new Set([...tasksById.values()].filter(task => Boolean(task.gitHubUrl?.trim())).map(task => task.id as number)),
    [tasksById]
  );

  const selectableItems = useMemo(() => items.filter(item => !publishedTaskIds.has(item.taskId)), [items, publishedTaskIds]);

  const selectedItems = items.filter(item => item.included);

  const allSelectableSelected = selectableItems.length > 0 && selectableItems.every(item => item.included);

  const handleToggleSelectAll = useCallback(() => {
    const targetIncluded = !allSelectableSelected;
    setItems(current => current.map(item => (publishedTaskIds.has(item.taskId) ? item : { ...item, included: targetIncluded })));
  }, [allSelectableSelected, publishedTaskIds]);

  const toggleExpanded = useCallback((taskId: number) => {
    setExpandedTaskIds(current => {
      const next = new Set(current);
      if (next.has(taskId)) {
        next.delete(taskId);
        setEditingBodyTaskIds(editing => {
          const nextEditing = new Set(editing);
          nextEditing.delete(taskId);
          return nextEditing;
        });
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const toggleEditingBody = useCallback((taskId: number) => {
    setEditingBodyTaskIds(current => {
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
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {selectableItems.length > 0 && (
            <Button color="secondary" outline onClick={handleToggleSelectAll} disabled={busy} data-cy="github-toggle-select-all-button">
              <FontAwesomeIcon icon={allSelectableSelected ? 'square' : 'check-square'} className="me-2" aria-hidden="true" />
              {allSelectableSelected ? (
                <Translate contentKey="processComposerApp.execution.github.preview.deselectAll">Deselecionar todas</Translate>
              ) : (
                <Translate contentKey="processComposerApp.execution.github.preview.selectAll">Selecionar todas</Translate>
              )}
            </Button>
          )}
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
      </div>

      {publishError && (
        <Alert color="danger" className="mb-3" data-cy="github-publish-error">
          {publishError}
        </Alert>
      )}

      {items.map(item => {
        const task = tasksById.get(item.taskId);
        const alreadyPublished = Boolean(task?.gitHubUrl?.trim());

        return (
          <IssuePreviewCard
            key={item.taskId}
            item={item}
            alreadyPublished={alreadyPublished}
            gitHubUrl={task?.gitHubUrl}
            expanded={expandedTaskIds.has(item.taskId)}
            editingBody={editingBodyTaskIds.has(item.taskId)}
            onToggleExpanded={() => toggleExpanded(item.taskId)}
            onToggleEditingBody={() => toggleEditingBody(item.taskId)}
            onUpdate={patch => updateItem(item.taskId, patch)}
          />
        );
      })}
    </div>
  );
};

export default IssuePreviewList;
