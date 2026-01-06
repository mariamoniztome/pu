import { Clock, User, FileText } from 'lucide-react';
import { Card } from '../ui/card';

interface LastAction {
  type: string;
  description: string;
  patient?: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function LastActionHighlight() {
  const lastAction: LastAction = {
    type: 'Consultation Completed',
    description: 'Follow-up session with patient',
    patient: 'Emily Blunt',
    time: '2 hours ago',
    icon: FileText,
  };

  const Icon = lastAction.icon;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary-100/60 to-lilac-100/60 border-white/60">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
            Last Action
          </p>
          <h3 className="text-xl font-bold text-gray-900">{lastAction.type}</h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Icon className="h-6 w-6 text-gray-800" />
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{lastAction.description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        {lastAction.patient && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{lastAction.patient}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{lastAction.time}</span>
        </div>
      </div>
    </Card>
  );
}
