import { CacheStorageInMemory } from "@/modules/storage";

// TODO 使用redis
// TODO 存一些其他的信息进去 比如订阅信息之类的
export const DATA_BASE = new CacheStorageInMemory<string>()


