import DataLoader from 'dataloader';

/**
 * Фабрика должна вернуть DataLoader.
 * В аргументе — обычный GraphQL-context (тот же, что приходит в резолверы).
 */
export interface DataloaderFactory<K = unknown, V = unknown> {
  createDataloader(graphqlCtx: Record<string, any>): DataLoader<K, V>;
}
