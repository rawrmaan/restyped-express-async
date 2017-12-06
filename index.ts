import * as express from 'express-serve-static-core'
import {RestypedBase, RestypedRoute} from 'restyped'

export interface TypedRequest<T extends RestypedRoute> extends express.Request {
  body: T['body']
  params: T['params']
  query: T['query']
}

type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'HEAD'
  | 'DELETE'
  | 'OPTIONS'

export default function AsyncRouter<APIDef extends RestypedBase>(
  app: express.Express | express.Router
) {
  function createMiddleware(
    path: string,
    method: HTTPMethod,
    handler: express.RequestHandler
  ) {
    app.use(path, (req, res, next) => {
      if (req.method === method) {
        handler(req, res, next)
      } else {
        next()
      }
    })
  }

  const createAsyncRoute = function<
    Path extends keyof APIDef,
    Method extends HTTPMethod
  >(
    path: Path,
    method: Method,
    handler: (
      req: TypedRequest<APIDef[Path][Method]>,
      res: express.Response
    ) => Promise<APIDef[Path][Method]['response']>
  ) {
    createMiddleware(path, method, (req, res, next) => {
      return handler(req, res)
        .then(res.send)
        .catch(next)
    })
  }

  return {
    route: createAsyncRoute,
    use: app.use,
    get: function<Path extends keyof APIDef>(
      path: Path,
      handler: (
        req: TypedRequest<APIDef[Path]['GET']>
      ) => Promise<APIDef[Path]['GET']['response']>
    ) {
      return createAsyncRoute(path, 'GET', handler)
    },
    post: function<Path extends keyof APIDef>(
      path: Path,
      handler: (
        req: TypedRequest<APIDef[Path]['POST']>
      ) => Promise<APIDef[Path]['POST']['response']>
    ) {
      return createAsyncRoute(path, 'POST', handler)
    },
    put: function<Path extends keyof APIDef>(
      path: Path,
      handler: (
        req: TypedRequest<APIDef[Path]['PUT']>
      ) => Promise<APIDef[Path]['PUT']['response']>
    ) {
      return createAsyncRoute(path, 'PUT', handler)
    },
    delete: function<Path extends keyof APIDef>(
      path: Path,
      handler: (
        req: TypedRequest<APIDef[Path]['DELETE']>
      ) => Promise<APIDef[Path]['DELETE']['response']>
    ) {
      return createAsyncRoute(path, 'DELETE', handler)
    },
    patch: function<Path extends keyof APIDef>(
      path: Path,
      handler: (
        req: TypedRequest<APIDef[Path]['PATCH']>
      ) => Promise<APIDef[Path]['PATCH']['response']>
    ) {
      return createAsyncRoute(path, 'PATCH', handler)
    },
    options: function<Path extends keyof APIDef>(
      path: Path,
      handler: (
        req: TypedRequest<APIDef[Path]['OPTIONS']>
      ) => Promise<APIDef[Path]['OPTIONS']['response']>
    ) {
      return createAsyncRoute(path, 'OPTIONS', handler)
    },
    head: function<Path extends keyof APIDef>(
      path: Path,
      handler: (
        req: TypedRequest<APIDef[Path]['HEAD']>
      ) => Promise<APIDef[Path]['HEAD']['response']>
    ) {
      return createAsyncRoute(path, 'HEAD', handler)
    }
  }
}
