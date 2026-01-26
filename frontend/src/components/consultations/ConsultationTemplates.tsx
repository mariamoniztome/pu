import { useState } from 'react';
import { FileText, Plus, Copy, Edit, Trash2, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface Template {
  id: string;
  title: string;
  content: string;
  category: 'consultation' | 'report';
}

export function ConsultationTemplates({ onSelectTemplate }: { onSelectTemplate?: (content: string) => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'consultation' as const });

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...formData } : t));
    } else {
      setTemplates([...templates, { id: Date.now().toString(), ...formData }]);
    }
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ title: '', content: '', category: 'consultation' });
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({ title: template.title, content: template.content, category: template.category as 'consultation' });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleCopy = (content: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(content);
    } else {
      navigator.clipboard.writeText(content);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Text Templates</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingTemplate(null);
            setFormData({ title: '', content: '', category: 'consultation' });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {templates.length > 0 ? (
          templates.map((template) => (
            <Card key={template.id} className="p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-lilac-200 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{template.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                  <span className="inline-block mt-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleCopy(template.content)}
                  className="p-2 rounded-full hover:bg-white/60 transition-all duration-300"
                  title="Copy template"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 rounded-full hover:bg-white/60 transition-all duration-300"
                  title="Edit template"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 rounded-full hover:bg-red-50 transition-all duration-300"
                  title="Delete template"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          </Card>
        ))
        ) : (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No templates yet</p>
              <p className="text-sm mt-1">Create your first template to get started</p>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white backdrop-blur-xl border-lilac-200">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-4 mt-4 px-12 pb-12">
            <div>
              <Label htmlFor="title">Template Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter template title"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'consultation' })}
                className="flex h-11 w-full rounded-full border-2 border-lilac-100 bg-white/70 backdrop-blur-sm px-5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-lilac-300 transition-all duration-300"
              >
                <option value="consultation">Consultation</option>
                <option value="report">Report</option>
              </select>
            </div>
            <div>
              <Label htmlFor="content">Template Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter template content"
                rows={8}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
