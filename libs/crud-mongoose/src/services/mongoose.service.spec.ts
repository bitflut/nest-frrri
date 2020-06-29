import { Crud, CrudController, Endpoint } from '@nest-frrri/crud';
import { Controller, Injectable, ValidationPipe } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { getModelToken, MongooseModule, MongooseModuleOptions, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Document, Model } from 'mongoose';
import * as supertest from 'supertest';
import { MongooseCrudService } from './mongoose.service';
import { IsNotEmpty, IsOptional, IsArray } from 'class-validator';

abstract class Entity {
    _id: string;
}

@Schema()
class User extends Entity {

    @Prop()
    name: string;

    @Prop()
    email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema()
class Post extends Entity {

    @Prop()
    title: string;

    @Prop()
    body: string;

    @Prop({ ref: 'User' })
    user: string;

    @Prop()
    tags: string[];
}

class PatchDto {

    @IsOptional()
    title: string;

    @IsNotEmpty()
    body: string;

    @IsNotEmpty()
    user: string;

    @IsArray()
    @IsOptional()
    tags: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

const usersDbData: User[] & { _id: string }[] = [
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

const postsDbData: Post[] & { _id: string }[] = [
    {
        body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto',
        _id: '5ec25a78737139f36b288f5a',
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
        user: usersDbData[0]._id,
        tags: ['tag'],
    },
    {
        body: 'est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis qui aperiam non debitis possimus qui neque nisi nulla',
        _id: '5ec25a6dd75a4cf337599503',
        title: 'qui est esse',
        user: usersDbData[0]._id,
        tags: ['tag'],
    },
    {
        body: 'et iusto sed quo iure voluptatem occaecati omnis eligendi aut ad voluptatem doloribus vel accusantium quis pariatur molestiae porro eius odio et labore et velit aut',
        _id: '5ec25a78737139f36b288f5b',
        title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
        user: usersDbData[1]._id,
        tags: ['tag'],
    },
];

const postToCreateDto = {
    body: 'et iusto sed quo iure voluptatem occaecati omnis eligendi aut ad voluptatem doloribus vel accusantium quis pariatur molestiae porro eius odio et ',
    title: 'ea molestias quasi exercitationem repellat',
    user: usersDbData[1]._id,
    tags: ['tag'],
};

@Injectable()
class PostsService extends MongooseCrudService<Post & Document>('Post') { }

@Crud({
    endpoints: [
        {
            endpoint: Endpoint.PatchOne,
            dto: PatchDto,
        },
        {
            endpoint: Endpoint.PostOne, dto: PatchDto,
        },
        Endpoint.DeleteOne,
        Endpoint.GetMany,
        Endpoint.GetOne,
        Endpoint.PutOne,
    ],
})
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
        app.useGlobalPipes(new ValidationPipe());
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

    it('should delete', async () => {
        let post = await PostModel.findOne({ _id: postsDbData[1]._id });
        expect(post).toBeDefined();
        const res = await $.delete(`/posts/${postsDbData[1]._id}`).expect(200);
        expect(res.body).toEqual({});
        post = await PostModel.findOne({ _id: postsDbData[1]._id });
        expect(post).toBeNull();
    });

    it('should delete non existing', async () => {
        const imaginaryId = '5ec25a78737139f36b288f52';
        const post = await PostModel.findOne({ _id: imaginaryId });
        expect(post).toBeNull();
        const res1 = await $.delete(`/posts/${imaginaryId}`).expect(200);
    });

    it('should create', async () => {
        let posts = await PostModel.find({ user: usersDbData[1]._id });
        expect(posts.length).toEqual(1);
        await $.post('/posts').send(postToCreateDto).expect(201);
        posts = await PostModel.find({ user: usersDbData[1]._id });
        expect(posts.length).toEqual(2);
    });

    it('should not create', async () => {
        let posts = await PostModel.find({ user: usersDbData[1]._id });
        expect(posts.length).toEqual(1);
        await $.post('/posts').send({}).expect(400);
        posts = await PostModel.find({ user: usersDbData[1]._id });
        expect(posts.length).toEqual(1);
    });

    it('should patch', async () => {
        const postToPatch = { ...postsDbData[0] };
        postToPatch.body = 'we put the city';

        delete postToPatch.title;
        delete postToPatch.tags;
        postToPatch['tags.0'] = 'flat';

        const data = await $.patch(`/posts/${postToPatch._id}`).send(postToPatch).expect(200);
        expect(data.body.body).toEqual(postToPatch.body);
        const post = await PostModel.findOne({ _id: postToPatch._id });
        expect(data.body.body).toEqual(post.body);
    });

    it('should not patch', async () => {
        const postToPatch = { ...postsDbData[0] };
        postToPatch.body = 'we put the city';
        delete postToPatch.title;
        delete postToPatch.tags;
        delete postToPatch.body;
        postToPatch['tags.0'] = 'flat';
        const data = await $.patch(`/posts/${postToPatch._id}`).send(postToPatch).expect(400);
    });

    afterEach(async () => {
        await mongod.stop();
        await app.close();
    });

});
