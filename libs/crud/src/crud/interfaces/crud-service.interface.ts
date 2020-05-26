import { IdType } from '@frrri/nest-crud/internal';
import { Defferable } from './deferrable.interface';
import { ParsedRequest } from './parsed-request.interface';

interface Dtos<PostOne, UpdateOne = PostOne> {
    postOne: PostOne;
    putOne: UpdateOne;
    patchOne: UpdateOne;
}

export interface CrudService<Entity = any, PaginatedEntity = Entity[], Input extends Dtos<any> = Dtos<Partial<Entity>>, Id = IdType> {
    getMany?(req: ParsedRequest, ...args: any[]): Defferable<PaginatedEntity>;
    getOne?(req: ParsedRequest, id: Id, ...args: any[]): Defferable<Entity>;
    deleteOne?(req: ParsedRequest, id: Id, ...args: any[]): Defferable<void>;
    patchOne?(req: ParsedRequest, id: Id, body: Input['patchOne'], ...args: any[]): Defferable<Entity>;
    putOne?(req: ParsedRequest, id: Id, body: Input['putOne'], ...args: any[]): Defferable<Entity>;
    postOne?(req: ParsedRequest, id: Id, body: Input['postOne'], ...args: any[]): Defferable<Entity>;
}
