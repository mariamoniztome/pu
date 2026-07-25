import { createContext, useContext } from 'react';

export const PageHeaderSlotContext = createContext<HTMLDivElement | null>(null);

export function usePageHeaderSlot() {
  return useContext(PageHeaderSlotContext);
}
