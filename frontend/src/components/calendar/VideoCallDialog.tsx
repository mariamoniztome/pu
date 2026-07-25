import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';

const JITSI_DOMAIN = 'meet.jit.si';

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => {
      dispose: () => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadJitsiScript(): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Failed to load Jitsi Meet API'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function VideoCallDialog({
  open,
  onOpenChange,
  roomName,
  patientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  patientName?: string;
}) {
  const { t } = useTranslation();
  const { doctor } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let api: { dispose: () => void } | null = null;

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;
        api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: doctor ? { displayName: `${doctor.firstName} ${doctor.lastName}` } : undefined,
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'chat', 'fullscreen', 'hangup', 'tileview'],
          },
        });
      })
      .catch(() => {
        if (!cancelled) toast.error(t('calendar.videoCall.loadFailed'));
      });

    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [open, roomName, doctor, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[64rem] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>
            {t('calendar.videoCall.title')}
            {patientName ? ` — ${patientName}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div ref={containerRef} className="h-[70vh] rounded-2xl overflow-hidden bg-gray-900" />
      </DialogContent>
    </Dialog>
  );
}
