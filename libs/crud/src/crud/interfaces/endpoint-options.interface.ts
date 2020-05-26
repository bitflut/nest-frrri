import { ClassType } from '@frrri/nest-crud/internal';
import { Endpoint } from '../enums/endpoint.enum';

interface DefaultOptions {
    endpoint: Endpoint;
    query?: { [key: string]: any };
}

interface GetManyOptions extends DefaultOptions {
    endpoint: Endpoint.GetMany;
}

interface GetOneOptions extends DefaultOptions {
    endpoint: Endpoint.GetOne;
    idType?: any;
}

interface PatchOneOptions extends DefaultOptions {
    endpoint: Endpoint.PatchOne;
    idType?: any;
    dto?: ClassType;
}

interface PutOneOptions extends DefaultOptions {
    endpoint: Endpoint.PutOne;
    idType?: any;
    dto?: ClassType;
}

interface PostOneOptions extends DefaultOptions {
    endpoint: Endpoint.PostOne;
    idType?: any;
    dto?: ClassType;
}

export type EndpointOptions =
    DefaultOptions
    | GetManyOptions
    | GetOneOptions
    | PatchOneOptions
    | PutOneOptions
    | PostOneOptions;
