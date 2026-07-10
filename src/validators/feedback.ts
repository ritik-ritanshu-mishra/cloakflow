import { z } from 'zod';

export const feedbackSchema = z.object({
  feedback: z
    .string({
      required_error: 'Feedback is required.',
      invalid_type_error: 'Feedback must be a string.',
    })
    .trim()
    .min(1, { message: 'Feedback cannot be empty.' })
    .max(5000, { message: 'Feedback must not exceed 5000 characters.' }),
});

export type FeedbackSchemaType = z.infer<typeof feedbackSchema>;
