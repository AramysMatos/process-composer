import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardText, CardTitle, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { IProcess } from 'app/shared/model/process.model';
import { isSystemTemplate } from 'app/shared/model/owned-entity.model';
import { countActivitiesForProcess, countPhasesForProcess } from 'app/shared/util/process-stats.utils';
import { IPhase } from 'app/shared/model/phase.model';
import { IActivity } from 'app/shared/model/activity.model';

export type ProcessListGridHandlers = {
  onDuplicate: (process: IProcess) => void;
  onDownloadStaticSite: (process: IProcess) => void;
  onRequestDelete: (process: IProcess) => void;
  duplicatingProcessId: number | null;
  downloadingStaticSiteId: number | null;
  deleting: boolean;
};

type ProcessListProcessGridProps = ProcessListGridHandlers & {
  processes: IProcess[];
  phases: IPhase[];
  activities: IActivity[];
  isAdmin: boolean;
  showSystemBadge?: boolean;
  showOwnerLabel?: boolean;
};

const getProcessOwnerLogin = (process: IProcess): string | null => process.owner?.login ?? process.createdBy ?? null;

export const ProcessListProcessGrid = ({
  processes,
  phases,
  activities,
  isAdmin,
  showSystemBadge: showSystemBadgeOverride,
  showOwnerLabel: showOwnerLabelOverride,
  onDuplicate,
  onDownloadStaticSite,
  onRequestDelete,
  duplicatingProcessId,
  downloadingStaticSiteId,
  deleting,
}: ProcessListProcessGridProps) => (
  <Row className="g-3 process-list__grid">
    {processes.map(process => {
      const isDuplicating = duplicatingProcessId === process.id;
      const isDownloadingStaticSite = downloadingStaticSiteId === process.id;
      const ownerLogin = getProcessOwnerLogin(process);
      const showSystemBadge = showSystemBadgeOverride ?? isSystemTemplate(process);
      const showOwnerLabel = showOwnerLabelOverride ?? (isAdmin && !showSystemBadge && Boolean(ownerLogin));

      return (
        <Col key={process.id} xs={12} md={6} xl={4}>
          <Card className="process-list__card shadow-sm" data-cy={`processListCard-${process.id}`}>
            <CardBody className="process-list__card-body">
              <div className="process-list__card-header">
                <CardTitle tag="h2" className="h5 text-body mb-0">
                  {process.processName}
                </CardTitle>
                <CardActionsMenu
                  data-cy={`processListCardMenu-${process.id}`}
                  items={[
                    {
                      key: 'duplicate',
                      label: (
                        <>
                          <FontAwesomeIcon icon="copy" className="me-2" />
                          <Translate contentKey="processComposerApp.processDesign.list.actions.duplicate">Duplicate process</Translate>
                        </>
                      ),
                      onClick() {
                        void onDuplicate(process);
                      },
                      disabled: isDuplicating || duplicatingProcessId !== null,
                      'data-cy': `processDuplicate-${process.id}`,
                    },
                    {
                      key: 'visualize',
                      label: (
                        <>
                          <FontAwesomeIcon icon="book" className="me-2" />
                          <Translate contentKey="processComposerApp.processDesign.list.actions.visualize">View process site</Translate>
                        </>
                      ),
                      onClick: () => window.open(`/processos/${process.id}/visualizar`, '_blank', 'noopener,noreferrer'),
                      'data-cy': `processVisualize-${process.id}`,
                    },
                    {
                      key: 'export',
                      label: (
                        <>
                          <FontAwesomeIcon icon="file-code" className="me-2" />
                          <Translate contentKey="processComposerApp.processDesign.list.actions.exportYaml">Export YAML</Translate>
                        </>
                      ),
                      to: `/processos/${process.id}/exportar`,
                      'data-cy': `processExportYaml-${process.id}`,
                    },
                    {
                      key: 'downloadStaticSite',
                      label: (
                        <>
                          <FontAwesomeIcon icon="box" className="me-2" />
                          <Translate contentKey="processComposerApp.processDesign.list.actions.downloadStaticSite">
                            Download static site
                          </Translate>
                        </>
                      ),
                      onClick() {
                        void onDownloadStaticSite(process);
                      },
                      disabled: isDownloadingStaticSite || downloadingStaticSiteId !== null,
                      'data-cy': `processDownloadStaticSite-${process.id}`,
                    },
                    {
                      key: 'delete',
                      label: (
                        <>
                          <FontAwesomeIcon icon="trash" className="me-2" />
                          <Translate contentKey="entity.action.delete">Delete</Translate>
                        </>
                      ),
                      onClick: () => onRequestDelete(process),
                      danger: true,
                      disabled: deleting,
                      'data-cy': `processDelete-${process.id}`,
                    },
                  ]}
                />
              </div>

              {process.processDescription && (
                <CardText className="text-muted small process-list__description">{process.processDescription}</CardText>
              )}

              {showOwnerLabel && ownerLogin && (
                <CardText className="small mb-2">
                  <span className="text-muted">
                    <Translate contentKey="processComposerApp.processDesign.list.owner.label" interpolate={{ login: ownerLogin }}>
                      {`Owner: ${ownerLogin}`}
                    </Translate>
                  </span>
                </CardText>
              )}

              <CardText className="text-muted small mb-0 d-flex flex-wrap align-items-center gap-2">
                <span>
                  <Translate
                    contentKey="home.dashboard.process.phaseCount"
                    interpolate={{ count: countPhasesForProcess(process.id, phases) }}
                  >
                    {`${countPhasesForProcess(process.id, phases)} phases`}
                  </Translate>
                  {' · '}
                  <Translate
                    contentKey="home.dashboard.process.activityCount"
                    interpolate={{ count: countActivitiesForProcess(process.id, phases, activities) }}
                  >
                    {`${countActivitiesForProcess(process.id, phases, activities)} activities`}
                  </Translate>
                </span>
                {showSystemBadge && (
                  <Badge color="info" className="mb-0">
                    <Translate contentKey="processComposerApp.library.systemTemplate">Modelo</Translate>
                  </Badge>
                )}
              </CardText>

              <div className="process-list__card-actions d-flex flex-wrap gap-2">
                <Button tag={Link} to={`/processos/${process.id}`} color="info" size="sm" data-cy={`processOpen-${process.id}`}>
                  <FontAwesomeIcon icon="eye" /> <Translate contentKey="home.dashboard.process.open">Open</Translate>
                </Button>
                <Button
                  tag={Link}
                  to={`/projetos/novo?processId=${process.id}`}
                  color="primary"
                  size="sm"
                  data-cy={`processInstantiate-${process.id}`}
                >
                  <FontAwesomeIcon icon="plus" />{' '}
                  <Translate contentKey="home.dashboard.process.instantiateProject">Instantiate Project</Translate>
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      );
    })}
  </Row>
);
