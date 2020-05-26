import { RequestMappingMetadata } from '@nestjs/common';
import { CrudDecoratorOptions } from './crud-decorator-options.interface';

export interface EndpointDefinition<T = any> {
    request: RequestMappingMetadata;
    factory: (options: CrudDecoratorOptions) => (...args: any[]) => T;
}
