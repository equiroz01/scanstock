import React, { ReactNode } from 'react';
import { I18nContext } from '@/i18n';
import { useLanguage } from '@/hooks/useLanguage';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { language, setLanguage, t, isLoading } = useLanguage();

  // Don't render children until language is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}
