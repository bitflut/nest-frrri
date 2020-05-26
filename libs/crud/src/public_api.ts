export { Crud } from './crud/decorators/crud.decorator';
// TODO: How should we differentiate between ParsedRequest and @ParsedRequest()?
export { ParsedRequest as IParsedRequest } from './crud/decorators/parsed-request.decorator';
export { Endpoint as Endpoint } from './crud/enums/endpoint.enum';
export { CrudController } from './crud/interfaces/crud-controller.interface';
export { CrudDecoratorOptions } from './crud/interfaces/crud-decorator-options.interface';
export { ParsedRequest } from './crud/interfaces/parsed-request.interface';

