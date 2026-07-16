import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import ProjectInstantiationWizard from './project-instantiation-wizard';
import ProjectList from './project-list';
import ProjectOverview from './project-overview';
import ProjectTasks from './project-tasks';

export default () => {
  return (
    <ErrorBoundaryRoutes>
      <Route index element={<ProjectList />} />
      <Route path="novo" element={<ProjectInstantiationWizard />} />
      <Route path=":id/tarefas" element={<ProjectTasks />} />
      <Route path=":id" element={<ProjectOverview />} />
    </ErrorBoundaryRoutes>
  );
};
