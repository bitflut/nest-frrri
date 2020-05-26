import { ClassType } from '@nest-frrri/crud/internal';
import { Endpoint } from '../enums/endpoint.enum';
import { EndpointOptions } from './endpoint-options.interface';

export interface CrudDecoratorOptions {
    /**
     * An array of CrudEndpoints you want to expose. You can provide an Object in order to configure custom options.
     *
     * Once `endpoints` is provided, only the endpoints stated are exposed. We believe in being explicit, so if we
     * ever decide to add more Endpointmethods, you won't automatically inherit them this way.
     *
     * @default
     * [...Object.values(CrudEndpoint)] // All available endpoints
     *
     * @example <caption>All endpoints provided will use the `DefaultDto` except for *PatchOne*, which will use `PatchOneDto`.</caption>
     * ```
     * {
     *     endpoints: [
     *         Endpoint.GetMany,
     *         Endpoint.GetOne,
     *         Endpoint.PostOne,
     *         {
     *             endpoint: Endpoint.PatchOne,
     *             dto: PatchOneDto,
     *         }
     *     ],
     *     dto: DefaultDto,
     * }
     * ```
     * @description
     * All endpoints privided will use the `DefaultDto` except for *PatchOne*, which will use `PatchOneDto`.
     */
    endpoints?: Array<Endpoint | EndpointOptions>;

    /**
     * Will be merged into `ParsedRequest.query` before passing it to the service.
     *
     * @description
     * Use if you want to scope your controller.
     *
     * @example
     * ```
     * {
     *     query: { isBlue: {$eq: true} }
     * }
     * ```
     */
    query?: { [key: string]: any };

    /** Default dto used for validation */
    dto?: ClassType;

    /**
     * Defalt type of id for endpoints with :id in path.
     * If provided, nest will convert the `id` to the provided primitive or ClassType.
     */
    idType?: any;
}
