import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuth } from "../../contexts/AuthContext";
import { organizationApi } from "../../api/organization";

const MARKET_TYPE_OPTIONS = [
  "clinicalPsychology",
  "psychiatry",
  "familyTherapy",
  "coaching",
  "nutrition",
  "other",
] as const;

const ORGANIZATION_SIZE_OPTIONS = ["justMe", "twoToFive", "sixToTwenty", "moreThanTwenty"] as const;

const WILLINGNESS_TO_PAY_OPTIONS = ["under10", "from10to25", "from25to50", "from50to100", "over100"] as const;

export function TrialSurveyGate() {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [marketType, setMarketType] = useState("");
  const [organizationSize, setOrganizationSize] = useState("");
  const [needs, setNeeds] = useState("");
  const [willingnessToPay, setWillingnessToPay] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!marketType || !organizationSize || !needs.trim() || !willingnessToPay) {
      toast.error(t('trial.requiredFields'));
      return;
    }

    setSubmitting(true);
    try {
      await organizationApi.submitTrialFeedback({
        marketType,
        organizationSize,
        needs: needs.trim(),
        willingnessToPay,
      });
      await refreshUser();
      toast.success(t('trial.submitted'));
    } catch (err: any) {
      toast.error(err.message || t('trial.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle>{t('trial.gateTitle')}</DialogTitle>
          <p className="text-sm text-gray-500">{t('trial.gateSubtitle')}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              {t('trial.marketType')} <span className="text-red-500">*</span>
            </Label>
            <Select value={marketType} onValueChange={setMarketType}>
              <SelectTrigger>
                <SelectValue placeholder={t('trial.selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {MARKET_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`trial.marketTypeOptions.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              {t('trial.organizationSize')} <span className="text-red-500">*</span>
            </Label>
            <Select value={organizationSize} onValueChange={setOrganizationSize}>
              <SelectTrigger>
                <SelectValue placeholder={t('trial.selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`trial.organizationSizeOptions.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              {t('trial.needs')} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              rows={3}
              placeholder={t('trial.needsPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              {t('trial.willingnessToPay')} <span className="text-red-500">*</span>
            </Label>
            <Select value={willingnessToPay} onValueChange={setWillingnessToPay}>
              <SelectTrigger>
                <SelectValue placeholder={t('trial.selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {WILLINGNESS_TO_PAY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`trial.willingnessToPayOptions.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.saving') : t('trial.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
