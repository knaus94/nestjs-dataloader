import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GQL_CONTEXT_KEY } from '../constants';
import { DataloaderDiscoveryService } from '../services/dataloader-discovery.service';

@Injectable()
export class DataloaderInterceptor implements NestInterceptor {
  constructor(private readonly discovery: DataloaderDiscoveryService) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const gqlContext = GqlExecutionContext.create(ctx).getContext<Record<string, any>>();
    gqlContext[GQL_CONTEXT_KEY] = this.discovery.createDataloaderMap(gqlContext);
    return next.handle();
  }
}
