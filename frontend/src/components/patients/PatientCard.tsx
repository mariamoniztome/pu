import { Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Patient } from '../../types/patient';
import { useTranslation } from '../../hooks/useTranslation';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  const { t } = useTranslation();
  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

const genderColors = {
    male: 'bg-blue-200 text-gray-900',
    female: 'bg-pink-200 text-gray-900',
    other: 'bg-purple-200 text-gray-900',
  };

  return (
    <Card variant="interactive" className="hover:scale-105 transition-transform duration-200">
      <CardHeader className="p-4 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg text-slate-800">{`${patient.firstName} ${patient.lastName}`}</span>
          <span className={`text-xs capitalize font-medium px-3 py-1.5 rounded-xl ${genderColors[patient.gender as keyof typeof genderColors]}`}>
            {t(`common.${patient.gender}`)}
          </span>
        </CardTitle>
        <p className="text-sm text-slate-600 font-medium">{t('patients.ageYears', { age })}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {patient.email && (
          <div className="flex items-center text-sm text-slate-700 bg-primary-50 p-2 rounded-xl">
            <Mail className="h-4 w-4 mr-2 text-primary-600" />
            {patient.email}
          </div>
        )}
        <div className="flex items-center text-sm text-slate-700 bg-lilac-50 p-2 rounded-xl">
          <Phone className="h-4 w-4 mr-2 text-lilac-600" />
          {patient.phone}
        </div>
        {patient.address && (
          <div className="flex items-center text-sm text-slate-700 bg-gray-50 p-2 rounded-xl">
            <MapPin className="h-4 w-4 mr-2 text-gray-600" />
            {patient.address}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(patient)}
        >
          <Edit className="h-4 w-4 mr-1" />
          {t('common.edit')}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(patient._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
