import tools from 'app/entities/tools/tools.reducer';
import guidelines from 'app/entities/guidelines/guidelines.reducer';
import roles from 'app/entities/roles/roles.reducer';
import artifacts from 'app/entities/artifacts/artifacts.reducer';
import templates from 'app/entities/templates/templates.reducer';
import process from 'app/entities/process/process.reducer';
import phase from 'app/entities/phase/phase.reducer';
import project from 'app/entities/project/project.reducer';
import task from 'app/entities/task/task.reducer';
import activity from 'app/entities/activity/activity.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

const entitiesReducers = {
  tools,
  guidelines,
  roles,
  artifacts,
  templates,
  process,
  phase,
  project,
  task,
  activity,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
};

export default entitiesReducers;
