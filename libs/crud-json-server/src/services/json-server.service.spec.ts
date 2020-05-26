import { Crud, CrudController, CrudDecoratorOptions, Endpoint } from '@nest-frrri/crud';
import { Controller, HttpModule } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as supertest from 'supertest';
import { JsonServerCrudService } from './json-server.service';

interface Post {
    id: number;
    userId: number;
    body: string;
    title: string;
}

describe('JsonServerService', () => {

    describe('with query', () => {
        const collection = 'posts';
        const query = { id: [1, 2] } as CrudDecoratorOptions['query'];
        const endpoints = [Endpoint.GetMany, Endpoint.GetOne] as CrudDecoratorOptions['endpoints'];
        let app: NestApplication;
        let $: supertest.SuperTest<supertest.Test>;

        beforeAll(async () => {
            class PostsService extends JsonServerCrudService<Post>({ collection }) { }

            @Crud({ query, endpoints })
            @Controller({ path: 'posts' })
            class PostsController implements CrudController<Post> {
                constructor(public service: PostsService) { }
            }

            const moduleRef = await Test.createTestingModule({
                imports: [HttpModule],
                controllers: [PostsController],
                providers: [PostsService],
            }).compile();

            app = moduleRef.createNestApplication();
            await app.init();
            $ = supertest(app.getHttpServer());
        });

        it('should work', async () => {
            const getMany = await $.get('/posts').expect(200);
            expect(getMany.body).toMatchSnapshot('getMany(id=1&id=2)');
            expect(getMany.body.length).toEqual(2);
        });

        afterAll(async () => {
            await app.close();
        });
    });

    describe('with pagination', () => {
        const collection = 'posts';
        const query = { id: [1, 2, 3, 4, 5, 6], _limit: 3 } as CrudDecoratorOptions['query'];
        const endpoints = [Endpoint.GetMany, Endpoint.GetOne] as CrudDecoratorOptions['endpoints'];
        let app: NestApplication;
        let $: supertest.SuperTest<supertest.Test>;

        beforeAll(async () => {
            class PostsService extends JsonServerCrudService<Post>({ collection }) { }

            @Crud({ query, endpoints })
            @Controller({ path: 'posts' })
            class PostsController implements CrudController<Post> {
                constructor(public service: PostsService) { }
            }

            const moduleRef = await Test.createTestingModule({
                imports: [HttpModule],
                controllers: [PostsController],
                providers: [PostsService],
            }).compile();

            app = moduleRef.createNestApplication();
            app.enableCors({
                allowedHeaders: ['link'],
                exposedHeaders: ['link'],
            });
            await app.init();
            $ = supertest(app.getHttpServer());
        });

        it('should work', async () => {
            const getMany = await $.get('/posts?_page=1').expect(200);
            expect(getMany.body).toMatchSnapshot('getMany(pagination)');
            expect(getMany.body.length).toEqual(3);

            const linkHeader: string = getMany.header['link'];
            expect(linkHeader).toBeDefined();

            const nextRegex = /<([^>]+)>;\s?rel="([^"]+)"/;
            const links: any = linkHeader.match(new RegExp(nextRegex, 'g'))
                .reduce((prev, curr) => {
                    const res = curr.match(new RegExp(nextRegex));
                    prev[res[2]] = res[1].replace(/.+\/([^\/]+)$/, '/$1');
                    return prev;
                }, {});
            expect(links.next).toBeDefined();
            expect(links.last).toBeDefined();

            const getNext = await $.get(links.next).expect(200);
            expect(getNext.body).toMatchSnapshot('getNext(pagination)');
            expect(getNext.body.length).toEqual(3);
        });

        afterAll(async () => {
            await app.close();
        });
    });

});
