import { Plugin } from '@envelop/core';
import { ModuleRef, ContextIdFactory } from '@nestjs/core';
import { GQL_CONTEXT_KEY } from '../constants';
import { DataloaderDiscoveryService } from '../services/dataloader-discovery.service';

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

      const loaders = service.createDataloaderMap(context);

      extendContext({ [GQL_CONTEXT_KEY]: loaders });
    },
  };
}
