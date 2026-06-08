import { z } from 'zod';

export const getPrescriptionsSchema = z.object({
  query: z.object({
    doctorName: z.string().optional(),
    status: z.string().optional(),
    date: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const getPrescriptionDetailSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a numeric string'),
  }),
});
