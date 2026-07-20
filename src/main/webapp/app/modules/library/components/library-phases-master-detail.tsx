import './library-phases-master-detail.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JhiItemCount, JhiPagination, Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  createEntitySilent as createPhase,
  deleteEntity as deletePhase,
  getEntities as getPhases,
  reset as resetPhase,
} from 'app/entities/phase/phase.reducer';
import { PhaseDetailEditor } from 'app/modules/process-design/components/phase-detail-editor/phase-detail-editor';

const LIST_PAGE_SIZE = 20;
const NEW_ITEM_ID = 'new';

interface LibraryPhasesMasterDetailProps {
  selectedId?: string;
  onSelectItem: (id: number | typeof NEW_ITEM_ID | undefined) => void;
}

export const LibraryPhasesMasterDetail = ({ selectedId, onSelectItem }: LibraryPhasesMasterDetailProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<{ id: number; name: string } | null>(null);

  const entities = useAppSelector(state => state.phase.entities);
  const loading = useAppSelector(state => state.phase.loading);
  const updating = useAppSelector(state => state.phase.updating);

  const isCreating = selectedId === NEW_ITEM_ID;
  const selectedNumericId = selectedId && selectedId !== NEW_ITEM_ID ? Number(selectedId) : undefined;
  const hasValidSelection = isCreating || (selectedNumericId !== undefined && !Number.isNaN(selectedNumericId));

  const trimmedSearch = searchQuery.trim().toLowerCase();

  const refreshLibraryPhases = useCallback(() => {
    dispatch(getPhases({ library: true }));
  }, [dispatch]);

  useEffect(() => {
    refreshLibraryPhases();
  }, [refreshLibraryPhases]);

  useEffect(() => {
    setActivePage(1);
  }, [trimmedSearch]);

  useEffect(() => {
    if (isCreating) {
      dispatch(resetPhase());
      setNewPhaseName('');
      setCreateError(null);
    }
  }, [dispatch, isCreating]);

  const filteredEntities = useMemo(() => {
    if (!trimmedSearch) {
      return entities;
    }

    return entities.filter(item => {
      const name = item.name?.toLowerCase() ?? '';
      const description = item.description?.toLowerCase() ?? '';
      return name.includes(trimmedSearch) || description.includes(trimmedSearch);
    });
  }, [entities, trimmedSearch]);

  const displayedEntities = useMemo(() => {
    const start = (activePage - 1) * LIST_PAGE_SIZE;
    return filteredEntities.slice(start, start + LIST_PAGE_SIZE);
  }, [activePage, filteredEntities]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);

    const trimmedName = newPhaseName.trim();
    if (!trimmedName) {
      return;
    }

    try {
      const result = await dispatch(createPhase({ name: trimmedName })).unwrap();
      const createdId = result.data.id;
      if (createdId) {
        refreshLibraryPhases();
        onSelectItem(createdId);
        navigate(`/biblioteca/phases/${createdId}`);
      }
    } catch {
      setCreateError(translate('processComposerApp.library.phases.createError', 'Could not create the phase.'));
    }
  };

  const handleDeleteRequest = useCallback((phase: { id: number; name: string }) => {
    setPhaseToDelete(phase);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!phaseToDelete) {
      return;
    }

    try {
      await dispatch(deletePhase(phaseToDelete.id)).unwrap();
      setDeleteModalOpen(false);
      setPhaseToDelete(null);
      refreshLibraryPhases();
      onSelectItem(undefined);
      navigate('/biblioteca/phases');
    } catch {
      setDeleteModalOpen(false);
    }
  };

  const handleDeleted = useCallback(() => {
    refreshLibraryPhases();
    onSelectItem(undefined);
    navigate('/biblioteca/phases');
  }, [navigate, onSelectItem, refreshLibraryPhases]);

  const handleDuplicated = useCallback(
    (phaseId: number) => {
      refreshLibraryPhases();
      onSelectItem(phaseId);
      navigate(`/biblioteca/phases/${phaseId}`);
    },
    [navigate, onSelectItem, refreshLibraryPhases]
  );

  return (
    <div className="library-master-detail library-phases-master-detail" data-cy="libraryMasterDetail-phases">
      <section className="library-master-detail__master" aria-label={translate('processComposerApp.library.masterList', 'Master list')}>
        <div className="library-master-detail__master-header">
          <InputGroup>
            <InputGroupText>
              <FontAwesomeIcon icon="search" />
            </InputGroupText>
            <Input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder={translate('processComposerApp.library.searchPlaceholder', 'Search by name...')}
              aria-label={translate('processComposerApp.library.searchPlaceholder', 'Search by name...')}
              data-cy="libraryPhasesSearchInput"
            />
          </InputGroup>
          <Button color="primary" size="sm" onClick={() => onSelectItem(NEW_ITEM_ID)} data-cy="libraryPhasesCreateButton">
            <FontAwesomeIcon icon="plus" /> <Translate contentKey="processComposerApp.library.phases.createLabel">New phase</Translate>
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" size="sm" />
          </div>
        )}

        {!loading && filteredEntities.length === 0 && (
          <div className="alert alert-warning m-3 mb-0" data-cy="libraryPhasesListEmpty">
            <Translate contentKey="processComposerApp.library.notFound">No items found</Translate>
          </div>
        )}

        {!loading && displayedEntities.length > 0 && (
          <div className="library-master-detail__list" data-cy="libraryPhasesMasterList">
            {displayedEntities.map(item => {
              const isSelected = item.id === selectedNumericId;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`library-master-detail__list-item${isSelected ? ' library-master-detail__list-item--selected' : ''}`}
                  onClick={() => item.id && onSelectItem(item.id)}
                  data-cy={`libraryPhasesListItem-${item.id}`}
                >
                  <span className="library-master-detail__list-item-name">{item.name}</span>
                  {item.description && <span className="library-master-detail__list-item-description">{item.description}</span>}
                </button>
              );
            })}
          </div>
        )}

        {!loading && filteredEntities.length > LIST_PAGE_SIZE && (
          <div className="p-3 border-top">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <JhiItemCount page={activePage} total={filteredEntities.length} itemsPerPage={LIST_PAGE_SIZE} i18nEnabled />
              <JhiPagination
                activePage={activePage}
                onSelect={setActivePage}
                maxButtons={5}
                itemsPerPage={LIST_PAGE_SIZE}
                totalItems={filteredEntities.length}
              />
            </div>
          </div>
        )}
      </section>

      <section className="library-master-detail__detail" aria-label={translate('processComposerApp.library.detailPanel', 'Detail panel')}>
        {!hasValidSelection ? (
          <div className="library-master-detail__detail-empty" data-cy="libraryPhasesDetailEmpty">
            <Translate contentKey="processComposerApp.library.phases.selectItem">
              Select a phase from the list or create a new one
            </Translate>
          </div>
        ) : isCreating ? (
          <div className="library-master-detail__detail-body">
            <h2 className="h4 mb-3">
              <Translate contentKey="processComposerApp.library.phases.createTitle">New phase</Translate>
            </h2>

            {createError && (
              <Alert color="danger" className="mb-3">
                {createError}
              </Alert>
            )}

            <Form
              onSubmit={event => {
                void handleCreate(event);
              }}
            >
              <FormGroup>
                <Label for="library-phase-name">
                  <Translate contentKey="processComposerApp.phase.name">Name</Translate>
                </Label>
                <Input
                  id="library-phase-name"
                  value={newPhaseName}
                  onChange={event => setNewPhaseName(event.target.value)}
                  required
                  autoFocus
                  data-cy="libraryPhaseNameInput"
                />
              </FormGroup>

              <div className="d-flex gap-2">
                <Button color="secondary" type="button" onClick={() => onSelectItem(undefined)} data-cy="libraryPhaseCreateCancel">
                  <Translate contentKey="entity.action.cancel">Cancel</Translate>
                </Button>
                <Button color="primary" type="submit" disabled={updating || !newPhaseName.trim()} data-cy="libraryPhaseCreateSubmit">
                  <FontAwesomeIcon icon="save" spin={updating} /> <Translate contentKey="entity.action.save">Save</Translate>
                </Button>
              </div>
            </Form>
          </div>
        ) : (
          <div className="library-master-detail__detail-body">
            <PhaseDetailEditor
              phaseId={selectedNumericId ?? null}
              variant="panel"
              showHeaderActions
              onSaved={refreshLibraryPhases}
              onDelete={handleDeleteRequest}
              onDeleted={handleDeleted}
              onDuplicated={handleDuplicated}
            />
          </div>
        )}
      </section>

      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)}>
        <ModalHeader toggle={() => setDeleteModalOpen(false)} data-cy="libraryPhasesDeleteDialogHeading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.library.delete.confirm" interpolate={{ name: phaseToDelete?.name ?? '' }}>
            Are you sure you want to delete this item?
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="danger" onClick={() => void handleConfirmDelete()} disabled={updating} data-cy="libraryPhasesConfirmDeleteButton">
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LibraryPhasesMasterDetail;
