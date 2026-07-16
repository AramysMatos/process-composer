import { z } from 'zod';

export const projectWizardStep1Schema = z.object({
  processId: z
    .number()
    .refine(value => Number.isFinite(value) && value > 0, 'processComposerApp.execution.wizard.validation.processRequired'),
});

export const projectWizardSchema = z.object({
  processId: z
    .number()
    .refine(value => Number.isFinite(value) && value > 0, 'processComposerApp.execution.wizard.validation.processRequired'),
  projectName: z.string().trim().min(1, 'processComposerApp.execution.wizard.validation.projectNameRequired'),
  projectDescription: z.string().optional(),
});

export type ProjectWizardFormValues = z.infer<typeof projectWizardSchema>;
