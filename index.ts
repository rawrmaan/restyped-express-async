import * as express from 'express'
import {RestypeBase, RestypeRoute} from 'restyped'

interface TypedRequest<T extends RestypeRoute> extends express.Request {
  body: T['body']
  params: T['params']
  query: T['query']
}

interface ReqResInterface {
  Request: any
  Response: any
}

interface RouteError {
  isRouteError: true
  status: number
  message: string
}

type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'HEAD'
  | 'DELETE'
  | 'OPTIONS'

export function throwRouteError(error: Partial<RouteError>) {
  throw {
    ...error,
    isRouteError: true
  } as RouteError
}

export default function AsyncRouter<APIDef extends RestypeBase>(
  app: express.Express
) {
  function createRoute(
    path: string,
    method: HTTPMethod,
    handler: express.RequestHandler
  ) {
    app.use(path, (req, res, next) => {
      if (req.method === method) {
        return handler(req, res, next)
      } else {
        next()
      }
    })
  }

  return function createAsyncRoute<
    Path extends keyof APIDef,
    Method extends HTTPMethod,
    RouteDef extends RestypeRoute = APIDef[Path][Method]
  >(
    path: Path,
    method: Method,
    handler: (req: TypedRequest<RouteDef>) => Promise<RouteDef['response']>
  ) {
    createRoute(path, method, (req, res, next) => {
      return handler(req)
        .then((result: any) => {
          res.send(result)
        })
        .catch(err => {
          if (err.isRouteError) {
            const routeErr: RouteError = err
            res.status(routeErr.status || 500).send(routeErr.message)
          } else {
            next(err)
          }
        })
    })
  }
}
