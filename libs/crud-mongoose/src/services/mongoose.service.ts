import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Document, DocumentQuery, FilterQuery, Model } from 'mongoose';
import { from, Observable, pipe, UnaryFunction } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { ParsedMongooseRequest } from '../interfaces/parsed-mongoose-request.interface';

export function MongooseCrudService<Entity extends Document = Document, PaginatedEntity = Entity[]>(modelToken: string) {
    @Injectable()
    class MongooseService implements OnModuleInit {

        modelToken = modelToken;
        model: Model<Entity>;

        constructor(protected moduleRef: ModuleRef) { }

        onModuleInit() {
            this.model = this.moduleRef.get(getModelToken(this.modelToken), { strict: false });
        }

        getMany(req: ParsedMongooseRequest) {
            return this.query(
                this.model.find(req.query.conditions) as unknown as DocumentQuery<PaginatedEntity, Entity>,
                req,
            );
        }

        getOne(req: ParsedMongooseRequest, id: string) {
            const conditions = {
                ...req.query.conditions,
                _id: id,
            } as FilterQuery<any>;

            return this.query(
                this.model.findOne(conditions),
                req,
            );
        }

        patchOne(req: ParsedMongooseRequest, id: string) {
            // TODO: Implementation
            const conditions = {
                ...req.query.conditions,
                _id: id,
            } as FilterQuery<any>;

            return this.query(
                this.model.findOne(conditions),
                req,
            );
        }

        putOne(req: ParsedMongooseRequest, id: string, data: any) {
            // TODO: Implementation
            const conditions = {
                ...req.query.conditions,
                _id: id,
            } as FilterQuery<any>;

            return this.query(
                this.model.findOne(conditions),
                req,
            );
        }

        postOne(req: ParsedMongooseRequest, data: any) {
            // TODO: Implementation
            const conditions = {
                ...req.query.conditions,
            } as FilterQuery<any>;

            return this.query(
                this.model.findOne(conditions),
                req,
            );
        }

        deleteOne(req: ParsedMongooseRequest, id: string) {
            // TODO: Implementation
            const conditions = {
                ...req.query.conditions,
                _id: id,
            } as FilterQuery<any>;

            return this.query(
                this.model.findOne(conditions),
                req,
            ).pipe(mapTo(undefined));
        }

        protected query<Many, One extends Document>(query: DocumentQuery<Many, One>, req: ParsedMongooseRequest) {
            ['select', 'sort'].forEach(action => {
                if (req.query[action]) {
                    query[action](req.query[action]);
                }
            });

            return this.request(query, req);
        }

        protected request<Many, One extends Document>(query: DocumentQuery<Many, One>, req: ParsedMongooseRequest) {
            return from(query).pipe(this.requestPipe(req));
        }

        protected requestPipe<In, Out = In>(req: ParsedMongooseRequest) {
            return pipe() as UnaryFunction<Observable<In>, Observable<Out>>;
        }
    }

    return MongooseService;
}
