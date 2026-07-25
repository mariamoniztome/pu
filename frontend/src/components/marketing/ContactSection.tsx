import { useState } from 'react';
import { Mail, Clock, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useTranslation } from '../../hooks/useTranslation';
import { contactApi } from '../../api/contact';
import { toast } from 'sonner';

export function ContactSection({
  titleKey = 'landing.contact.title',
  subtitleKey = 'landing.contact.subtitle',
}: {
  titleKey?: string;
  subtitleKey?: string;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactApi.submit({ name, email, message });
      toast.success(t('landing.contact.success'));
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('landing.contact.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="max-w-5xl mx-auto px-6 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">{t(titleKey)}</h2>
          <p className="text-gray-600 mt-2">{t(subtitleKey)}</p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-lilac-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-lilac-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('landing.contact.responseTimeTitle')}</p>
                <p className="text-sm text-gray-500">{t('landing.contact.responseTimeBody')}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('landing.contact.anyQuestionTitle')}</p>
                <p className="text-sm text-gray-500">{t('landing.contact.anyQuestionBody')}</p>
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactName">{t('landing.contact.name')}</Label>
              <Input id="contactName" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">{t('landing.contact.email')}</Label>
              <Input id="contactEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactMessage">{t('landing.contact.message')}</Label>
            <Textarea id="contactMessage" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button type="submit" disabled={sending}>
            <Mail className="h-4 w-4 mr-2" />
            {sending ? t('landing.contact.sending') : t('landing.contact.send')}
          </Button>
        </form>
      </div>
    </section>
  );
}
