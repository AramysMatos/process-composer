import { z } from 'zod';

export const phaseDraftSchema = z.object({
  name: z.string().trim().min(1, 'processComposerApp.processDesign.wizard.validation.phaseNameRequired'),
  description: z.string().optional(),
});

export const processWizardSchema = z.object({
  processName: z.string().trim().min(1, 'processComposerApp.processDesign.wizard.validation.processNameRequired'),
  processDescription: z.string().optional(),
  phases: z.array(phaseDraftSchema).min(1, 'processComposerApp.processDesign.wizard.validation.atLeastOnePhase'),
});

export const processWizardStep1Schema = processWizardSchema.pick({
  processName: true,
  processDescription: true,
});

export const processWizardStep2Schema = processWizardSchema.pick({
  phases: true,
});

export type ProcessWizardFormValues = z.infer<typeof processWizardSchema>;
