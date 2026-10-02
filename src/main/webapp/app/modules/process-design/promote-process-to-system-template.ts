import axios from 'axios';

import { IProcess } from 'app/shared/model/process.model';

export const promoteProcessToSystemTemplate = async (processId: number): Promise<IProcess> => {
  const response = await axios.post<IProcess>(`api/processes/${processId}/promote-system-template`);
  return response.data;
};
