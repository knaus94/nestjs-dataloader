import { Plugin } from '@envelop/types';
import { DataloaderDiscoveryService } from '../services/dataloader-discovery.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { INestApplicationContext } from '@nestjs/common';

type NestContext = { req: any };

export const useNestjsDataloader = (appContext: INestApplicationContext): Plugin<NestContext & { loaders?: any }> => {
  const discoveryService = appContext.get(DataloaderDiscoveryService);

  return {
    onContextBuilding({ context, extendContext }) {
      const gqlCtx = GqlExecutionContext.create({
        getContext: () => context,
      } as any);

      const loaders = discoveryService.createDataloaderMap(gqlCtx);
      extendContext({ loaders });
    },
  };
};
