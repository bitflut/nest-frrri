import { IdType } from '@nest-frrri/crud/internal';
import { CrudService } from './crud-service.interface';
import { Defferable } from './deferrable.interface';
import { ParsedRequest } from './parsed-request.interface';

export interface CrudController<Entity = any, PaginatedEntity = Entity[], Id = IdType> {
    service: CrudService<Entity, PaginatedEntity>;
    getMany?(req: ParsedRequest, ...args: any[]): Defferable<PaginatedEntity>;
    getOne?(req: ParsedRequest, id: Id, ...args: any[]): Defferable<Entity>;
    deleteOne?(req: ParsedRequest, id: Id, ...args: any[]): Defferable<void>;
    patchOne?(req: ParsedRequest, id: Id, data: Partial<Entity>, ...args: any[]): Defferable<Entity>;
    putOne?(req: ParsedRequest, id: Id, data: Partial<Entity>, ...args: any[]): Defferable<Entity>;
    postOne?(req: ParsedRequest, id: Id, data: Partial<Entity>, ...args: any[]): Defferable<Entity>;
}

