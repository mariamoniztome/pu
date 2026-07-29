import { Request, Response, NextFunction } from 'express';
import { translate, resolveLang, Lang } from '../i18n/index.js';

declare global {
  namespace Express {
    interface Request {
      lang: Lang;
      t: (key: string, params?: Record<string, string | number>) => string;
    }
  }
}

export const i18nMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const lang = resolveLang(req.headers['accept-language']);
  req.lang = lang;
  req.t = (key, params) => translate(lang, key, params);
  next();
};
