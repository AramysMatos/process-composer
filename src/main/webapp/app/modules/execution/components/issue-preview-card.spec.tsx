import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { IssuePreviewCard } from './issue-preview-card';

jest.mock('app/shared-ui/markdown-content', () => ({
  MarkdownContent: ({ content }: { content: string }) => (
    <div data-testid="markdown-content">
      <h2>Descrição</h2>
      <p>{content}</p>
    </div>
  ),
}));

const baseItem = {
  taskId: 1,
  title: 'Minha issue',
  body: '## Descrição\n\nTexto da issue',
  included: true,
};

function getCy(container: HTMLElement, selector: string): HTMLElement {
  const element = container.querySelector(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element as HTMLElement;
}

describe('IssuePreviewCard', () => {
  it('should render compact header with title and expand control', () => {
    const { container } = render(
      <IssuePreviewCard
        item={baseItem}
        alreadyPublished={false}
        expanded={false}
        editingBody={false}
        onToggleExpanded={jest.fn()}
        onToggleEditingBody={jest.fn()}
        onUpdate={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Minha issue')).toBeTruthy();
    expect(getCy(container, '[data-cy="issue-preview-toggle-1"]')).toBeTruthy();
    expect(screen.queryByTestId('markdown-content')).toBeNull();
  });

  it('should show markdown preview when expanded', () => {
    const { container } = render(
      <IssuePreviewCard
        item={baseItem}
        alreadyPublished={false}
        expanded
        editingBody={false}
        onToggleExpanded={jest.fn()}
        onToggleEditingBody={jest.fn()}
        onUpdate={jest.fn()}
      />
    );

    expect(screen.getByTestId('markdown-content')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Descrição' })).toBeTruthy();
    expect(getCy(container, '[data-cy="issue-preview-edit-toggle-1"]')).toBeTruthy();
  });

  it('should toggle to markdown editor when edit button is clicked', () => {
    const onToggleEditingBody = jest.fn();
    const { container } = render(
      <IssuePreviewCard
        item={baseItem}
        alreadyPublished={false}
        expanded
        editingBody={false}
        onToggleExpanded={jest.fn()}
        onToggleEditingBody={onToggleEditingBody}
        onUpdate={jest.fn()}
      />
    );

    fireEvent.click(getCy(container, '[data-cy="issue-preview-edit-toggle-1"]'));
    expect(onToggleEditingBody).toHaveBeenCalledTimes(1);
  });

  it('should show textarea in editing mode', () => {
    const { container } = render(
      <IssuePreviewCard
        item={baseItem}
        alreadyPublished={false}
        expanded
        editingBody
        onToggleExpanded={jest.fn()}
        onToggleEditingBody={jest.fn()}
        onUpdate={jest.fn()}
      />
    );

    expect(getCy(container, '[data-cy="issue-preview-body-editor-1"]')).toBeTruthy();
    expect(screen.queryByTestId('markdown-content')).toBeNull();
    expect(getCy(container, '[data-cy="issue-preview-edit-toggle-1"]')).toBeTruthy();
  });

  it('should call onToggleExpanded when expand button is clicked', () => {
    const onToggleExpanded = jest.fn();
    const { container } = render(
      <IssuePreviewCard
        item={baseItem}
        alreadyPublished={false}
        expanded={false}
        editingBody={false}
        onToggleExpanded={onToggleExpanded}
        onToggleEditingBody={jest.fn()}
        onUpdate={jest.fn()}
      />
    );

    fireEvent.click(getCy(container, '[data-cy="issue-preview-toggle-1"]'));
    expect(onToggleExpanded).toHaveBeenCalledTimes(1);
  });

  it('should hide edit controls for already published issues', () => {
    const { container } = render(
      <IssuePreviewCard
        item={{ ...baseItem, included: false }}
        alreadyPublished
        gitHubUrl="https://github.com/org/repo/issues/1"
        expanded
        editingBody={false}
        onToggleExpanded={jest.fn()}
        onToggleEditingBody={jest.fn()}
        onUpdate={jest.fn()}
      />
    );

    expect(container.querySelector('[data-cy="issue-preview-edit-toggle-1"]')).toBeNull();
    expect(screen.getByTestId('markdown-content')).toBeTruthy();
    expect(screen.getByRole('link', { name: /github.com\/org\/repo\/issues\/1/i })).toBeTruthy();
  });
});
