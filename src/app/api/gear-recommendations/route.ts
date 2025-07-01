import { getGearRecommendations } from "@/ai/flows/gear-recommendation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cycleDetails, ridingPreferences } = body;

        if (!ridingPreferences || ridingPreferences.length < 10) {
            return NextResponse.json(
                { error: "Please describe your riding preferences in more detail (at least 10 characters)." },
                { status: 400 }
            );
        }

        const result = await getGearRecommendations({
            cycleDetails,
            ridingPreferences,
        });

        return NextResponse.json({ recommendations: result.recommendations });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Sorry, we couldn't generate recommendations at this time. Please try again later." },
            { status: 500 }
        );
    }
}
