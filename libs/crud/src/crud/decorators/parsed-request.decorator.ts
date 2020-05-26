import { createParamDecorator } from '@nestjs/common';
import { PARSED_REQUEST } from '../constants';

export const ParsedRequest = createParamDecorator(
    (_, ctx): ParameterDecorator => {
        const request = ctx?.switchToHttp?.().getRequest();
        return request?.[PARSED_REQUEST] ?? {};
    },
);
