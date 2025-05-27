// src/plugins/nestjs-dataloader.plugin.ts
import { Plugin } from '@envelop/core';
import { INestApplicationContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DataloaderDiscoveryService } from '../services/dataloader-discovery.service';

type BaseCtx = { req?: any; request?: any };

export function useNestjsDataloader(app?: INestApplicationContext): Plugin<BaseCtx & { loaders?: Map<any, any> }> {
  const discoveryStatic = app?.get(DataloaderDiscoveryService);

  return {
    async onContextBuilding({ context, extendContext }) {
      const req = (context as any).req ?? (context as any).request;
      if (!req) return;

      const nestApp: INestApplicationContext | undefined = app ?? req.app ?? req.nestApp;

      if (!nestApp) {
        throw new Error(
          '[nestjs-dataloader] Nest application context not found. ' +
            'Pass it explicitly: useNestjsDataloader(app) or attach it to req.app.',
        );
      }

      const discovery = discoveryStatic ?? nestApp.get(DataloaderDiscoveryService, { strict: false });

      if (!discovery) {
        throw new Error('[nestjs-dataloader] DataloaderDiscoveryService is not available in the current Nest context.');
      }

      const gqlCtx = GqlExecutionContext.create({
        getContext: () => ({ req }),
      } as any);

      const loaders = discovery.createDataloaderMap(gqlCtx);
      extendContext({ loaders });
    },
  };
}
