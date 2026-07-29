import { useAuth } from "../contexts/AuthContext";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function useTrialStatus() {
  const { organization } = useAuth();
  const trialEndsAt = organization?.subscription.trialEndsAt;

  if (!trialEndsAt) {
    return { inTrial: false, daysRemaining: 0, isExpired: false, surveyCompleted: true };
  }

  const endMs = new Date(trialEndsAt).getTime();
  const daysRemaining = Math.max(0, Math.ceil((endMs - Date.now()) / MS_PER_DAY));
  const isExpired = Date.now() >= endMs;
  const surveyCompleted = !!organization?.subscription.trialSurveyCompletedAt;

  return { inTrial: true, daysRemaining, isExpired, surveyCompleted };
}
