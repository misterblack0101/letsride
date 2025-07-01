"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAIRecommendationsAction } from "@/app/actions";
import { Bot, Lightbulb, Loader2, PartyPopper } from "lucide-react";

type GearRecommendationProps = {
  cycleDetails: string;
};

const initialState = {
  recommendations: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="accent" className="w-full">
      {pending ? (
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
  );
}

export default function GearRecommendation({ cycleDetails }: GearRecommendationProps) {
  const [state, formAction] = React.useActionState(getAIRecommendationsAction, initialState);

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
        <form action={formAction} className="space-y-4">
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
          <SubmitButton />
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
