import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Tools from './tools';
import Guidelines from './guidelines';
import Roles from './roles';
import Artifacts from './artifacts';
import Templates from './templates';
import Process from './process';
import Phase from './phase';
import Project from './project';
import Task from './task';
import Activity from './activity';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="tools/*" element={<Tools />} />
        <Route path="guidelines/*" element={<Guidelines />} />
        <Route path="roles/*" element={<Roles />} />
        <Route path="artifacts/*" element={<Artifacts />} />
        <Route path="templates/*" element={<Templates />} />
        <Route path="process/*" element={<Process />} />
        <Route path="phase/*" element={<Phase />} />
        <Route path="project/*" element={<Project />} />
        <Route path="task/*" element={<Task />} />
        <Route path="activity/*" element={<Activity />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
