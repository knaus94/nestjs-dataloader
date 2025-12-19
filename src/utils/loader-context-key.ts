import type { InjectionToken } from '@nestjs/common/interfaces';
import { PACKAGE_NAMESPACE } from '../constants';

const loaderContextKeys = new Map<InjectionToken, string>();
let nextLoaderContextKeyId = 0;

export const tokenToString = (token: InjectionToken): string => {
  if (typeof token === 'string') return token;
  if (typeof token === 'symbol') return token.toString();
  return token?.name ?? 'anonymous';
};

export const getLoaderContextKey = (token: InjectionToken): string => {
  const existing = loaderContextKeys.get(token);
  if (existing) return existing;

  const label = tokenToString(token);
  const key = `${PACKAGE_NAMESPACE}:loader:${label}:${nextLoaderContextKeyId++}`;
  loaderContextKeys.set(token, key);
  return key;
};
