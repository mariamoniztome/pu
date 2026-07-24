import { useState } from 'react';
import { Check, Circle, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTranslation } from '../../hooks/useTranslation';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export function ConsultationChecklist() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = () => {
    if (newItemLabel.trim()) {
      setItems([...items, { id: Date.now().toString(), label: newItemLabel, completed: false }]);
      setNewItemLabel('');
      setIsAdding(false);
    }
  };

  const startEdit = (id: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditLabel(label);
  };

  const saveEdit = (id: string) => {
    if (editLabel.trim()) {
      setItems(items.map(item =>
        item.id === id ? { ...item, label: editLabel } : item
      ));
    }
    setEditingId(null);
    setEditLabel('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(items.filter(item => item.id !== id));
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{t('consultations.checklist.title')}</h3>
          <span className="text-sm font-medium text-gray-600">
            {t('consultations.checklist.completedCount', { completed: completedCount, total: items.length })}
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
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="relative group">
              {editingId === item.id ? (
                <div className="flex gap-2 p-3 bg-white/80 rounded-3xl">
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(item.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    placeholder={t('consultations.checklist.editPlaceholder')}
                    autoFocus
                    className="flex-1"
                  />
                  <Button onClick={() => saveEdit(item.id)} size="sm">{t('consultations.checklist.save')}</Button>
                  <Button onClick={cancelEdit} variant="outline" size="sm">{t('common.cancel')}</Button>
                </div>
              ) : (
                <button
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
                  <span className={`flex-1 text-sm ${
                    item.completed ? 'text-gray-700 font-medium' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => startEdit(item.id, item.label, e)}
                      className="p-1.5 rounded-full hover:bg-white/60 transition-all duration-300"
                      title={t('consultations.checklist.editItem')}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => deleteItem(item.id, e)}
                      className="p-1.5 rounded-full hover:bg-red-50 transition-all duration-300"
                      title={t('consultations.checklist.deleteItem')}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </button>
                  </div>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">{t('consultations.checklist.noItems')}</p>
            <p className="text-xs mt-1">{t('consultations.checklist.addItemsHelp')}</p>
          </div>
        )}

        {isAdding ? (
          <div className="flex gap-2 mt-3">
            <Input
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder={t('consultations.checklist.addItemPlaceholder')}
              autoFocus
              className="flex-1"
            />
            <Button onClick={addItem} size="sm">{t('consultations.checklist.add')}</Button>
            <Button onClick={() => { setIsAdding(false); setNewItemLabel(''); }} variant="outline" size="sm">{t('common.cancel')}</Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="w-full mt-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('consultations.checklist.addItem')}
          </Button>
        )}
      </div>
    </Card>
  );
}
