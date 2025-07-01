"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAIRecommendationsClient } from "@/lib/gear-recommendations-client";
import { Bot, Lightbulb, Loader2, PartyPopper } from "lucide-react";

type GearRecommendationProps = {
  cycleDetails: string;
};

type State = {
  recommendations?: string;
  error?: string;
};

const initialState: State = {
  recommendations: undefined,
  error: undefined,
};

export default function GearRecommendation({ cycleDetails }: GearRecommendationProps) {
  const [state, setState] = React.useState<State>(initialState);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setState(initialState);

    const formData = new FormData(e.currentTarget);
    const ridingPreferences = formData.get("ridingPreferences") as string;

    const result = await getAIRecommendationsClient(cycleDetails, ridingPreferences);
    setState(result);
    setIsLoading(false);
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <div>
                <CardTitle className="font-headline text-xl text-primary">AI Gear Advisor</CardTitle>
                <CardDescription>Get personalized gear recommendations.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="cycleDetails" value={cycleDetails} />
          <div>
            <Label htmlFor="ridingPreferences">Your Riding Style & Preferences</Label>
            <Textarea
              id="ridingPreferences"
              name="ridingPreferences"
              placeholder="e.g., I ride mostly on paved city trails, 2-3 times a week for fitness. Occasional long weekend rides on hilly country roads."
              rows={4}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading} variant="accent" className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Get Recommendations
              </>
            )}
          </Button>
        </form>

        {state.error && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}
        
        {state.recommendations && (
          <div className="mt-6">
             <Alert>
              <PartyPopper className="h-4 w-4" />
              <AlertTitle className="font-headline">Here are your recommendations!</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap mt-2 text-sm text-foreground">
                {state.recommendations}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
