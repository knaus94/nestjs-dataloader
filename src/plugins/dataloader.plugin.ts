import { useDataLoader } from '@envelop/dataloader';
import type { Plugin } from '@envelop/core';
import type DataLoader from 'dataloader';
import type { InjectionToken } from '@nestjs/common/interfaces';
import { ModuleRef, ContextIdFactory } from '@nestjs/core';
import { GQL_CONTEXT_KEY } from '../constants';
import { DataloaderDiscoveryService } from '../services/dataloader-discovery.service';
import { getLoaderContextKey } from '../utils/loader-context-key';

export function createDataloaderPlugin(moduleRef: ModuleRef, discovery: DataloaderDiscoveryService): Plugin {
  return {
    async onContextBuilding({ context, extendContext }) {
      const req = (context as any).req ?? (context as any).request;
      if (!req) return;

      const ctxId = ContextIdFactory.getByRequest(req);

      const service =
        (discovery as any).scope === 0
          ? discovery
          : await moduleRef.resolve(DataloaderDiscoveryService, ctxId, {
              strict: false,
            });

      const providers = service.getProviders();
      const loaders = new Map<InjectionToken, DataLoader<any, any>>();
      const contextRecord = context as Record<string, any>;
      const extend = extendContext as (contextExtension: Partial<Record<string, any>>) => void;

      let isContextBuildingBroken = false;
      const breakContextBuilding = () => {
        isContextBuildingBroken = true;
      };

      for (const provider of providers) {
        const key = getLoaderContextKey(provider.token);
        const plugin = useDataLoader(key, (ctx) => provider.instance.createDataloader(ctx));
        if (plugin.onContextBuilding) {
          await plugin.onContextBuilding({
            context: contextRecord,
            extendContext: extend,
            breakContextBuilding,
          });
        }
        const loader = contextRecord[key] as DataLoader<any, any> | undefined;
        if (loader) {
          loaders.set(provider.token, loader);
        }
        if (isContextBuildingBroken) {
          break;
        }
      }

      extendContext({ [GQL_CONTEXT_KEY]: loaders });
    },
  };
}
