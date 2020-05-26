import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PARSED_REQUEST } from '../constants';
import { ParsedRequest } from '../interfaces/parsed-request.interface';

@Injectable()
export class CrudRequestInterceptor<T = any> implements NestInterceptor<T> {

    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> | Promise<Observable<T>> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        request[PARSED_REQUEST] = {
            query: request.query,
            request,
            response,
        } as ParsedRequest;

        return next.handle();
    }

}
