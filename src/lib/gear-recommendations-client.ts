// Client-side utility for gear recommendations

type State = {
    recommendations?: string;
    error?: string;
}

export async function getAIRecommendationsClient(
    cycleDetails: string,
    ridingPreferences: string
): Promise<State> {
    if (!ridingPreferences || ridingPreferences.length < 10) {
        return { error: "Please describe your riding preferences in more detail (at least 10 characters)." };
    }

    // For static export, AI functionality is not available
    // This is a placeholder that could be replaced with external API calls
    return {
        error: "AI recommendations are not available in static export mode. This feature requires a server to run the AI model."
    };

    // Alternative: You could integrate with external APIs here
    // try {
    //   const response = await fetch('https://your-external-ai-api.com/recommendations', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer YOUR_API_KEY'
    //     },
    //     body: JSON.stringify({
    //       cycleDetails,
    //       ridingPreferences,
    //     }),
    //   });

    //   const data = await response.json();
    //   return { recommendations: data.recommendations };
    // } catch (error) {
    //   console.error(error);
    //   return { error: "Sorry, we couldn't generate recommendations at this time. Please try again later." };
    // }
}
