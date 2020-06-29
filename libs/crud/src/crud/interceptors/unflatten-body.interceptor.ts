import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PARSED_REQUEST, ORIGINAL_BODY } from '../constants';

@Injectable()
export class UnflattenBodyInterceptor<T = any> implements NestInterceptor<T> {

    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> | Promise<Observable<T>> {
        const request = context.switchToHttp().getRequest();
        const body = request[PARSED_REQUEST].request.body;
        request[ORIGINAL_BODY] = body;
        request[PARSED_REQUEST].request.body = this.unflatten(body);
        return next.handle();
    }

    unflatten(object): any {
        const result = {};
        Object.keys(object).forEach((key: any) => {
            this.setValue(result, key, object[key]);
        });
        return result;
    }

    setValue(object: any, path: string, value: any): any {
        const fragments = path.split('.');
        const last = fragments.pop();
        const checkForArray = (index: number, src: any) =>
            isFinite(index + 1 in src ? src[index + 1] : last);

        const extendendObject = fragments.reduce((prev: any, curr: any, index: number, src: any[]) => {
            return prev[curr] = prev[curr] || (checkForArray(index, src) ? [] : {});
        }, object);
        extendendObject[last] = value;
        return extendendObject;
    }

}
