import { IdType } from '@nest-frrri/crud/internal';
import { Controller, HttpModule, ValidationPipe } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import * as supertest from 'supertest';
import { Crud } from '../decorators/crud.decorator';
import { Endpoint } from '../enums/endpoint.enum';
import { CrudController } from '../interfaces/crud-controller.interface';
import { CrudService } from '../interfaces/crud-service.interface';
import { ParsedRequest } from '../interfaces/parsed-request.interface';

interface Post {
    id: number;
    userId: number;
    body: string;
    title: string;
}

@Exclude()
class DefaultDto {
    @Expose()
    @IsString()
    @IsOptional()
    userId?: number;

    @Expose()
    @IsString()
    body: string;

    @Expose()
    @IsString()
    title: string;
}

@Exclude()
class PostOneDto {
    @Expose()
    @IsString()
    body: string;

    @Expose()
    @IsString()
    title: string;
}

class PostsService implements CrudService<Post> {

    data: { [key: number]: Post } = {
        1: {
            'body': 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto',
            'id': 1,
            'title': 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
            'userId': 1,
        },
        2: {
            'body': 'est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis qui aperiam non debitis possimus qui neque nisi nulla',
            'id': 2,
            'title': 'qui est esse',
            'userId': 1,
        },
        3: {
            'body': 'et iusto sed quo iure voluptatem occaecati omnis eligendi aut ad voluptatem doloribus vel accusantium quis pariatur molestiae porro eius odio et labore et velit aut',
            'id': 3,
            'title': 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
            'userId': 1,
        },
    };

    getMany(req: ParsedRequest) {
        return Object.values(this.data);
    }

    getOne(req: ParsedRequest, id: IdType) {
        return this.data[id];
    }

    patchOne(req: ParsedRequest, id: IdType, originalBody: any, body: any) {
        return body;
    }

    postOne(req: ParsedRequest, body: any) {
        return body;
    }

}

describe('CrudRequestInterceptor', () => {
    let $: supertest.SuperTest<supertest.Test>;
    let app: NestApplication;

    @Crud({
        endpoints: [
            Endpoint.GetMany,
            Endpoint.GetOne,
            Endpoint.PatchOne,
            {
                endpoint: Endpoint.PostOne,
                dto: PostOneDto,
            },
        ],
        dto: DefaultDto,
    })
    @Controller('posts')
    class PostsController implements CrudController<Post> {
        constructor(public service: PostsService) { }
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [PostsController],
            providers: [PostsService],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();
        $ = supertest(app.getHttpServer());
    });

    it('should be provided', async () => {
        const getMany = await $.get('/posts').expect(200);
        expect(getMany.body).toMatchSnapshot('getMany()');

        const getOne1 = await $.get('/posts/1').expect(200);
        expect(getOne1.body).toMatchSnapshot('getOne(1)');
        expect(getOne1.body.id).toEqual(1);

        const getOne2 = await $.get('/posts/2').expect(200);
        expect(getOne2.body).toMatchSnapshot('getOne(2)');
        expect(getOne2.body.id).toEqual(2);

        const patch1 = await $.patch('/posts/1').send({ _id: 'asdf', body: 'asdf', title: 'asdf', asdf: 'asdf' }).expect(200);
        expect(patch1.body).toMatchSnapshot('patch(1)');
        expect(Object.keys(patch1.body).length).toBeGreaterThan(0);
        expect(patch1.body.asdf).toBeUndefined();

        const post1 = await $.post('/posts').send({ _id: 'asdf', body: 'asdf', title: 'asdf', asdf: 'asdf' }).expect(201);
        expect(post1.body).toMatchSnapshot('post(1)');
    });

    afterAll(async () => {
        await app.close();
    });

});
