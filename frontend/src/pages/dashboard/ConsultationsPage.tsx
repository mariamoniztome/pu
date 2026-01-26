import { useState, useEffect } from 'react';
import { Plus, FileText, Eye, Edit, X, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { consultationsApi } from '../../api';
import { Consultation } from '../../types/consultation';
import { ConsultationForm } from '../../components/consultations/ConsultationForm';
import { ConsultationTemplates } from '../../components/consultations/ConsultationTemplates';
import { ConsultationChecklist } from '../../components/consultations/ConsultationChecklist';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useTranslation } from '../../hooks/useTranslation';

export function ConsultationsPage() {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [viewConsultation, setViewConsultation] = useState<Consultation | null>(null);

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
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-700">{t('consultations.attachments', { count: consultation.attachments.length })}:</div>
                      <div className="space-y-1">
                        {consultation.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={`http://localhost:5000/${attachment.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {attachment.originalName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewConsultation(consultation)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t('common.view')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedConsultation(consultation);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardFooter>
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

      {viewConsultation && (
        <Dialog open onOpenChange={() => setViewConsultation(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-2xl">
                {getPatientName(viewConsultation)} - {t('consultations.sessionNumber', { number: viewConsultation.sessionNumber })}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setViewConsultation(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="space-y-4 px-6 pb-6">
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">{t('common.date')}</div>
                <div className="text-sm">{new Date(viewConsultation.date).toLocaleDateString()}</div>
              </div>

              {viewConsultation.chiefComplaint && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('consultations.chiefComplaint')}</div>
                  <div className="text-sm bg-slate-50 p-3 rounded-lg">{viewConsultation.chiefComplaint}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">{t('consultations.sessionNotes')}</div>
                <div className="text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{viewConsultation.sessionNotes}</div>
              </div>

              {viewConsultation.clinicalObservations && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('consultations.clinicalObservations')}</div>
                  <div className="text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{viewConsultation.clinicalObservations}</div>
                </div>
              )}

              {viewConsultation.interventions && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('consultations.interventions')}</div>
                  <div className="text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{viewConsultation.interventions}</div>
                </div>
              )}

              {viewConsultation.homework && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('consultations.homework')}</div>
                  <div className="text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{viewConsultation.homework}</div>
                </div>
              )}

              {viewConsultation.progressAssessment && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('consultations.progressAssessment')}</div>
                  <div className="text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{viewConsultation.progressAssessment}</div>
                </div>
              )}

              {viewConsultation.nextSessionPlan && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('consultations.nextSessionPlan')}</div>
                  <div className="text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{viewConsultation.nextSessionPlan}</div>
                </div>
              )}

              {viewConsultation.attachments.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">{t('consultations.attachments', { count: viewConsultation.attachments.length })}</div>
                  <div className="space-y-2">
                    {viewConsultation.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-slate-500" />
                          <div>
                            <div className="text-sm font-medium">{attachment.originalName}</div>
                            <div className="text-xs text-slate-500">
                              {(attachment.size / 1024).toFixed(2)} KB • {new Date(attachment.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <a
                              href={`http://localhost:5000/${attachment.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('common.view')}
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `http://localhost:5000/${attachment.path}`;
                              link.download = attachment.originalName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
