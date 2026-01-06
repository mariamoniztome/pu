import { useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { Card } from '../ui/card';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export function ConsultationChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'Review patient history', completed: false },
    { id: '2', label: 'Document chief complaint', completed: false },
    { id: '3', label: 'Conduct mental status examination', completed: false },
    { id: '4', label: 'Review current medications', completed: false },
    { id: '5', label: 'Assess risk factors', completed: false },
    { id: '6', label: 'Develop/update treatment plan', completed: false },
    { id: '7', label: 'Schedule follow-up', completed: false },
    { id: '8', label: 'Document session notes', completed: false },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Consultation Checklist</h3>
          <span className="text-sm font-medium text-gray-600">
            {completedCount} of {items.length} completed
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-lilac-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-3xl text-left transition-all duration-300 ${
              item.completed
                ? 'bg-gradient-to-r from-primary-100 to-lilac-100 hover:from-primary-150 hover:to-lilac-150'
                : 'bg-white/60 hover:bg-white/80'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              item.completed
                ? 'bg-gradient-to-r from-primary-400 to-lilac-400 shadow-lg'
                : 'bg-white border-2 border-gray-300'
            }`}>
              {item.completed ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <Circle className="h-3 w-3 text-gray-400" />
              )}
            </div>
            <span className={`text-sm ${
              item.completed ? 'text-gray-700 font-medium' : 'text-gray-600'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
