import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GQL_CONTEXT_KEY } from '../constants';
import { DataloaderDiscoveryService } from '../services/dataloader-discovery.service';

@Injectable()
export class DataloaderInterceptor implements NestInterceptor {
  constructor(private readonly discovery: DataloaderDiscoveryService) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const gqlCtx = GqlExecutionContext.create(ctx);
    gqlCtx.getContext()[GQL_CONTEXT_KEY] = this.discovery.createDataloaderMap(gqlCtx);
    return next.handle();
  }
}
