import { useCallback, useState } from 'react';
import { translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch } from 'app/config/store';
import { saveActivityToLibrary, savePhaseToLibrary } from 'app/modules/process-design/save-to-library';

type SavingTarget = { type: 'activity' | 'phase'; id: number };

export const useSaveToLibrary = () => {
  const dispatch = useAppDispatch();
  const [savingTarget, setSavingTarget] = useState<SavingTarget | null>(null);

  const isSaving = useCallback(
    (type: SavingTarget['type'], id: number) => savingTarget?.type === type && savingTarget.id === id,
    [savingTarget]
  );

  const handleSaveActivityToLibrary = useCallback(
    async (activityId: number) => {
      if (savingTarget) {
        return;
      }

      setSavingTarget({ type: 'activity', id: activityId });
      try {
        await saveActivityToLibrary(dispatch, activityId);
        toast.success(translate('processComposerApp.processDesign.library.saveActivitySuccess', 'Atividade salva na biblioteca.'));
      } catch {
        toast.error(translate('processComposerApp.processDesign.library.saveActivityError', 'Não foi possível salvar na biblioteca.'));
      } finally {
        setSavingTarget(null);
      }
    },
    [dispatch, savingTarget]
  );

  const handleSavePhaseToLibrary = useCallback(
    async (phaseId: number) => {
      if (savingTarget) {
        return;
      }

      setSavingTarget({ type: 'phase', id: phaseId });
      try {
        await savePhaseToLibrary(dispatch, phaseId);
        toast.success(translate('processComposerApp.processDesign.library.savePhaseSuccess', 'Fase salva na biblioteca.'));
      } catch {
        toast.error(translate('processComposerApp.processDesign.library.savePhaseError', 'Não foi possível salvar na biblioteca.'));
      } finally {
        setSavingTarget(null);
      }
    },
    [dispatch, savingTarget]
  );

  return {
    isSaving,
    handleSaveActivityToLibrary,
    handleSavePhaseToLibrary,
  };
};
