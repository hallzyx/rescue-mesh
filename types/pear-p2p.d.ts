declare module "corestore" {
  type ReplicationSocket = {
    write(data: Buffer): void;
    destroyed?: boolean;
    on(event: string, cb: (...args: unknown[]) => void): void;
  };

  export default class Corestore {
    constructor(path: string);
    get(options: { name: string } | { key: Buffer }): {
      key: Buffer;
      length: number;
      ready(): Promise<void>;
      update(): Promise<void>;
      download(range: { start: number; end: number }): { done(): Promise<void> };
    };
    replicate(target: boolean | ReplicationSocket): NodeJS.ReadWriteStream;
  }
}

declare module "hyperswarm" {
  type SwarmSocket = {
    write(data: Buffer): void;
    destroyed?: boolean;
    on(event: "data", cb: (chunk: Buffer) => void): void;
    on(event: string, cb: (...args: unknown[]) => void): void;
  };

  export default class Hyperswarm {
    connections: Set<SwarmSocket>;
    on(event: "connection", listener: (socket: SwarmSocket) => void): void;
    join(topic: Buffer, opts?: { server?: boolean; client?: boolean }): void;
    flush(): Promise<void>;
  }
}

declare module "hyperbee" {
  export default class Hyperbee {
    constructor(
      core: {
        key: Buffer;
        length: number;
        ready(): Promise<void>;
        update(): Promise<void>;
        download(range: { start: number; end: number }): { done(): Promise<void> };
      },
      opts?: { keyEncoding?: string; valueEncoding?: string },
    );
    ready(): Promise<void>;
    put(key: string, value: unknown): Promise<void>;
    get(key: string): Promise<{ value?: unknown } | null>;
    createReadStream(): AsyncIterable<{ key: string; value?: unknown }>;
  }
}
