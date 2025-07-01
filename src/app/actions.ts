"use server";

import { getGearRecommendations } from "@/ai/flows/gear-recommendation";

type State = {
  recommendations?: string;
  error?: string;
}

export async function getAIRecommendationsAction(prevState: State, formData: FormData): Promise<State> {
  const cycleDetails = formData.get("cycleDetails") as string;
  const ridingPreferences = formData.get("ridingPreferences") as string;

  if (!ridingPreferences || ridingPreferences.length < 10) {
    return { error: "Please describe your riding preferences in more detail (at least 10 characters)." };
  }

  try {
    const result = await getGearRecommendations({
      cycleDetails,
      ridingPreferences,
    });
    return { recommendations: result.recommendations };
  } catch (e) {
    console.error(e);
    return { error: "Sorry, we couldn't generate recommendations at this time. Please try again later." };
  }
}
