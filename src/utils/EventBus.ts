import type { Events } from './events'

export class EventBus {
  private static listeners: {
    [K in keyof Events]?: Array<(payload: Events[K]) => void>
  } = {};

  static on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    (this.listeners[event] ??= []) as Array<(payload: Events[K]) => void>;
    (this.listeners[event] as Array<(payload: Events[K]) => void>).push(handler);
  }

  static off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    if (!this.listeners[event]) return;
    // @ts-ignore
    this.listeners[event] = this.listeners[event].filter(h => h !== handler) as Array<(payload: Events[K]) => void>;
  }

  static emit<K extends keyof Events>(event: K, payload: Events[K]) {
    (this.listeners[event] ?? []).forEach(handler => (handler as (payload: Events[K]) => void)(payload));
  }
}