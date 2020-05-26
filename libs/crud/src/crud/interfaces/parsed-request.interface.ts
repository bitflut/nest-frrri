export interface ParsedRequest<Query = { [key: string]: any }, Request = any, Response = any> {
    query: Query;
    request: Request;
    response: Response;
    [key: string]: any;
}
