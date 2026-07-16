import './activity-relation-edge.scss';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow, type EdgeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translate } from 'react-jhipster';

import { ActivityRelationEdgeData, getCrossPhaseEdgePath, getRowIndexFromY, pickChannelX } from './activity-canvas-layout';

export const ActivityRelationEdge = memo(
  ({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    selected,
    data,
  }: EdgeProps) => {
    const { deleteElements, getNode, getNodes } = useReactFlow();
    const edgeData = data as ActivityRelationEdgeData | undefined;

    let edgePath: string;
    let labelX: number;
    let labelY: number;

    if (edgeData?.crossPhase) {
      const sourceNode = getNode(source);
      const targetNode = getNode(target);
      const routeIndex = edgeData.routeIndex ?? 0;
      const nodes = getNodes();
      const sourceRowIndex = getRowIndexFromY(sourceNode?.position.y ?? 0);
      const targetRowIndex = getRowIndexFromY(targetNode?.position.y ?? 0);
      const channelX = pickChannelX(sourceX, targetX, nodes, routeIndex);
      [edgePath, labelX, labelY] = getCrossPhaseEdgePath(
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceRowIndex,
        targetRowIndex,
        channelX,
        routeIndex
      );
    } else {
      [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
    }

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
