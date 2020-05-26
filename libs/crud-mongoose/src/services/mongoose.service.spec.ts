import { Crud, CrudController } from '@frrri/nest-crud';
import { Controller, Injectable } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { getModelToken, MongooseModule, MongooseModuleOptions, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Document, Model } from 'mongoose';
import * as supertest from 'supertest';
import { MongooseService, MongooseServiceOptions } from './mongoose.service';

@Schema()
class User {
    @Prop()
    _id: string;

    @Prop()
    name: string;

    @Prop()
    email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema()
class Post {
    @Prop()
    _id: string;

    @Prop()
    title: string;

    @Prop()
    body: string;

    @Prop({ ref: 'User' })
    user: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

const usersDbData: User[] = [
    {
        _id: '5ec25a6dd75a4cf3375994ff',
        name: 'Marian',
        email: 'marian@bitflut.com',
    },
    {
        _id: '5ec25a78737139f36b288f58',
        name: 'Patrick',
        email: 'patrick@bitflut.com',
    },
];

const postsDbData: Post[] = [
    {
        body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto',
        _id: '5ec25a78737139f36b288f5a',
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
        user: usersDbData[0]._id,
    },
    {
        body: 'est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis qui aperiam non debitis possimus qui neque nisi nulla',
        _id: '5ec25a6dd75a4cf337599503',
        title: 'qui est esse',
        user: usersDbData[0]._id,
    },
    {
        body: 'et iusto sed quo iure voluptatem occaecati omnis eligendi aut ad voluptatem doloribus vel accusantium quis pariatur molestiae porro eius odio et labore et velit aut',
        _id: '5ec25a78737139f36b288f5b',
        title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
        user: usersDbData[1]._id,
    },
];

@MongooseServiceOptions({ modelToken: 'Post' })
@Injectable()
class PostsService extends MongooseService<Post & Document> { }

@Crud()
@Controller({ path: 'posts' })
class PostsController implements CrudController<Post & Document> {
    constructor(public service: PostsService) { }
}

describe('MongooseService', () => {
    let mongod: MongoMemoryServer;
    let app: NestApplication;
    let UserModel: Model<User & Document>;
    let PostModel: Model<Post & Document>;
    let postsController: PostsController;
    let postsService: PostsService;
    let $: supertest.SuperTest<supertest.Test>;

    beforeEach(async () => {
        mongod = new MongoMemoryServer();
        await mongod.start();

        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: async () => {
                        const uri = await mongod.getUri();
                        return { uri } as MongooseModuleOptions;
                    },
                }),
                MongooseModule.forFeature([
                    { name: 'Post', schema: PostSchema },
                    { name: 'User', schema: UserSchema },
                ]),
            ],
            controllers: [PostsController],
            providers: [PostsService],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        $ = supertest(app.getHttpServer());

        UserModel = moduleRef.get<Model<User & Document>>(getModelToken('User'));
        PostModel = moduleRef.get<Model<Post & Document>>(getModelToken('Post'));

        await UserModel.create(usersDbData);
        await PostModel.create(postsDbData);

        postsController = moduleRef.get(PostsController);
        postsService = moduleRef.get(PostsService);
    });

    it('should find posts on MongoMemoryServer', async () => {
        const posts = await PostModel.find({}).exec();
        expect(posts.length).toEqual(3);
    });

    it('should getMany', async () => {
        const res = await $.get('/posts').expect(200);
        expect(res.body.length).toEqual(3);
    });

    it('should getMany with params', async () => {
        const res = await $.get(`/posts?conditions[_id][$eq]=${postsDbData[0]._id}`).expect(200);
        expect(res.body.length).toEqual(1);
    });

    it('should getOne', async () => {
        const res = await $.get(`/posts/${postsDbData[0]._id}`).expect(200);
        expect(res.body._id).toEqual(postsDbData[0]._id);
    });

    it('should getOne with select', async () => {
        const res = await $.get(`/posts/${postsDbData[0]._id}?select=title`).expect(200);
        expect(res.body._id).toEqual(postsDbData[0]._id);
        expect(res.body.title).toEqual(postsDbData[0].title);
        expect(res.body.body).toBeUndefined();
    });

    it('should getMany with sort and select', async () => {
        const res = await $.get('/posts?sort=-_id&select=title').expect(200);
        expect(res.body[0]._id).toEqual(postsDbData[2]._id);
        expect(res.body[0].title).toEqual(postsDbData[2].title);
        expect(res.body[0].body).toBeUndefined();
    });

    afterEach(async () => {
        await mongod.stop();
        await app.close();
    });

});
