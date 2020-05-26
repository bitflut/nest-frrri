import { createParamDecorator } from '@nestjs/common';

export const IdParam = (key = 'id') => createParamDecorator(
    (_, ctx): ParameterDecorator => {
        const request = ctx?.switchToHttp()?.getRequest();
        return request.params[key];
    },
);
