import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common/interfaces';
import { GqlExecutionContext } from '@nestjs/graphql';
import type DataLoader from 'dataloader';
import { GQL_CONTEXT_KEY } from '../constants';
import { getLoaderContextKey, tokenToString } from '../utils/loader-context-key';
import { DataloaderProvider } from './dataloader-provider.decorator';

export const Loader = createParamDecorator(
  async (token: InjectionToken, ctx: ExecutionContext): Promise<DataLoader<any, any>> => {
    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    const map = gqlCtx[GQL_CONTEXT_KEY] as Map<InjectionToken, DataLoader<any, any>> | undefined;

    const dl = map?.get(token);
    if (dl) {
      return dl;
    }

    const key = getLoaderContextKey(token);
    const directLoader = (gqlCtx as Record<string, any>)[key] as DataLoader<any, any> | undefined;
    if (directLoader) {
      return directLoader;
    }

    if (!map) {
      throw new InternalServerErrorException('Dataloaders map missing in GraphQL context');
    }
    throw new InternalServerErrorException(
      `DataLoader ${tokenToString(token)} not found. Did you add @${DataloaderProvider.name}()?`,
    );
  },
);
