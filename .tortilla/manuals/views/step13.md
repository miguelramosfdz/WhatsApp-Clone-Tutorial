# Step 13: Authentication

[//]: # (head-end)


In the previous step we’ve set the ground for the authentication system in our app. We have a users collection which can be used to distinguish which data the client is authorized to view, and we have a context handler which can retrieve the current user logged in based on the received value of the `cookie` header. It’s definitely a good starting point, but it misses a lot of things.

In this chapter we will implement a cookie-based authentication system. There are many ways to implement an authentication system in an app, but cookie-based authentication is one of the most popular ones, hence we will go with that method. Essentially the authentication flow in our app should look very simple: a user will be able to sign-in with a dedicated screen, and if he doesn’t own an account he can use the sign-up screen to create a new one. The more complicated part in this flow is the back-end, which is the core of this chapter. So before we get into the implementation, we need to understand the authentication process:

- A user logs in with a username and a password.
The server compares the received username and password to the ones stored in the database.
- If the comparison was successful, the server will generate a token and will set it as a cookie.
- Each time a request is sent, the server will retrieve the username from the stored token on the cookie header and will send data back accordingly.

![auth-flow](https://user-images.githubusercontent.com/7648874/55929679-55e94200-5c50-11e9-9fe7-54ad6194a572.png)

The stored token will save us the hassle of re-specifying the username and password over and over again each and every request. It’s important to note that everything in the authentication process is encrypted, **sensitive information will never be stored or sent in its raw form**, otherwise data might be stolen in case of a DB breach or a request hijacking. This is what it means for our app:

- Passwords will always be stored in an encrypted form in the DB using an algorithm called [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt). Bcrypt has the ability to compare the password in its raw form to the encrypted one, which can help us authorize the user.

- Tokens are self contained. That means that once we decode the encrypted string we can get a hold of the username string. This form of encrypted tokens is called [Json Web Token (JWT)](https://jwt.io/).

> We're not going to elaborate about the algorithm behind each encryption method because we want to focus more on practicality, although it's very much recommended to understand how each method works before proceeding.

The implementation will follow the principles above. Authentication is a hot topic in the GraphQL world and there are several ways of doing so. In our application we will implement the mechanism using the classic REST framework within our GraphQL back-end. This approach is completely fine and in line with the official GraphQL best practices. We will start with the back-end and set the infrastructure for authentication, and then we will move on to the front-end.

We’re gonna expose 2 new routes from our REST API: `/sign-in` and `/sign-up`. `/sign-out` is unnecessary because it can be done locally by deleting the right cookie. Our back-end is gonna grow bigger so first we will separate the Express app from the Apollo Server instance, and extract the env vars to a dedicated module:

[{]: <helper> (diffStep 10.1 module="server")

#### [Step 10.1: Separate app into a different module](https://github.com/Urigo/WhatsApp-Clone-Server/commit/f9b9355)

##### Added app.ts
```diff
@@ -0,0 +1,15 @@
+┊  ┊ 1┊import bodyParser from 'body-parser'
+┊  ┊ 2┊import cors from 'cors'
+┊  ┊ 3┊import cookieParser from 'cookie-parser'
+┊  ┊ 4┊import express from 'express'
+┊  ┊ 5┊import { origin } from './env'
+┊  ┊ 6┊
+┊  ┊ 7┊export const app = express()
+┊  ┊ 8┊
+┊  ┊ 9┊app.use(cors({ credentials: true, origin }))
+┊  ┊10┊app.use(bodyParser.json())
+┊  ┊11┊app.use(cookieParser())
+┊  ┊12┊
+┊  ┊13┊app.get('/_ping', (req, res) => {
+┊  ┊14┊  res.send('pong')
+┊  ┊15┊})
```

##### Added env.ts
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊export const origin = process.env.ORIGIN || 'http://localhost:3000'
+┊ ┊2┊export const port = process.env.PORT || 4000
```

##### Changed index.ts
```diff
@@ -1,23 +1,10 @@
 ┊ 1┊ 1┊import { ApolloServer, gql, PubSub } from 'apollo-server-express'
-┊ 2┊  ┊import bodyParser from 'body-parser'
-┊ 3┊  ┊import cors from 'cors'
-┊ 4┊  ┊import cookieParser from 'cookie-parser'
-┊ 5┊  ┊import express from 'express'
 ┊ 6┊ 2┊import http from 'http'
+┊  ┊ 3┊import { app } from './app'
 ┊ 7┊ 4┊import { users } from './db'
+┊  ┊ 5┊import { origin, port } from './env'
 ┊ 8┊ 6┊import schema from './schema'
 ┊ 9┊ 7┊
-┊10┊  ┊const app = express()
-┊11┊  ┊
-┊12┊  ┊const origin = process.env.ORIGIN || 'http://localhost:3000'
-┊13┊  ┊app.use(cors({ credentials: true, origin }))
-┊14┊  ┊app.use(bodyParser.json())
-┊15┊  ┊app.use(cookieParser())
-┊16┊  ┊
-┊17┊  ┊app.get('/_ping', (req, res) => {
-┊18┊  ┊  res.send('pong')
-┊19┊  ┊})
-┊20┊  ┊
 ┊21┊ 8┊const pubsub = new PubSub()
 ┊22┊ 9┊const server = new ApolloServer({
 ┊23┊10┊  schema,
```
```diff
@@ -36,8 +23,6 @@
 ┊36┊23┊const httpServer = http.createServer(app)
 ┊37┊24┊server.installSubscriptionHandlers(httpServer)
 ┊38┊25┊
-┊39┊  ┊const port = process.env.PORT || 4000
-┊40┊  ┊
 ┊41┊26┊httpServer.listen(port, () => {
 ┊42┊27┊  console.log(`Server is listening on port ${port}`)
 ┊43┊28┊})
```

[}]: #

We will first start with the `/sign-in` route, so we can test it against pre-defined user credentials, and then we will proceed to implementing the `/sign-up` route. It would be a lot easier to progress this way. For that we will install a couple of packages:

- `bcrypt` - which is responsible for running a one-way encryption against received passwords before they’re stored in the DB.
- `jsonwebtoken` - responsible for encrypting the logged-in username before it’s set as a cooky and decrypting it once it’s sent back with a request.

    $ npm install bcrypt jsonwebtoken
    $ npm install --dev @types/bcrypt @types/jsonwebtoken

And we will implement the `/sign-in` route:

[{]: <helper> (diffStep 10.2 files="app" module="server")

#### [Step 10.2: Add /sign-in route](https://github.com/Urigo/WhatsApp-Clone-Server/commit/2a05395)

##### Changed app.ts
```diff
@@ -2,7 +2,10 @@
 ┊ 2┊ 2┊import cors from 'cors'
 ┊ 3┊ 3┊import cookieParser from 'cookie-parser'
 ┊ 4┊ 4┊import express from 'express'
-┊ 5┊  ┊import { origin } from './env'
+┊  ┊ 5┊import bcrypt from 'bcrypt'
+┊  ┊ 6┊import jwt from 'jsonwebtoken'
+┊  ┊ 7┊import { users } from './db'
+┊  ┊ 8┊import { expiration, origin, secret } from './env'
 ┊ 6┊ 9┊
 ┊ 7┊10┊export const app = express()
 ┊ 8┊11┊
```
```diff
@@ -13,3 +16,24 @@
 ┊13┊16┊app.get('/_ping', (req, res) => {
 ┊14┊17┊  res.send('pong')
 ┊15┊18┊})
+┊  ┊19┊
+┊  ┊20┊app.post('/sign-in', (req, res) => {
+┊  ┊21┊  const { username, password } = req.body
+┊  ┊22┊
+┊  ┊23┊  const user = users.find(u => u.username === username)
+┊  ┊24┊
+┊  ┊25┊  if (!user) {
+┊  ┊26┊    return res.status(404).send('user not found')
+┊  ┊27┊  }
+┊  ┊28┊
+┊  ┊29┊  const passwordsMatch = bcrypt.compareSync(password, user.password)
+┊  ┊30┊
+┊  ┊31┊  if (!passwordsMatch) {
+┊  ┊32┊    return res.status(400).send('password is incorrect')
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  const authToken = jwt.sign(username, secret)
+┊  ┊36┊
+┊  ┊37┊  res.cookie('authToken', authToken, { maxAge: expiration })
+┊  ┊38┊  res.status(200).send({ id: user.id })
+┊  ┊39┊})
```

[}]: #

As you can see we use a special secret before we encrypt the username with JWT. The same secret will be used later on to decrypt the token back into username when getting requests. If someone malicious will get a hold of that password, he can fabricate an authentication token for every user that he wants, **thus it’s important to choose a strong secret**.

When building the context for our GraphQL resolvers, we will decode the received cookie with JWT using the same secret to determine the username who made the request. Once we have that username, we can simply retrieve the original user from the DB and define it on the context:

[{]: <helper> (diffStep 10.3 module="server")

#### [Step 10.3: Get current user from auth token](https://github.com/Urigo/WhatsApp-Clone-Server/commit/a0072e1)

##### Changed index.ts
```diff
@@ -1,17 +1,23 @@
 ┊ 1┊ 1┊import { ApolloServer, gql, PubSub } from 'apollo-server-express'
 ┊ 2┊ 2┊import http from 'http'
+┊  ┊ 3┊import jwt from 'jsonwebtoken'
 ┊ 3┊ 4┊import { app } from './app'
 ┊ 4┊ 5┊import { users } from './db'
-┊ 5┊  ┊import { origin, port } from './env'
+┊  ┊ 6┊import { origin, port, secret } from './env'
 ┊ 6┊ 7┊import schema from './schema'
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊const pubsub = new PubSub()
 ┊ 9┊10┊const server = new ApolloServer({
 ┊10┊11┊  schema,
-┊11┊  ┊  context: ({ req }) => ({
-┊12┊  ┊    currentUser: users.find(u => u.id === req.cookies.currentUserId),
-┊13┊  ┊    pubsub,
-┊14┊  ┊  }),
+┊  ┊12┊  context: ({ req }) => {
+┊  ┊13┊    const username = jwt.verify(req.cookies.authToken, secret) as string
+┊  ┊14┊    const currentUser = username && users.find(u => u.username === username)
+┊  ┊15┊
+┊  ┊16┊    return {
+┊  ┊17┊      currentUser,
+┊  ┊18┊      pubsub,
+┊  ┊19┊    }
+┊  ┊20┊  },
 ┊15┊21┊})
 ┊16┊22┊
 ┊17┊23┊server.applyMiddleware({
```

[}]: #

You might have noticed that the User schema has been updated, because we try to address the `user.username` property. The authentication in our app will be done with a username and a password; accordingly, we will update our User type definitions and the user documents in the users collection mock. The credentials that we’re going to store can actually be used to sign-in to our app:

[{]: <helper> (diffStep 10.4 module="server")

#### [Step 10.4: Update user schema to contain credentials](https://github.com/Urigo/WhatsApp-Clone-Server/commit/ebf1d3f)

##### Changed db.ts
```diff
@@ -1,6 +1,8 @@
 ┊1┊1┊export type User = {
 ┊2┊2┊  id: string
 ┊3┊3┊  name: string
+┊ ┊4┊  username: string
+┊ ┊5┊  password: string
 ┊4┊6┊  picture: string
 ┊5┊7┊}
 ┊6┊8┊
```
```diff
@@ -27,26 +29,36 @@
 ┊27┊29┊    {
 ┊28┊30┊      id: '1',
 ┊29┊31┊      name: 'Ray Edwards',
+┊  ┊32┊      username: 'ray',
+┊  ┊33┊      password: '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm', // 111
 ┊30┊34┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
 ┊31┊35┊    },
 ┊32┊36┊    {
 ┊33┊37┊      id: '2',
 ┊34┊38┊      name: 'Ethan Gonzalez',
+┊  ┊39┊      username: 'ethan',
+┊  ┊40┊      password: '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO', // 222
 ┊35┊41┊      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
 ┊36┊42┊    },
 ┊37┊43┊    {
 ┊38┊44┊      id: '3',
 ┊39┊45┊      name: 'Bryan Wallace',
+┊  ┊46┊      username: 'bryan',
+┊  ┊47┊      password: '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.', // 333
 ┊40┊48┊      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
 ┊41┊49┊    },
 ┊42┊50┊    {
 ┊43┊51┊      id: '4',
 ┊44┊52┊      name: 'Avery Stewart',
+┊  ┊53┊      username: 'avery',
+┊  ┊54┊      password: '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi', // 444
 ┊45┊55┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
 ┊46┊56┊    },
 ┊47┊57┊    {
 ┊48┊58┊      id: '5',
 ┊49┊59┊      name: 'Katie Peterson',
+┊  ┊60┊      username: 'katie',
+┊  ┊61┊      password: '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242', // 555
 ┊50┊62┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
 ┊51┊63┊    },
 ┊52┊64┊  ])
```
```diff
@@ -106,4 +118,4 @@
 ┊106┊118┊  ])
 ┊107┊119┊}
 ┊108┊120┊
-┊109┊   ┊resetDb()
+┊   ┊121┊resetDb()🚫↵
```

[}]: #

To test it out, we will run our front-end application and open the dev-console. Using the Fetch API we will send a request to the `/sign-in` route. We can use the credentials of one of the users stored in the DB. As for now all our restricted routes are observing the `currentUserId` cookie. This is wrong and no longer relevant. Let’s change the `withAuth()` method to observe the `authToken` cookie so we can test our REST endpoint successfully:

[{]: <helper> (diffStep 13.1 module="client")

#### [Step 13.1: Use authToken cookie](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/6ea728e)

##### Changed src&#x2F;services&#x2F;auth.service.tsx
```diff
@@ -23,8 +23,8 @@
 ┊23┊23┊  }
 ┊24┊24┊}
 ┊25┊25┊
-┊26┊  ┊export const signIn = (currentUserId) => {
-┊27┊  ┊  document.cookie = `currentUserId=${currentUserId}`
+┊  ┊26┊export const signIn = (authToken) => {
+┊  ┊27┊  document.cookie = `authToken=${authToken}`
 ┊28┊28┊
 ┊29┊29┊  // This will become async in the near future
 ┊30┊30┊  return Promise.resolve()
```
```diff
@@ -33,12 +33,12 @@
 ┊33┊33┊export const signOut = () => {
 ┊34┊34┊  // "expires" represents the lifespan of a cookie. Beyond that date the cookie will
 ┊35┊35┊  // be deleted by the browser. "expires" cannot be viewed from "document.cookie"
-┊36┊  ┊  document.cookie = `currentUserId=;expires=${new Date(0)}`
+┊  ┊36┊  document.cookie = `authToken=;expires=${new Date(0)}`
 ┊37┊37┊
 ┊38┊38┊  // Clear cache
 ┊39┊39┊  return client.clearStore()
 ┊40┊40┊}
 ┊41┊41┊
 ┊42┊42┊export const isSignedIn = () => {
-┊43┊  ┊  return /currentUserId=.+(;|$)/.test(document.cookie)
+┊  ┊43┊  return /authToken=.+(;|$)/.test(document.cookie)
 ┊44┊44┊}
```

[}]: #

Now we can perform the sign-in. It would be a good idea to sign-in with the first user - `ray`, since all the DB mock is built around him:

```js
fetch(`http://localhost:4000/sign-in`, {
  method: 'POST',
  body: JSON.stringify({
    username: 'ray',
    password: '111',
  }),
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})
```

Now if we would look at the value of `document.cookie` we should see a key named `authToken` with a JWT token and the `ChatsListScreen` should show the chats which are relevant to `ray`. To complete the sign-in flow we would need to update the `AuthScreen` and the `auth.service` to use username and password and the actual `/sign-in` route we’ve just implemented.

To check if we’re authorized to visit a route, not only we would need to check if we have the `authToken` cookie defined, but we would also need to validate it against the server to see that it actually references a real user. For that we will implement `Query.me` which will send us back the current user logged in directly from the context:

[{]: <helper> (diffStep 10.5 module="server")

#### [Step 10.5: Add Query.me](https://github.com/Urigo/WhatsApp-Clone-Server/commit/9394de4)

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -65,6 +65,10 @@
 ┊65┊65┊  },
 ┊66┊66┊
 ┊67┊67┊  Query: {
+┊  ┊68┊    me(root, args, { currentUser }) {
+┊  ┊69┊      return currentUser || null
+┊  ┊70┊    },
+┊  ┊71┊
 ┊68┊72┊    chats(root, args, { currentUser }) {
 ┊69┊73┊      if (!currentUser) return []
 ┊70┊74┊
```

##### Changed schema&#x2F;typeDefs.graphql
```diff
@@ -26,6 +26,7 @@
 ┊26┊26┊}
 ┊27┊27┊
 ┊28┊28┊type Query {
+┊  ┊29┊  me: User
 ┊29┊30┊  chats: [Chat!]!
 ┊30┊31┊  chat(chatId: ID!): Chat
 ┊31┊32┊  users: [User!]!
```

##### Added tests&#x2F;queries&#x2F;getMe.test.ts
```diff
@@ -0,0 +1,33 @@
+┊  ┊ 1┊import { createTestClient } from 'apollo-server-testing'
+┊  ┊ 2┊import { ApolloServer, gql } from 'apollo-server-express'
+┊  ┊ 3┊import schema from '../../schema'
+┊  ┊ 4┊import { users } from '../../db'
+┊  ┊ 5┊
+┊  ┊ 6┊describe('Query.me', () => {
+┊  ┊ 7┊  it('should fetch current user', async () => {
+┊  ┊ 8┊    const server = new ApolloServer({
+┊  ┊ 9┊      schema,
+┊  ┊10┊      context: () => ({
+┊  ┊11┊        currentUser: users[0],
+┊  ┊12┊      }),
+┊  ┊13┊    })
+┊  ┊14┊
+┊  ┊15┊    const { query } = createTestClient(server)
+┊  ┊16┊
+┊  ┊17┊    const res = await query({
+┊  ┊18┊      query: gql `
+┊  ┊19┊        query GetMe {
+┊  ┊20┊          me {
+┊  ┊21┊            id
+┊  ┊22┊            name
+┊  ┊23┊            picture
+┊  ┊24┊          }
+┊  ┊25┊        }
+┊  ┊26┊      `,
+┊  ┊27┊    })
+┊  ┊28┊
+┊  ┊29┊    expect(res.data).toBeDefined()
+┊  ┊30┊    expect(res.errors).toBeUndefined()
+┊  ┊31┊    expect(res.data).toMatchSnapshot()
+┊  ┊32┊  })
+┊  ┊33┊})
```

[}]: #

Now back to the `auth.service`, we will replace the `signIn()` method implementation with one that actually calls the `/sign-in` REST endpoint in our API:

[{]: <helper> (diffStep 13.2 module="client")

#### [Step 13.2: Update auth service to call REST endpoint](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/c8b2efb)

##### Changed src&#x2F;services&#x2F;auth.service.tsx
```diff
@@ -1,3 +1,4 @@
+┊ ┊1┊import { parse as parseCookie } from 'cookie'
 ┊1┊2┊import * as React from 'react'
 ┊2┊3┊import { Redirect } from 'react-router-dom'
 ┊3┊4┊import client from '../client'
```
```diff
@@ -23,22 +24,28 @@
 ┊23┊24┊  }
 ┊24┊25┊}
 ┊25┊26┊
-┊26┊  ┊export const signIn = (authToken) => {
-┊27┊  ┊  document.cookie = `authToken=${authToken}`
-┊28┊  ┊
-┊29┊  ┊  // This will become async in the near future
-┊30┊  ┊  return Promise.resolve()
+┊  ┊27┊export const signIn = ({ username, password }) => {
+┊  ┊28┊  return fetch(`${process.env.REACT_APP_SERVER_URL}/sign-in`, {
+┊  ┊29┊    method: 'POST',
+┊  ┊30┊    body: JSON.stringify({ username, password }),
+┊  ┊31┊    credentials: 'include',
+┊  ┊32┊    headers: {
+┊  ┊33┊      'Accept': 'application/json',
+┊  ┊34┊      'Content-Type': 'application/json',
+┊  ┊35┊    },
+┊  ┊36┊  }).then(res => {
+┊  ┊37┊    if (res.status >= 400) {
+┊  ┊38┊      return res.text().then(e => Promise.reject(e))
+┊  ┊39┊    }
+┊  ┊40┊  })
 ┊31┊41┊}
 ┊32┊42┊
 ┊33┊43┊export const signOut = () => {
-┊34┊  ┊  // "expires" represents the lifespan of a cookie. Beyond that date the cookie will
-┊35┊  ┊  // be deleted by the browser. "expires" cannot be viewed from "document.cookie"
 ┊36┊44┊  document.cookie = `authToken=;expires=${new Date(0)}`
 ┊37┊45┊
-┊38┊  ┊  // Clear cache
 ┊39┊46┊  return client.clearStore()
 ┊40┊47┊}
 ┊41┊48┊
 ┊42┊49┊export const isSignedIn = () => {
 ┊43┊50┊  return /authToken=.+(;|$)/.test(document.cookie)
-┊44┊  ┊}
+┊  ┊51┊}🚫↵
```

[}]: #

And we will use the GraphQL query we’ve just implemented to check if the user actually exists within the DB before we proceed to the restricted route:

[{]: <helper> (diffStep 13.3 module="client")

#### [Step 13.3: Validate auth token against the back-end on restricted route](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/37cb247)

##### Added src&#x2F;graphql&#x2F;queries&#x2F;me.query.ts
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import * as fragments from '../fragments'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  query Me {
+┊  ┊ 6┊    me {
+┊  ┊ 7┊      ...User
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊  ${fragments.user}
+┊  ┊11┊`
```

##### Changed src&#x2F;services&#x2F;auth.service.tsx
```diff
@@ -1,9 +1,17 @@
 ┊ 1┊ 1┊import { parse as parseCookie } from 'cookie'
 ┊ 2┊ 2┊import * as React from 'react'
+┊  ┊ 3┊import { useContext } from 'react'
 ┊ 3┊ 4┊import { Redirect } from 'react-router-dom'
 ┊ 4┊ 5┊import client from '../client'
+┊  ┊ 6┊import { useMeQuery, User } from '../graphql/types'
 ┊ 5┊ 7┊import { useCacheService } from './cache.service'
 ┊ 6┊ 8┊
+┊  ┊ 9┊const MyContext = React.createContext<User>(null)
+┊  ┊10┊
+┊  ┊11┊export const useMe = () => {
+┊  ┊12┊  return useContext(MyContext)
+┊  ┊13┊}
+┊  ┊14┊
 ┊ 7┊15┊export const withAuth = (Component: React.ComponentType) => {
 ┊ 8┊16┊  return (props) => {
 ┊ 9┊17┊    if (!isSignedIn()) {
```
```diff
@@ -16,10 +24,22 @@
 ┊16┊24┊      )
 ┊17┊25┊    }
 ┊18┊26┊
+┊  ┊27┊    const { data, error, loading } = useMeQuery()
+┊  ┊28┊
 ┊19┊29┊    useCacheService()
 ┊20┊30┊
+┊  ┊31┊    if (loading) return null
+┊  ┊32┊
+┊  ┊33┊    if (error || !data.me) {
+┊  ┊34┊      signOut()
+┊  ┊35┊
+┊  ┊36┊      return <Redirect to="/sign-in" />
+┊  ┊37┊    }
+┊  ┊38┊
 ┊21┊39┊    return (
-┊22┊  ┊      <Component {...props} />
+┊  ┊40┊      <MyContext.Provider value={data.me}>
+┊  ┊41┊        <Component {...props} />
+┊  ┊42┊      </MyContext.Provider>
 ┊23┊43┊    )
 ┊24┊44┊  }
 ┊25┊45┊}
```

[}]: #

we will use the new query to try and fetch the user directly from the back-end, and we will only proceed if the user was actually found. In addition, we will replace the `signIn()` method to call our REST API using the native fetch API:

[{]: <helper> (diffStep 13.4 module="client")

#### [Step 13.4: Add username and password to AuthScreen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/462cb4f)

##### Changed src&#x2F;components&#x2F;AuthScreen&#x2F;index.tsx
```diff
@@ -110,21 +110,33 @@
 ┊110┊110┊`
 ┊111┊111┊
 ┊112┊112┊export default ({ history }) => {
-┊113┊   ┊  const [userId, setUserId] = useState('')
+┊   ┊113┊  const [username, setUsername] = useState('')
+┊   ┊114┊  const [password, setPassword] = useState('')
+┊   ┊115┊  const [error, setError] = useState('')
 ┊114┊116┊
-┊115┊   ┊  const onUserIdChange = useCallback(({ target }) => {
-┊116┊   ┊    setUserId(target.value)
+┊   ┊117┊  const onUsernameChange = useCallback(({ target }) => {
+┊   ┊118┊    setError('')
+┊   ┊119┊    setUsername(target.value)
+┊   ┊120┊  }, [true])
+┊   ┊121┊
+┊   ┊122┊  const onPasswordChange = useCallback(({ target }) => {
+┊   ┊123┊    setError('')
+┊   ┊124┊    setPassword(target.value)
 ┊117┊125┊  }, [true])
 ┊118┊126┊
 ┊119┊127┊  const maySignIn = useCallback(() => {
-┊120┊   ┊    return !!userId
-┊121┊   ┊  }, [userId])
+┊   ┊128┊    return !!(username && password)
+┊   ┊129┊  }, [username, password])
 ┊122┊130┊
 ┊123┊131┊  const handleSignIn = useCallback(() => {
-┊124┊   ┊    signIn(userId).then(() => {
-┊125┊   ┊      history.replace('/chats')
-┊126┊   ┊    })
-┊127┊   ┊  }, [userId])
+┊   ┊132┊    signIn({ username, password })
+┊   ┊133┊      .then(() => {
+┊   ┊134┊        history.push('/chats')
+┊   ┊135┊      })
+┊   ┊136┊      .catch(error => {
+┊   ┊137┊        setError(error.message || error)
+┊   ┊138┊      })
+┊   ┊139┊  }, [username, password])
 ┊128┊140┊
 ┊129┊141┊  return (
 ┊130┊142┊    <Container>
```
```diff
@@ -137,12 +149,21 @@
 ┊137┊149┊          <Legend>Sign in</Legend>
 ┊138┊150┊          <Section>
 ┊139┊151┊            <TextField
-┊140┊   ┊              data-testid="user-id-input"
-┊141┊   ┊              label="User ID"
-┊142┊   ┊              value={userId}
-┊143┊   ┊              onChange={onUserIdChange}
+┊   ┊152┊              className="AuthScreen-text-field"
+┊   ┊153┊              label="Username"
+┊   ┊154┊              value={username}
+┊   ┊155┊              onChange={onUsernameChange}
+┊   ┊156┊              margin="normal"
+┊   ┊157┊              placeholder="Enter your username"
+┊   ┊158┊            />
+┊   ┊159┊            <TextField
+┊   ┊160┊              className="AuthScreen-text-field"
+┊   ┊161┊              label="Password"
+┊   ┊162┊              type="password"
+┊   ┊163┊              value={password}
+┊   ┊164┊              onChange={onPasswordChange}
 ┊144┊165┊              margin="normal"
-┊145┊   ┊              placeholder="Enter current user ID"
+┊   ┊166┊              placeholder="Enter your password"
 ┊146┊167┊            />
 ┊147┊168┊          </Section>
 ┊148┊169┊          <Button
```

[}]: #

The behavior of the updated screen should be identical to what we had so far. To complete the flow we’ll need a way to sign-up. When we signing-up we will need the following parameters: `name`, `username`, `password` and `passwordConfirm`. In addition we will need to run certain validations against the parameters:

- The name must be at least 3 and at most 50 characters long.
- The username must be at least 3 and at most 18 characters long.
- A password must be at least 8 and at most 30 characters long. In addition, it should contain English letters, numbers, and special characters.

For that we will implement a dedicated validations module:

[{]: <helper> (diffStep 10.6 files="validators" module="server")

#### [Step 10.6: Add /sign-up route](https://github.com/Urigo/WhatsApp-Clone-Server/commit/f45b6e1)

##### Added validators.ts
```diff
@@ -0,0 +1,43 @@
+┊  ┊ 1┊export const validatePassword = (ctx: string, str: string) => {
+┊  ┊ 2┊  if (typeof str !== 'string') {
+┊  ┊ 3┊    throw TypeError(`${ctx} must be a string`)
+┊  ┊ 4┊  }
+┊  ┊ 5┊
+┊  ┊ 6┊  validateLength(ctx, str, 8, 30)
+┊  ┊ 7┊
+┊  ┊ 8┊  if (!/[a-zA-Z]+/.test(str)) {
+┊  ┊ 9┊    throw TypeError(`${ctx} must contain english letters`)
+┊  ┊10┊  }
+┊  ┊11┊
+┊  ┊12┊  if (!/\d+/.test(str)) {
+┊  ┊13┊    throw TypeError(`${ctx} must contain numbers`)
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  if (!/[^\da-zA-Z]+/.test(str)) {
+┊  ┊17┊    throw TypeError(`${ctx} must contain special charachters`)
+┊  ┊18┊  }
+┊  ┊19┊}
+┊  ┊20┊
+┊  ┊21┊export const validateLength = (ctx: string, str: string, ...args: number[]) => {
+┊  ┊22┊  let min, max
+┊  ┊23┊
+┊  ┊24┊  if (args.length === 1) {
+┊  ┊25┊    min = 0
+┊  ┊26┊    max = args[0]
+┊  ┊27┊  } else {
+┊  ┊28┊    min = args[0]
+┊  ┊29┊    max = args[1]
+┊  ┊30┊  }
+┊  ┊31┊
+┊  ┊32┊  if (typeof str !== 'string') {
+┊  ┊33┊    throw TypeError(`${ctx} must be a string`)
+┊  ┊34┊  }
+┊  ┊35┊
+┊  ┊36┊  if (str.length < min) {
+┊  ┊37┊    throw TypeError(`${ctx} must be at least ${min} chars long`)
+┊  ┊38┊  }
+┊  ┊39┊
+┊  ┊40┊  if (str.length > max) {
+┊  ┊41┊    throw TypeError(`${ctx} must contain ${max} chars at most`)
+┊  ┊42┊  }
+┊  ┊43┊}
```

[}]: #

And we will implement the handler for the `/sign-up` route:

[{]: <helper> (diffStep 10.6 files="app" module="server")

#### [Step 10.6: Add /sign-up route](https://github.com/Urigo/WhatsApp-Clone-Server/commit/f45b6e1)

##### Changed app.ts
```diff
@@ -4,8 +4,9 @@
 ┊ 4┊ 4┊import express from 'express'
 ┊ 5┊ 5┊import bcrypt from 'bcrypt'
 ┊ 6┊ 6┊import jwt from 'jsonwebtoken'
-┊ 7┊  ┊import { users } from './db'
+┊  ┊ 7┊import { User, users } from './db'
 ┊ 8┊ 8┊import { expiration, origin, secret } from './env'
+┊  ┊ 9┊import { validateLength, validatePassword } from './validators'
 ┊ 9┊10┊
 ┊10┊11┊export const app = express()
 ┊11┊12┊
```
```diff
@@ -17,6 +18,40 @@
 ┊17┊18┊  res.send('pong')
 ┊18┊19┊})
 ┊19┊20┊
+┊  ┊21┊app.post('/sign-up', (req, res) => {
+┊  ┊22┊  const { name, username, password, passwordConfirm } = req.body
+┊  ┊23┊
+┊  ┊24┊  try {
+┊  ┊25┊    validateLength('req.name', name, 3, 50)
+┊  ┊26┊    validateLength('req.username', name, 3, 18)
+┊  ┊27┊    validatePassword('req.password', password)
+┊  ┊28┊
+┊  ┊29┊    if (password !== passwordConfirm) {
+┊  ┊30┊      throw Error("req.password and req.passwordConfirm don't match")
+┊  ┊31┊    }
+┊  ┊32┊
+┊  ┊33┊    if (users.some(u => u.username === username)) {
+┊  ┊34┊      throw Error("username already exists")
+┊  ┊35┊    }
+┊  ┊36┊  } catch (e) {
+┊  ┊37┊    return res.status(400).send(e.message)
+┊  ┊38┊  }
+┊  ┊39┊
+┊  ┊40┊  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
+┊  ┊41┊
+┊  ┊42┊  const user: User = {
+┊  ┊43┊    id: String(users.length + 1),
+┊  ┊44┊    password: passwordHash,
+┊  ┊45┊    picture: '',
+┊  ┊46┊    username,
+┊  ┊47┊    name,
+┊  ┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  users.push(user)
+┊  ┊51┊
+┊  ┊52┊  res.status(200).send({ id: user.id })
+┊  ┊53┊})
+┊  ┊54┊
 ┊20┊55┊app.post('/sign-in', (req, res) => {
 ┊21┊56┊  const { username, password } = req.body
 ┊22┊57┊
```

[}]: #

Before encrypting the password we append a string called “salt” to it. Even though the passwords are stored encrypted in the DB, a hacker might use a dictionary of common passwords in their encrypted form to decipher the original password. When adding salt to a password which is essentially a random string, the hacker cannot use a dictionary anymore since he would need to know the salt. Hypothetically, the hacker can get a hold of the salt and re-generate the entire dictionary, however that would take too long because of the way Bcrypt is designed to work.

Going back to the client, we will implement a new `signUp()` method in the `auth.service` that will call the `/sign-up` route in our REST API:

[{]: <helper> (diffStep 13.5 module="client")

#### [Step 13.5: Add signUp() method to auth.service](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/566c388)

##### Changed src&#x2F;services&#x2F;auth.service.tsx
```diff
@@ -60,6 +60,22 @@
 ┊60┊60┊  })
 ┊61┊61┊}
 ┊62┊62┊
+┊  ┊63┊export const signUp = ({ name, username, password, passwordConfirm }) => {
+┊  ┊64┊  return fetch(`${process.env.REACT_APP_SERVER_URL}/sign-up`, {
+┊  ┊65┊    method: 'POST',
+┊  ┊66┊    body: JSON.stringify({ name, username, password, passwordConfirm }),
+┊  ┊67┊    credentials: 'include',
+┊  ┊68┊    headers: {
+┊  ┊69┊      'Accept': 'application/json',
+┊  ┊70┊      'Content-Type': 'application/json',
+┊  ┊71┊    },
+┊  ┊72┊  }).then(res => {
+┊  ┊73┊    if (res.status >= 400) {
+┊  ┊74┊      return res.text().then(e => Promise.reject(e))
+┊  ┊75┊    }
+┊  ┊76┊  })
+┊  ┊77┊}
+┊  ┊78┊
 ┊63┊79┊export const signOut = () => {
 ┊64┊80┊  document.cookie = `authToken=;expires=${new Date(0)}`
```

[}]: #

Now we will implement a dedicated `SignUpForm` that we can use to perform the sign-up. Instead of implementing a new screen, we will use the `AuthScreen` to alternate between the `SignInForm` and the `SignUpForm` using `AnimatedSwitch`. This way we can have a container component that is common for both forms, and we will be able to switch between the two very smoothly. We will first define a new `/sign-up` route in our router:

[{]: <helper> (diffStep 13.6 module="client")

#### [Step 13.6: Split AuthScreen into SignInForm and SignUpForm](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/04dbb89)

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignInForm.test.tsx
```diff
@@ -0,0 +1,81 @@
+┊  ┊ 1┊import { createMemoryHistory } from 'history'
+┊  ┊ 2┊import React from 'react'
+┊  ┊ 3┊import { cleanup, render, fireEvent, wait, waitForElement } from 'react-testing-library'
+┊  ┊ 4┊import SignInForm from './SignInForm'
+┊  ┊ 5┊
+┊  ┊ 6┊describe('SignInForm', () => {
+┊  ┊ 7┊  afterEach(cleanup)
+┊  ┊ 8┊  afterEach(() => fetch.resetMocks())
+┊  ┊ 9┊
+┊  ┊10┊  it('enables sign-in button when filled in', async () => {
+┊  ┊11┊    const history = createMemoryHistory()
+┊  ┊12┊
+┊  ┊13┊    {
+┊  ┊14┊      const { container, getByTestId } = render(<SignInForm history={history} />)
+┊  ┊15┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊16┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊17┊      const signInButton = getByTestId('sign-in-button') as HTMLButtonElement
+┊  ┊18┊
+┊  ┊19┊      expect(signInButton.disabled).toEqual(true)
+┊  ┊20┊
+┊  ┊21┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊22┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊23┊
+┊  ┊24┊      await waitForElement(() => usernameInput)
+┊  ┊25┊      await waitForElement(() => passwordInput)
+┊  ┊26┊
+┊  ┊27┊      expect(signInButton.disabled).toEqual(false)
+┊  ┊28┊    }
+┊  ┊29┊  })
+┊  ┊30┊
+┊  ┊31┊  it('prints server error if input was wrong', async () => {
+┊  ┊32┊    const history = createMemoryHistory()
+┊  ┊33┊
+┊  ┊34┊    fetchMock.mockRejectOnce(new Error('sign-in failed'))
+┊  ┊35┊
+┊  ┊36┊    {
+┊  ┊37┊      const { container, getByTestId } = render(<SignInForm history={history} />)
+┊  ┊38┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊39┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊40┊      const signInButton = getByTestId('sign-in-button') as HTMLButtonElement
+┊  ┊41┊      const errorMessage = getByTestId('error-message')
+┊  ┊42┊
+┊  ┊43┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊44┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊45┊
+┊  ┊46┊      await waitForElement(() => usernameInput)
+┊  ┊47┊      await waitForElement(() => passwordInput)
+┊  ┊48┊
+┊  ┊49┊      fireEvent.click(signInButton)
+┊  ┊50┊
+┊  ┊51┊      await waitForElement(() => errorMessage)
+┊  ┊52┊
+┊  ┊53┊      expect(errorMessage.innerHTML).toEqual('sign-in failed')
+┊  ┊54┊    }
+┊  ┊55┊  })
+┊  ┊56┊
+┊  ┊57┊  it('navigates to /chats if everything went right', async () => {
+┊  ┊58┊    const history = createMemoryHistory()
+┊  ┊59┊
+┊  ┊60┊    fetchMock.mockResponseOnce('success')
+┊  ┊61┊
+┊  ┊62┊    {
+┊  ┊63┊      const { container, getByTestId } = render(<SignInForm history={history} />)
+┊  ┊64┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊65┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊66┊      const signInButton = getByTestId('sign-in-button') as HTMLButtonElement
+┊  ┊67┊
+┊  ┊68┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊69┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊70┊
+┊  ┊71┊      await waitForElement(() => usernameInput)
+┊  ┊72┊      await waitForElement(() => passwordInput)
+┊  ┊73┊
+┊  ┊74┊      fireEvent.click(signInButton)
+┊  ┊75┊
+┊  ┊76┊      await wait(() =>
+┊  ┊77┊        expect(history.location.pathname).toEqual('/chats')
+┊  ┊78┊      )
+┊  ┊79┊    }
+┊  ┊80┊  })
+┊  ┊81┊})
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignInForm.tsx
```diff
@@ -0,0 +1,81 @@
+┊  ┊ 1┊import { History } from 'history'
+┊  ┊ 2┊import * as React from 'react'
+┊  ┊ 3┊import { useCallback, useState } from 'react'
+┊  ┊ 4┊import { signIn } from '../../services/auth.service'
+┊  ┊ 5┊import {
+┊  ┊ 6┊  SignForm,
+┊  ┊ 7┊  ActualForm,
+┊  ┊ 8┊  Legend,
+┊  ┊ 9┊  Section,
+┊  ┊10┊  TextField,
+┊  ┊11┊  Button,
+┊  ┊12┊  ErrorMessage,
+┊  ┊13┊} from './form-components'
+┊  ┊14┊
+┊  ┊15┊export default ({ history }) => {
+┊  ┊16┊  const [username, setUsername] = useState('')
+┊  ┊17┊  const [password, setPassword] = useState('')
+┊  ┊18┊  const [error, setError] = useState('')
+┊  ┊19┊
+┊  ┊20┊  const onUsernameChange = useCallback(({ target }) => {
+┊  ┊21┊    setError('')
+┊  ┊22┊    setUsername(target.value)
+┊  ┊23┊  }, [true])
+┊  ┊24┊
+┊  ┊25┊  const onPasswordChange = useCallback(({ target }) => {
+┊  ┊26┊    setError('')
+┊  ┊27┊    setPassword(target.value)
+┊  ┊28┊  }, [true])
+┊  ┊29┊
+┊  ┊30┊  const maySignIn = useCallback(() => {
+┊  ┊31┊    return !!(username && password)
+┊  ┊32┊  }, [username, password])
+┊  ┊33┊
+┊  ┊34┊  const handleSignIn = useCallback(() => {
+┊  ┊35┊    signIn({ username, password })
+┊  ┊36┊      .then(() => {
+┊  ┊37┊        history.replace('/chats')
+┊  ┊38┊      })
+┊  ┊39┊      .catch(error => {
+┊  ┊40┊        setError(error.message || error)
+┊  ┊41┊      })
+┊  ┊42┊  }, [username, password])
+┊  ┊43┊
+┊  ┊44┊  return (
+┊  ┊45┊    <SignForm>
+┊  ┊46┊      <ActualForm>
+┊  ┊47┊        <Legend>Sign in</Legend>
+┊  ┊48┊        <Section style={{ width: '100%' }}>
+┊  ┊49┊          <TextField
+┊  ┊50┊            data-testid="username-input"
+┊  ┊51┊            label="Username"
+┊  ┊52┊            value={username}
+┊  ┊53┊            onChange={onUsernameChange}
+┊  ┊54┊            margin="normal"
+┊  ┊55┊            placeholder="Enter your username"
+┊  ┊56┊          />
+┊  ┊57┊          <TextField
+┊  ┊58┊            data-testid="password-input"
+┊  ┊59┊            label="Password"
+┊  ┊60┊            type="password"
+┊  ┊61┊            value={password}
+┊  ┊62┊            onChange={onPasswordChange}
+┊  ┊63┊            margin="normal"
+┊  ┊64┊            placeholder="Enter your password"
+┊  ┊65┊          />
+┊  ┊66┊        </Section>
+┊  ┊67┊        <Button
+┊  ┊68┊          data-testid="sign-in-button"
+┊  ┊69┊          type="button"
+┊  ┊70┊          color="secondary"
+┊  ┊71┊          variant="contained"
+┊  ┊72┊          disabled={!maySignIn()}
+┊  ┊73┊          onClick={handleSignIn}
+┊  ┊74┊        >
+┊  ┊75┊          Sign in
+┊  ┊76┊        </Button>
+┊  ┊77┊        <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
+┊  ┊78┊      </ActualForm>
+┊  ┊79┊    </SignForm>
+┊  ┊80┊  )
+┊  ┊81┊}
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignUpForm.test.tsx
```diff
@@ -0,0 +1,99 @@
+┊  ┊ 1┊import { createMemoryHistory } from 'history'
+┊  ┊ 2┊import React from 'react'
+┊  ┊ 3┊import { cleanup, render, fireEvent, wait, waitForElement } from 'react-testing-library'
+┊  ┊ 4┊import SignUpForm from './SignUpForm'
+┊  ┊ 5┊
+┊  ┊ 6┊describe('SignUpForm', () => {
+┊  ┊ 7┊  afterEach(cleanup)
+┊  ┊ 8┊  afterEach(() => fetch.resetMocks())
+┊  ┊ 9┊
+┊  ┊10┊  it('enables sign-up button when filled in', async () => {
+┊  ┊11┊    const history = createMemoryHistory()
+┊  ┊12┊
+┊  ┊13┊    {
+┊  ┊14┊      const { container, getByTestId } = render(<SignUpForm history={history} />)
+┊  ┊15┊      const nameInput = getByTestId('name-input').querySelector('input')
+┊  ┊16┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊17┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊18┊      const passwordConfirmInput = getByTestId('password-confirm-input').querySelector('input')
+┊  ┊19┊      const signUpButton = getByTestId('sign-up-button') as HTMLButtonElement
+┊  ┊20┊
+┊  ┊21┊      expect(signUpButton.disabled).toEqual(true)
+┊  ┊22┊
+┊  ┊23┊      fireEvent.change(nameInput, { target: { value: 'User Name' } })
+┊  ┊24┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊25┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊26┊      fireEvent.change(passwordConfirmInput, { target: { value: 'password' } })
+┊  ┊27┊
+┊  ┊28┊      await waitForElement(() => nameInput)
+┊  ┊29┊      await waitForElement(() => usernameInput)
+┊  ┊30┊      await waitForElement(() => passwordInput)
+┊  ┊31┊      await waitForElement(() => passwordConfirmInput)
+┊  ┊32┊
+┊  ┊33┊      expect(signUpButton.disabled).toEqual(false)
+┊  ┊34┊    }
+┊  ┊35┊  })
+┊  ┊36┊
+┊  ┊37┊  it('prints server error if input was wrong', async () => {
+┊  ┊38┊    const history = createMemoryHistory()
+┊  ┊39┊
+┊  ┊40┊    fetchMock.mockRejectOnce(new Error('sign-up failed'))
+┊  ┊41┊
+┊  ┊42┊    {
+┊  ┊43┊      const { container, getByTestId } = render(<SignUpForm history={history} />)
+┊  ┊44┊      const nameInput = getByTestId('name-input').querySelector('input')
+┊  ┊45┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊46┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊47┊      const passwordConfirmInput = getByTestId('password-confirm-input').querySelector('input')
+┊  ┊48┊      const signUpButton = getByTestId('sign-up-button') as HTMLButtonElement
+┊  ┊49┊      const errorMessage = getByTestId('error-message')
+┊  ┊50┊
+┊  ┊51┊      fireEvent.change(nameInput, { target: { value: 'User Name' } })
+┊  ┊52┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊53┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊54┊      fireEvent.change(passwordConfirmInput, { target: { value: 'password' } })
+┊  ┊55┊
+┊  ┊56┊      await waitForElement(() => nameInput)
+┊  ┊57┊      await waitForElement(() => usernameInput)
+┊  ┊58┊      await waitForElement(() => passwordInput)
+┊  ┊59┊      await waitForElement(() => passwordConfirmInput)
+┊  ┊60┊
+┊  ┊61┊      fireEvent.click(signUpButton)
+┊  ┊62┊
+┊  ┊63┊      await waitForElement(() => errorMessage)
+┊  ┊64┊
+┊  ┊65┊      expect(errorMessage.innerHTML).toEqual('sign-up failed')
+┊  ┊66┊    }
+┊  ┊67┊  })
+┊  ┊68┊
+┊  ┊69┊  it('navigates to /sign-in if everything went right', async () => {
+┊  ┊70┊    const history = createMemoryHistory()
+┊  ┊71┊
+┊  ┊72┊    fetchMock.mockResponseOnce('success')
+┊  ┊73┊
+┊  ┊74┊    {
+┊  ┊75┊      const { container, getByTestId } = render(<SignUpForm history={history} />)
+┊  ┊76┊      const nameInput = getByTestId('name-input').querySelector('input')
+┊  ┊77┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊78┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊79┊      const passwordConfirmInput = getByTestId('password-confirm-input').querySelector('input')
+┊  ┊80┊      const signUpButton = getByTestId('sign-up-button') as HTMLButtonElement
+┊  ┊81┊
+┊  ┊82┊      fireEvent.change(nameInput, { target: { value: 'User Name' } })
+┊  ┊83┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊84┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊85┊      fireEvent.change(passwordConfirmInput, { target: { value: 'password' } })
+┊  ┊86┊
+┊  ┊87┊      await waitForElement(() => nameInput)
+┊  ┊88┊      await waitForElement(() => usernameInput)
+┊  ┊89┊      await waitForElement(() => passwordInput)
+┊  ┊90┊      await waitForElement(() => passwordConfirmInput)
+┊  ┊91┊
+┊  ┊92┊      fireEvent.click(signUpButton)
+┊  ┊93┊
+┊  ┊94┊      await wait(() =>
+┊  ┊95┊        expect(history.location.pathname).toEqual('/sign-in')
+┊  ┊96┊      )
+┊  ┊97┊    }
+┊  ┊98┊  })
+┊  ┊99┊})
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignUpForm.tsx
```diff
@@ -0,0 +1,123 @@
+┊   ┊  1┊import * as React from 'react'
+┊   ┊  2┊import { useCallback, useState } from 'react'
+┊   ┊  3┊import { signUp } from '../../services/auth.service'
+┊   ┊  4┊import {
+┊   ┊  5┊  SignForm,
+┊   ┊  6┊  ActualForm,
+┊   ┊  7┊  Legend,
+┊   ┊  8┊  Section,
+┊   ┊  9┊  TextField,
+┊   ┊ 10┊  Button,
+┊   ┊ 11┊  ErrorMessage,
+┊   ┊ 12┊} from './form-components'
+┊   ┊ 13┊
+┊   ┊ 14┊export default ({ history }) => {
+┊   ┊ 15┊  const [name, setName] = useState('')
+┊   ┊ 16┊  const [username, setUsername] = useState('')
+┊   ┊ 17┊  const [password, setPassword] = useState('')
+┊   ┊ 18┊  const [passwordConfirm, setPasswordConfirm] = useState('')
+┊   ┊ 19┊  const [error, setError] = useState('')
+┊   ┊ 20┊
+┊   ┊ 21┊  const updateName = useCallback(({ target }) => {
+┊   ┊ 22┊    setError('')
+┊   ┊ 23┊    setName(target.value)
+┊   ┊ 24┊  }, [true])
+┊   ┊ 25┊
+┊   ┊ 26┊  const updateUsername = useCallback(({ target }) => {
+┊   ┊ 27┊    setError('')
+┊   ┊ 28┊    setUsername(target.value)
+┊   ┊ 29┊  }, [true])
+┊   ┊ 30┊
+┊   ┊ 31┊  const updatePassword = useCallback(({ target }) => {
+┊   ┊ 32┊    setError('')
+┊   ┊ 33┊    setPassword(target.value)
+┊   ┊ 34┊  }, [true])
+┊   ┊ 35┊
+┊   ┊ 36┊  const updatePasswordConfirm = useCallback(({ target }) => {
+┊   ┊ 37┊    setError('')
+┊   ┊ 38┊    setPasswordConfirm(target.value)
+┊   ┊ 39┊  }, [true])
+┊   ┊ 40┊
+┊   ┊ 41┊  const maySignUp = useCallback(() => {
+┊   ┊ 42┊    return !!(name && username && password && password === passwordConfirm)
+┊   ┊ 43┊  }, [name, username, password, passwordConfirm])
+┊   ┊ 44┊
+┊   ┊ 45┊  const handleSignUp = useCallback(() => {
+┊   ┊ 46┊    signUp({ username, password, passwordConfirm, name })
+┊   ┊ 47┊      .then(() => {
+┊   ┊ 48┊        history.replace('/sign-in')
+┊   ┊ 49┊      })
+┊   ┊ 50┊      .catch(error => {
+┊   ┊ 51┊        setError(error.message || error)
+┊   ┊ 52┊      })
+┊   ┊ 53┊  }, [name, username, password, passwordConfirm])
+┊   ┊ 54┊
+┊   ┊ 55┊  return (
+┊   ┊ 56┊    <SignForm>
+┊   ┊ 57┊      <ActualForm>
+┊   ┊ 58┊        <Legend>Sign up</Legend>
+┊   ┊ 59┊        <Section
+┊   ┊ 60┊          style={{
+┊   ┊ 61┊            float: 'left',
+┊   ┊ 62┊            width: 'calc(50% - 10px)',
+┊   ┊ 63┊            paddingRight: '10px',
+┊   ┊ 64┊          }}
+┊   ┊ 65┊        >
+┊   ┊ 66┊          <TextField
+┊   ┊ 67┊            data-testid="name-input"
+┊   ┊ 68┊            label="Name"
+┊   ┊ 69┊            value={name}
+┊   ┊ 70┊            onChange={updateName}
+┊   ┊ 71┊            autoComplete="off"
+┊   ┊ 72┊            margin="normal"
+┊   ┊ 73┊          />
+┊   ┊ 74┊          <TextField
+┊   ┊ 75┊            data-testid="username-input"
+┊   ┊ 76┊            label="Username"
+┊   ┊ 77┊            value={username}
+┊   ┊ 78┊            onChange={updateUsername}
+┊   ┊ 79┊            autoComplete="off"
+┊   ┊ 80┊            margin="normal"
+┊   ┊ 81┊          />
+┊   ┊ 82┊        </Section>
+┊   ┊ 83┊        <Section
+┊   ┊ 84┊          style={{
+┊   ┊ 85┊            float: 'right',
+┊   ┊ 86┊            width: 'calc(50% - 10px)',
+┊   ┊ 87┊            paddingLeft: '10px',
+┊   ┊ 88┊          }}
+┊   ┊ 89┊        >
+┊   ┊ 90┊          <TextField
+┊   ┊ 91┊            data-testid="password-input"
+┊   ┊ 92┊            label="Password"
+┊   ┊ 93┊            type="password"
+┊   ┊ 94┊            value={password}
+┊   ┊ 95┊            onChange={updatePassword}
+┊   ┊ 96┊            autoComplete="off"
+┊   ┊ 97┊            margin="normal"
+┊   ┊ 98┊          />
+┊   ┊ 99┊          <TextField
+┊   ┊100┊            data-testid="password-confirm-input"
+┊   ┊101┊            label="Confirm password"
+┊   ┊102┊            type="password"
+┊   ┊103┊            value={passwordConfirm}
+┊   ┊104┊            onChange={updatePasswordConfirm}
+┊   ┊105┊            autoComplete="off"
+┊   ┊106┊            margin="normal"
+┊   ┊107┊          />
+┊   ┊108┊        </Section>
+┊   ┊109┊        <Button
+┊   ┊110┊          data-testid="sign-up-button"
+┊   ┊111┊          type="button"
+┊   ┊112┊          color="secondary"
+┊   ┊113┊          variant="contained"
+┊   ┊114┊          disabled={!maySignUp()}
+┊   ┊115┊          onClick={handleSignUp}
+┊   ┊116┊        >
+┊   ┊117┊          Sign up
+┊   ┊118┊        </Button>
+┊   ┊119┊        <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
+┊   ┊120┊      </ActualForm>
+┊   ┊121┊    </SignForm>
+┊   ┊122┊  )
+┊   ┊123┊}
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;form-components.ts
```diff
@@ -0,0 +1,75 @@
+┊  ┊ 1┊import MaterialButton from '@material-ui/core/Button'
+┊  ┊ 2┊import MaterialTextField from '@material-ui/core/TextField'
+┊  ┊ 3┊import styled from 'styled-components'
+┊  ┊ 4┊
+┊  ┊ 5┊export const SignForm = styled.div `
+┊  ┊ 6┊  height: calc(100% - 265px);
+┊  ┊ 7┊`
+┊  ┊ 8┊
+┊  ┊ 9┊export const ActualForm = styled.form `
+┊  ┊10┊  padding: 20px;
+┊  ┊11┊`
+┊  ┊12┊
+┊  ┊13┊export const Section = styled.div `
+┊  ┊14┊  padding-bottom: 35px;
+┊  ┊15┊`
+┊  ┊16┊
+┊  ┊17┊export const Legend = styled.legend `
+┊  ┊18┊  font-weight: bold;
+┊  ┊19┊  color: white;
+┊  ┊20┊`
+┊  ┊21┊
+┊  ┊22┊export const Label = styled.label `
+┊  ┊23┊  color: white !important;
+┊  ┊24┊`
+┊  ┊25┊
+┊  ┊26┊export const Input = styled.input `
+┊  ┊27┊  color: white;
+┊  ┊28┊
+┊  ┊29┊  &::placeholder {
+┊  ┊30┊    color: var(--primary-bg);
+┊  ┊31┊  }
+┊  ┊32┊`
+┊  ┊33┊
+┊  ┊34┊export const TextField = styled(MaterialTextField) `
+┊  ┊35┊  width: 100%;
+┊  ┊36┊  position: relative;
+┊  ┊37┊
+┊  ┊38┊  > div::before {
+┊  ┊39┊    border-color: white !important;
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  input {
+┊  ┊43┊    color: white !important;
+┊  ┊44┊
+┊  ┊45┊    &::placeholder {
+┊  ┊46┊      color: var(--primary-bg) !important;
+┊  ┊47┊    }
+┊  ┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  label {
+┊  ┊51┊    color: white !important;
+┊  ┊52┊  }
+┊  ┊53┊`
+┊  ┊54┊
+┊  ┊55┊export const Button = styled(MaterialButton) `
+┊  ┊56┊  width: 100px;
+┊  ┊57┊  display: block !important;
+┊  ┊58┊  margin: auto !important;
+┊  ┊59┊  background-color: var(--secondary-bg) !important;
+┊  ┊60┊
+┊  ┊61┊  &[disabled] {
+┊  ┊62┊    color: #38a81c;
+┊  ┊63┊  }
+┊  ┊64┊
+┊  ┊65┊  &:not([disabled]) {
+┊  ┊66┊    color: white;
+┊  ┊67┊  }
+┊  ┊68┊`
+┊  ┊69┊
+┊  ┊70┊export const ErrorMessage = styled.div `
+┊  ┊71┊  position: fixed;
+┊  ┊72┊  color: red;
+┊  ┊73┊  font-size: 15px;
+┊  ┊74┊  margin-top: 20px;
+┊  ┊75┊`
```

##### Changed src&#x2F;components&#x2F;AuthScreen&#x2F;index.tsx
```diff
@@ -1,12 +1,12 @@
-┊ 1┊  ┊import MaterialButton from '@material-ui/core/Button'
-┊ 2┊  ┊import MaterialTextField from '@material-ui/core/TextField'
 ┊ 3┊ 1┊import * as React from 'react'
-┊ 4┊  ┊import { useCallback, useMemo, useState } from 'react'
+┊  ┊ 2┊import { useMemo } from 'react'
+┊  ┊ 3┊import { Route } from 'react-router-dom'
 ┊ 5┊ 4┊import styled from 'styled-components'
-┊ 6┊  ┊import { signIn } from '../../services/auth.service'
+┊  ┊ 5┊import AnimatedSwitch from '../AnimatedSwitch'
+┊  ┊ 6┊import SignInForm from './SignInForm'
+┊  ┊ 7┊import SignUpForm from './SignUpForm'
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊const Container = styled.div `
-┊ 9┊  ┊  height: 100%;
 ┊10┊10┊  background: radial-gradient(rgb(34, 65, 67), rgb(17, 48, 50)),
 ┊11┊11┊    url(/assets/chat-background.jpg) no-repeat;
 ┊12┊12┊  background-size: cover;
```
```diff
@@ -43,141 +43,43 @@
 ┊ 43┊ 43┊  }
 ┊ 44┊ 44┊`
 ┊ 45┊ 45┊
-┊ 46┊   ┊const SignInForm = styled.div `
-┊ 47┊   ┊  height: calc(100% - 265px);
-┊ 48┊   ┊`
-┊ 49┊   ┊
-┊ 50┊   ┊const ActualForm = styled.form `
-┊ 51┊   ┊  padding: 20px;
-┊ 52┊   ┊`
-┊ 53┊   ┊
-┊ 54┊   ┊const Section = styled.div `
-┊ 55┊   ┊  width: 100%;
-┊ 56┊   ┊  padding-bottom: 35px;
-┊ 57┊   ┊`
-┊ 58┊   ┊
-┊ 59┊   ┊const Legend = styled.legend `
-┊ 60┊   ┊  font-weight: bold;
-┊ 61┊   ┊  color: white;
-┊ 62┊   ┊`
-┊ 63┊   ┊
-┊ 64┊   ┊const Label = styled.label `
-┊ 65┊   ┊  color: white !important;
-┊ 66┊   ┊`
-┊ 67┊   ┊
-┊ 68┊   ┊const Input = styled.input `
-┊ 69┊   ┊  color: white;
-┊ 70┊   ┊
-┊ 71┊   ┊  &::placeholder {
-┊ 72┊   ┊    color: var(--primary-bg);
-┊ 73┊   ┊  }
-┊ 74┊   ┊`
-┊ 75┊   ┊
-┊ 76┊   ┊const TextField = styled(MaterialTextField) `
-┊ 77┊   ┊  width: 100%;
-┊ 78┊   ┊  position: relative;
-┊ 79┊   ┊
-┊ 80┊   ┊  > div::before {
-┊ 81┊   ┊    border-color: white !important;
-┊ 82┊   ┊  }
-┊ 83┊   ┊
-┊ 84┊   ┊  input {
-┊ 85┊   ┊    color: white !important;
-┊ 86┊   ┊
-┊ 87┊   ┊    &::placeholder {
-┊ 88┊   ┊      color: var(--primary-bg) !important;
+┊   ┊ 46┊export default ({ history, location }) => {
+┊   ┊ 47┊  const alternative = useMemo(() => {
+┊   ┊ 48┊    if (location.pathname === '/sign-in') {
+┊   ┊ 49┊      const handleSignUp = () => {
+┊   ┊ 50┊        history.replace('/sign-up')
+┊   ┊ 51┊      }
+┊   ┊ 52┊
+┊   ┊ 53┊      return (
+┊   ┊ 54┊        <Alternative>
+┊   ┊ 55┊          Don't have an account yet? <a onClick={handleSignUp}>Sign up!</a>
+┊   ┊ 56┊        </Alternative>
+┊   ┊ 57┊      )
 ┊ 89┊ 58┊    }
-┊ 90┊   ┊  }
-┊ 91┊   ┊
-┊ 92┊   ┊  label {
-┊ 93┊   ┊    color: white !important;
-┊ 94┊   ┊  }
-┊ 95┊   ┊`
-┊ 96┊   ┊
-┊ 97┊   ┊const Button = styled(MaterialButton) `
-┊ 98┊   ┊  width: 100px;
-┊ 99┊   ┊  display: block !important;
-┊100┊   ┊  margin: auto !important;
-┊101┊   ┊  background-color: var(--secondary-bg) !important;
-┊102┊   ┊
-┊103┊   ┊  &[disabled] {
-┊104┊   ┊    color: #38a81c;
-┊105┊   ┊  }
-┊106┊   ┊
-┊107┊   ┊  &:not([disabled]) {
-┊108┊   ┊    color: white;
-┊109┊   ┊  }
-┊110┊   ┊`
-┊111┊   ┊
-┊112┊   ┊export default ({ history }) => {
-┊113┊   ┊  const [username, setUsername] = useState('')
-┊114┊   ┊  const [password, setPassword] = useState('')
-┊115┊   ┊  const [error, setError] = useState('')
-┊116┊   ┊
-┊117┊   ┊  const onUsernameChange = useCallback(({ target }) => {
-┊118┊   ┊    setError('')
-┊119┊   ┊    setUsername(target.value)
-┊120┊   ┊  }, [true])
-┊121┊   ┊
-┊122┊   ┊  const onPasswordChange = useCallback(({ target }) => {
-┊123┊   ┊    setError('')
-┊124┊   ┊    setPassword(target.value)
-┊125┊   ┊  }, [true])
-┊126┊   ┊
-┊127┊   ┊  const maySignIn = useCallback(() => {
-┊128┊   ┊    return !!(username && password)
-┊129┊   ┊  }, [username, password])
-┊130┊   ┊
-┊131┊   ┊  const handleSignIn = useCallback(() => {
-┊132┊   ┊    signIn({ username, password })
-┊133┊   ┊      .then(() => {
-┊134┊   ┊        history.push('/chats')
-┊135┊   ┊      })
-┊136┊   ┊      .catch(error => {
-┊137┊   ┊        setError(error.message || error)
-┊138┊   ┊      })
-┊139┊   ┊  }, [username, password])
+┊   ┊ 59┊    else {
+┊   ┊ 60┊      const handleSignIn = () => {
+┊   ┊ 61┊        history.replace('/sign-in')
+┊   ┊ 62┊      }
+┊   ┊ 63┊
+┊   ┊ 64┊      return (
+┊   ┊ 65┊        <Alternative>
+┊   ┊ 66┊          Already have an accout? <a onClick={handleSignIn}>Sign in!</a>
+┊   ┊ 67┊        </Alternative>
+┊   ┊ 68┊      )
+┊   ┊ 69┊    }
+┊   ┊ 70┊  }, [location.pathname])
 ┊140┊ 71┊
 ┊141┊ 72┊  return (
-┊142┊   ┊    <Container>
-┊143┊   ┊      <Intro>
+┊   ┊ 73┊    <Container className="AuthScreen Screen">
+┊   ┊ 74┊      <Intro className="AuthScreen-intro">
 ┊144┊ 75┊        <Icon src="assets/whatsapp-icon.png" className="AuthScreen-icon" />
 ┊145┊ 76┊        <Title className="AuthScreen-title">WhatsApp</Title>
 ┊146┊ 77┊      </Intro>
-┊147┊   ┊      <SignInForm>
-┊148┊   ┊        <ActualForm>
-┊149┊   ┊          <Legend>Sign in</Legend>
-┊150┊   ┊          <Section>
-┊151┊   ┊            <TextField
-┊152┊   ┊              className="AuthScreen-text-field"
-┊153┊   ┊              label="Username"
-┊154┊   ┊              value={username}
-┊155┊   ┊              onChange={onUsernameChange}
-┊156┊   ┊              margin="normal"
-┊157┊   ┊              placeholder="Enter your username"
-┊158┊   ┊            />
-┊159┊   ┊            <TextField
-┊160┊   ┊              className="AuthScreen-text-field"
-┊161┊   ┊              label="Password"
-┊162┊   ┊              type="password"
-┊163┊   ┊              value={password}
-┊164┊   ┊              onChange={onPasswordChange}
-┊165┊   ┊              margin="normal"
-┊166┊   ┊              placeholder="Enter your password"
-┊167┊   ┊            />
-┊168┊   ┊          </Section>
-┊169┊   ┊          <Button
-┊170┊   ┊            data-testid="sign-in-button"
-┊171┊   ┊            type="button"
-┊172┊   ┊            color="secondary"
-┊173┊   ┊            variant="contained"
-┊174┊   ┊            disabled={!maySignIn()}
-┊175┊   ┊            onClick={handleSignIn}
-┊176┊   ┊          >
-┊177┊   ┊            Sign in
-┊178┊   ┊          </Button>
-┊179┊   ┊        </ActualForm>
-┊180┊   ┊      </SignInForm>
+┊   ┊ 78┊      <AnimatedSwitch>
+┊   ┊ 79┊        <Route exact path="/sign-in" component={SignInForm} />
+┊   ┊ 80┊        <Route exact path="/sign-up" component={SignUpForm} />
+┊   ┊ 81┊      </AnimatedSwitch>
+┊   ┊ 82┊      {alternative}
 ┊181┊ 83┊    </Container>
 ┊182┊ 84┊  )
 ┊183┊ 85┊}
```

[}]: #

And then we will make the necessary changes in the `AuthScreen`:

[{]: <helper> (diffStep 13.6 module="client")

#### [Step 13.6: Split AuthScreen into SignInForm and SignUpForm](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/04dbb89)

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignInForm.test.tsx
```diff
@@ -0,0 +1,81 @@
+┊  ┊ 1┊import { createMemoryHistory } from 'history'
+┊  ┊ 2┊import React from 'react'
+┊  ┊ 3┊import { cleanup, render, fireEvent, wait, waitForElement } from 'react-testing-library'
+┊  ┊ 4┊import SignInForm from './SignInForm'
+┊  ┊ 5┊
+┊  ┊ 6┊describe('SignInForm', () => {
+┊  ┊ 7┊  afterEach(cleanup)
+┊  ┊ 8┊  afterEach(() => fetch.resetMocks())
+┊  ┊ 9┊
+┊  ┊10┊  it('enables sign-in button when filled in', async () => {
+┊  ┊11┊    const history = createMemoryHistory()
+┊  ┊12┊
+┊  ┊13┊    {
+┊  ┊14┊      const { container, getByTestId } = render(<SignInForm history={history} />)
+┊  ┊15┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊16┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊17┊      const signInButton = getByTestId('sign-in-button') as HTMLButtonElement
+┊  ┊18┊
+┊  ┊19┊      expect(signInButton.disabled).toEqual(true)
+┊  ┊20┊
+┊  ┊21┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊22┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊23┊
+┊  ┊24┊      await waitForElement(() => usernameInput)
+┊  ┊25┊      await waitForElement(() => passwordInput)
+┊  ┊26┊
+┊  ┊27┊      expect(signInButton.disabled).toEqual(false)
+┊  ┊28┊    }
+┊  ┊29┊  })
+┊  ┊30┊
+┊  ┊31┊  it('prints server error if input was wrong', async () => {
+┊  ┊32┊    const history = createMemoryHistory()
+┊  ┊33┊
+┊  ┊34┊    fetchMock.mockRejectOnce(new Error('sign-in failed'))
+┊  ┊35┊
+┊  ┊36┊    {
+┊  ┊37┊      const { container, getByTestId } = render(<SignInForm history={history} />)
+┊  ┊38┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊39┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊40┊      const signInButton = getByTestId('sign-in-button') as HTMLButtonElement
+┊  ┊41┊      const errorMessage = getByTestId('error-message')
+┊  ┊42┊
+┊  ┊43┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊44┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊45┊
+┊  ┊46┊      await waitForElement(() => usernameInput)
+┊  ┊47┊      await waitForElement(() => passwordInput)
+┊  ┊48┊
+┊  ┊49┊      fireEvent.click(signInButton)
+┊  ┊50┊
+┊  ┊51┊      await waitForElement(() => errorMessage)
+┊  ┊52┊
+┊  ┊53┊      expect(errorMessage.innerHTML).toEqual('sign-in failed')
+┊  ┊54┊    }
+┊  ┊55┊  })
+┊  ┊56┊
+┊  ┊57┊  it('navigates to /chats if everything went right', async () => {
+┊  ┊58┊    const history = createMemoryHistory()
+┊  ┊59┊
+┊  ┊60┊    fetchMock.mockResponseOnce('success')
+┊  ┊61┊
+┊  ┊62┊    {
+┊  ┊63┊      const { container, getByTestId } = render(<SignInForm history={history} />)
+┊  ┊64┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊65┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊66┊      const signInButton = getByTestId('sign-in-button') as HTMLButtonElement
+┊  ┊67┊
+┊  ┊68┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊69┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊70┊
+┊  ┊71┊      await waitForElement(() => usernameInput)
+┊  ┊72┊      await waitForElement(() => passwordInput)
+┊  ┊73┊
+┊  ┊74┊      fireEvent.click(signInButton)
+┊  ┊75┊
+┊  ┊76┊      await wait(() =>
+┊  ┊77┊        expect(history.location.pathname).toEqual('/chats')
+┊  ┊78┊      )
+┊  ┊79┊    }
+┊  ┊80┊  })
+┊  ┊81┊})
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignInForm.tsx
```diff
@@ -0,0 +1,81 @@
+┊  ┊ 1┊import { History } from 'history'
+┊  ┊ 2┊import * as React from 'react'
+┊  ┊ 3┊import { useCallback, useState } from 'react'
+┊  ┊ 4┊import { signIn } from '../../services/auth.service'
+┊  ┊ 5┊import {
+┊  ┊ 6┊  SignForm,
+┊  ┊ 7┊  ActualForm,
+┊  ┊ 8┊  Legend,
+┊  ┊ 9┊  Section,
+┊  ┊10┊  TextField,
+┊  ┊11┊  Button,
+┊  ┊12┊  ErrorMessage,
+┊  ┊13┊} from './form-components'
+┊  ┊14┊
+┊  ┊15┊export default ({ history }) => {
+┊  ┊16┊  const [username, setUsername] = useState('')
+┊  ┊17┊  const [password, setPassword] = useState('')
+┊  ┊18┊  const [error, setError] = useState('')
+┊  ┊19┊
+┊  ┊20┊  const onUsernameChange = useCallback(({ target }) => {
+┊  ┊21┊    setError('')
+┊  ┊22┊    setUsername(target.value)
+┊  ┊23┊  }, [true])
+┊  ┊24┊
+┊  ┊25┊  const onPasswordChange = useCallback(({ target }) => {
+┊  ┊26┊    setError('')
+┊  ┊27┊    setPassword(target.value)
+┊  ┊28┊  }, [true])
+┊  ┊29┊
+┊  ┊30┊  const maySignIn = useCallback(() => {
+┊  ┊31┊    return !!(username && password)
+┊  ┊32┊  }, [username, password])
+┊  ┊33┊
+┊  ┊34┊  const handleSignIn = useCallback(() => {
+┊  ┊35┊    signIn({ username, password })
+┊  ┊36┊      .then(() => {
+┊  ┊37┊        history.replace('/chats')
+┊  ┊38┊      })
+┊  ┊39┊      .catch(error => {
+┊  ┊40┊        setError(error.message || error)
+┊  ┊41┊      })
+┊  ┊42┊  }, [username, password])
+┊  ┊43┊
+┊  ┊44┊  return (
+┊  ┊45┊    <SignForm>
+┊  ┊46┊      <ActualForm>
+┊  ┊47┊        <Legend>Sign in</Legend>
+┊  ┊48┊        <Section style={{ width: '100%' }}>
+┊  ┊49┊          <TextField
+┊  ┊50┊            data-testid="username-input"
+┊  ┊51┊            label="Username"
+┊  ┊52┊            value={username}
+┊  ┊53┊            onChange={onUsernameChange}
+┊  ┊54┊            margin="normal"
+┊  ┊55┊            placeholder="Enter your username"
+┊  ┊56┊          />
+┊  ┊57┊          <TextField
+┊  ┊58┊            data-testid="password-input"
+┊  ┊59┊            label="Password"
+┊  ┊60┊            type="password"
+┊  ┊61┊            value={password}
+┊  ┊62┊            onChange={onPasswordChange}
+┊  ┊63┊            margin="normal"
+┊  ┊64┊            placeholder="Enter your password"
+┊  ┊65┊          />
+┊  ┊66┊        </Section>
+┊  ┊67┊        <Button
+┊  ┊68┊          data-testid="sign-in-button"
+┊  ┊69┊          type="button"
+┊  ┊70┊          color="secondary"
+┊  ┊71┊          variant="contained"
+┊  ┊72┊          disabled={!maySignIn()}
+┊  ┊73┊          onClick={handleSignIn}
+┊  ┊74┊        >
+┊  ┊75┊          Sign in
+┊  ┊76┊        </Button>
+┊  ┊77┊        <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
+┊  ┊78┊      </ActualForm>
+┊  ┊79┊    </SignForm>
+┊  ┊80┊  )
+┊  ┊81┊}
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignUpForm.test.tsx
```diff
@@ -0,0 +1,99 @@
+┊  ┊ 1┊import { createMemoryHistory } from 'history'
+┊  ┊ 2┊import React from 'react'
+┊  ┊ 3┊import { cleanup, render, fireEvent, wait, waitForElement } from 'react-testing-library'
+┊  ┊ 4┊import SignUpForm from './SignUpForm'
+┊  ┊ 5┊
+┊  ┊ 6┊describe('SignUpForm', () => {
+┊  ┊ 7┊  afterEach(cleanup)
+┊  ┊ 8┊  afterEach(() => fetch.resetMocks())
+┊  ┊ 9┊
+┊  ┊10┊  it('enables sign-up button when filled in', async () => {
+┊  ┊11┊    const history = createMemoryHistory()
+┊  ┊12┊
+┊  ┊13┊    {
+┊  ┊14┊      const { container, getByTestId } = render(<SignUpForm history={history} />)
+┊  ┊15┊      const nameInput = getByTestId('name-input').querySelector('input')
+┊  ┊16┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊17┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊18┊      const passwordConfirmInput = getByTestId('password-confirm-input').querySelector('input')
+┊  ┊19┊      const signUpButton = getByTestId('sign-up-button') as HTMLButtonElement
+┊  ┊20┊
+┊  ┊21┊      expect(signUpButton.disabled).toEqual(true)
+┊  ┊22┊
+┊  ┊23┊      fireEvent.change(nameInput, { target: { value: 'User Name' } })
+┊  ┊24┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊25┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊26┊      fireEvent.change(passwordConfirmInput, { target: { value: 'password' } })
+┊  ┊27┊
+┊  ┊28┊      await waitForElement(() => nameInput)
+┊  ┊29┊      await waitForElement(() => usernameInput)
+┊  ┊30┊      await waitForElement(() => passwordInput)
+┊  ┊31┊      await waitForElement(() => passwordConfirmInput)
+┊  ┊32┊
+┊  ┊33┊      expect(signUpButton.disabled).toEqual(false)
+┊  ┊34┊    }
+┊  ┊35┊  })
+┊  ┊36┊
+┊  ┊37┊  it('prints server error if input was wrong', async () => {
+┊  ┊38┊    const history = createMemoryHistory()
+┊  ┊39┊
+┊  ┊40┊    fetchMock.mockRejectOnce(new Error('sign-up failed'))
+┊  ┊41┊
+┊  ┊42┊    {
+┊  ┊43┊      const { container, getByTestId } = render(<SignUpForm history={history} />)
+┊  ┊44┊      const nameInput = getByTestId('name-input').querySelector('input')
+┊  ┊45┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊46┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊47┊      const passwordConfirmInput = getByTestId('password-confirm-input').querySelector('input')
+┊  ┊48┊      const signUpButton = getByTestId('sign-up-button') as HTMLButtonElement
+┊  ┊49┊      const errorMessage = getByTestId('error-message')
+┊  ┊50┊
+┊  ┊51┊      fireEvent.change(nameInput, { target: { value: 'User Name' } })
+┊  ┊52┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊53┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊54┊      fireEvent.change(passwordConfirmInput, { target: { value: 'password' } })
+┊  ┊55┊
+┊  ┊56┊      await waitForElement(() => nameInput)
+┊  ┊57┊      await waitForElement(() => usernameInput)
+┊  ┊58┊      await waitForElement(() => passwordInput)
+┊  ┊59┊      await waitForElement(() => passwordConfirmInput)
+┊  ┊60┊
+┊  ┊61┊      fireEvent.click(signUpButton)
+┊  ┊62┊
+┊  ┊63┊      await waitForElement(() => errorMessage)
+┊  ┊64┊
+┊  ┊65┊      expect(errorMessage.innerHTML).toEqual('sign-up failed')
+┊  ┊66┊    }
+┊  ┊67┊  })
+┊  ┊68┊
+┊  ┊69┊  it('navigates to /sign-in if everything went right', async () => {
+┊  ┊70┊    const history = createMemoryHistory()
+┊  ┊71┊
+┊  ┊72┊    fetchMock.mockResponseOnce('success')
+┊  ┊73┊
+┊  ┊74┊    {
+┊  ┊75┊      const { container, getByTestId } = render(<SignUpForm history={history} />)
+┊  ┊76┊      const nameInput = getByTestId('name-input').querySelector('input')
+┊  ┊77┊      const usernameInput = getByTestId('username-input').querySelector('input')
+┊  ┊78┊      const passwordInput = getByTestId('password-input').querySelector('input')
+┊  ┊79┊      const passwordConfirmInput = getByTestId('password-confirm-input').querySelector('input')
+┊  ┊80┊      const signUpButton = getByTestId('sign-up-button') as HTMLButtonElement
+┊  ┊81┊
+┊  ┊82┊      fireEvent.change(nameInput, { target: { value: 'User Name' } })
+┊  ┊83┊      fireEvent.change(usernameInput, { target: { value: 'username' } })
+┊  ┊84┊      fireEvent.change(passwordInput, { target: { value: 'password' } })
+┊  ┊85┊      fireEvent.change(passwordConfirmInput, { target: { value: 'password' } })
+┊  ┊86┊
+┊  ┊87┊      await waitForElement(() => nameInput)
+┊  ┊88┊      await waitForElement(() => usernameInput)
+┊  ┊89┊      await waitForElement(() => passwordInput)
+┊  ┊90┊      await waitForElement(() => passwordConfirmInput)
+┊  ┊91┊
+┊  ┊92┊      fireEvent.click(signUpButton)
+┊  ┊93┊
+┊  ┊94┊      await wait(() =>
+┊  ┊95┊        expect(history.location.pathname).toEqual('/sign-in')
+┊  ┊96┊      )
+┊  ┊97┊    }
+┊  ┊98┊  })
+┊  ┊99┊})
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignUpForm.tsx
```diff
@@ -0,0 +1,123 @@
+┊   ┊  1┊import * as React from 'react'
+┊   ┊  2┊import { useCallback, useState } from 'react'
+┊   ┊  3┊import { signUp } from '../../services/auth.service'
+┊   ┊  4┊import {
+┊   ┊  5┊  SignForm,
+┊   ┊  6┊  ActualForm,
+┊   ┊  7┊  Legend,
+┊   ┊  8┊  Section,
+┊   ┊  9┊  TextField,
+┊   ┊ 10┊  Button,
+┊   ┊ 11┊  ErrorMessage,
+┊   ┊ 12┊} from './form-components'
+┊   ┊ 13┊
+┊   ┊ 14┊export default ({ history }) => {
+┊   ┊ 15┊  const [name, setName] = useState('')
+┊   ┊ 16┊  const [username, setUsername] = useState('')
+┊   ┊ 17┊  const [password, setPassword] = useState('')
+┊   ┊ 18┊  const [passwordConfirm, setPasswordConfirm] = useState('')
+┊   ┊ 19┊  const [error, setError] = useState('')
+┊   ┊ 20┊
+┊   ┊ 21┊  const updateName = useCallback(({ target }) => {
+┊   ┊ 22┊    setError('')
+┊   ┊ 23┊    setName(target.value)
+┊   ┊ 24┊  }, [true])
+┊   ┊ 25┊
+┊   ┊ 26┊  const updateUsername = useCallback(({ target }) => {
+┊   ┊ 27┊    setError('')
+┊   ┊ 28┊    setUsername(target.value)
+┊   ┊ 29┊  }, [true])
+┊   ┊ 30┊
+┊   ┊ 31┊  const updatePassword = useCallback(({ target }) => {
+┊   ┊ 32┊    setError('')
+┊   ┊ 33┊    setPassword(target.value)
+┊   ┊ 34┊  }, [true])
+┊   ┊ 35┊
+┊   ┊ 36┊  const updatePasswordConfirm = useCallback(({ target }) => {
+┊   ┊ 37┊    setError('')
+┊   ┊ 38┊    setPasswordConfirm(target.value)
+┊   ┊ 39┊  }, [true])
+┊   ┊ 40┊
+┊   ┊ 41┊  const maySignUp = useCallback(() => {
+┊   ┊ 42┊    return !!(name && username && password && password === passwordConfirm)
+┊   ┊ 43┊  }, [name, username, password, passwordConfirm])
+┊   ┊ 44┊
+┊   ┊ 45┊  const handleSignUp = useCallback(() => {
+┊   ┊ 46┊    signUp({ username, password, passwordConfirm, name })
+┊   ┊ 47┊      .then(() => {
+┊   ┊ 48┊        history.replace('/sign-in')
+┊   ┊ 49┊      })
+┊   ┊ 50┊      .catch(error => {
+┊   ┊ 51┊        setError(error.message || error)
+┊   ┊ 52┊      })
+┊   ┊ 53┊  }, [name, username, password, passwordConfirm])
+┊   ┊ 54┊
+┊   ┊ 55┊  return (
+┊   ┊ 56┊    <SignForm>
+┊   ┊ 57┊      <ActualForm>
+┊   ┊ 58┊        <Legend>Sign up</Legend>
+┊   ┊ 59┊        <Section
+┊   ┊ 60┊          style={{
+┊   ┊ 61┊            float: 'left',
+┊   ┊ 62┊            width: 'calc(50% - 10px)',
+┊   ┊ 63┊            paddingRight: '10px',
+┊   ┊ 64┊          }}
+┊   ┊ 65┊        >
+┊   ┊ 66┊          <TextField
+┊   ┊ 67┊            data-testid="name-input"
+┊   ┊ 68┊            label="Name"
+┊   ┊ 69┊            value={name}
+┊   ┊ 70┊            onChange={updateName}
+┊   ┊ 71┊            autoComplete="off"
+┊   ┊ 72┊            margin="normal"
+┊   ┊ 73┊          />
+┊   ┊ 74┊          <TextField
+┊   ┊ 75┊            data-testid="username-input"
+┊   ┊ 76┊            label="Username"
+┊   ┊ 77┊            value={username}
+┊   ┊ 78┊            onChange={updateUsername}
+┊   ┊ 79┊            autoComplete="off"
+┊   ┊ 80┊            margin="normal"
+┊   ┊ 81┊          />
+┊   ┊ 82┊        </Section>
+┊   ┊ 83┊        <Section
+┊   ┊ 84┊          style={{
+┊   ┊ 85┊            float: 'right',
+┊   ┊ 86┊            width: 'calc(50% - 10px)',
+┊   ┊ 87┊            paddingLeft: '10px',
+┊   ┊ 88┊          }}
+┊   ┊ 89┊        >
+┊   ┊ 90┊          <TextField
+┊   ┊ 91┊            data-testid="password-input"
+┊   ┊ 92┊            label="Password"
+┊   ┊ 93┊            type="password"
+┊   ┊ 94┊            value={password}
+┊   ┊ 95┊            onChange={updatePassword}
+┊   ┊ 96┊            autoComplete="off"
+┊   ┊ 97┊            margin="normal"
+┊   ┊ 98┊          />
+┊   ┊ 99┊          <TextField
+┊   ┊100┊            data-testid="password-confirm-input"
+┊   ┊101┊            label="Confirm password"
+┊   ┊102┊            type="password"
+┊   ┊103┊            value={passwordConfirm}
+┊   ┊104┊            onChange={updatePasswordConfirm}
+┊   ┊105┊            autoComplete="off"
+┊   ┊106┊            margin="normal"
+┊   ┊107┊          />
+┊   ┊108┊        </Section>
+┊   ┊109┊        <Button
+┊   ┊110┊          data-testid="sign-up-button"
+┊   ┊111┊          type="button"
+┊   ┊112┊          color="secondary"
+┊   ┊113┊          variant="contained"
+┊   ┊114┊          disabled={!maySignUp()}
+┊   ┊115┊          onClick={handleSignUp}
+┊   ┊116┊        >
+┊   ┊117┊          Sign up
+┊   ┊118┊        </Button>
+┊   ┊119┊        <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
+┊   ┊120┊      </ActualForm>
+┊   ┊121┊    </SignForm>
+┊   ┊122┊  )
+┊   ┊123┊}
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;form-components.ts
```diff
@@ -0,0 +1,75 @@
+┊  ┊ 1┊import MaterialButton from '@material-ui/core/Button'
+┊  ┊ 2┊import MaterialTextField from '@material-ui/core/TextField'
+┊  ┊ 3┊import styled from 'styled-components'
+┊  ┊ 4┊
+┊  ┊ 5┊export const SignForm = styled.div `
+┊  ┊ 6┊  height: calc(100% - 265px);
+┊  ┊ 7┊`
+┊  ┊ 8┊
+┊  ┊ 9┊export const ActualForm = styled.form `
+┊  ┊10┊  padding: 20px;
+┊  ┊11┊`
+┊  ┊12┊
+┊  ┊13┊export const Section = styled.div `
+┊  ┊14┊  padding-bottom: 35px;
+┊  ┊15┊`
+┊  ┊16┊
+┊  ┊17┊export const Legend = styled.legend `
+┊  ┊18┊  font-weight: bold;
+┊  ┊19┊  color: white;
+┊  ┊20┊`
+┊  ┊21┊
+┊  ┊22┊export const Label = styled.label `
+┊  ┊23┊  color: white !important;
+┊  ┊24┊`
+┊  ┊25┊
+┊  ┊26┊export const Input = styled.input `
+┊  ┊27┊  color: white;
+┊  ┊28┊
+┊  ┊29┊  &::placeholder {
+┊  ┊30┊    color: var(--primary-bg);
+┊  ┊31┊  }
+┊  ┊32┊`
+┊  ┊33┊
+┊  ┊34┊export const TextField = styled(MaterialTextField) `
+┊  ┊35┊  width: 100%;
+┊  ┊36┊  position: relative;
+┊  ┊37┊
+┊  ┊38┊  > div::before {
+┊  ┊39┊    border-color: white !important;
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  input {
+┊  ┊43┊    color: white !important;
+┊  ┊44┊
+┊  ┊45┊    &::placeholder {
+┊  ┊46┊      color: var(--primary-bg) !important;
+┊  ┊47┊    }
+┊  ┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  label {
+┊  ┊51┊    color: white !important;
+┊  ┊52┊  }
+┊  ┊53┊`
+┊  ┊54┊
+┊  ┊55┊export const Button = styled(MaterialButton) `
+┊  ┊56┊  width: 100px;
+┊  ┊57┊  display: block !important;
+┊  ┊58┊  margin: auto !important;
+┊  ┊59┊  background-color: var(--secondary-bg) !important;
+┊  ┊60┊
+┊  ┊61┊  &[disabled] {
+┊  ┊62┊    color: #38a81c;
+┊  ┊63┊  }
+┊  ┊64┊
+┊  ┊65┊  &:not([disabled]) {
+┊  ┊66┊    color: white;
+┊  ┊67┊  }
+┊  ┊68┊`
+┊  ┊69┊
+┊  ┊70┊export const ErrorMessage = styled.div `
+┊  ┊71┊  position: fixed;
+┊  ┊72┊  color: red;
+┊  ┊73┊  font-size: 15px;
+┊  ┊74┊  margin-top: 20px;
+┊  ┊75┊`
```

##### Changed src&#x2F;components&#x2F;AuthScreen&#x2F;index.tsx
```diff
@@ -1,12 +1,12 @@
-┊ 1┊  ┊import MaterialButton from '@material-ui/core/Button'
-┊ 2┊  ┊import MaterialTextField from '@material-ui/core/TextField'
 ┊ 3┊ 1┊import * as React from 'react'
-┊ 4┊  ┊import { useCallback, useMemo, useState } from 'react'
+┊  ┊ 2┊import { useMemo } from 'react'
+┊  ┊ 3┊import { Route } from 'react-router-dom'
 ┊ 5┊ 4┊import styled from 'styled-components'
-┊ 6┊  ┊import { signIn } from '../../services/auth.service'
+┊  ┊ 5┊import AnimatedSwitch from '../AnimatedSwitch'
+┊  ┊ 6┊import SignInForm from './SignInForm'
+┊  ┊ 7┊import SignUpForm from './SignUpForm'
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊const Container = styled.div `
-┊ 9┊  ┊  height: 100%;
 ┊10┊10┊  background: radial-gradient(rgb(34, 65, 67), rgb(17, 48, 50)),
 ┊11┊11┊    url(/assets/chat-background.jpg) no-repeat;
 ┊12┊12┊  background-size: cover;
```
```diff
@@ -43,141 +43,43 @@
 ┊ 43┊ 43┊  }
 ┊ 44┊ 44┊`
 ┊ 45┊ 45┊
-┊ 46┊   ┊const SignInForm = styled.div `
-┊ 47┊   ┊  height: calc(100% - 265px);
-┊ 48┊   ┊`
-┊ 49┊   ┊
-┊ 50┊   ┊const ActualForm = styled.form `
-┊ 51┊   ┊  padding: 20px;
-┊ 52┊   ┊`
-┊ 53┊   ┊
-┊ 54┊   ┊const Section = styled.div `
-┊ 55┊   ┊  width: 100%;
-┊ 56┊   ┊  padding-bottom: 35px;
-┊ 57┊   ┊`
-┊ 58┊   ┊
-┊ 59┊   ┊const Legend = styled.legend `
-┊ 60┊   ┊  font-weight: bold;
-┊ 61┊   ┊  color: white;
-┊ 62┊   ┊`
-┊ 63┊   ┊
-┊ 64┊   ┊const Label = styled.label `
-┊ 65┊   ┊  color: white !important;
-┊ 66┊   ┊`
-┊ 67┊   ┊
-┊ 68┊   ┊const Input = styled.input `
-┊ 69┊   ┊  color: white;
-┊ 70┊   ┊
-┊ 71┊   ┊  &::placeholder {
-┊ 72┊   ┊    color: var(--primary-bg);
-┊ 73┊   ┊  }
-┊ 74┊   ┊`
-┊ 75┊   ┊
-┊ 76┊   ┊const TextField = styled(MaterialTextField) `
-┊ 77┊   ┊  width: 100%;
-┊ 78┊   ┊  position: relative;
-┊ 79┊   ┊
-┊ 80┊   ┊  > div::before {
-┊ 81┊   ┊    border-color: white !important;
-┊ 82┊   ┊  }
-┊ 83┊   ┊
-┊ 84┊   ┊  input {
-┊ 85┊   ┊    color: white !important;
-┊ 86┊   ┊
-┊ 87┊   ┊    &::placeholder {
-┊ 88┊   ┊      color: var(--primary-bg) !important;
+┊   ┊ 46┊export default ({ history, location }) => {
+┊   ┊ 47┊  const alternative = useMemo(() => {
+┊   ┊ 48┊    if (location.pathname === '/sign-in') {
+┊   ┊ 49┊      const handleSignUp = () => {
+┊   ┊ 50┊        history.replace('/sign-up')
+┊   ┊ 51┊      }
+┊   ┊ 52┊
+┊   ┊ 53┊      return (
+┊   ┊ 54┊        <Alternative>
+┊   ┊ 55┊          Don't have an account yet? <a onClick={handleSignUp}>Sign up!</a>
+┊   ┊ 56┊        </Alternative>
+┊   ┊ 57┊      )
 ┊ 89┊ 58┊    }
-┊ 90┊   ┊  }
-┊ 91┊   ┊
-┊ 92┊   ┊  label {
-┊ 93┊   ┊    color: white !important;
-┊ 94┊   ┊  }
-┊ 95┊   ┊`
-┊ 96┊   ┊
-┊ 97┊   ┊const Button = styled(MaterialButton) `
-┊ 98┊   ┊  width: 100px;
-┊ 99┊   ┊  display: block !important;
-┊100┊   ┊  margin: auto !important;
-┊101┊   ┊  background-color: var(--secondary-bg) !important;
-┊102┊   ┊
-┊103┊   ┊  &[disabled] {
-┊104┊   ┊    color: #38a81c;
-┊105┊   ┊  }
-┊106┊   ┊
-┊107┊   ┊  &:not([disabled]) {
-┊108┊   ┊    color: white;
-┊109┊   ┊  }
-┊110┊   ┊`
-┊111┊   ┊
-┊112┊   ┊export default ({ history }) => {
-┊113┊   ┊  const [username, setUsername] = useState('')
-┊114┊   ┊  const [password, setPassword] = useState('')
-┊115┊   ┊  const [error, setError] = useState('')
-┊116┊   ┊
-┊117┊   ┊  const onUsernameChange = useCallback(({ target }) => {
-┊118┊   ┊    setError('')
-┊119┊   ┊    setUsername(target.value)
-┊120┊   ┊  }, [true])
-┊121┊   ┊
-┊122┊   ┊  const onPasswordChange = useCallback(({ target }) => {
-┊123┊   ┊    setError('')
-┊124┊   ┊    setPassword(target.value)
-┊125┊   ┊  }, [true])
-┊126┊   ┊
-┊127┊   ┊  const maySignIn = useCallback(() => {
-┊128┊   ┊    return !!(username && password)
-┊129┊   ┊  }, [username, password])
-┊130┊   ┊
-┊131┊   ┊  const handleSignIn = useCallback(() => {
-┊132┊   ┊    signIn({ username, password })
-┊133┊   ┊      .then(() => {
-┊134┊   ┊        history.push('/chats')
-┊135┊   ┊      })
-┊136┊   ┊      .catch(error => {
-┊137┊   ┊        setError(error.message || error)
-┊138┊   ┊      })
-┊139┊   ┊  }, [username, password])
+┊   ┊ 59┊    else {
+┊   ┊ 60┊      const handleSignIn = () => {
+┊   ┊ 61┊        history.replace('/sign-in')
+┊   ┊ 62┊      }
+┊   ┊ 63┊
+┊   ┊ 64┊      return (
+┊   ┊ 65┊        <Alternative>
+┊   ┊ 66┊          Already have an accout? <a onClick={handleSignIn}>Sign in!</a>
+┊   ┊ 67┊        </Alternative>
+┊   ┊ 68┊      )
+┊   ┊ 69┊    }
+┊   ┊ 70┊  }, [location.pathname])
 ┊140┊ 71┊
 ┊141┊ 72┊  return (
-┊142┊   ┊    <Container>
-┊143┊   ┊      <Intro>
+┊   ┊ 73┊    <Container className="AuthScreen Screen">
+┊   ┊ 74┊      <Intro className="AuthScreen-intro">
 ┊144┊ 75┊        <Icon src="assets/whatsapp-icon.png" className="AuthScreen-icon" />
 ┊145┊ 76┊        <Title className="AuthScreen-title">WhatsApp</Title>
 ┊146┊ 77┊      </Intro>
-┊147┊   ┊      <SignInForm>
-┊148┊   ┊        <ActualForm>
-┊149┊   ┊          <Legend>Sign in</Legend>
-┊150┊   ┊          <Section>
-┊151┊   ┊            <TextField
-┊152┊   ┊              className="AuthScreen-text-field"
-┊153┊   ┊              label="Username"
-┊154┊   ┊              value={username}
-┊155┊   ┊              onChange={onUsernameChange}
-┊156┊   ┊              margin="normal"
-┊157┊   ┊              placeholder="Enter your username"
-┊158┊   ┊            />
-┊159┊   ┊            <TextField
-┊160┊   ┊              className="AuthScreen-text-field"
-┊161┊   ┊              label="Password"
-┊162┊   ┊              type="password"
-┊163┊   ┊              value={password}
-┊164┊   ┊              onChange={onPasswordChange}
-┊165┊   ┊              margin="normal"
-┊166┊   ┊              placeholder="Enter your password"
-┊167┊   ┊            />
-┊168┊   ┊          </Section>
-┊169┊   ┊          <Button
-┊170┊   ┊            data-testid="sign-in-button"
-┊171┊   ┊            type="button"
-┊172┊   ┊            color="secondary"
-┊173┊   ┊            variant="contained"
-┊174┊   ┊            disabled={!maySignIn()}
-┊175┊   ┊            onClick={handleSignIn}
-┊176┊   ┊          >
-┊177┊   ┊            Sign in
-┊178┊   ┊          </Button>
-┊179┊   ┊        </ActualForm>
-┊180┊   ┊      </SignInForm>
+┊   ┊ 78┊      <AnimatedSwitch>
+┊   ┊ 79┊        <Route exact path="/sign-in" component={SignInForm} />
+┊   ┊ 80┊        <Route exact path="/sign-up" component={SignUpForm} />
+┊   ┊ 81┊      </AnimatedSwitch>
+┊   ┊ 82┊      {alternative}
 ┊181┊ 83┊    </Container>
 ┊182┊ 84┊  )
 ┊183┊ 85┊}
```

[}]: #

> Note how we used the `/sign-(in|up)` pattern to define the `/sign-up` route. This is because the request will be further redirected in the `AuthScreen`.

The authentication flow is complete! To test it out, you can create a new user, log in with it and start chatting with other users.


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/final@next/.tortilla/manuals/views/step12.md) |
|:----------------------|

[}]: #
