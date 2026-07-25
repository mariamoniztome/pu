import { useMemo } from 'react';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import { adjacencyGraphs, dictionary } from '@zxcvbn-ts/language-common';
import { useTranslation } from '../../hooks/useTranslation';

const zxcvbn = new ZxcvbnFactory({ graphs: adjacencyGraphs, dictionary });

const LEVELS = [
  { key: 'veryWeak', bar: 'bg-red-400', text: 'text-red-600' },
  { key: 'weak', bar: 'bg-orange-400', text: 'text-orange-600' },
  { key: 'fair', bar: 'bg-amber-400', text: 'text-amber-600' },
  { key: 'good', bar: 'bg-lime-400', text: 'text-lime-600' },
  { key: 'strong', bar: 'bg-green-500', text: 'text-green-600' },
] as const;

export function passwordScore(password: string): number {
  if (!password) return 0;
  return zxcvbn.check(password).score;
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { t } = useTranslation();
  const score = useMemo(() => passwordScore(password), [password]);
  const level = LEVELS[score];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {LEVELS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? level.bar : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${level.text}`}>
        {t(`auth.passwordStrength.${level.key}`)}
      </p>
    </div>
  );
}
