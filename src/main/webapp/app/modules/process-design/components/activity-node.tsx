import './activity-node.scss';

import React, { memo } from 'react';
import * as ReactFlow from '@xyflow/react';
import { Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translate } from 'react-jhipster';

export interface ActivityNodeData extends Record<string, unknown> {
  activityId: number;
  name: string;
  phaseName: string;
  phaseColor: string;
  roleCount: number;
  artifactCount: number;
}

export const ActivityNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ActivityNodeData;

  return (
    <div
      className={`activity-node${selected ? ' activity-node--selected' : ''}`}
      style={{ '--activity-node-phase-color': nodeData.phaseColor } as React.CSSProperties}
      data-cy={`activity-node-${nodeData.activityId}`}
    >
      <ReactFlow.Handle type="target" position={Position.Left} id="left" />
      <ReactFlow.Handle type="target" position={Position.Top} id="top" />
      <div className="activity-node__name">{nodeData.name}</div>
      <div className="activity-node__phase">{nodeData.phaseName}</div>
      <div className="activity-node__badges">
        <span className="activity-node__badge">
          <FontAwesomeIcon icon="users" />
          {translate('processComposerApp.processDesign.canvas.rolesBadge', { count: nodeData.roleCount })}
        </span>
        <span className="activity-node__badge">
          <FontAwesomeIcon icon="box" />
          {translate('processComposerApp.processDesign.canvas.artifactsBadge', { count: nodeData.artifactCount })}
        </span>
      </div>
      <ReactFlow.Handle type="source" position={Position.Right} id="right" />
      <ReactFlow.Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
});

ActivityNode.displayName = 'ActivityNode';

export default ActivityNode;
