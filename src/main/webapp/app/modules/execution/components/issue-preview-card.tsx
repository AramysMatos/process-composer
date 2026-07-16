import './issue-preview-list.scss';

import React from 'react';
import { Badge, Button, Collapse, FormGroup, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { GithubIssuePreview } from 'app/modules/execution/execution.reducer';
import { MarkdownContent } from 'app/shared-ui/markdown-content';

export interface EditableIssuePreview extends GithubIssuePreview {
  included: boolean;
}

export interface IssuePreviewCardProps {
  item: EditableIssuePreview;
  alreadyPublished: boolean;
  gitHubUrl?: string | null;
  expanded: boolean;
  editingBody: boolean;
  onToggleExpanded: () => void;
  onToggleEditingBody: () => void;
  onUpdate: (patch: Partial<EditableIssuePreview>) => void;
}

export const IssuePreviewCard = ({
  item,
  alreadyPublished,
  gitHubUrl,
  expanded,
  editingBody,
  onToggleExpanded,
  onToggleEditingBody,
  onUpdate,
}: IssuePreviewCardProps) => {
  const cardClassName = ['issue-preview-card', 'mb-3', 'shadow-sm', !item.included ? 'issue-preview-card--excluded' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClassName} data-cy={`issue-preview-card-${item.taskId}`}>
      <div className="issue-preview-card__header">
        <FormGroup check className="issue-preview-card__include mb-0">
          <Input
            id={`issue-include-${item.taskId}`}
            type="checkbox"
            checked={item.included}
            disabled={alreadyPublished}
            aria-label={translate('processComposerApp.execution.github.preview.includeAria', 'Incluir na publicação')}
            onChange={event => onUpdate({ included: event.target.checked })}
            data-cy={`issue-preview-include-${item.taskId}`}
          />
        </FormGroup>

        <Input
          id={`issue-title-${item.taskId}`}
          type="text"
          className="issue-preview-card__title-input"
          value={item.title}
          disabled={alreadyPublished}
          placeholder={translate('processComposerApp.execution.github.preview.titlePlaceholder', 'Título da issue')}
          onChange={event => onUpdate({ title: event.target.value })}
          data-cy={`issue-preview-title-${item.taskId}`}
        />

        <Button
          color="link"
          className="issue-preview-card__toggle p-0"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          aria-label={
            expanded
              ? translate('processComposerApp.execution.github.preview.hideBody', 'Ocultar descrição')
              : translate('processComposerApp.execution.github.preview.viewBody', 'Ver descrição')
          }
          data-cy={`issue-preview-toggle-${item.taskId}`}
        >
          <span className="d-none d-md-inline">
            {expanded
              ? translate('processComposerApp.execution.github.preview.hideBody', 'Ocultar descrição')
              : translate('processComposerApp.execution.github.preview.viewBody', 'Ver descrição')}
          </span>
          <FontAwesomeIcon icon={expanded ? 'chevron-up' : 'chevron-down'} aria-hidden="true" />
        </Button>
      </div>

      {alreadyPublished && (
        <div className="issue-preview-card__meta">
          <Badge color="secondary" className="me-2">
            <Translate contentKey="processComposerApp.execution.github.preview.alreadyPublished">Already published</Translate>
          </Badge>
          {gitHubUrl && (
            <a href={gitHubUrl} target="_blank" rel="noopener noreferrer" className="small">
              {gitHubUrl}
            </a>
          )}
        </div>
      )}

      <Collapse isOpen={expanded}>
        {expanded && (
          <div className="issue-preview-card__body">
            {!alreadyPublished && (
              <div className="issue-preview-card__body-toolbar">
                <Button
                  color="link"
                  size="sm"
                  className="p-0"
                  onClick={onToggleEditingBody}
                  aria-label={
                    editingBody
                      ? translate('processComposerApp.execution.github.preview.viewPreview', 'Visualizar')
                      : translate('processComposerApp.execution.github.preview.editMarkdown', 'Editar Markdown')
                  }
                  data-cy={`issue-preview-edit-toggle-${item.taskId}`}
                >
                  {editingBody ? (
                    <Translate contentKey="processComposerApp.execution.github.preview.viewPreview">Visualizar</Translate>
                  ) : (
                    <Translate contentKey="processComposerApp.execution.github.preview.editMarkdown">Editar Markdown</Translate>
                  )}
                </Button>
              </div>
            )}

            {editingBody && !alreadyPublished ? (
              <Input
                id={`issue-body-${item.taskId}`}
                type="textarea"
                className="issue-preview-card__editor"
                rows={12}
                value={item.body}
                onChange={event => onUpdate({ body: event.target.value })}
                data-cy={`issue-preview-body-editor-${item.taskId}`}
              />
            ) : (
              <div className="issue-preview-card__preview" data-cy={`issue-preview-body-preview-${item.taskId}`}>
                <MarkdownContent content={item.body} />
              </div>
            )}
          </div>
        )}
      </Collapse>
    </article>
  );
};

export default IssuePreviewCard;
