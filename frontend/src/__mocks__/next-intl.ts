// Mock for next-intl and use-intl
export const useTranslations = () => (key: string) => key;
export const useLocale = () => 'en';
export const useMessages = () => ({});
export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => children;
export const createNavigation = () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
  redirect: jest.fn(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
});
export const defineRouting = (config: unknown) => config;
export const getRequestConfig = (fn: unknown) => fn;

import React from 'react';
