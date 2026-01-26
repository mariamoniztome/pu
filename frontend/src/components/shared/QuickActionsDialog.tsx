import { useState } from 'react';
import { FileText, Calendar, UserPlus, DollarSign, ClipboardList, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

export function QuickActionsDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'new-appointment',
      title: 'New Appointment',
      description: 'Schedule a new patient appointment',
      icon: Calendar,
      color: 'from-primary-200 to-primary-300',
      action: () => {
        setIsOpen(false);
      },
    },
    {
      id: 'new-patient',
      title: 'New Patient',
      description: 'Register a new patient',
      icon: UserPlus,
      color: 'from-lilac-200 to-lilac-300',
      action: () => {
        setIsOpen(false);
      },
    },
    {
      id: 'new-consultation',
      title: 'New Consultation',
      description: 'Start a new consultation session',
      icon: ClipboardList,
      color: 'from-blue-200 to-blue-300',
      action: () => {
        setIsOpen(false);
      },
    },
    {
      id: 'new-prescription',
      title: 'Write Prescription',
      description: 'Create a new prescription',
      icon: FileText,
      color: 'from-primary-200 to-primary-300',
      action: () => {
        setIsOpen(false);
      },
    },
    {
      id: 'new-payment',
      title: 'Record Payment',
      description: 'Register a new payment',
      icon: DollarSign,
      color: 'from-green-200 to-green-300',
      action: () => {
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl z-50 bg-gradient-to-br from-primary-400 to-lilac-400 hover:from-primary-500 hover:to-lilac-500"
        size="icon"
      >
        <span className="text-2xl">+</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-xl border-lilac-200">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Quick Actions</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Choose an action to perform quickly</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  className={`p-6 cursor-pointer bg-gradient-to-br ${action.color} border-white/60 hover:scale-105 transition-all duration-300`}
                  onClick={action.action}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Icon className="h-6 w-6 text-gray-800" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-700">{action.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
