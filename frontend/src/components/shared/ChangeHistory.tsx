import { User, Edit, FileText } from 'lucide-react';
import { Card } from '../ui/card';

interface HistoryEntry {
  id: string;
  action: string;
  description: string;
  user: string;
  timestamp: Date;
  type: 'edit' | 'create' | 'update';
}

export function ChangeHistory() {
  const history: HistoryEntry[] = [
    {
      id: '1',
      action: 'Session notes updated',
      description: 'Added progress notes and treatment adjustments',
      user: 'Dr. Luke',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'edit',
    },
    {
      id: '2',
      action: 'New consultation created',
      description: 'Initial assessment for follow-up session',
      user: 'Dr. Luke',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: 'create',
    },
    {
      id: '3',
      action: 'Treatment plan modified',
      description: 'Updated medication dosage and therapy frequency',
      user: 'Dr. Luke',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'update',
    },
    {
      id: '4',
      action: 'Attachment added',
      description: 'Uploaded lab results and assessment forms',
      user: 'Dr. Luke',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'update',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'create':
        return FileText;
      case 'edit':
        return Edit;
      default:
        return Edit;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'from-primary-200 to-primary-300';
      case 'edit':
        return 'from-lilac-200 to-lilac-300';
      default:
        return 'from-blue-200 to-blue-300';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change History</h3>

      <div className="space-y-4">
        {history.map((entry, index) => {
          const Icon = getIcon(entry.type);
          return (
            <div key={entry.id} className="relative">
              {index < history.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-lilac-200 to-transparent" />
              )}
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getIconColor(entry.type)} flex items-center justify-center flex-shrink-0 shadow-md z-10`}>
                  <Icon className="h-5 w-5 text-gray-800" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{entry.action}</h4>
                    <span className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{entry.user}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
