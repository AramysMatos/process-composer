import { z } from 'zod';

export const projectWizardStep1Schema = z.object({
  processId: z
    .number()
    .refine(value => Number.isFinite(value) && value > 0, 'processComposerApp.execution.wizard.validation.processRequired'),
});

export const projectWizardStep2Schema = z.object({
  selectedActivityIds: z.array(z.number()).min(1, 'processComposerApp.execution.wizard.validation.atLeastOneActivity'),
});

export const projectWizardSchema = z.object({
  processId: z
    .number()
    .refine(value => Number.isFinite(value) && value > 0, 'processComposerApp.execution.wizard.validation.processRequired'),
  projectName: z.string().trim().min(1, 'processComposerApp.execution.wizard.validation.projectNameRequired'),
  projectDescription: z.string().optional(),
  selectedActivityIds: z.array(z.number()).min(1, 'processComposerApp.execution.wizard.validation.atLeastOneActivity'),
});

export type ProjectWizardFormValues = z.infer<typeof projectWizardSchema>;
