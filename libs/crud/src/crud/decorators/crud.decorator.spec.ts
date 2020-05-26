import { ClassType } from '@frrri/nest-crud/internal';
import { Controller } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Endpoint } from '../enums/endpoint.enum';
import { CrudDecoratorOptions } from '../interfaces/crud-decorator-options.interface';
import { Crud } from './crud.decorator';

class Dto { }
class PostDto { }
class PatchDto { }

describe('@Crud', () => {

    it('should compile with defaults', () => {
        @Crud()
        @Controller()
        class Ctrl { }

        // Compiles successfully
        expect(Ctrl).toBeDefined();

        // Defines all endpoints
        for (const endpoint of Object.values(Endpoint)) {
            expect(Ctrl.prototype[endpoint]).toBeDefined();
        }
    });

    it('should provide certain endpoints', () => {
        const endpoints = [Endpoint.GetMany, Endpoint.GetOne] as CrudDecoratorOptions['endpoints'];

        @Crud({ endpoints })
        @Controller()
        class Ctrl { }

        // Defines endpoints provided
        for (const endpoint of endpoints) {
            expect(Ctrl.prototype[endpoint as Endpoint]).toBeDefined();
        }

        // Does not define any unprovided endpoints
        expect(Ctrl.prototype[Endpoint.DeleteOne]).not.toBeDefined();
    });

    it('should use dto', () => {
        @Crud({ dto: Dto })
        @Controller()
        class Ctrl { }

        const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', Ctrl.prototype, Endpoint.PostOne);
        const isPostDtoDefined = paramTypes.findIndex(t => t === Dto) > -1;
        expect(isPostDtoDefined).toBeTruthy();
    });

    it('should set custom dtos alongside default dto', () => {
        @Crud({
            endpoints: [
                Endpoint.PutOne,
                {
                    endpoint: Endpoint.PostOne,
                    dto: PostDto,
                },
                {
                    endpoint: Endpoint.PatchOne,
                    dto: PatchDto,
                },
            ],
            dto: Dto,
        })
        @Controller()
        class Ctrl { }

        const validateDto = (endpoint: Endpoint, dto: ClassType) => {
            const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', Ctrl.prototype, endpoint) || [];
            const isDtoDefined = paramTypes.findIndex(t => t === dto) > -1;
            expect(isDtoDefined).toBeTruthy();
        };

        validateDto(Endpoint.PutOne, Dto);
        validateDto(Endpoint.PatchOne, PatchDto);
        validateDto(Endpoint.PostOne, PostDto);
    });

    it('should set provided id type', () => {
        @Crud({ idType: ObjectId })
        @Controller()
        class Ctrl { }

        const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', Ctrl.prototype, Endpoint.GetOne);
        const isIdTypeDefined = paramTypes.findIndex(t => t === ObjectId) > -1;
        expect(isIdTypeDefined).toBeTruthy();
    });

});
