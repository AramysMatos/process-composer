import './home.scss';

import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Col, Row, Spinner } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { getEntities as getProcesses } from 'app/entities/process/process.reducer';
import { getEntities as getProjects } from 'app/entities/project/project.reducer';
import { countActivitiesForProcess, countPhasesForProcess } from 'app/shared/util/process-stats.utils';
import { ProcessSummaryCard } from './components/process-summary-card';
import { ProjectSummaryCard } from './components/project-summary-card';

const RECENT_ITEMS_LIMIT = 6;

const sortByIdDesc = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

export const HomeDashboard = () => {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const processes = useAppSelector(state => state.process.entities);
  const phases = useAppSelector(state => state.phase.entities);
  const activities = useAppSelector(state => state.activity.entities);
  const projects = useAppSelector(state => state.project.entities);
  const processesLoading = useAppSelector(state => state.process.loading);
  const projectsLoading = useAppSelector(state => state.project.loading);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProcesses({ page: 0, size: RECENT_ITEMS_LIMIT, sort: 'id,desc' }));
      dispatch(getPhases({}));
      dispatch(getActivities({}));
      dispatch(getProjects({}));
    }
  }, [dispatch, isAuthenticated]);

  const recentProcesses = useMemo(() => processes, [processes]);
  const recentProjects = useMemo(() => sortByIdDesc(projects).slice(0, RECENT_ITEMS_LIMIT), [projects]);

  const hasProcesses = processes.length > 0;
  const hasProjects = projects.length > 0;
  const isLoading = processesLoading || projectsLoading;

  return (
    <div className="home-dashboard" data-cy="homeDashboard">
      <div className="mb-4">
        <h1 className="h2 mb-1">
          <Translate contentKey="home.dashboard.title">Home</Translate>
        </h1>
        <p className="text-muted mb-0">
          <Translate contentKey="home.dashboard.subtitle">Overview of your process definitions and running projects</Translate>
        </p>
      </div>

      {!isAuthenticated && (
        <Alert color="warning" className="mb-4">
          <Translate contentKey="global.messages.info.authenticated.prefix">If you want to </Translate>
          <Link to="/login" className="alert-link">
            <Translate contentKey="global.messages.info.authenticated.link">sign in</Translate>
          </Link>
          <Translate contentKey="global.messages.info.authenticated.suffix">
            , you can try the default accounts:
            <br />- Administrator (login=&quot;admin&quot; and password=&quot;admin&quot;)
            <br />- User (login=&quot;user&quot; and password=&quot;user&quot;).
          </Translate>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={6}>
          <section className="home-dashboard__section" data-cy="homeProcessesSection">
            <div className="home-dashboard__section-header">
              <h2 className="h4 mb-0">
                <Translate contentKey="home.dashboard.myProcesses">My Processes</Translate>
              </h2>
              {hasProcesses && (
                <Link to="/processos" className="home-dashboard__view-all" data-cy="viewAllProcesses">
                  <Translate contentKey="home.dashboard.viewAll">View all</Translate>
                </Link>
              )}
            </div>

            {isAuthenticated && isLoading && (
              <div className="home-dashboard__loading text-center py-4">
                <Spinner color="primary" />
              </div>
            )}

            {isAuthenticated && !isLoading && !hasProcesses && (
              <div className="home-dashboard__empty-state" data-cy="processesEmptyState">
                <p className="text-muted mb-3">
                  <Translate contentKey="home.dashboard.process.empty">
                    You have not created any process yet. Start by defining your first process template.
                  </Translate>
                </p>
                <Button tag={Link} to="/processos/novo" color="primary" data-cy="createFirstProcessButton">
                  <FontAwesomeIcon icon="plus" />{' '}
                  <Translate contentKey="home.dashboard.process.createFirst">Create my first process</Translate>
                </Button>
              </div>
            )}

            {isAuthenticated && !isLoading && hasProcesses && (
              <div className="home-dashboard__card-grid">
                {recentProcesses.map(process => (
                  <ProcessSummaryCard
                    key={process.id}
                    process={process}
                    phaseCount={countPhasesForProcess(process.id, phases)}
                    activityCount={countActivitiesForProcess(process.id, phases, activities)}
                  />
                ))}
              </div>
            )}
          </section>
        </Col>

        <Col lg={6}>
          <section className="home-dashboard__section" data-cy="homeProjectsSection">
            <div className="home-dashboard__section-header">
              <h2 className="h4 mb-0">
                <Translate contentKey="home.dashboard.myProjects">My Projects</Translate>
              </h2>
              {hasProcesses && hasProjects && (
                <Link to="/projetos" className="home-dashboard__view-all" data-cy="viewAllProjects">
                  <Translate contentKey="home.dashboard.viewAll">View all</Translate>
                </Link>
              )}
            </div>

            {isAuthenticated && isLoading && (
              <div className="home-dashboard__loading text-center py-4">
                <Spinner color="primary" />
              </div>
            )}

            {isAuthenticated && !isLoading && !hasProcesses && (
              <div className="home-dashboard__empty-state" data-cy="projectsDependsOnProcessState">
                <p className="text-muted mb-0">
                  <Translate contentKey="home.dashboard.project.requiresProcess">
                    Projects are created from an existing process. Create at least one process before instantiating a project.
                  </Translate>
                </p>
              </div>
            )}

            {isAuthenticated && !isLoading && hasProcesses && !hasProjects && (
              <div className="home-dashboard__empty-state" data-cy="projectsEmptyState">
                <p className="text-muted mb-0">
                  <Translate contentKey="home.dashboard.project.empty">
                    No projects yet. Use &quot;Instantiate Project&quot; on a process card to create your first one.
                  </Translate>
                </p>
              </div>
            )}

            {isAuthenticated && !isLoading && hasProcesses && hasProjects && (
              <div className="home-dashboard__card-grid">
                {recentProjects.map(project => (
                  <ProjectSummaryCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        </Col>
      </Row>
    </div>
  );
};

export default HomeDashboard;
