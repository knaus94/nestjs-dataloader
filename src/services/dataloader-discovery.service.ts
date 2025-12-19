import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common/interfaces';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import type DataLoader from 'dataloader';
import { METADATA_KEY } from '../constants';
import { DataloaderFactory } from '../interfaces/dataloader-factory.interface';

export type DataloaderMap = Map<InjectionToken, DataLoader<any, any>>;

@Injectable()
export class DataloaderDiscoveryService implements OnModuleInit {
  private providers?: InstanceWrapper<DataloaderFactory>[];

  constructor(private readonly discovery: DiscoveryService) {}

  onModuleInit() {
    this.providers = this.discovery
      .getProviders()
      .filter(
        (p) => p.metatype && Reflect.getMetadata(METADATA_KEY, p.metatype),
      ) as InstanceWrapper<DataloaderFactory>[];
  }

  getProviders(): InstanceWrapper<DataloaderFactory>[] {
    if (!this.providers) {
      throw new InternalServerErrorException('DataloaderDiscoveryService is not initialised');
    }
    return this.providers;
  }

  createDataloaderMap(graphqlCtx: Record<string, any>): DataloaderMap {
    const providers = this.getProviders();
    return new Map(
      providers.map((p) => [
        p.token,
        p.instance.createDataloader(graphqlCtx),
      ]),
    );
  }
}
