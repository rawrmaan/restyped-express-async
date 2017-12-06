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
    Method extends HTTPMethod,
    RouteDef extends RestypedRoute = APIDef[Path][Method]
  >(
    path: Path,
    method: Method,
    handler: (
      req: TypedRequest<RouteDef>,
      res: express.Response
    ) => Promise<RouteDef['response']>
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
    get: function<
      Path extends keyof APIDef,
      RouteDef extends RestypedRoute = APIDef[Path]['GET']
    >(
      path: Path,
      handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
    ) {
      return createAsyncRoute(path, 'GET', handler)
    },

    post: function<
      Path extends keyof APIDef,
      RouteDef extends RestypedRoute = APIDef[Path]['POST']
    >(
      path: Path,
      handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
    ) {
      return createAsyncRoute(path, 'POST', handler)
    },

    put: function<
      Path extends keyof APIDef,
      RouteDef extends RestypedRoute = APIDef[Path]['PUT']
    >(
      path: Path,
      handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
    ) {
      return createAsyncRoute(path, 'PUT', handler)
    },

    delete: function<
      Path extends keyof APIDef,
      RouteDef extends RestypedRoute = APIDef[Path]['DELETE']
    >(
      path: Path,
      handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
    ) {
      return createAsyncRoute(path, 'DELETE', handler)
    },

    patch: function<
      Path extends keyof APIDef,
      RouteDef extends RestypedRoute = APIDef[Path]['PATCH']
    >(
      path: Path,
      handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
    ) {
      return createAsyncRoute(path, 'PATCH', handler)
    },

    options: function<
      Path extends keyof APIDef,
      RouteDef extends RestypedRoute = APIDef[Path]['OPTIONS']
    >(
      path: Path,
      handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
    ) {
      return createAsyncRoute(path, 'OPTIONS', handler)
    },

    head: function<
      Path extends keyof APIDef,
      RouteDef extends RestypedRoute = APIDef[Path]['HEAD']
    >(
      path: Path,
      handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
    ) {
      return createAsyncRoute(path, 'HEAD', handler)
    }
  }
}
