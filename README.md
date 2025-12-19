# @dessly/nestjs-dataloader

> 📦 Zero-config DataLoader integration for **NestJS 11 + GraphQL Yoga**

---

## Installation
```bash
npm i @dessly/nestjs-dataloader dataloader
```

## Quick Start

# 1. Connect the module

```typescript
// core.module.ts
import { Module } from '@nestjs/common';
import {
  GraphQLModule,
} from '@nestjs/graphql';
import {
  YogaFederationDriver,
  YogaFederationDriverConfig,
} from '@graphql-yoga/nestjs-federation';
import { DataloaderModule, DATALOADER_ENVELOP_PLUGIN } from '@dessly/nestjs-dataloader';

@Module({
  imports: [
    /** ① add the global module */
    DataloaderModule,

    /** ② connect GraphQL via forRootAsync
        and get the Envelop plugin from DI  */
    GraphQLModule.forRootAsync<YogaFederationDriverConfig>({
      driver: YogaFederationDriver,
      imports: [DataloaderModule],
      inject: [DATALOADER_ENVELOP_PLUGIN],
      useFactory: (dataloaderPlugin) => ({
        driver: YogaFederationDriver,
        autoSchemaFile: { federation: 2 },
        context: ({ req }) => ({ req }),
        plugins: [dataloaderPlugin],          // ← DataLoader-plugin
      }),
    }),
  ],
})
export class CoreModule {}
```

# 2. Define DataLoader

```typescript
// author.loader.ts
import DataLoader from 'dataloader';
import { DataloaderProvider } from '@dessly/nestjs-dataloader';
import { AuthorService } from './author.service';
import { Author } from './author.entity';

@DataloaderProvider()
export class AuthorLoader {
  constructor(private readonly svc: AuthorService) {}

  /** helper: SELECT ... WHERE id IN (ids) and return in the correct order */
  createDataloader(): DataLoader<number, Author | null> {
    return new DataLoader(async (ids: readonly number[]) => {
      const rows = await this.svc.findManyByIds(ids as number[]);
      const map = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => map.get(id) ?? null);
    });
  }
}
```

# 3. Use in resolver

```typescript
// book.resolver.ts
import { ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { Loader } from '@dessly/nestjs-dataloader';
import { AuthorLoader } from './author.loader';
import DataLoader from 'dataloader';
import { Book } from './book.entity';
import { Author } from './author.entity';

@Resolver(() => Book)
export class BookResolver {
  @ResolveField(() => Author, { name: 'author' })
  author(
    @Parent() book: Book,
    @Loader(AuthorLoader) loader: DataLoader<number, Author | null>,
  ) {
    return loader.load(book.authorId);
  }
}
```
