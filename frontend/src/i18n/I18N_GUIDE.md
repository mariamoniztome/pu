# Internationalization (i18n) Implementation Guide

## Overview
This project has been configured with i18n support for English and Portuguese (Portugal) using i18next and i18next-react.

## Structure

### Translation Files
- **English**: `src/i18n/locales/en.json`
- **Portuguese (Portugal)**: `src/i18n/locales/pt-PT.json`

### Configuration
- **Main Config**: `src/i18n/config.ts` - i18next initialization and setup
- **Language Switcher**: `src/components/LanguageSwitcher.tsx` - UI component for switching languages

### Hook
- **Translation Hook**: `src/hooks/useTranslation.ts` - Custom hook to use translations in components

## Usage in Components

### Basic Usage
```tsx
import { useTranslation } from '../hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### With Interpolation
```tsx
const message = t('forms.success.create', { entity: 'Patient' });
// Returns: "Patient created successfully" (EN) or "Paciente criado com sucesso" (PT-PT)
```

## Translation Keys Structure

The translations are organized by sections:
- `common.*` - Common UI elements
- `navigation.*` - Navigation menu items
- `dashboard.*` - Dashboard page
- `patients.*` - Patient management
- `appointments.*` - Appointment management
- `consultations.*` - Consultation management
- `reports.*` - Reports management
- `payments.*` - Payments management
- `calendar.*` - Calendar management
- `forms.*` - Form-related messages
- `language.*` - Language names

## Adding New Translations

1. Add the key to both `en.json` and `pt-PT.json` in the appropriate section
2. Use the same key structure in both files
3. Use the translation in your component: `t('section.key')`

Example:
```json
// en.json
{
  "mySection": {
    "myKey": "My English text"
  }
}

// pt-PT.json
{
  "mySection": {
    "myKey": "Meu texto em português"
  }
}
```

## Language Persistence

The selected language is automatically saved to browser localStorage under the key `i18nextLng`. The language detection order is:
1. localStorage (if previously selected)
2. Browser language (navigator.language)
3. Fallback to English

## Language Switcher

The language switcher is available in the top-right corner of the application layout. Users can:
1. Click the language dropdown
2. Select their preferred language
3. The entire application will update automatically

## Pages Updated with i18n Support

- [DashboardPage](../pages/DashboardPage.tsx)
- [PatientsPage](../pages/PatientsPage.tsx)
- [AppointmentsPage](../pages/AppointmentsPage.tsx)
- [CalendarPage](../pages/CalendarPage.tsx)
- [ConsultationsPage](../pages/ConsultationsPage.tsx)
- [ReportsPage](../pages/ReportsPage.tsx)
- [PaymentsPage](../pages/PaymentsPage.tsx)
- [Layout](../components/Layout.tsx) - Navigation menu

## Installed Packages

- `i18next` - Core i18n library
- `i18next-react` - React integration for i18next
- `i18next-browser-languagedetector` - Automatic language detection
- `i18next-http-backend` - Backend support (optional)

## Future Enhancements

- Add more languages as needed
- Implement server-side translations
- Add RTL language support
- Create admin panel for translation management
- Add pluralization support for specific translations
