import { Plugin } from '@envelop/types';
import { INestApplicationContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DataloaderDiscoveryService } from '../services/dataloader-discovery.service';

type BaseCtx = { req?: any; request?: any };

export const useNestjsDataloader = (app: INestApplicationContext): Plugin<BaseCtx & { loaders?: Map<any, any> }> => {
  const discovery = app.get(DataloaderDiscoveryService);

  return {
    onContextBuilding({ context, extendContext }) {
      const req = (context as any).req ?? (context as any).request;
      if (!req) {
        throw new Error(
          'Cannot locate HTTP request on GraphQL context. ' +
            'Make sure you pass { req } (Apollo) or { request } (Yoga) when forming the context.',
        );
      }

      // Формируем GqlExecutionContext, чтобы re-useʼнуть уже готовую логику discovery
      const gqlCtx = GqlExecutionContext.create({
        getContext: () => ({ req }),
      } as any);

      const loaders = discovery.createDataloaderMap(gqlCtx);
      extendContext({ loaders });
    },
  };
};
