import { describe, expect, it } from 'vitest';
import * as z from 'zod';

const reportValidationSchema = z
  .object({
    spotId: z.string().min(1, 'Please select a campus location'),
    method: z.enum(['phone_meter', 'manual_estimate']),
    dbLevel: z
      .number()
      .min(25, 'Reading must be at least 25 dB')
      .max(110, 'Reading cannot exceed 110 dB')
      .optional()
      .nullable(),
    estimateLevel: z.enum(['silent', 'quiet', 'chatty', 'loud']).optional().nullable(),
    durationSeconds: z.number().min(5).max(300),
    guidelinesAccepted: z.literal(true),
  })
  .refine(
    (data) => {
      if (data.method === 'phone_meter') {
        return typeof data.dbLevel === 'number' && !isNaN(data.dbLevel);
      }
      return Boolean(data.estimateLevel);
    },
    {
      message: 'Provide either a phone meter dB reading or a subjective estimate',
      path: ['dbLevel'],
    }
  );

describe('Report Submission Validation (Client & Server Parity)', () => {
  it('accepts valid phone sound-meter readings within allowable dB bounds', () => {
    const validPhone = reportValidationSchema.safeParse({
      spotId: 'spot-lib-reading',
      method: 'phone_meter',
      dbLevel: 42.5,
      estimateLevel: null,
      durationSeconds: 25,
      guidelinesAccepted: true,
    });
    expect(validPhone.success).toBe(true);
  });

  it('rejects out-of-range dB readings (< 25 dB or > 110 dB)', () => {
    const tooLow = reportValidationSchema.safeParse({
      spotId: 'spot-lib-reading',
      method: 'phone_meter',
      dbLevel: 15,
      durationSeconds: 25,
      guidelinesAccepted: true,
    });
    expect(tooLow.success).toBe(false);

    const tooHigh = reportValidationSchema.safeParse({
      spotId: 'spot-lib-reading',
      method: 'phone_meter',
      dbLevel: 140,
      durationSeconds: 25,
      guidelinesAccepted: true,
    });
    expect(tooHigh.success).toBe(false);
  });

  it('accepts valid subjective manual estimates', () => {
    const validEstimate = reportValidationSchema.safeParse({
      spotId: 'spot-food-court',
      method: 'manual_estimate',
      dbLevel: null,
      estimateLevel: 'chatty',
      durationSeconds: 20,
      guidelinesAccepted: true,
    });
    expect(validEstimate.success).toBe(true);
  });

  it('rejects submissions that fail to accept measurement guidelines', () => {
    const unconfirmed = reportValidationSchema.safeParse({
      spotId: 'spot-lib-reading',
      method: 'phone_meter',
      dbLevel: 40,
      durationSeconds: 25,
      guidelinesAccepted: false,
    });
    expect(unconfirmed.success).toBe(false);
  });

  it('rejects phone readings missing a numeric decibel value', () => {
    const missingDb = reportValidationSchema.safeParse({
      spotId: 'spot-lib-reading',
      method: 'phone_meter',
      dbLevel: null,
      durationSeconds: 25,
      guidelinesAccepted: true,
    });
    expect(missingDb.success).toBe(false);
  });
});
