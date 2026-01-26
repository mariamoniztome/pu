import { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { consultationsApi } from '../../api';
import { Consultation } from '../../types/consultation';
import { ConsultationForm } from '../../components/consultations/ConsultationForm';
import { ConsultationTemplates } from '../../components/consultations/ConsultationTemplates';
import { ConsultationChecklist } from '../../components/consultations/ConsultationChecklist';
import { useTranslation } from '../../hooks/useTranslation';

export function ConsultationsPage() {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const data = await consultationsApi.getAll();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load consultations:', error);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (consultation: Consultation) => {
  if (!consultation.patient || typeof consultation.patient === 'string') {
      return t('common.unknownPatient');
    }
    const { firstName = '', lastName = '' } = consultation.patient;
    const name = `${firstName} ${lastName}`.trim();
    return name || t('common.unknownPatient');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('consultations.loadingConsultations')}</div>;
  }

  return (
    <div className="space-y-6">
    <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t('consultations.sessionsTitle')}</h1>
          <p className="text-slate-600 mt-1">{t('consultations.sessionsSubtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-full bg-gray-900 hover:bg-black">
          <Plus className="h-5 w-5 mr-2" />
          {t('consultations.newSession')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultations.map((consultation) => (
              <Card key={consultation._id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{getPatientName(consultation)}</span>
                    <span className="text-sm font-normal text-slate-500">
                      {t('consultations.sessionNumber', { number: consultation.sessionNumber })}
                    </span>
                  </CardTitle>
                  <div className="text-sm text-slate-500">
                    {new Date(consultation.date).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {consultation.chiefComplaint && (
                    <div>
                      <div className="text-sm font-medium text-slate-700">{t('consultations.chiefComplaint')}:</div>
                      <div className="text-sm text-slate-600">{consultation.chiefComplaint}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-slate-700">{t('consultations.sessionNotes')}:</div>
                    <div className="text-sm text-slate-600 line-clamp-3">{consultation.sessionNotes}</div>
                  </div>
                  {consultation.attachments.length > 0 && (
                    <div className="flex items-center text-sm text-slate-500">
                      <FileText className="h-4 w-4 mr-1" />
                      {t('consultations.attachments', { count: consultation.attachments.length })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <ConsultationTemplates />
        </div>

        <div className="space-y-6">
          <ConsultationChecklist />
        </div>
      </div>

      {showForm && (
        <ConsultationForm
          consultation={selectedConsultation}
          onClose={() => {
            setShowForm(false);
            setSelectedConsultation(null);
            loadConsultations();
          }}
        />
      )}
    </div>
  );
}
