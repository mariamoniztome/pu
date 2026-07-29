import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Unplug, CalendarCheck2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { calendarIntegrationsApi } from "../../api";
import { CalendarConnection, CalendarProvider } from "../../types/calendarIntegration";
import { useTranslation } from "../../hooks/useTranslation";

const PROVIDER_ORDER: CalendarProvider[] = ["google", "outlook", "icloud"];

export function CalendarIntegrationsTab() {
  const { t, i18n } = useTranslation();
  const culture = i18n.language?.startsWith("pt") ? "pt-PT" : "en-US";
  const [searchParams, setSearchParams] = useSearchParams();
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [outlookConfigured, setOutlookConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<CalendarProvider | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showIcloudForm, setShowIcloudForm] = useState(false);
  const [icloudEmail, setIcloudEmail] = useState("");
  const [icloudPassword, setIcloudPassword] = useState("");
  const [disconnectTarget, setDisconnectTarget] = useState<CalendarConnection | null>(null);

  const loadConnections = async () => {
    try {
      const data = await calendarIntegrationsApi.list();
      setConnections(data.connections);
      setGoogleConfigured(data.googleConfigured);
      setOutlookConfigured(data.outlookConfigured);
    } catch {
      toast.error(t("settings.integrations.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // Landed back here from the Google/Outlook OAuth redirect — surface the
  // result and drop the query params so a refresh doesn't re-show the toast.
  useEffect(() => {
    const calendar = searchParams.get("calendar");
    const status = searchParams.get("status");
    if (!calendar || !status) return;

    if (status === "connected") {
      toast.success(t("settings.integrations.connectedToast", { provider: t(`settings.integrations.providers.${calendar}`) }));
      loadConnections();
    } else {
      toast.error(t("settings.integrations.connectFailedToast", { provider: t(`settings.integrations.providers.${calendar}`) }));
    }

    const next = new URLSearchParams(searchParams);
    next.delete("calendar");
    next.delete("status");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleConnect = async (provider: CalendarProvider) => {
    if (provider === "icloud") {
      setIcloudEmail("");
      setIcloudPassword("");
      setShowIcloudForm(true);
      return;
    }

    setConnectingProvider(provider);
    try {
      const url =
        provider === "google"
          ? await calendarIntegrationsApi.getGoogleAuthUrl()
          : await calendarIntegrationsApi.getOutlookAuthUrl();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("settings.integrations.connectFailed"));
      setConnectingProvider(null);
    }
  };

  const handleIcloudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectingProvider("icloud");
    try {
      await calendarIntegrationsApi.connectIcloud({ email: icloudEmail, appSpecificPassword: icloudPassword });
      toast.success(t("settings.integrations.connectedToast", { provider: t("settings.integrations.providers.icloud") }));
      setShowIcloudForm(false);
      loadConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("settings.integrations.icloudConnectFailed"));
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleSync = async (connection: CalendarConnection) => {
    setSyncingId(connection._id);
    try {
      await calendarIntegrationsApi.sync(connection._id);
      toast.success(t("settings.integrations.syncSuccess"));
      loadConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("settings.integrations.syncFailed"));
    } finally {
      setSyncingId(null);
    }
  };

  const confirmDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      await calendarIntegrationsApi.disconnect(disconnectTarget._id);
      toast.success(t("settings.integrations.disconnected"));
      setConnections((prev) => prev.filter((c) => c._id !== disconnectTarget._id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("settings.integrations.disconnectFailed"));
    } finally {
      setDisconnectTarget(null);
    }
  };

  const isConfigured = (provider: CalendarProvider) =>
    provider === "google" ? googleConfigured : provider === "outlook" ? outlookConfigured : true;

  if (loading) {
    return <div className="text-sm text-gray-500">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{t("settings.integrations.title")}</h3>
        <p className="text-sm text-gray-500">{t("settings.integrations.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROVIDER_ORDER.map((provider) => {
          const connection = connections.find((c) => c.provider === provider);
          const configured = isConfigured(provider);

          return (
            <div key={provider} className="rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{t(`settings.integrations.providers.${provider}`)}</h4>
                {connection?.status === "connected" && (
                  <CalendarCheck2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
                {connection?.status === "error" && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
              </div>

              {connection ? (
                <div className="flex-1 space-y-1 text-sm">
                  <p className="text-gray-700 truncate">{connection.accountLabel}</p>
                  {connection.status === "error" ? (
                    <p className="text-xs text-amber-600">{t("settings.integrations.syncError")}</p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      {connection.lastSyncedAt
                        ? t("settings.integrations.lastSynced", {
                            date: new Date(connection.lastSyncedAt).toLocaleString(culture),
                          })
                        : t("settings.integrations.neverSynced")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="flex-1 text-xs text-gray-400">
                  {configured ? t("settings.integrations.notConnected") : t("settings.integrations.notConfigured")}
                </p>
              )}

              {connection ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={syncingId === connection._id}
                    onClick={() => handleSync(connection)}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncingId === connection._id ? "animate-spin" : ""}`} />
                    {t("settings.integrations.syncNow")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDisconnectTarget(connection)}
                  >
                    <Unplug className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={!configured || connectingProvider === provider}
                  onClick={() => handleConnect(provider)}
                >
                  {connectingProvider === provider ? t("common.saving") : t("settings.integrations.connect")}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">{t("settings.integrations.note")}</p>

      <Dialog open={showIcloudForm} onOpenChange={setShowIcloudForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.integrations.icloudDialogTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIcloudSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">{t("settings.integrations.icloudDialogHelp")}</p>
            <div className="space-y-2">
              <Label htmlFor="icloudEmail">{t("settings.integrations.icloudEmail")}</Label>
              <Input
                id="icloudEmail"
                type="email"
                value={icloudEmail}
                onChange={(e) => setIcloudEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icloudPassword">{t("settings.integrations.icloudPassword")}</Label>
              <Input
                id="icloudPassword"
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={icloudPassword}
                onChange={(e) => setIcloudPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowIcloudForm(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={connectingProvider === "icloud"}>
                {connectingProvider === "icloud" ? t("common.saving") : t("settings.integrations.connect")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        title={t("settings.integrations.confirmDisconnect")}
        confirmLabel={t("settings.integrations.disconnect")}
        onConfirm={confirmDisconnect}
      />
    </div>
  );
}
