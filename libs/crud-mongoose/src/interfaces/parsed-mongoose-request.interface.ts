import { ParsedRequest } from '@nest-frrri/crud';
import { FilterQuery } from 'mongoose';

interface RequestQuery {
    conditions: FilterQuery<any>;
    select: string;
    sort: string;
}

export interface ParsedMongooseRequest extends ParsedRequest<RequestQuery> {
}
