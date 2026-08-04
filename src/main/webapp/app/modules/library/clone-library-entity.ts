import axios from 'axios';

import { LibraryEntityType } from 'app/modules/library/library.config';

export async function cloneLibraryEntity(type: LibraryEntityType, id: number): Promise<void> {
  await axios.post(`/api/${type}/${id}/clone`);
}
