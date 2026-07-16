import React, { useMemo } from 'react';
import { Badge, ListGroup, ListGroupItem } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { LibraryActivityRef } from 'app/modules/library/library.config';

interface UsedInActivitiesListProps {
  activityRefs: LibraryActivityRef[];
}

interface GroupedActivityUsage {
  activityId: number;
  activityName: string;
  relationLabelKeys: string[];
}

const groupActivityRefs = (activityRefs: LibraryActivityRef[]): GroupedActivityUsage[] => {
  const grouped = new Map<number, GroupedActivityUsage>();

  activityRefs.forEach(ref => {
    const activityId = ref.activity.id;
    if (!activityId) {
      return;
    }

    const existing = grouped.get(activityId);
    if (existing) {
      if (!existing.relationLabelKeys.includes(ref.relationLabelKey)) {
        existing.relationLabelKeys.push(ref.relationLabelKey);
      }
      return;
    }

    grouped.set(activityId, {
      activityId,
      activityName: ref.activity.name ?? `#${activityId}`,
      relationLabelKeys: [ref.relationLabelKey],
    });
  });

  return Array.from(grouped.values()).sort((left, right) => left.activityName.localeCompare(right.activityName));
};

export const UsedInActivitiesList = ({ activityRefs }: UsedInActivitiesListProps) => {
  const groupedUsages = useMemo(() => groupActivityRefs(activityRefs), [activityRefs]);

  if (groupedUsages.length === 0) {
    return (
      <p className="text-muted mb-0" data-cy="usedInActivitiesEmpty">
        <Translate contentKey="processComposerApp.library.usedIn.empty">Not used in any activity yet</Translate>
      </p>
    );
  }

  return (
    <ListGroup flush className="used-in-activities-list" data-cy="usedInActivitiesList">
      {groupedUsages.map(usage => (
        <ListGroupItem key={usage.activityId} className="used-in-activities-list__item px-0" data-cy={`usedInActivity-${usage.activityId}`}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="fw-medium">{usage.activityName}</span>
            <div className="d-flex flex-wrap gap-1">
              {usage.relationLabelKeys.map(relationLabelKey => (
                <Badge key={`${usage.activityId}-${relationLabelKey}`} color="info" pill className="used-in-activities-list__badge">
                  <Translate contentKey={relationLabelKey} />
                </Badge>
              ))}
            </div>
          </div>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};

export default UsedInActivitiesList;
