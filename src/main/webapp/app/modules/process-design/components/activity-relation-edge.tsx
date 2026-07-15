import './activity-relation-edge.scss';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow, type EdgeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translate } from 'react-jhipster';

export const ActivityRelationEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style, selected }: EdgeProps) => {
    const { deleteElements } = useReactFlow();
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    return (
      <>
        <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 2.5 : 2 }} />
        <EdgeLabelRenderer>
          <button
            type="button"
            className="nodrag nopan activity-relation-edge__delete"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            aria-label={translate('processComposerApp.processDesign.canvas.removeRelation', 'Remove relationship')}
            title={translate('processComposerApp.processDesign.canvas.removeRelation', 'Remove relationship')}
            onClick={event => {
              event.stopPropagation();
              void deleteElements({ edges: [{ id }] });
            }}
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </EdgeLabelRenderer>
      </>
    );
  }
);

ActivityRelationEdge.displayName = 'ActivityRelationEdge';

export default ActivityRelationEdge;
