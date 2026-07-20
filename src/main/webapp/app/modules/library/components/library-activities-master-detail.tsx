import './library-activities-master-detail.scss';

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
  createEntitySilent as createActivity,
  deleteEntity as deleteActivity,
  getEntities as getActivities,
  reset as resetActivity,
} from 'app/entities/activity/activity.reducer';
import { ActivityDetailEditor } from 'app/modules/process-design/components/activity-detail-drawer/activity-detail-editor';
import { IActivity } from 'app/shared/model/activity.model';

const LIST_PAGE_SIZE = 20;
const NEW_ITEM_ID = 'new';

interface LibraryActivitiesMasterDetailProps {
  selectedId?: string;
  onSelectItem: (id: number | typeof NEW_ITEM_ID | undefined) => void;
}

export const LibraryActivitiesMasterDetail = ({ selectedId, onSelectItem }: LibraryActivitiesMasterDetailProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [newActivityName, setNewActivityName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<{ id: number; name: string } | null>(null);

  const entities = useAppSelector(state => state.activity.entities);
  const loading = useAppSelector(state => state.activity.loading);
  const updating = useAppSelector(state => state.activity.updating);

  const isCreating = selectedId === NEW_ITEM_ID;
  const selectedNumericId = selectedId && selectedId !== NEW_ITEM_ID ? Number(selectedId) : undefined;
  const hasValidSelection = isCreating || (selectedNumericId !== undefined && !Number.isNaN(selectedNumericId));

  const trimmedSearch = searchQuery.trim().toLowerCase();

  const refreshLibraryActivities = useCallback(() => {
    dispatch(getActivities({ library: true }));
  }, [dispatch]);

  useEffect(() => {
    refreshLibraryActivities();
  }, [refreshLibraryActivities]);

  useEffect(() => {
    setActivePage(1);
  }, [trimmedSearch]);

  useEffect(() => {
    if (isCreating) {
      dispatch(resetActivity());
      setNewActivityName('');
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

    const trimmedName = newActivityName.trim();
    if (!trimmedName) {
      return;
    }

    try {
      const result = await dispatch(
        createActivity({
          name: trimmedName,
          subActivities: [],
          predecessorActivities: [],
        } as IActivity)
      ).unwrap();

      const createdId = result.data.id;
      if (createdId) {
        refreshLibraryActivities();
        onSelectItem(createdId);
        navigate(`/biblioteca/activities/${createdId}`);
      }
    } catch {
      setCreateError(translate('processComposerApp.library.activities.createError', 'Could not create the activity.'));
    }
  };

  const handleDeleteRequest = useCallback((activity: { id: number; name: string }) => {
    setActivityToDelete(activity);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!activityToDelete) {
      return;
    }

    try {
      await dispatch(deleteActivity(activityToDelete.id)).unwrap();
      setDeleteModalOpen(false);
      setActivityToDelete(null);
      refreshLibraryActivities();
      onSelectItem(undefined);
      navigate('/biblioteca/activities');
    } catch {
      setDeleteModalOpen(false);
    }
  };

  const handleDeleted = useCallback(() => {
    refreshLibraryActivities();
    onSelectItem(undefined);
    navigate('/biblioteca/activities');
  }, [navigate, onSelectItem, refreshLibraryActivities]);

  return (
    <div className="library-master-detail library-activities-master-detail" data-cy="libraryMasterDetail-activities">
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
              data-cy="libraryActivitiesSearchInput"
            />
          </InputGroup>
          <Button color="primary" size="sm" onClick={() => onSelectItem(NEW_ITEM_ID)} data-cy="libraryActivitiesCreateButton">
            <FontAwesomeIcon icon="plus" />{' '}
            <Translate contentKey="processComposerApp.library.activities.createLabel">New activity</Translate>
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" size="sm" />
          </div>
        )}

        {!loading && filteredEntities.length === 0 && (
          <div className="alert alert-warning m-3 mb-0" data-cy="libraryActivitiesListEmpty">
            <Translate contentKey="processComposerApp.library.notFound">No items found</Translate>
          </div>
        )}

        {!loading && displayedEntities.length > 0 && (
          <div className="library-master-detail__list" data-cy="libraryActivitiesMasterList">
            {displayedEntities.map(item => {
              const isSelected = item.id === selectedNumericId;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`library-master-detail__list-item${isSelected ? ' library-master-detail__list-item--selected' : ''}`}
                  onClick={() => item.id && onSelectItem(item.id)}
                  data-cy={`libraryActivitiesListItem-${item.id}`}
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
          <div className="library-master-detail__detail-empty" data-cy="libraryActivitiesDetailEmpty">
            <Translate contentKey="processComposerApp.library.activities.selectItem">
              Select an activity from the list or create a new one
            </Translate>
          </div>
        ) : isCreating ? (
          <div className="library-master-detail__detail-body">
            <h2 className="h4 mb-3">
              <Translate contentKey="processComposerApp.library.activities.createTitle">New activity</Translate>
            </h2>

            {createError && (
              <Alert color="danger" className="mb-3">
                {createError}
              </Alert>
            )}

            <Form onSubmit={handleCreate}>
              <FormGroup>
                <Label for="library-activity-name">
                  <Translate contentKey="processComposerApp.activity.name">Name</Translate>
                </Label>
                <Input
                  id="library-activity-name"
                  value={newActivityName}
                  onChange={event => setNewActivityName(event.target.value)}
                  required
                  autoFocus
                  data-cy="libraryActivityNameInput"
                />
              </FormGroup>

              <div className="d-flex gap-2">
                <Button color="secondary" type="button" onClick={() => onSelectItem(undefined)} data-cy="libraryActivityCreateCancel">
                  <Translate contentKey="entity.action.cancel">Cancel</Translate>
                </Button>
                <Button color="primary" type="submit" disabled={updating || !newActivityName.trim()} data-cy="libraryActivityCreateSubmit">
                  <FontAwesomeIcon icon="save" spin={updating} /> <Translate contentKey="entity.action.save">Save</Translate>
                </Button>
              </div>
            </Form>
          </div>
        ) : (
          <div className="library-master-detail__detail-body">
            <ActivityDetailEditor
              activityId={selectedNumericId ?? null}
              variant="panel"
              showHeaderActions
              onSaved={refreshLibraryActivities}
              onDelete={handleDeleteRequest}
              onDeleted={handleDeleted}
            />
          </div>
        )}
      </section>

      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)}>
        <ModalHeader toggle={() => setDeleteModalOpen(false)} data-cy="libraryActivitiesDeleteDialogHeading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.library.delete.confirm" interpolate={{ name: activityToDelete?.name ?? '' }}>
            Are you sure you want to delete this item?
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="danger" onClick={handleConfirmDelete} disabled={updating} data-cy="libraryActivitiesConfirmDeleteButton">
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LibraryActivitiesMasterDetail;
