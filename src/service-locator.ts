export class ServiceLocator {
  static services: Record<string, any> = {};

  static register(name: string, service: any) {
    this.services[name] = service;
  }

  static unregister(name: string) {
    delete this.services[name];
  }

  static get<T>(name: string): T {
    const service = this.services[name];
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service as T;
  }
}
