import { EndpointDefinition } from './endpoint-definition.interface';
import { EndpointOptions } from './endpoint-options.interface';

export type EndpointConfig = EndpointOptions & EndpointDefinition;
