// src/dataloader.module.ts
import { Global, Module } from '@nestjs/common';
import { ModuleRef, DiscoveryModule } from '@nestjs/core'; // ← добавили DiscoveryModule
import { DataloaderDiscoveryService } from './services/dataloader-discovery.service';
import { createDataloaderPlugin } from './plugins/dataloader.plugin';
import { DATALOADER_ENVELOP_PLUGIN } from './constants';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    DataloaderDiscoveryService,
    {
      provide: DATALOADER_ENVELOP_PLUGIN,
      inject: [ModuleRef, DataloaderDiscoveryService],
      useFactory: createDataloaderPlugin,
    },
  ],
  exports: [DATALOADER_ENVELOP_PLUGIN, DataloaderDiscoveryService],
})
export class DataloaderModule {}
