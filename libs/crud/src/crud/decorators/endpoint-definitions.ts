import { RequestMethod } from '@nestjs/common';
import { Endpoint } from '../enums/endpoint.enum';
import { EndpointConfig } from '../interfaces/endpoint-config.interface';
import { EndpointDefinition } from '../interfaces/endpoint-definition.interface';
import { ParsedRequest } from '../interfaces/parsed-request.interface';

function endpointFactory(config: EndpointConfig) {
    return function (req: ParsedRequest, ...args: any) {
        if (!req) {
            throw new Error(`Provide \`ParsedRequest\` as first argument to \`${config.endpoint}()\``);
        }

        req.query = {
            ...req.query,
            ...config.query,
        };

        return this.service[config.endpoint](req, ...args);
    };
}

const defaultFactory = (config: EndpointConfig) => endpointFactory(config);

export const endpointDefinitions: { [key in Endpoint]: EndpointDefinition } = {
    [Endpoint.GetMany]: {
        request: {
            method: RequestMethod.GET,
            path: '',
        },
        factory: defaultFactory,
    },
    [Endpoint.GetOne]: {
        request: {
            method: RequestMethod.GET,
            path: ':id',
        },
        factory: defaultFactory,
    },
    [Endpoint.DeleteOne]: {
        request: {
            method: RequestMethod.DELETE,
            path: ':id',
        },
        factory: defaultFactory,
    },
    [Endpoint.PatchOne]: {
        request: {
            method: RequestMethod.PATCH,
            path: ':id',
        },
        factory: defaultFactory,
    },
    [Endpoint.PostOne]: {
        request: {
            method: RequestMethod.POST,
            path: '',
        },
        factory: defaultFactory,
    },
    [Endpoint.PutOne]: {
        request: {
            method: RequestMethod.PUT,
            path: ':id',
        },
        factory: defaultFactory,
    },
};
