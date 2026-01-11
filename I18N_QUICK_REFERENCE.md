# i18n Quick Reference

## Common Translation Keys

### Navigation
- `navigation.dashboard` → Dashboard / Painel de Controlo
- `navigation.patients` → Patients / Pacientes
- `navigation.appointments` → Appointments / Consultas
- `navigation.calendar` → Calendar / Calendário
- `navigation.consultations` → Consultations / Consultas Médicas
- `navigation.reports` → Reports / Relatórios
- `navigation.payments` → Payments / Pagamentos
- `navigation.settings` → Settings / Definições

### Common Actions
- `common.save` → Save / Guardar
- `common.cancel` → Cancel / Cancelar
- `common.delete` → Delete / Eliminar
- `common.edit` → Edit / Editar
- `common.add` → Add / Adicionar
- `common.search` → Search / Pesquisar
- `common.loading` → Loading... / A carregar...

### Status Messages
- `common.success` → Success / Sucesso
- `common.error` → Error / Erro
- `common.warning` → Warning / Aviso

### Dashboard
- `dashboard.title` → Dashboard / Painel de Controlo
- `dashboard.totalPatients` → Total Patients / Total de Pacientes
- `dashboard.totalAppointments` → Total Appointments / Total de Consultas
- `dashboard.revenueToday` → Revenue Today / Receita Hoje

### Patients
- `patients.title` → Patients / Pacientes
- `patients.firstName` → First Name / Primeiro Nome
- `patients.lastName` → Last Name / Sobrenome
- `patients.email` → Email / Email
- `patients.phone` → Phone / Telefone
- `patients.dateOfBirth` → Date of Birth / Data de Nascimento
- `patients.gender` → Gender / Género

### Appointments
- `appointments.title` → Appointments / Consultas
- `appointments.patientName` → Patient Name / Nome do Paciente
- `appointments.doctorName` → Doctor Name / Nome do Médico
- `appointments.appointmentDate` → Appointment Date / Data da Consulta
- `appointments.status` → Status / Estado

### Forms
- `forms.validation.required` → This field is required / Este campo é obrigatório
- `forms.validation.invalidEmail` → Invalid email / Email inválido
- `forms.success.create` → {{entity}} created successfully
- `forms.error.create` → Failed to create {{entity}}

## Usage Example

```tsx
import { useTranslation } from '../hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('patients.title')}</h1>
      <button>{t('common.save')}</button>
      <p>{t('forms.validation.required')}</p>
      
      {/* With interpolation */}
      <p>{t('forms.success.create', { entity: 'Patient' })}</p>
    </div>
  );
}
```

## Current Language Support
- English (en)
- Português Portugal (pt-PT)

## How to Add a New Translation Key

1. **Add to both JSON files** (same key, different values):
   ```json
   // en.json
   { "mySection": { "myKey": "English text" } }
   
   // pt-PT.json
   { "mySection": { "myKey": "Texto em português" } }
   ```

2. **Use in component**:
   ```tsx
   const message = t('mySection.myKey');
   ```

## Language Switcher Location
Top-right corner of the main layout - users can click to change language anytime.

## Storage
Selected language is automatically saved to browser's localStorage (`i18nextLng` key).
