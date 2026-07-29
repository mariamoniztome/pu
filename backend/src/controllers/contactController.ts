import { Request, Response } from 'express';
import { sendMail } from '../utils/mailer.js';

const MAX_MESSAGE_LENGTH = 5000;

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: req.t('contact.fieldsRequired') });
      return;
    }

    if (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ message: req.t('contact.messageTooLong') });
      return;
    }

    const destination = process.env.CONTACT_EMAIL;
    if (!destination) {
      console.log(`[contact] CONTACT_EMAIL not configured — message from ${email}: ${message}`);
      res.status(200).json({ message: req.t('contact.messageReceived') });
      return;
    }

    await sendMail({
      to: destination,
      subject: `New contact form message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    res.status(200).json({ message: req.t('contact.messageReceived') });
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: req.t('contact.sendFailed'), error: error.message });
  }
};
