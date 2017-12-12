# RESTyped Axios

Express route wrappers for declaring type-safe APIs with [RESTyped](https://github.com/rawrmaan/restyped). Also supports `async` route functions.

## Usage

`npm install restyped-express-async`

It's just like normal express, except you'll need to provide a RESTyped API definition file for the API you want to use, and return a Promise with your response value in order to activate type-checking.

```typescript
import RestypedRouter from 'restyped-express-async'
import {MyAPI} from './MyAPI' // <- Your API's RESTyped defintion
import * as express from 'express'

const app = express()
const router = RestypedRouter<MyAPI>(app)

// You'll get a compile error if you declare a route that doesn't exist in your API defintion.
router.post('/login', async req => {
  // Error if you try to access body keys that don't exist in your API definition.
  const {username, password, twoFactorPin} = req.body
  //     ^ string  ^ string  ^ number

  const accessToken = await User.login(username, password, twoFactorPin)

  // Error if you don't return the response type defined in your API defintion.
  return accessToken
})
```

## Error handling and status codes

### Error handling

You can `throw` from inside your `async` function and it will return a 500 to the client.

### Status codes

Use express directly to send responses with status codes. Don't forget to `return` after you `res.send()`.

```typescript
router.post('/login', async (req, res) => {
  const {username, password, twoFactorPin} = req.body
  const accessToken = await User.login(username, password, twoFactorPin)

  if (!accessToken) {
    res.status(401).send()
    return
  }

  return accessToken
})
```
