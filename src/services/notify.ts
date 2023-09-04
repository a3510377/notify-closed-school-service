import { EventEmitter } from 'events';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Notify extends EventEmitter implements Notify {}

export interface NotifyEvents {
  closeInfo: [data: Record<string, Record<string, string[]>>];
}

export type NotifyEventKeys = keyof NotifyEvents;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Notify {
  addListener<K extends NotifyEventKeys>(
    eventName: K,
    listener: (...args: NotifyEvents[K]) => void,
  ): this;
  addListener<K extends string | symbol>(
    eventName: Exclude<K, NotifyEventKeys>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void,
  ): this;

  on<K extends NotifyEventKeys>(
    eventName: K,
    listener: (...args: NotifyEvents[K]) => void,
  ): this;
  on<K extends string | symbol>(
    eventName: Exclude<K, NotifyEventKeys>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void,
  ): this;

  once<K extends NotifyEventKeys>(
    eventName: K,
    listener: (...args: NotifyEvents[K]) => void,
  ): this;
  once<K extends string | symbol>(
    eventName: Exclude<K, NotifyEventKeys>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void,
  ): this;

  removeListener<K extends NotifyEventKeys>(
    eventName: K,
    listener: (...args: NotifyEvents[K]) => void,
  ): this;
  removeListener<K extends string | symbol>(
    eventName: Exclude<K, NotifyEventKeys>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void,
  ): this;

  emit<K extends NotifyEventKeys>(
    eventName: K,
    ...args: NotifyEvents[K]
  ): boolean;
  emit<K extends string | symbol>(
    eventName: Exclude<K, NotifyEventKeys>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): boolean;
}
