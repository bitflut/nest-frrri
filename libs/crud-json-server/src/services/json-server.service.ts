import { ParsedRequest } from '@nest-frrri/crud';
import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, pipe, UnaryFunction } from 'rxjs';
import { map, mapTo, tap } from 'rxjs/operators';

interface Options {
    collection: string;
    apiUrl?: string;
}

export function JsonServerCrudService<Entity = any, PaginatedEntity = Entity[]>(options: Options) {

    options = {
        apiUrl: 'http://localhost:3000',
        ...options,
    };

    @Injectable()
    class JsonServerService {

        collection = options.collection;
        apiUrl = options.apiUrl;

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

    return JsonServerService;
}
