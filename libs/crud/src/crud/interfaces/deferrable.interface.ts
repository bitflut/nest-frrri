import { Observable } from 'rxjs';

/**
 * We can return primtives, promises or observables from controllers and services.
 * Nest handles resolving these for us.
 */
export type Defferable<T = any> = T | Observable<T> | Promise<T>;
