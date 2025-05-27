import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common/interfaces';
import { GqlExecutionContext } from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { GQL_CONTEXT_KEY } from '../constants';
import { DataloaderProvider } from './dataloader-provider.decorator';

const toStr = (t: InjectionToken) => (typeof t === 'string' ? t : typeof t === 'symbol' ? String(t) : t.name);

export const Loader = createParamDecorator(
  async (token: InjectionToken, ctx: ExecutionContext): Promise<DataLoader<any, any>> => {
    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    const map = gqlCtx[GQL_CONTEXT_KEY] as Map<InjectionToken, DataLoader<any, any>>;

    if (!map) {
      throw new InternalServerErrorException('Dataloaders map missing in GraphQL context');
    }

    const dl = map.get(token);
    if (!dl) {
      throw new InternalServerErrorException(
        `DataLoader ${toStr(token)} not found. Did you add @${DataloaderProvider.name}()?`,
      );
    }
    return dl;
  },
);
