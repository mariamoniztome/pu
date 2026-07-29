import { useState } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuth } from "../../contexts/AuthContext";
import { useTrialStatus } from "../../hooks/useTrialStatus";
import { organizationApi } from "../../api/organization";

export function TrialBanner() {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const { inTrial, daysRemaining, isExpired } = useTrialStatus();
  const [endingTrial, setEndingTrial] = useState(false);

  if (!inTrial || isExpired) return null;

  const handleEndTrialForTesting = async () => {
    setEndingTrial(true);
    try {
      await organizationApi.endTrialForTesting();
      await refreshUser();
    } catch {
      toast.error(t('trial.testEndFailed'));
    } finally {
      setEndingTrial(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lilac-100 bg-lilac-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Clock className="h-4 w-4 text-lilac-600" />
        <span className="font-semibold">{t('trial.bannerLabel')}</span>
        <span>·</span>
        <span>
          {daysRemaining <= 1
            ? t('trial.lastDay')
            : t('trial.daysRemaining', { count: daysRemaining })}
        </span>
      </div>

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={handleEndTrialForTesting}
          disabled={endingTrial}
          className="text-xs font-semibold text-gray-500 bg-white/60 px-3 py-1.5 rounded-full hover:bg-white disabled:opacity-50"
        >
          {t('trial.testEndTrial')}
        </button>
      )}
    </div>
  );
}
