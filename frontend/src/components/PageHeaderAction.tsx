import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePageHeaderSlot } from '../contexts/PageHeaderContext';

export function PageHeaderAction({ children }: { children: ReactNode }) {
  const slot = usePageHeaderSlot();
  if (!slot) return null;
  return createPortal(children, slot);
}
