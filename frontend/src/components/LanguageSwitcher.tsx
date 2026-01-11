import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useTranslation } from '../hooks/useTranslation';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='rounded-sm'>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
