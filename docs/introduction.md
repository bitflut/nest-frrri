# Introduction

## 🏎️ 🏎️ @nest-frrri 🏎️ 🏎️

> Crud controllers at 250 km/h

## @nest-frrri/crud

### Synopsis

Most crud libraries for Nest try to solve too much. This is why we created @nest-frrri/crud.

### State of development

We are working on the foundation of this library. If you want to take it for a test drive, please see the nest-integration app in this repository until documentation catches up.

### What it looks like:

#### @nest-frrri/crud-mongoose example:

```typescript
class PostsService extends MongooseService<Post & Document>({ modelToken: 'Post' }) { }

@Crud()
@Controller({ path: 'posts' })
class PostsController implements CrudController<Post & Document> {
  constructor(public service: PostsService) { }
}
```

## Integrations

See
- @nest-frrri/crud-mongoose
- @nest-frrri/crud-json-server

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)
