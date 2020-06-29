import { createParamDecorator } from '@nestjs/common';
import { ORIGINAL_BODY } from '../constants';

export const OriginalBody = createParamDecorator(
    (_, ctx): ParameterDecorator => {
        const request = ctx?.switchToHttp?.().getRequest();
        return request?.[ORIGINAL_BODY] ?? {};
    },
);