// Gear recommendation flow

/**
 * @fileOverview This file defines a Genkit flow for recommending cycling gear based on the selected cycle and user preferences.
 *
 * - `getGearRecommendations`:  A function that takes cycle details and user preferences as input and returns gear recommendations.
 * - `GearRecommendationInput`: The input type for the `getGearRecommendations` function.
 * - `GearRecommendationOutput`: The output type for the `getGearRecommendations` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema definition
const GearRecommendationInputSchema = z.object({
  cycleDetails: z
    .string()
    .describe('Details of the selected cycle, including type, brand, and features.'),
  ridingPreferences: z
    .string()
    .describe(
      'User riding preferences, including terrain, style, and typical ride duration.'
    ),
});
export type GearRecommendationInput = z.infer<typeof GearRecommendationInputSchema>;

// Output schema definition
const GearRecommendationOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'A list of recommended accessories and gear, with brief explanations of why they are suitable.'
    ),
});
export type GearRecommendationOutput = z.infer<typeof GearRecommendationOutputSchema>;

// Exported function to get gear recommendations
export async function getGearRecommendations(
  input: GearRecommendationInput
): Promise<GearRecommendationOutput> {
  return gearRecommendationFlow(input);
}

// Prompt definition
const gearRecommendationPrompt = ai.definePrompt({
  name: 'gearRecommendationPrompt',
  input: {
    schema: GearRecommendationInputSchema,
  },
  output: {
    schema: GearRecommendationOutputSchema,
  },
  prompt: `You are an expert cycling gear advisor.

  Based on the cycle details and riding preferences provided, recommend relevant accessories and gear.
  Explain why each item is suitable for the given cycle and preferences.

  Cycle Details: {{{cycleDetails}}}
  Riding Preferences: {{{ridingPreferences}}}

  Format the recommendations as a list.
`,
});

// Flow definition
const gearRecommendationFlow = ai.defineFlow(
  {
    name: 'gearRecommendationFlow',
    inputSchema: GearRecommendationInputSchema,
    outputSchema: GearRecommendationOutputSchema,
  },
  async input => {
    const { output } = await gearRecommendationPrompt(input);
    return output!;
  }
);
