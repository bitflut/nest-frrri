import { ParsedRequest } from '@frrri/nest-crud';
import { ClassType } from '@frrri/nest-crud/internal';
import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, pipe, UnaryFunction } from 'rxjs';
import { map, mapTo, tap } from 'rxjs/operators';

export function JsonServerServiceOptions(options: {
    collection: string;
    apiUrl?: string;
    validate?: boolean;
}) {
    options = {
        apiUrl: 'http://localhost:3000',
        validate: true,
        ...options,
    };

    return function (target: ClassType) {
        if (options.validate) {
            const isServiceInherited = target.prototype instanceof JsonServerService;
            if (!isServiceInherited) {
                throw new Error(`\`${target.name}\` does not extend \`JsonServerService\``);
            }
        }
        target.prototype.collection = options.collection;
        target.prototype.apiUrl = options.apiUrl;
    };
}

@Injectable()
export class JsonServerService<Entity = any, PaginatedEntity = Entity[]> {

    collection: string;
    apiUrl: string;

    constructor(
        private http: HttpService,
    ) { }

    private composeUrl(...parts: string[]) {
        return [this.apiUrl, this.collection, ...parts].filter(p => typeof p !== 'undefined').join('/');
    }

    getMany(req: ParsedRequest) {
        return this.http.get<PaginatedEntity>(
            this.composeUrl(),
            { params: req.query },
        ).pipe(this.responsePipe(req));
    }

    getOne(req: ParsedRequest, id: string) {
        return this.http.get<Entity>(
            this.composeUrl(id),
            { params: req.query },
        ).pipe(this.responsePipe(req));
    }

    patchOne(req: ParsedRequest, id: string) {
        return this.http.patch<Entity>(
            this.composeUrl(id),
            { params: req.query },
        ).pipe(this.responsePipe(req));
    }

    putOne(req: ParsedRequest, id: string, data: any) {
        return this.http.put<Entity>(
            this.composeUrl(id),
            data,
            { params: req.query },
        ).pipe(this.responsePipe(req));
    }

    postOne(req: ParsedRequest, data: any) {
        return this.http.post<Entity>(
            this.composeUrl(),
            data,
            { params: req.query },
        ).pipe(this.responsePipe(req));
    }

    deleteOne(req: ParsedRequest, id: string) {
        return this.http.delete<void>(
            this.composeUrl(id),
            { params: req.query },
        ).pipe(
            this.responsePipe(req),
            mapTo(undefined),
        );
    }

    private responsePipe<In extends AxiosResponse>(req: ParsedRequest) {
        return pipe(
            tap(response => {
                req.response.set('link', response.headers['link']);
            }),
            map(response => response.data as In['data']),
        ) as UnaryFunction<Observable<In>, Observable<In['data']>>;
    }

}
