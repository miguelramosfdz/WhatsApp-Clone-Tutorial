# Step 2: Authentication

[//]: # (head-end)


![login](https://user-images.githubusercontent.com/7648874/52663083-c9b4ea00-2f40-11e9-9783-bf36fd88e4bb.png)

As we're probably all familiar with WhatsApp, the app surrounds around authentication. It's a very crucial part because without authentication there would be no way to identify users and who communicates with whom. On top of all we would like to keep things private, because we don't want personal information to leak to other people. Although the original WhatsApp uses phone authentication with an SMS code, in our app we're gonna keep things simple and use a basic authentication.

The authentication flow in the front-end app is simple and consists of the following:

- Sign-Up
- Sign-In
- Settings
- Sign-Out

The more complicated part comes when we have to match each data with its owner and check if a user is authorized to perform an operation or not.

### Server authentication

Authentication is a hot topic in the GraphQL world and there are some projects which aim at authenticating through GraphQL. Since often you will be required to use a specific auth framework (because of a feature you need or because of an existing authorization infrastructure) I will show you how to use a classic REST API framework within your GraphQL application. This approach is completely fine and in line with the official GraphQL best practices. We will use `Passport` for the authentication and `BasicAuth` as the auth mechanism:

    $ yarn add bcrypt-nodejs@0.0.3 passport@0.4.0 passport-http@0.3.0
    $ yarn add -D @types/bcrypt-nodejs@0.0.30 @types/passport@1.0.0 @types/passport-http@0.3.7

`BasicAuth` is basically responsible for sending a username and password in an Authorization Header together with each request and it's fully supported by any browser (meaning that we will be able to use Graphiql simply by proving username and password in the login window provided by the browser itself). It's the most simple auth mechanism but it's completely fine for our needs. Later we could decide to use something more complicated like JWT, but it's outside of the scope of this tutorial.

We will connect the auth logic to our Express app within the auth GQLModule. Indeed, GQLModules can also be used to apply logic which is not directly related to GraphQL. This method is excellent because it ensures that our GraphQL resolvers will be set with the right infrastructure right out of the box and we can safely reuse the module:

[{]: <helper> (diffStep 2.1 files="app, modules/auth" module="server")

#### Step 2.1: Add auth routes

##### Changed modules&#x2F;app.module.ts
```diff
@@ -7,13 +7,15 @@
 ┊ 7┊ 7┊import { MessageModule } from './message'
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊export interface IAppModuleConfig {
-┊10┊  ┊  connection: Connection;
+┊  ┊10┊  connection: Connection
+┊  ┊11┊  app: Express
 ┊11┊12┊}
 ┊12┊13┊
 ┊13┊14┊export const AppModule = new GraphQLModule<IAppModuleConfig>({
 ┊14┊15┊  name: 'App',
-┊15┊  ┊  imports: ({ config: { connection } }) => [
+┊  ┊16┊  imports: ({ config: { app, connection } }) => [
 ┊16┊17┊    AuthModule.forRoot({
+┊  ┊18┊      app,
 ┊17┊19┊      connection,
 ┊18┊20┊    }),
 ┊19┊21┊    UserModule,
```

##### Changed modules&#x2F;auth&#x2F;index.ts
```diff
@@ -1,12 +1,61 @@
 ┊ 1┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 3┊import { Express } from 'express'
 ┊ 2┊ 4┊import { Connection } from 'typeorm'
 ┊ 3┊ 5┊import { AuthProvider } from './providers/auth.provider'
+┊  ┊ 6┊import { APP } from '../app.symbols'
+┊  ┊ 7┊import { PubSub } from 'apollo-server-express'
+┊  ┊ 8┊import passport from 'passport'
+┊  ┊ 9┊import basicStrategy from 'passport-http'
+┊  ┊10┊import { InjectFunction } from '@graphql-modules/di'
 ┊ 4┊11┊
-┊ 5┊  ┊export const AuthModule = new GraphQLModule({
+┊  ┊12┊export interface IAppModuleConfig {
+┊  ┊13┊  connection: Connection
+┊  ┊14┊  app: Express
+┊  ┊15┊}
+┊  ┊16┊
+┊  ┊17┊export const AuthModule = new GraphQLModule<IAppModuleConfig>({
 ┊ 6┊18┊  name: 'Auth',
-┊ 7┊  ┊  providers: ({ config: { connection } }) => [
+┊  ┊19┊  providers: ({ config: { connection, app } }) => [
 ┊ 8┊20┊    { provide: Connection, useValue: connection },
+┊  ┊21┊    { provide: APP, useValue: app },
+┊  ┊22┊    PubSub,
 ┊ 9┊23┊    AuthProvider,
 ┊10┊24┊  ],
+┊  ┊25┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊26┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
 ┊11┊27┊  configRequired: true,
+┊  ┊28┊  middleware: InjectFunction(AuthProvider, APP)((authProvider, app: Express) => {
+┊  ┊29┊    passport.use(
+┊  ┊30┊      'basic-signin',
+┊  ┊31┊      new basicStrategy.BasicStrategy(async (username: string, password: string, done: any) => {
+┊  ┊32┊        done(null, await authProvider.signIn(username, password))
+┊  ┊33┊      })
+┊  ┊34┊    )
+┊  ┊35┊
+┊  ┊36┊    passport.use(
+┊  ┊37┊      'basic-signup',
+┊  ┊38┊      new basicStrategy.BasicStrategy(
+┊  ┊39┊        { passReqToCallback: true },
+┊  ┊40┊        async (
+┊  ┊41┊          req: Express.Request & { body: { name?: string } },
+┊  ┊42┊          username: string,
+┊  ┊43┊          password: string,
+┊  ┊44┊          done: any
+┊  ┊45┊        ) => {
+┊  ┊46┊          const name = req.body.name
+┊  ┊47┊          return done(null, !!name && (await authProvider.signUp(username, password, name)))
+┊  ┊48┊        }
+┊  ┊49┊      )
+┊  ┊50┊    )
+┊  ┊51┊
+┊  ┊52┊    app.post('/signup', passport.authenticate('basic-signup', { session: false }), (req, res) =>
+┊  ┊53┊      res.json(req.user)
+┊  ┊54┊    )
+┊  ┊55┊
+┊  ┊56┊    app.use(passport.authenticate('basic-signin', { session: false }))
+┊  ┊57┊
+┊  ┊58┊    app.post('/signin', (req, res) => res.json(req.user))
+┊  ┊59┊    return {}
+┊  ┊60┊  }),
 ┊12┊61┊})
```

##### Changed modules&#x2F;auth&#x2F;providers&#x2F;auth.provider.ts
```diff
@@ -1,27 +1,75 @@
-┊ 1┊  ┊import { OnRequest } from '@graphql-modules/core'
-┊ 2┊  ┊import { Injectable } from '@graphql-modules/di'
+┊  ┊ 1┊import { Injectable, ProviderScope } from '@graphql-modules/di'
+┊  ┊ 2┊import { ModuleSessionInfo, OnRequest, OnConnect } from '@graphql-modules/core'
 ┊ 3┊ 3┊import { Connection } from 'typeorm'
 ┊ 4┊ 4┊import { User } from '../../../entity/user'
+┊  ┊ 5┊import bcrypt from 'bcrypt-nodejs'
 ┊ 5┊ 6┊
-┊ 6┊  ┊@Injectable()
-┊ 7┊  ┊export class AuthProvider implements OnRequest {
+┊  ┊ 7┊@Injectable({
+┊  ┊ 8┊  scope: ProviderScope.Session,
+┊  ┊ 9┊})
+┊  ┊10┊export class AuthProvider implements OnRequest, OnConnect {
 ┊ 8┊11┊  currentUser: User
 ┊ 9┊12┊
-┊10┊  ┊  constructor(
-┊11┊  ┊    private connection: Connection
-┊12┊  ┊  ) {}
+┊  ┊13┊  constructor(private connection: Connection) {}
 ┊13┊14┊
-┊14┊  ┊  async onRequest() {
-┊15┊  ┊    if (this.currentUser) return
+┊  ┊15┊  onRequest({ session }: ModuleSessionInfo) {
+┊  ┊16┊    if ('req' in session) {
+┊  ┊17┊      this.currentUser = session.req.user
+┊  ┊18┊    }
+┊  ┊19┊  }
+┊  ┊20┊
+┊  ┊21┊  async onConnect(connectionParams: { authToken?: string }) {
+┊  ┊22┊    if (connectionParams.authToken) {
+┊  ┊23┊      // Create a buffer and tell it the data coming in is base64
+┊  ┊24┊      const buf = Buffer.from(connectionParams.authToken.split(' ')[1], 'base64')
+┊  ┊25┊      // Read it back out as a string
+┊  ┊26┊      const [username, password]: string[] = buf.toString().split(':')
+┊  ┊27┊      const user = await this.signIn(username, password)
+┊  ┊28┊      if (user) {
+┊  ┊29┊        // Set context for the WebSocket
+┊  ┊30┊        this.currentUser = user
+┊  ┊31┊      } else {
+┊  ┊32┊        throw new Error('Wrong credentials!')
+┊  ┊33┊      }
+┊  ┊34┊    } else {
+┊  ┊35┊      throw new Error('Missing auth token!')
+┊  ┊36┊    }
+┊  ┊37┊  }
 ┊16┊38┊
+┊  ┊39┊  getUserByUsername(username: string) {
+┊  ┊40┊    return this.connection.getRepository(User).findOne({ where: { username } })
+┊  ┊41┊  }
 ┊17┊42┊
-┊18┊  ┊    const currentUser = await this.connection
-┊19┊  ┊      .createQueryBuilder(User, 'user')
-┊20┊  ┊      .getOne()
+┊  ┊43┊  async signIn(username: string, password: string): Promise<User | false> {
+┊  ┊44┊    const user = await this.getUserByUsername(username)
+┊  ┊45┊    if (user && this.validPassword(password, user.password)) {
+┊  ┊46┊      return user
+┊  ┊47┊    } else {
+┊  ┊48┊      return false
+┊  ┊49┊    }
+┊  ┊50┊  }
 ┊21┊51┊
-┊22┊  ┊    if (currentUser) {
-┊23┊  ┊      console.log(currentUser)
-┊24┊  ┊      this.currentUser = currentUser
+┊  ┊52┊  async signUp(username: string, password: string, name: string): Promise<User | false> {
+┊  ┊53┊    const userExists = !!(await this.getUserByUsername(username))
+┊  ┊54┊    if (!userExists) {
+┊  ┊55┊      const user = this.connection.manager.save(
+┊  ┊56┊        new User({
+┊  ┊57┊          username,
+┊  ┊58┊          password: this.generateHash(password),
+┊  ┊59┊          name,
+┊  ┊60┊        })
+┊  ┊61┊      )
+┊  ┊62┊      return user
+┊  ┊63┊    } else {
+┊  ┊64┊      return false
 ┊25┊65┊    }
 ┊26┊66┊  }
+┊  ┊67┊
+┊  ┊68┊  generateHash(password: string) {
+┊  ┊69┊    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
+┊  ┊70┊  }
+┊  ┊71┊
+┊  ┊72┊  validPassword(password: string, localPassword: string) {
+┊  ┊73┊    return bcrypt.compareSync(password, localPassword)
+┊  ┊74┊  }
 ┊27┊75┊}
```

[}]: #

We are going to store hashes instead of plain passwords, that's why we're using `bcrypt-nodejs`. With `passport.use('basic-signin')` and `passport.use('basic-signup')` we define how the auth framework deals with our database. `app.post('/signup')` is the endpoint for creating new accounts, so we left it out of the authentication middleware (`app.use(passport.authenticate('basic-signin')`).

We will also add an additional query called `me` which will simply return the user which is currently logged in. This will come in handy in the client:

[{]: <helper> (diffStep 2.1 files="modules/user" module="server")

#### Step 2.1: Add auth routes

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
```diff
@@ -14,6 +14,10 @@
 ┊14┊14┊    return this.connection.createQueryBuilder(User, 'user')
 ┊15┊15┊  }
 ┊16┊16┊
+┊  ┊17┊  getMe() {
+┊  ┊18┊    return this.currentUser
+┊  ┊19┊  }
+┊  ┊20┊
 ┊17┊21┊  getUsers() {
 ┊18┊22┊    return this.createQueryBuilder()
 ┊19┊23┊      .where('user.id != :id', { id: this.currentUser.id })
```

##### Changed modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊export default {
 ┊ 7┊ 7┊  Query: {
+┊  ┊ 8┊    me: (obj, args, { injector }) => injector.get(UserProvider).getMe(),
 ┊ 8┊ 9┊    users: (obj, args, { injector }) => injector.get(UserProvider).getUsers(),
 ┊ 9┊10┊  },
 ┊10┊11┊} as IResolvers
```

##### Changed modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊type Query {
+┊ ┊2┊  me: User
 ┊2┊3┊  users: [User!]
 ┊3┊4┊}
 ┊4┊5┊
```

[}]: #

### Client authentication

To make things more convenient, we will create a dedicated authentication service under a separate module called `auth.service.tsx`. The auth service will take care of:

- Performing sign-in/sign-up against the server.
- Storing received auth token in local storage.
- Providing a wrapper around guarded routes that require authorization.

[{]: <helper> (diffStep 2.1 files="src/services, src/graphql" module="client")

#### [Step 2.1: Add auth service](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/e01ef20)

##### Changed src&#x2F;graphql&#x2F;fragments&#x2F;index.ts
```diff
@@ -1,2 +1,3 @@
 ┊1┊1┊export { default as chat } from './chat.fragment'
 ┊2┊2┊export { default as message } from './message.fragment'
+┊ ┊3┊export { default as user } from './user.fragment'
```

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;user.fragment.ts
```diff
@@ -0,0 +1,9 @@
+┊ ┊1┊import gql from 'graphql-tag'
+┊ ┊2┊
+┊ ┊3┊export default gql`
+┊ ┊4┊  fragment User on User {
+┊ ┊5┊    id
+┊ ┊6┊    name
+┊ ┊7┊    picture
+┊ ┊8┊  }
+┊ ┊9┊`
```

##### Added src&#x2F;graphql&#x2F;queries&#x2F;index.ts
```diff
@@ -0,0 +1 @@
+┊ ┊1┊export { default as me } from './me.query'
```

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

##### Added src&#x2F;services&#x2F;auth.service.tsx
```diff
@@ -0,0 +1,84 @@
+┊  ┊ 1┊import * as React from 'react'
+┊  ┊ 2┊import { useContext } from 'react'
+┊  ┊ 3┊import { useQuery } from 'react-apollo-hooks'
+┊  ┊ 4┊import { Redirect } from 'react-router-dom'
+┊  ┊ 5┊import store from '../apollo-client'
+┊  ┊ 6┊import * as queries from '../graphql/queries'
+┊  ┊ 7┊import { Me, User } from '../graphql/types'
+┊  ┊ 8┊
+┊  ┊ 9┊const MyContext = React.createContext<User.Fragment>(null)
+┊  ┊10┊
+┊  ┊11┊export const useMe = () => {
+┊  ┊12┊  return useContext(MyContext)
+┊  ┊13┊}
+┊  ┊14┊
+┊  ┊15┊export const withAuth = (Component: React.ComponentType) => {
+┊  ┊16┊  return props => {
+┊  ┊17┊    if (!getAuthHeader()) return <Redirect to="/sign-in" />
+┊  ┊18┊
+┊  ┊19┊    // Validating against server
+┊  ┊20┊    const myResult = useQuery<Me.Query>(queries.me, { suspend: true })
+┊  ┊21┊
+┊  ┊22┊    // Override TypeScript definition issue with the current version
+┊  ┊23┊    if (myResult.error) return <Redirect to="/sign-in" />
+┊  ┊24┊
+┊  ┊25┊    return (
+┊  ┊26┊      <MyContext.Provider value={myResult.data.me}>
+┊  ┊27┊        <Component {...props} />
+┊  ┊28┊      </MyContext.Provider>
+┊  ┊29┊    )
+┊  ┊30┊  }
+┊  ┊31┊}
+┊  ┊32┊
+┊  ┊33┊export const storeAuthHeader = (auth: string) => {
+┊  ┊34┊  localStorage.setItem('Authorization', auth)
+┊  ┊35┊}
+┊  ┊36┊
+┊  ┊37┊export const getAuthHeader = (): string | null => {
+┊  ┊38┊  return localStorage.getItem('Authorization') || null
+┊  ┊39┊}
+┊  ┊40┊
+┊  ┊41┊export const signIn = ({ username, password }) => {
+┊  ┊42┊  const auth = `Basic ${btoa(`${username}:${password}`)}`
+┊  ┊43┊
+┊  ┊44┊  return fetch(`${process.env.REACT_APP_SERVER_URL}/signin`, {
+┊  ┊45┊    method: 'POST',
+┊  ┊46┊    headers: {
+┊  ┊47┊      Authorization: auth,
+┊  ┊48┊    },
+┊  ┊49┊  }).then(res => {
+┊  ┊50┊    if (res.status < 400) {
+┊  ┊51┊      storeAuthHeader(auth)
+┊  ┊52┊    } else {
+┊  ┊53┊      return Promise.reject(res.statusText)
+┊  ┊54┊    }
+┊  ┊55┊  })
+┊  ┊56┊}
+┊  ┊57┊
+┊  ┊58┊export const signUp = ({ username, password, name }) => {
+┊  ┊59┊  return fetch(`${process.env.REACT_APP_SERVER_URL}/signup`, {
+┊  ┊60┊    method: 'POST',
+┊  ┊61┊    body: JSON.stringify({ name }),
+┊  ┊62┊    headers: {
+┊  ┊63┊      Accept: 'application/json',
+┊  ┊64┊      'Content-Type': 'application/json',
+┊  ┊65┊      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
+┊  ┊66┊    },
+┊  ┊67┊  })
+┊  ┊68┊}
+┊  ┊69┊
+┊  ┊70┊export const signOut = () => {
+┊  ┊71┊  localStorage.removeItem('Authorization')
+┊  ┊72┊
+┊  ┊73┊  return store.clearStore()
+┊  ┊74┊}
+┊  ┊75┊
+┊  ┊76┊export default {
+┊  ┊77┊  useMe,
+┊  ┊78┊  withAuth,
+┊  ┊79┊  storeAuthHeader,
+┊  ┊80┊  getAuthHeader,
+┊  ┊81┊  signIn,
+┊  ┊82┊  signUp,
+┊  ┊83┊  signOut,
+┊  ┊84┊}
```

[}]: #

The service also includes a `useMe()` GraphQL hook that will fetch the current user. Its definition is separate since it's used vastly and shared between many components.

Since we're using token oriented authentication, it means that any time we make a request to our GraphQL back-end we would need to authorize ourselves by sending this token. This can easily be done thanks to Apollo. By setting the client correctly we can automatically set the headers and parameters for each request that is being done.

[{]: <helper> (diffStep 2.1 files="src/apollo-client.ts" module="client")

#### [Step 2.1: Add auth service](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/e01ef20)

##### Changed src&#x2F;apollo-client.ts
```diff
@@ -1,10 +1,12 @@
 ┊ 1┊ 1┊import { InMemoryCache } from 'apollo-cache-inmemory'
 ┊ 2┊ 2┊import { ApolloClient } from 'apollo-client'
 ┊ 3┊ 3┊import { ApolloLink, split } from 'apollo-link'
+┊  ┊ 4┊import { setContext } from 'apollo-link-context'
 ┊ 4┊ 5┊import { HttpLink } from 'apollo-link-http'
 ┊ 5┊ 6┊import { WebSocketLink } from 'apollo-link-ws'
 ┊ 6┊ 7┊import { getMainDefinition } from 'apollo-utilities'
 ┊ 7┊ 8┊import { OperationDefinitionNode } from 'graphql'
+┊  ┊ 9┊import { getAuthHeader } from './services/auth.service'
 ┊ 8┊10┊
 ┊ 9┊11┊const httpUri = process.env.REACT_APP_SERVER_URL + '/graphql'
 ┊10┊12┊const wsUri = httpUri.replace(/^https?/, 'ws')
```
```diff
@@ -17,16 +19,30 @@
 ┊17┊19┊  uri: wsUri,
 ┊18┊20┊  options: {
 ┊19┊21┊    reconnect: true,
+┊  ┊22┊    connectionParams: () => ({
+┊  ┊23┊      authToken: getAuthHeader(),
+┊  ┊24┊    }),
 ┊20┊25┊  },
 ┊21┊26┊})
 ┊22┊27┊
+┊  ┊28┊const authLink = setContext((_, { headers }) => {
+┊  ┊29┊  const auth = getAuthHeader()
+┊  ┊30┊
+┊  ┊31┊  return {
+┊  ┊32┊    headers: {
+┊  ┊33┊      ...headers,
+┊  ┊34┊      Authorization: auth,
+┊  ┊35┊    },
+┊  ┊36┊  }
+┊  ┊37┊})
+┊  ┊38┊
 ┊23┊39┊const terminatingLink = split(
 ┊24┊40┊  ({ query }) => {
 ┊25┊41┊    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode
 ┊26┊42┊    return kind === 'OperationDefinition' && operation === 'subscription'
 ┊27┊43┊  },
 ┊28┊44┊  wsLink,
-┊29┊  ┊  httpLink,
+┊  ┊45┊  authLink.concat(httpLink),
 ┊30┊46┊)
 ┊31┊47┊
 ┊32┊48┊const link = ApolloLink.from([terminatingLink])
```

[}]: #

This would require us to install a package called `apollo-link-context`:

    $ yarn add apollo-link-context@1.0.14

Now that we have that mechanism implemented we need a way to access it. For that purpose we will be implementing a sign-in form and a sign-up form. Once we create a user and sign-in we will be promoted to the main chats list screen.

[{]: <helper> (diffStep 2.2 files="src/components/AuthScreen" module="client")

#### [Step 2.2: Implement auth components](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/a67226a)

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignInForm.tsx
```diff
@@ -0,0 +1,84 @@
+┊  ┊ 1┊import Button from '@material-ui/core/Button'
+┊  ┊ 2┊import TextField from '@material-ui/core/TextField'
+┊  ┊ 3┊import { History } from 'history'
+┊  ┊ 4┊import * as React from 'react'
+┊  ┊ 5┊import { useState } from 'react'
+┊  ┊ 6┊import { signIn } from '../../services/auth.service'
+┊  ┊ 7┊
+┊  ┊ 8┊interface SignInFormProps {
+┊  ┊ 9┊  history: History
+┊  ┊10┊}
+┊  ┊11┊
+┊  ┊12┊export default ({ history }: SignInFormProps) => {
+┊  ┊13┊  const [username, setUsername] = useState('')
+┊  ┊14┊  const [password, setPassword] = useState('')
+┊  ┊15┊  const [error, setError] = useState('')
+┊  ┊16┊
+┊  ┊17┊  const onUsernameChange = ({ target }) => {
+┊  ┊18┊    setError('')
+┊  ┊19┊    setUsername(target.value)
+┊  ┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  const onPasswordChange = ({ target }) => {
+┊  ┊23┊    setError('')
+┊  ┊24┊    setPassword(target.value)
+┊  ┊25┊  }
+┊  ┊26┊
+┊  ┊27┊  const maySignIn = () => {
+┊  ┊28┊    return !!(username && password)
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  const handleSignIn = () => {
+┊  ┊32┊    signIn({ username, password })
+┊  ┊33┊      .then(() => {
+┊  ┊34┊        history.push('/chats')
+┊  ┊35┊      })
+┊  ┊36┊      .catch(error => {
+┊  ┊37┊        setError(error.message || error)
+┊  ┊38┊      })
+┊  ┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  const handleSignUp = () => {
+┊  ┊42┊    history.push('/sign-up')
+┊  ┊43┊  }
+┊  ┊44┊
+┊  ┊45┊  return (
+┊  ┊46┊    <div className="SignInForm Screen">
+┊  ┊47┊      <form>
+┊  ┊48┊        <legend>Sign in</legend>
+┊  ┊49┊        <div style={{ width: '100%' }}>
+┊  ┊50┊          <TextField
+┊  ┊51┊            className="AuthScreen-text-field"
+┊  ┊52┊            label="Username"
+┊  ┊53┊            value={username}
+┊  ┊54┊            onChange={onUsernameChange}
+┊  ┊55┊            margin="normal"
+┊  ┊56┊            placeholder="Enter your username"
+┊  ┊57┊          />
+┊  ┊58┊          <TextField
+┊  ┊59┊            className="AuthScreen-text-field"
+┊  ┊60┊            label="Password"
+┊  ┊61┊            type="password"
+┊  ┊62┊            value={password}
+┊  ┊63┊            onChange={onPasswordChange}
+┊  ┊64┊            margin="normal"
+┊  ┊65┊            placeholder="Enter your password"
+┊  ┊66┊          />
+┊  ┊67┊        </div>
+┊  ┊68┊        <Button
+┊  ┊69┊          type="button"
+┊  ┊70┊          color="secondary"
+┊  ┊71┊          variant="contained"
+┊  ┊72┊          disabled={!maySignIn()}
+┊  ┊73┊          onClick={handleSignIn}
+┊  ┊74┊        >
+┊  ┊75┊          Sign in
+┊  ┊76┊        </Button>
+┊  ┊77┊        <div className="AuthScreen-error">{error}</div>
+┊  ┊78┊        <span className="AuthScreen-alternative">
+┊  ┊79┊          Don't have an account yet? <a onClick={handleSignUp}>Sign up!</a>
+┊  ┊80┊        </span>
+┊  ┊81┊      </form>
+┊  ┊82┊    </div>
+┊  ┊83┊  )
+┊  ┊84┊}
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignUpForm.tsx
```diff
@@ -0,0 +1,127 @@
+┊   ┊  1┊import Button from '@material-ui/core/Button'
+┊   ┊  2┊import TextField from '@material-ui/core/TextField'
+┊   ┊  3┊import { History } from 'history'
+┊   ┊  4┊import * as React from 'react'
+┊   ┊  5┊import { useState } from 'react'
+┊   ┊  6┊import { signUp } from '../../services/auth.service'
+┊   ┊  7┊
+┊   ┊  8┊interface SignUpFormProps {
+┊   ┊  9┊  history: History
+┊   ┊ 10┊}
+┊   ┊ 11┊
+┊   ┊ 12┊export default ({ history }: SignUpFormProps) => {
+┊   ┊ 13┊  const [name, setName] = useState('')
+┊   ┊ 14┊  const [username, setUsername] = useState('')
+┊   ┊ 15┊  const [oldPassword, setOldPassword] = useState('')
+┊   ┊ 16┊  const [password, setPassword] = useState('')
+┊   ┊ 17┊  const [error, setError] = useState('')
+┊   ┊ 18┊
+┊   ┊ 19┊  const updateName = ({ target }) => {
+┊   ┊ 20┊    setError('')
+┊   ┊ 21┊    setName(target.value)
+┊   ┊ 22┊  }
+┊   ┊ 23┊
+┊   ┊ 24┊  const updateUsername = ({ target }) => {
+┊   ┊ 25┊    setError('')
+┊   ┊ 26┊    setUsername(target.value)
+┊   ┊ 27┊  }
+┊   ┊ 28┊
+┊   ┊ 29┊  const updateOldPassword = ({ target }) => {
+┊   ┊ 30┊    setError('')
+┊   ┊ 31┊    setOldPassword(target.value)
+┊   ┊ 32┊  }
+┊   ┊ 33┊
+┊   ┊ 34┊  const updateNewPassword = ({ target }) => {
+┊   ┊ 35┊    setError('')
+┊   ┊ 36┊    setPassword(target.value)
+┊   ┊ 37┊  }
+┊   ┊ 38┊
+┊   ┊ 39┊  const maySignUp = () => {
+┊   ┊ 40┊    return !!(name && username && oldPassword && oldPassword === password)
+┊   ┊ 41┊  }
+┊   ┊ 42┊
+┊   ┊ 43┊  const handleSignUp = () => {
+┊   ┊ 44┊    signUp({ username, password, name })
+┊   ┊ 45┊      .then(() => {
+┊   ┊ 46┊        history.push('/sign-in')
+┊   ┊ 47┊      })
+┊   ┊ 48┊      .catch(error => {
+┊   ┊ 49┊        setError(error.message || error)
+┊   ┊ 50┊      })
+┊   ┊ 51┊  }
+┊   ┊ 52┊
+┊   ┊ 53┊  const handleSignIn = () => {
+┊   ┊ 54┊    history.push('/sign-in')
+┊   ┊ 55┊  }
+┊   ┊ 56┊
+┊   ┊ 57┊  return (
+┊   ┊ 58┊    <div className="SignUpForm Screen">
+┊   ┊ 59┊      <form>
+┊   ┊ 60┊        <legend>Sign up</legend>
+┊   ┊ 61┊        <div
+┊   ┊ 62┊          style={{
+┊   ┊ 63┊            float: 'left',
+┊   ┊ 64┊            width: 'calc(50% - 10px)',
+┊   ┊ 65┊            paddingRight: '10px',
+┊   ┊ 66┊          }}
+┊   ┊ 67┊        >
+┊   ┊ 68┊          <TextField
+┊   ┊ 69┊            className="AuthScreen-text-field"
+┊   ┊ 70┊            label="Name"
+┊   ┊ 71┊            value={name}
+┊   ┊ 72┊            onChange={updateName}
+┊   ┊ 73┊            autoComplete="off"
+┊   ┊ 74┊            margin="normal"
+┊   ┊ 75┊          />
+┊   ┊ 76┊          <TextField
+┊   ┊ 77┊            className="AuthScreen-text-field"
+┊   ┊ 78┊            label="Username"
+┊   ┊ 79┊            value={username}
+┊   ┊ 80┊            onChange={updateUsername}
+┊   ┊ 81┊            autoComplete="off"
+┊   ┊ 82┊            margin="normal"
+┊   ┊ 83┊          />
+┊   ┊ 84┊        </div>
+┊   ┊ 85┊        <div
+┊   ┊ 86┊          style={{
+┊   ┊ 87┊            float: 'right',
+┊   ┊ 88┊            width: 'calc(50% - 10px)',
+┊   ┊ 89┊            paddingLeft: '10px',
+┊   ┊ 90┊          }}
+┊   ┊ 91┊        >
+┊   ┊ 92┊          <TextField
+┊   ┊ 93┊            className="AuthScreen-text-field"
+┊   ┊ 94┊            label="Old password"
+┊   ┊ 95┊            type="password"
+┊   ┊ 96┊            value={oldPassword}
+┊   ┊ 97┊            onChange={updateOldPassword}
+┊   ┊ 98┊            autoComplete="off"
+┊   ┊ 99┊            margin="normal"
+┊   ┊100┊          />
+┊   ┊101┊          <TextField
+┊   ┊102┊            className="AuthScreen-text-field"
+┊   ┊103┊            label="New password"
+┊   ┊104┊            type="password"
+┊   ┊105┊            value={password}
+┊   ┊106┊            onChange={updateNewPassword}
+┊   ┊107┊            autoComplete="off"
+┊   ┊108┊            margin="normal"
+┊   ┊109┊          />
+┊   ┊110┊        </div>
+┊   ┊111┊        <Button
+┊   ┊112┊          type="button"
+┊   ┊113┊          color="secondary"
+┊   ┊114┊          variant="contained"
+┊   ┊115┊          disabled={!maySignUp()}
+┊   ┊116┊          onClick={handleSignUp}
+┊   ┊117┊        >
+┊   ┊118┊          Sign up
+┊   ┊119┊        </Button>
+┊   ┊120┊        <div className="AuthScreen-error">{error}</div>
+┊   ┊121┊        <span className="AuthScreen-alternative">
+┊   ┊122┊          Already have an accout? <a onClick={handleSignIn}>Sign in!</a>
+┊   ┊123┊        </span>
+┊   ┊124┊      </form>
+┊   ┊125┊    </div>
+┊   ┊126┊  )
+┊   ┊127┊}
```

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,118 @@
+┊   ┊  1┊import * as React from 'react'
+┊   ┊  2┊import { RouteComponentProps } from 'react-router-dom'
+┊   ┊  3┊import { Route } from 'react-router-dom'
+┊   ┊  4┊import styled from 'styled-components'
+┊   ┊  5┊import AnimatedSwitch from '../AnimatedSwitch'
+┊   ┊  6┊import SignInForm from './SignInForm'
+┊   ┊  7┊import SignUpForm from './SignUpForm'
+┊   ┊  8┊
+┊   ┊  9┊const Style = styled.div`
+┊   ┊ 10┊  background: radial-gradient(rgb(34, 65, 67), rgb(17, 48, 50)),
+┊   ┊ 11┊    url(/assets/chat-background.jpg) no-repeat;
+┊   ┊ 12┊  background-size: cover;
+┊   ┊ 13┊  background-blend-mode: multiply;
+┊   ┊ 14┊  color: white;
+┊   ┊ 15┊
+┊   ┊ 16┊  .AuthScreen-intro {
+┊   ┊ 17┊    height: 265px;
+┊   ┊ 18┊  }
+┊   ┊ 19┊
+┊   ┊ 20┊  .AuthScreen-icon {
+┊   ┊ 21┊    width: 125px;
+┊   ┊ 22┊    height: auto;
+┊   ┊ 23┊    margin-left: auto;
+┊   ┊ 24┊    margin-right: auto;
+┊   ┊ 25┊    padding-top: 70px;
+┊   ┊ 26┊    display: block;
+┊   ┊ 27┊  }
+┊   ┊ 28┊
+┊   ┊ 29┊  .AuthScreen-title {
+┊   ┊ 30┊    width: 100%;
+┊   ┊ 31┊    text-align: center;
+┊   ┊ 32┊    color: white;
+┊   ┊ 33┊  }
+┊   ┊ 34┊
+┊   ┊ 35┊  .AuthScreen-text-field {
+┊   ┊ 36┊    width: 100%;
+┊   ┊ 37┊    position: relative;
+┊   ┊ 38┊  }
+┊   ┊ 39┊
+┊   ┊ 40┊  .AuthScreen-text-field > div::before {
+┊   ┊ 41┊    border-color: white !important;
+┊   ┊ 42┊  }
+┊   ┊ 43┊
+┊   ┊ 44┊  .AuthScreen-error {
+┊   ┊ 45┊    position: absolute;
+┊   ┊ 46┊    color: red;
+┊   ┊ 47┊    font-size: 15px;
+┊   ┊ 48┊    margin-top: 20px;
+┊   ┊ 49┊  }
+┊   ┊ 50┊
+┊   ┊ 51┊  .AuthScreen-alternative {
+┊   ┊ 52┊    position: absolute;
+┊   ┊ 53┊    bottom: 10px;
+┊   ┊ 54┊    left: 10px;
+┊   ┊ 55┊
+┊   ┊ 56┊    a {
+┊   ┊ 57┊      color: var(--secondary-bg);
+┊   ┊ 58┊    }
+┊   ┊ 59┊  }
+┊   ┊ 60┊
+┊   ┊ 61┊  .Screen {
+┊   ┊ 62┊    height: calc(100% - 265px);
+┊   ┊ 63┊  }
+┊   ┊ 64┊
+┊   ┊ 65┊  form {
+┊   ┊ 66┊    padding: 20px;
+┊   ┊ 67┊
+┊   ┊ 68┊    > div {
+┊   ┊ 69┊      padding-bottom: 35px;
+┊   ┊ 70┊    }
+┊   ┊ 71┊  }
+┊   ┊ 72┊
+┊   ┊ 73┊  legend {
+┊   ┊ 74┊    font-weight: bold;
+┊   ┊ 75┊    color: white;
+┊   ┊ 76┊  }
+┊   ┊ 77┊
+┊   ┊ 78┊  label {
+┊   ┊ 79┊    color: white !important;
+┊   ┊ 80┊  }
+┊   ┊ 81┊
+┊   ┊ 82┊  input {
+┊   ┊ 83┊    color: white;
+┊   ┊ 84┊
+┊   ┊ 85┊    &::placeholder {
+┊   ┊ 86┊      color: var(--primary-bg);
+┊   ┊ 87┊    }
+┊   ┊ 88┊  }
+┊   ┊ 89┊
+┊   ┊ 90┊  button {
+┊   ┊ 91┊    width: 100px;
+┊   ┊ 92┊    display: block;
+┊   ┊ 93┊    margin-left: auto;
+┊   ┊ 94┊    margin-right: auto;
+┊   ┊ 95┊    background-color: var(--secondary-bg) !important;
+┊   ┊ 96┊
+┊   ┊ 97┊    &[disabled] {
+┊   ┊ 98┊      color: #38a81c;
+┊   ┊ 99┊    }
+┊   ┊100┊
+┊   ┊101┊    &:not([disabled]) {
+┊   ┊102┊      color: white;
+┊   ┊103┊    }
+┊   ┊104┊  }
+┊   ┊105┊`
+┊   ┊106┊
+┊   ┊107┊export default ({ history, location }: RouteComponentProps) => (
+┊   ┊108┊  <Style className="AuthScreen Screen">
+┊   ┊109┊    <div className="AuthScreen-intro">
+┊   ┊110┊      <img src="assets/whatsapp-icon.png" className="AuthScreen-icon" />
+┊   ┊111┊      <h2 className="AuthScreen-title">WhatsApp Clone</h2>
+┊   ┊112┊    </div>
+┊   ┊113┊    <AnimatedSwitch>
+┊   ┊114┊      <Route exact path="/sign-in" component={SignInForm} />
+┊   ┊115┊      <Route exact path="/sign-up" component={SignUpForm} />
+┊   ┊116┊    </AnimatedSwitch>
+┊   ┊117┊  </Style>
+┊   ┊118┊)
```

[}]: #

If you'll look at the main AuthScreen component you'll see that we use a router to alternate between the sign-in and the sign-up forms. That's the meaning behind a Switch component. However, you can also notice that we use an AnimatedSwitch. As it sounds, this component will ensure that transition between routes is animated. This upgrade our UX in the app, and it is also designated to be used across other routes. If so, let's implement it. First we will need to install a package called `react-router-transition`:

    $ yarn add react-router-transition@1.2.1

This will enable the transition between the routes. However, we will need to specify the characteristics of the transition, so, let's implement our own version of AnimatedSwitch:

[{]: <helper> (diffStep 2.2 files="src/components/AnimatedSwitch" module="client")

#### [Step 2.2: Implement auth components](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/a67226a)

##### Added src&#x2F;components&#x2F;AnimatedSwitch.tsx
```diff
@@ -0,0 +1,30 @@
+┊  ┊ 1┊import styled from 'styled-components'
+┊  ┊ 2┊import { AnimatedSwitch, spring } from 'react-router-transition'
+┊  ┊ 3┊
+┊  ┊ 4┊const glide = val =>
+┊  ┊ 5┊  spring(val, {
+┊  ┊ 6┊    stiffness: 174,
+┊  ┊ 7┊    damping: 24,
+┊  ┊ 8┊  })
+┊  ┊ 9┊
+┊  ┊10┊const mapStyles = styles => ({
+┊  ┊11┊  transform: `translateX(${styles.offset}%)`,
+┊  ┊12┊})
+┊  ┊13┊
+┊  ┊14┊export default styled(AnimatedSwitch).attrs(() => ({
+┊  ┊15┊  atEnter: { offset: 100 },
+┊  ┊16┊  atLeave: { offset: glide(-100) },
+┊  ┊17┊  atActive: { offset: glide(0) },
+┊  ┊18┊  mapStyles,
+┊  ┊19┊}))`
+┊  ┊20┊  position: relative;
+┊  ┊21┊  overflow: hidden;
+┊  ┊22┊  width: 100%;
+┊  ┊23┊  height: 100%;
+┊  ┊24┊  > div {
+┊  ┊25┊    position: absolute;
+┊  ┊26┊    overflow: hidden;
+┊  ┊27┊    width: 100%;
+┊  ┊28┊    height: 100%;
+┊  ┊29┊  }
+┊  ┊30┊`
```

[}]: #

As shown in the screenshot at the top of this page, the auth screen includes few assets that we should download: a background picture and a logo. Please download the assets below and save them in the `public/assets` directory as `chat-background.jpg` and `whatsapp-icon.jpg` respectively:

![chat-background.jpg](https://user-images.githubusercontent.com/7648874/51983290-3f49a080-24d3-11e9-9de9-cf57354d1e3a.jpg)

![whatsapp-icon.jpg](https://user-images.githubusercontent.com/7648874/52662552-768e6780-2f3f-11e9-931c-36a5c13ca49b.png)

So following that, we would need to define a router that will handle changes in routes. We will be using `react-router-dom`:

    $ yarn add react-router-dom@4.3.1

Now that we have it let's define our routes. Note how we take advantage of the `withAuth()` method to guard our routes and make them available only to users who are authorized:

[{]: <helper> (diffStep 2.3 files="src/App" module="client")

#### [Step 2.3: Create router with guarded routes](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/79ff9eb)

##### Changed src&#x2F;App.tsx
```diff
@@ -1,14 +1,20 @@
-┊ 1┊  ┊import React, { Component } from 'react';
+┊  ┊ 1┊import * as React from 'react'
+┊  ┊ 2┊import { BrowserRouter, Route, Redirect } from 'react-router-dom'
+┊  ┊ 3┊import AnimatedSwitch from './components/AnimatedSwitch'
+┊  ┊ 4┊import AuthScreen from './components/AuthScreen'
 ┊ 2┊ 5┊import ChatsListScreen from './components/ChatsListScreen'
+┊  ┊ 6┊import { withAuth } from './services/auth.service'
 ┊ 3┊ 7┊
-┊ 4┊  ┊class App extends Component {
-┊ 5┊  ┊  render() {
-┊ 6┊  ┊    return (
-┊ 7┊  ┊      <div className="App">
-┊ 8┊  ┊        <ChatsListScreen />
-┊ 9┊  ┊      </div>
-┊10┊  ┊    );
-┊11┊  ┊  }
-┊12┊  ┊}
+┊  ┊ 8┊const RedirectToChats = () => (
+┊  ┊ 9┊  <Redirect to="/chats" />
+┊  ┊10┊)
 ┊13┊11┊
-┊14┊  ┊export default App;
+┊  ┊12┊export default () => (
+┊  ┊13┊  <BrowserRouter>
+┊  ┊14┊    <AnimatedSwitch>
+┊  ┊15┊      <Route exact path="/sign-(in|up)" component={AuthScreen} />
+┊  ┊16┊      <Route exact path="/chats" component={withAuth(ChatsListScreen)} />
+┊  ┊17┊      <Route component={RedirectToChats} />
+┊  ┊18┊    </AnimatedSwitch>
+┊  ┊19┊  </BrowserRouter>
+┊  ┊20┊)
```

[}]: #

Since in our auth service we basically check if the user is logged in by actually querying the server with a React hook, we will need to use a Suspense component that will catch the pending request.

[{]: <helper> (diffStep 2.3 files="src/index" module="client")

#### [Step 2.3: Create router with guarded routes](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/79ff9eb)

##### Changed src&#x2F;index.tsx
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
 ┊2┊2┊import React from 'react';
+┊ ┊3┊import { Suspense } from 'react'
 ┊3┊4┊import ReactDOM from 'react-dom';
 ┊4┊5┊import { ApolloProvider } from 'react-apollo-hooks';
 ┊5┊6┊import './index.css';
```
```diff
@@ -20,7 +21,9 @@
 ┊20┊21┊ReactDOM.render(
 ┊21┊22┊  <MuiThemeProvider theme={theme}>
 ┊22┊23┊    <ApolloProvider client={apolloClient}>
-┊23┊  ┊      <App />
+┊  ┊24┊      <Suspense fallback={null}>
+┊  ┊25┊        <App />
+┊  ┊26┊      </Suspense>
 ┊24┊27┊    </ApolloProvider>
 ┊25┊28┊  </MuiThemeProvider>
 ┊26┊29┊, document.getElementById('root'));
```

[}]: #

> It's highly recommended to go through the [docs of Suspense](https://reactjs.org/docs/react-api.html#reactsuspense) before you proceed if you're not familiar with it.

Perfect. Now we can sign-in and sign-up, and we can view chats which belong to us. Now we're gonna implement the settings screen, where we will be able to set our profile details, such as name and picture. Let's keep the image uploading thing for a bit later, we will focus on the component itself first. The settings screen layout includes:

- A navbar.
- A form with inputs.

Accordingly, the implementation of the screen should look like so:

[{]: <helper> (diffStep 2.4 files="src/components" module="client")

#### [Step 2.4: Implement settings screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/2ebdaf2)

##### Added src&#x2F;components&#x2F;SettingsScreen&#x2F;SettingsForm.tsx
```diff
@@ -0,0 +1,127 @@
+┊   ┊  1┊import TextField from '@material-ui/core/TextField'
+┊   ┊  2┊import EditIcon from '@material-ui/icons/Edit'
+┊   ┊  3┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  4┊import gql from 'graphql-tag'
+┊   ┊  5┊import * as React from 'react'
+┊   ┊  6┊import { useEffect, useState } from 'react'
+┊   ┊  7┊import { useMutation } from 'react-apollo-hooks'
+┊   ┊  8┊import { RouteComponentProps } from 'react-router-dom'
+┊   ┊  9┊import styled from 'styled-components'
+┊   ┊ 10┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 11┊import { SettingsFormMutation } from '../../graphql/types'
+┊   ┊ 12┊import { useMe } from '../../services/auth.service'
+┊   ┊ 13┊import Navbar from '../Navbar'
+┊   ┊ 14┊import SettingsNavbar from './SettingsNavbar'
+┊   ┊ 15┊
+┊   ┊ 16┊const Style = styled.div`
+┊   ┊ 17┊  .SettingsForm-picture {
+┊   ┊ 18┊    max-width: 300px;
+┊   ┊ 19┊    display: block;
+┊   ┊ 20┊    margin: auto;
+┊   ┊ 21┊    margin-top: 50px;
+┊   ┊ 22┊
+┊   ┊ 23┊    img {
+┊   ┊ 24┊      object-fit: cover;
+┊   ┊ 25┊      border-radius: 50%;
+┊   ┊ 26┊      margin-bottom: -34px;
+┊   ┊ 27┊      width: 300px;
+┊   ┊ 28┊      height: 300px;
+┊   ┊ 29┊    }
+┊   ┊ 30┊
+┊   ┊ 31┊    svg {
+┊   ┊ 32┊      float: right;
+┊   ┊ 33┊      font-size: 30px;
+┊   ┊ 34┊      opacity: 0.5;
+┊   ┊ 35┊      border-left: black solid 1px;
+┊   ┊ 36┊      padding-left: 5px;
+┊   ┊ 37┊      cursor: pointer;
+┊   ┊ 38┊    }
+┊   ┊ 39┊  }
+┊   ┊ 40┊
+┊   ┊ 41┊  .SettingsForm-name-input {
+┊   ┊ 42┊    display: block;
+┊   ┊ 43┊    margin: auto;
+┊   ┊ 44┊    width: calc(100% - 50px);
+┊   ┊ 45┊    margin-top: 50px;
+┊   ┊ 46┊
+┊   ┊ 47┊    > div {
+┊   ┊ 48┊      width: 100%;
+┊   ┊ 49┊    }
+┊   ┊ 50┊  }
+┊   ┊ 51┊`
+┊   ┊ 52┊
+┊   ┊ 53┊const mutation = gql`
+┊   ┊ 54┊  mutation SettingsFormMutation($name: String, $picture: String) {
+┊   ┊ 55┊    updateUser(name: $name, picture: $picture) {
+┊   ┊ 56┊      ...User
+┊   ┊ 57┊    }
+┊   ┊ 58┊  }
+┊   ┊ 59┊  ${fragments.user}
+┊   ┊ 60┊`
+┊   ┊ 61┊
+┊   ┊ 62┊export default ({ history }: RouteComponentProps) => {
+┊   ┊ 63┊  const me = useMe()
+┊   ┊ 64┊  const [myName, setMyName] = useState(me.name)
+┊   ┊ 65┊  const [myPicture, setMyPicture] = useState(me.picture)
+┊   ┊ 66┊
+┊   ┊ 67┊  const updateUser = useMutation<SettingsFormMutation.Mutation, SettingsFormMutation.Variables>(
+┊   ┊ 68┊    mutation,
+┊   ┊ 69┊    {
+┊   ┊ 70┊      variables: { name: myName, picture: myPicture },
+┊   ┊ 71┊      optimisticResponse: {
+┊   ┊ 72┊        __typename: 'Mutation',
+┊   ┊ 73┊        updateUser: {
+┊   ┊ 74┊          __typename: 'User',
+┊   ┊ 75┊          id: me.id,
+┊   ┊ 76┊          picture: myPicture,
+┊   ┊ 77┊          name: myName,
+┊   ┊ 78┊        },
+┊   ┊ 79┊      },
+┊   ┊ 80┊      update: (client, { data: { updateUser } }) => {
+┊   ┊ 81┊        me.picture = myPicture
+┊   ┊ 82┊        me.name = myPicture
+┊   ┊ 83┊
+┊   ┊ 84┊        client.writeFragment({
+┊   ┊ 85┊          id: defaultDataIdFromObject(me),
+┊   ┊ 86┊          fragment: fragments.user,
+┊   ┊ 87┊          data: me,
+┊   ┊ 88┊        })
+┊   ┊ 89┊      },
+┊   ┊ 90┊    },
+┊   ┊ 91┊  )
+┊   ┊ 92┊
+┊   ┊ 93┊  useEffect(
+┊   ┊ 94┊    () => {
+┊   ┊ 95┊      if (myPicture !== me.picture) {
+┊   ┊ 96┊        updateUser()
+┊   ┊ 97┊      }
+┊   ┊ 98┊    },
+┊   ┊ 99┊    [myPicture],
+┊   ┊100┊  )
+┊   ┊101┊
+┊   ┊102┊  const updateName = ({ target }) => {
+┊   ┊103┊    setMyName(target.value)
+┊   ┊104┊  }
+┊   ┊105┊
+┊   ┊106┊  const updatePicture = async () => {
+┊   ┊107┊    // TODO: Implement
+┊   ┊108┊  }
+┊   ┊109┊
+┊   ┊110┊  return (
+┊   ┊111┊    <Style className={name}>
+┊   ┊112┊      <div className="SettingsForm-picture">
+┊   ┊113┊        <img src={myPicture || '/assets/default-profile-pic.jpg'} />
+┊   ┊114┊        <EditIcon onClick={updatePicture} />
+┊   ┊115┊      </div>
+┊   ┊116┊      <TextField
+┊   ┊117┊        className="SettingsForm-name-input"
+┊   ┊118┊        label="Name"
+┊   ┊119┊        value={myName}
+┊   ┊120┊        onChange={updateName}
+┊   ┊121┊        onBlur={updateUser}
+┊   ┊122┊        margin="normal"
+┊   ┊123┊        placeholder="Enter your name"
+┊   ┊124┊      />
+┊   ┊125┊    </Style>
+┊   ┊126┊  )
+┊   ┊127┊}
```

##### Added src&#x2F;components&#x2F;SettingsScreen&#x2F;SettingsNavbar.tsx
```diff
@@ -0,0 +1,49 @@
+┊  ┊ 1┊import Button from '@material-ui/core/Button'
+┊  ┊ 2┊import ArrowBackIcon from '@material-ui/icons/ArrowBack'
+┊  ┊ 3┊import { History } from 'history'
+┊  ┊ 4┊import * as React from 'react'
+┊  ┊ 5┊import styled from 'styled-components'
+┊  ┊ 6┊
+┊  ┊ 7┊const Style = styled.div`
+┊  ┊ 8┊  padding: 0;
+┊  ┊ 9┊  display: flex;
+┊  ┊10┊  flex-direction: row;
+┊  ┊11┊  margin-left: -20px;
+┊  ┊12┊
+┊  ┊13┊  .SettingsNavbar-title {
+┊  ┊14┊    line-height: 56px;
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  .SettingsNavbar-back-button {
+┊  ┊18┊    color: var(--primary-text);
+┊  ┊19┊  }
+┊  ┊20┊
+┊  ┊21┊  .SettingsNavbar-picture {
+┊  ┊22┊    height: 40px;
+┊  ┊23┊    width: 40px;
+┊  ┊24┊    margin-top: 3px;
+┊  ┊25┊    margin-left: -22px;
+┊  ┊26┊    object-fit: cover;
+┊  ┊27┊    padding: 5px;
+┊  ┊28┊    border-radius: 50%;
+┊  ┊29┊  }
+┊  ┊30┊`
+┊  ┊31┊
+┊  ┊32┊interface SettingsNavbarProps {
+┊  ┊33┊  history: History
+┊  ┊34┊}
+┊  ┊35┊
+┊  ┊36┊export default ({ history }: SettingsNavbarProps) => {
+┊  ┊37┊  const navToChats = () => {
+┊  ┊38┊    history.push('/chats')
+┊  ┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  return (
+┊  ┊42┊    <Style className={name}>
+┊  ┊43┊      <Button className="SettingsNavbar-back-button" onClick={navToChats}>
+┊  ┊44┊        <ArrowBackIcon />
+┊  ┊45┊      </Button>
+┊  ┊46┊      <div className="SettingsNavbar-title">Settings</div>
+┊  ┊47┊    </Style>
+┊  ┊48┊  )
+┊  ┊49┊}
```

##### Added src&#x2F;components&#x2F;SettingsScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊import * as React from 'react'
+┊  ┊ 2┊import { Suspense } from 'react'
+┊  ┊ 3┊import { RouteComponentProps } from 'react-router-dom'
+┊  ┊ 4┊import Navbar from '../Navbar'
+┊  ┊ 5┊import SettingsForm from './SettingsForm'
+┊  ┊ 6┊import SettingsNavbar from './SettingsNavbar'
+┊  ┊ 7┊
+┊  ┊ 8┊export default ({ history }: RouteComponentProps) => (
+┊  ┊ 9┊  <div className="SettingsScreen Screen">
+┊  ┊10┊    <Navbar>
+┊  ┊11┊      <SettingsNavbar history={history} />
+┊  ┊12┊    </Navbar>
+┊  ┊13┊    <Suspense fallback={null}>
+┊  ┊14┊      <SettingsForm />
+┊  ┊15┊    </Suspense>
+┊  ┊16┊  </div>
+┊  ┊17┊)
```

[}]: #

The `optimisticResponse` object is used to predict the response so we can have it immediately and the `update` callback is used to update the cache. Anytime we receive a response from our GraphQL back-end we should update the cache, otherwise the data presented in our app will be out-dated.

The user should be updated on 2 scenarios: Either we loose focus on the name input or we upload a new image. We used the [`useEffect`](https://reactjs.org/docs/hooks-effect.html) to determine changes in the profile picture URL and trigger an update.

We will need to update our back-end to have an `updateUser` mutation:

[{]: <helper> (diffStep 2.2 files="modules/user" module="server")

#### Step 2.2: Add updateUser() mutation

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
```diff
@@ -23,4 +23,23 @@
 ┊23┊23┊      .where('user.id != :id', { id: this.currentUser.id })
 ┊24┊24┊      .getMany()
 ┊25┊25┊  }
+┊  ┊26┊
+┊  ┊27┊  async updateUser({
+┊  ┊28┊    name,
+┊  ┊29┊    picture,
+┊  ┊30┊  }: {
+┊  ┊31┊    name?: string,
+┊  ┊32┊    picture?: string,
+┊  ┊33┊  } = {}) {
+┊  ┊34┊    if (name === this.currentUser.name && picture === this.currentUser.picture) {
+┊  ┊35┊      return this.currentUser;
+┊  ┊36┊    }
+┊  ┊37┊
+┊  ┊38┊    this.currentUser.name = name || this.currentUser.name;
+┊  ┊39┊    this.currentUser.picture = picture || this.currentUser.picture;
+┊  ┊40┊
+┊  ┊41┊    await this.repository.save(this.currentUser);
+┊  ┊42┊
+┊  ┊43┊    return this.currentUser;
+┊  ┊44┊  }
 ┊26┊45┊}
```

##### Changed modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -8,4 +8,10 @@
 ┊ 8┊ 8┊    me: (obj, args, { injector }) => injector.get(UserProvider).getMe(),
 ┊ 9┊ 9┊    users: (obj, args, { injector }) => injector.get(UserProvider).getUsers(),
 ┊10┊10┊  },
+┊  ┊11┊  Mutation: {
+┊  ┊12┊    updateUser: (obj, { name, picture }, { injector }) => injector.get(UserProvider).updateUser({
+┊  ┊13┊      name: name || '',
+┊  ┊14┊      picture: picture || '',
+┊  ┊15┊    }),
+┊  ┊16┊  },
 ┊11┊17┊} as IResolvers
```

##### Changed modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -3,6 +3,10 @@
 ┊ 3┊ 3┊  users: [User!]
 ┊ 4┊ 4┊}
 ┊ 5┊ 5┊
+┊  ┊ 6┊type Mutation {
+┊  ┊ 7┊  updateUser(name: String, picture: String): User!
+┊  ┊ 8┊}
+┊  ┊ 9┊
 ┊ 6┊10┊type User {
 ┊ 7┊11┊  id: ID!
 ┊ 8┊12┊  name: String
```

[}]: #

Remember that a user could be correlated to a chat, for example, if a user changes its information such as name or picture, the chat informationshould be changed as well. This means that we will need to listen to changes with a [subscription](https://www.apollographql.com/docs/react/advanced/subscriptions.html) and update our cache accordingly.

Since `react-apollo-hooks` doesn't have a built-in `useSubscription()` hook as for version `0.3.1`, we will implement a polyfill that will do exactly that. First we will ad a utility package:

    $ yarn add react-fast-compare@2.0.4

And then we will implement the `useSubscription()` hook:

[{]: <helper> (diffStep 2.5 files="src/polyfills" module="client")

#### [Step 2.5: Handle chat update subscription](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/e5a2cf5)

##### Added src&#x2F;polyfills&#x2F;react-apollo-hooks.ts
```diff
@@ -0,0 +1,72 @@
+┊  ┊ 1┊import { DataProxy } from 'apollo-cache'
+┊  ┊ 2┊import { OperationVariables, FetchPolicy } from 'apollo-client'
+┊  ┊ 3┊import { DocumentNode, GraphQLError } from 'graphql'
+┊  ┊ 4┊import { useEffect, useMemo, useRef, useState } from 'react'
+┊  ┊ 5┊import { useApolloClient } from 'react-apollo-hooks'
+┊  ┊ 6┊import * as isEqual from 'react-fast-compare'
+┊  ┊ 7┊
+┊  ┊ 8┊export type SubscriptionOptions<T, TVariables> = {
+┊  ┊ 9┊  variables?: TVariables
+┊  ┊10┊  fetchPolicy?: FetchPolicy
+┊  ┊11┊  onSubscriptionData?: (options?: { client?: DataProxy; subscriptionData?: T }) => any
+┊  ┊12┊}
+┊  ┊13┊
+┊  ┊14┊export const useSubscription = <T, TVariables = OperationVariables>(
+┊  ┊15┊  query: DocumentNode,
+┊  ┊16┊  options: SubscriptionOptions<T, TVariables> = {},
+┊  ┊17┊): {
+┊  ┊18┊  data: T | { [key: string]: void }
+┊  ┊19┊  error?: GraphQLError
+┊  ┊20┊  loading: boolean
+┊  ┊21┊} => {
+┊  ┊22┊  const onSubscriptionData = options.onSubscriptionData
+┊  ┊23┊  const prevOptions = useRef<typeof options | null>(null)
+┊  ┊24┊  const client = useApolloClient()
+┊  ┊25┊  const [data, setData] = useState<T | {}>({})
+┊  ┊26┊  const [error, setError] = useState<GraphQLError | null>(null)
+┊  ┊27┊  const [loading, setLoading] = useState<boolean>(true)
+┊  ┊28┊
+┊  ┊29┊  const subscriptionOptions = {
+┊  ┊30┊    query,
+┊  ┊31┊    variables: options.variables,
+┊  ┊32┊    fetchPolicy: options.fetchPolicy,
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  useEffect(
+┊  ┊36┊    () => {
+┊  ┊37┊      prevOptions.current = subscriptionOptions
+┊  ┊38┊      const subscription = client
+┊  ┊39┊        .subscribe<{ data: T }, TVariables>(subscriptionOptions)
+┊  ┊40┊        .subscribe({
+┊  ┊41┊          next: ({ data }) => {
+┊  ┊42┊            setData(data)
+┊  ┊43┊
+┊  ┊44┊            if (onSubscriptionData) {
+┊  ┊45┊              onSubscriptionData({ client, subscriptionData: data })
+┊  ┊46┊            }
+┊  ┊47┊          },
+┊  ┊48┊          error: err => {
+┊  ┊49┊            setError(err)
+┊  ┊50┊            setLoading(false)
+┊  ┊51┊          },
+┊  ┊52┊          complete: () => {
+┊  ┊53┊            setLoading(false)
+┊  ┊54┊          },
+┊  ┊55┊        })
+┊  ┊56┊
+┊  ┊57┊      return () => {
+┊  ┊58┊        subscription.unsubscribe()
+┊  ┊59┊      }
+┊  ┊60┊    },
+┊  ┊61┊    [isEqual(prevOptions.current, subscriptionOptions) ? prevOptions.current : subscriptionOptions],
+┊  ┊62┊  )
+┊  ┊63┊
+┊  ┊64┊  return useMemo(
+┊  ┊65┊    () => ({
+┊  ┊66┊      data,
+┊  ┊67┊      error,
+┊  ┊68┊      loading,
+┊  ┊69┊    }),
+┊  ┊70┊    [data, error, loading],
+┊  ┊71┊  )
+┊  ┊72┊}
```

[}]: #

Then we will define the subscription document and listen to it in a dedicated service called `cache.service`, which is responsible for updating the cache:

[{]: <helper> (diffStep 2.5 files="src/graphql, src/services/cache" module="client")

#### [Step 2.5: Handle chat update subscription](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/e5a2cf5)

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;chatUpdated.subscription.ts
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import * as fragments from '../fragments'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  subscription ChatUpdated {
+┊  ┊ 6┊    chatUpdated {
+┊  ┊ 7┊      ...Chat
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊  ${fragments.chat}
+┊  ┊11┊`
```

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;index.ts
```diff
@@ -0,0 +1 @@
+┊ ┊1┊export { default as chatUpdated } from './chatUpdated.subscription'
```

##### Added src&#x2F;services&#x2F;cache.service.tsx
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊  ┊ 2┊import * as fragments from '../graphql/fragments'
+┊  ┊ 3┊import * as subscriptions from '../graphql/subscriptions'
+┊  ┊ 4┊import { ChatUpdated } from '../graphql/types'
+┊  ┊ 5┊import { useSubscription } from '../polyfills/react-apollo-hooks'
+┊  ┊ 6┊
+┊  ┊ 7┊export const useSubscriptions = () => {
+┊  ┊ 8┊  useSubscription<ChatUpdated.Subscription>(subscriptions.chatUpdated, {
+┊  ┊ 9┊    onSubscriptionData: ({ client, subscriptionData: { chatUpdated } }) => {
+┊  ┊10┊      client.writeFragment({
+┊  ┊11┊        id: defaultDataIdFromObject(chatUpdated),
+┊  ┊12┊        fragment: fragments.chat,
+┊  ┊13┊        fragmentName: 'Chat',
+┊  ┊14┊        data: chatUpdated,
+┊  ┊15┊      })
+┊  ┊16┊    },
+┊  ┊17┊  })
+┊  ┊18┊}
```

[}]: #

We should listen to subscriptions only once we're logged-in, therefore let's use the `useSubscriptions()` hook that we've just created in the `auth.service`:

[{]: <helper> (diffStep 2.5 files="src/services/auth" module="client")

#### [Step 2.5: Handle chat update subscription](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/e5a2cf5)

##### Changed src&#x2F;services&#x2F;auth.service.tsx
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊import store from '../apollo-client'
 ┊ 6┊ 6┊import * as queries from '../graphql/queries'
 ┊ 7┊ 7┊import { Me, User } from '../graphql/types'
+┊  ┊ 8┊import { useSubscriptions } from './cache.service'
 ┊ 8┊ 9┊
 ┊ 9┊10┊const MyContext = React.createContext<User.Fragment>(null)
 ┊10┊11┊
```
```diff
@@ -22,6 +23,8 @@
 ┊22┊23┊    // Override TypeScript definition issue with the current version
 ┊23┊24┊    if (myResult.error) return <Redirect to="/sign-in" />
 ┊24┊25┊
+┊  ┊26┊    useSubscriptions()
+┊  ┊27┊
 ┊25┊28┊    return (
 ┊26┊29┊      <MyContext.Provider value={myResult.data.me}>
 ┊27┊30┊        <Component {...props} />
```

[}]: #

Now we will have to implement the subscription in our server. GraphQL subscriptions are a way to push data from the server to the clients that choose to listen to real time messages from the server. To trigger a subscription event we will use a method called `publish` which is used by a class called `PubSub`. Pubsub sits between your application's logic and the GraphQL subscriptions engine - it receives a publish command from your app logic and pushes it to your GraphQL execution engine. This is how it should look like in code, in relation to `chatUpdated` subscription:

[{]: <helper> (diffStep 2.3 module="server")

#### Step 2.3: Add chatUpdated subscription

##### Changed index.ts
```diff
@@ -21,11 +21,12 @@
 ┊21┊21┊  app.use(cors())
 ┊22┊22┊  app.use(bodyParser.json())
 ┊23┊23┊
-┊24┊  ┊  const { schema, context } = AppModule.forRoot({ app, connection })
+┊  ┊24┊  const { schema, context, subscriptions } = AppModule.forRoot({ app, connection })
 ┊25┊25┊
 ┊26┊26┊  const apollo = new ApolloServer({
 ┊27┊27┊    schema,
 ┊28┊28┊    context,
+┊  ┊29┊    subscriptions,
 ┊29┊30┊  })
 ┊30┊31┊
 ┊31┊32┊  apollo.applyMiddleware({
```

##### Changed modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { Injectable } from '@graphql-modules/di'
+┊ ┊2┊import { PubSub } from 'apollo-server-express'
 ┊2┊3┊import { Connection } from 'typeorm'
 ┊3┊4┊import { Chat } from '../../../entity/chat'
 ┊4┊5┊import { User } from '../../../entity/user'
```
```diff
@@ -8,6 +9,7 @@
 ┊ 8┊ 9┊@Injectable()
 ┊ 9┊10┊export class ChatProvider {
 ┊10┊11┊  constructor(
+┊  ┊12┊    private pubsub: PubSub,
 ┊11┊13┊    private connection: Connection,
 ┊12┊14┊    private userProvider: UserProvider,
 ┊13┊15┊    private authProvider: AuthProvider
```
```diff
@@ -108,4 +110,53 @@
 ┊108┊110┊
 ┊109┊111┊    return owner || null
 ┊110┊112┊  }
+┊   ┊113┊
+┊   ┊114┊  async filterChatAddedOrUpdated(chatAddedOrUpdated: Chat, creatorOrUpdaterId: string) {
+┊   ┊115┊    return (
+┊   ┊116┊      creatorOrUpdaterId !== this.currentUser.id &&
+┊   ┊117┊      chatAddedOrUpdated.listingMembers.some((user: User) => user.id === this.currentUser.id)
+┊   ┊118┊    )
+┊   ┊119┊  }
+┊   ┊120┊
+┊   ┊121┊  async updateUser({
+┊   ┊122┊    name,
+┊   ┊123┊    picture,
+┊   ┊124┊  }: {
+┊   ┊125┊    name?: string
+┊   ┊126┊    picture?: string
+┊   ┊127┊  } = {}) {
+┊   ┊128┊    await this.userProvider.updateUser({ name, picture })
+┊   ┊129┊
+┊   ┊130┊    const data = await this.connection
+┊   ┊131┊      .createQueryBuilder(User, 'user')
+┊   ┊132┊      .where('user.id = :id', { id: this.currentUser.id })
+┊   ┊133┊      // Get a list of the chats who have/had currentUser involved
+┊   ┊134┊      .innerJoinAndSelect(
+┊   ┊135┊        'user.allTimeMemberChats',
+┊   ┊136┊        'allTimeMemberChats',
+┊   ┊137┊        // Groups are unaffected
+┊   ┊138┊        'allTimeMemberChats.name IS NULL'
+┊   ┊139┊      )
+┊   ┊140┊      // We need to notify only those who get the chat listed (except currentUser of course)
+┊   ┊141┊      .innerJoin(
+┊   ┊142┊        'allTimeMemberChats.listingMembers',
+┊   ┊143┊        'listingMembers',
+┊   ┊144┊        'listingMembers.id != :currentUserId',
+┊   ┊145┊        {
+┊   ┊146┊          currentUserId: this.currentUser.id,
+┊   ┊147┊        }
+┊   ┊148┊      )
+┊   ┊149┊      .getOne()
+┊   ┊150┊
+┊   ┊151┊    const chatsAffected = (data && data.allTimeMemberChats) || []
+┊   ┊152┊
+┊   ┊153┊    chatsAffected.forEach(chat => {
+┊   ┊154┊      this.pubsub.publish('chatUpdated', {
+┊   ┊155┊        updaterId: this.currentUser.id,
+┊   ┊156┊        chatUpdated: chat,
+┊   ┊157┊      })
+┊   ┊158┊    })
+┊   ┊159┊
+┊   ┊160┊    return this.currentUser
+┊   ┊161┊  }
 ┊111┊162┊}
```

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -1,12 +1,28 @@
+┊  ┊ 1┊import { PubSub, withFilter } from 'apollo-server-express'
 ┊ 1┊ 2┊import { ModuleContext } from '@graphql-modules/core'
 ┊ 2┊ 3┊import { IResolvers } from '../../../types'
 ┊ 3┊ 4┊import { ChatProvider } from '../providers/chat.provider'
+┊  ┊ 5┊import { Chat } from '../../../entity/chat'
 ┊ 4┊ 6┊
 ┊ 5┊ 7┊export default {
 ┊ 6┊ 8┊  Query: {
 ┊ 7┊ 9┊    chats: (obj, args, { injector }) => injector.get(ChatProvider).getChats(),
 ┊ 8┊10┊    chat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).getChat(chatId),
 ┊ 9┊11┊  },
+┊  ┊12┊  Mutation: {
+┊  ┊13┊    updateUser: (obj, { name, picture }, { injector }) => injector.get(ChatProvider).updateUser({
+┊  ┊14┊      name: name || '',
+┊  ┊15┊      picture: picture || '',
+┊  ┊16┊    }),
+┊  ┊17┊  },
+┊  ┊18┊  Subscription: {
+┊  ┊19┊    chatUpdated: {
+┊  ┊20┊      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('chatUpdated'),
+┊  ┊21┊        (data: { chatUpdated: Chat, updaterId: string }, variables, { injector }: ModuleContext) =>
+┊  ┊22┊          data && injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatUpdated, data.updaterId)
+┊  ┊23┊      ),
+┊  ┊24┊    },
+┊  ┊25┊  },
 ┊10┊26┊  Chat: {
 ┊11┊27┊    name: (chat, args, { injector }) => injector.get(ChatProvider).getChatName(chat),
 ┊12┊28┊    picture: (chat, args, { injector }) => injector.get(ChatProvider).getChatPicture(chat),
```

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -3,6 +3,10 @@
 ┊ 3┊ 3┊  chat(chatId: ID!): Chat
 ┊ 4┊ 4┊}
 ┊ 5┊ 5┊
+┊  ┊ 6┊type Subscription {
+┊  ┊ 7┊  chatUpdated: Chat
+┊  ┊ 8┊}
+┊  ┊ 9┊
 ┊ 6┊10┊type Chat {
 ┊ 7┊11┊  #May be a chat or a group
 ┊ 8┊12┊  id: ID!
```

[}]: #

> See [official Apollo subscription docs page](https://www.apollographql.com/docs/apollo-server/features/subscriptions.html).

Note that we've added a second `updateUser()` resolver in addition to the one which already exists in the `user` module. Reason being is because we want to keep the `user` module independent from the `chat` module, and so we apply logic on top of the existing one. GQLModule's engine will execute the resolvers in the right order based on the injected dependencies tree, so you shouldn't worry much about execution.

I'd like to get back to the image uploading feature. Although it can be implemented manually, we will be using an external service for storing images. This is much more convenient: it will save us a lot of implementation, it's probably more secure, and it has built-in features such as transformation and projection.

We will be using [Cloudinary](https://cloudinary.com/) as our storage service. A Cloudinary instance should be set for each application separately, but for the sake of demonstration we will use an instance that we set up for the public, but just know **that you should never reveal the credentials of any service that you set up**.

First of all be sure to open an account and setup your basic app information in Cloudinary.

Then, add a new preset called `profile-pic` where we will be resettings uploaded images' dimensions to 300px by 300px. More information on how to do that can be found in [here](https://support.cloudinary.com/hc/en-us/articles/360004967272-Upload-Preset-Configuration).

![upload-picture-settings](https://user-images.githubusercontent.com/7648874/51096173-a984f480-17f5-11e9-893f-5227e2c564af.jpg)

Up next, we will implement the appropriate route in our app's server. The reason we don't upload the image directly to the cloud service directly from our application is because **we risk exposing some sensitive data regards the service and some users may abuse it**. We will start by installing the right packages:

    $ yarn add tmp@0.0.33 multer@1.4.1 cloudinary@1.13.2
    $ yarn add -D @types/tmp@0.0.33 @types/multer1.3.7

We will also write custom TypeScript definitions for the `cloudinary` package since they don't exist:

[{]: <helper> (diffStep 2.4 files="cloudinary.d.ts" module="server")

#### Step 2.4: Add /upload-profile-pic REST endpoint

##### Added cloudinary.d.ts
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊declare module 'cloudinary' {
+┊  ┊ 2┊  export function config(config: { cloud_name: string; api_key: string; api_secret: string }): void
+┊  ┊ 3┊
+┊  ┊ 4┊  export var v2: {
+┊  ┊ 5┊    uploader: {
+┊  ┊ 6┊      upload_stream: (callback?: (error: Error, result: any) => any) => NodeJS.WritableStream
+┊  ┊ 7┊      upload: (path: string, callback?: (error: Error, result: any) => any) => any
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊}
```

[}]: #

Then we will set the right API keys in the `.env` file:

[{]: <helper> (diffStep 2.4 files=".env" module="server")

#### Step 2.4: Add /upload-profile-pic REST endpoint

##### Added .env
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊# NEVER DEFINE HERE ONLY ON CLOUD
+┊ ┊2┊CLOUDINARY_URL=cloudinary://756494366771661:OttZILiLRKaB5tKR8F3vQhMrNRg@whatsapp-clone
```

[}]: #

The purpose of the `.env` file is to load environment variables into our app in a more comfortable way. For that to apply we will need to install and require a package which is called [`dotenv`](https://www.npmjs.com/package/dotenv).

    $ yarn add dotenv@6.2.0

[{]: <helper> (diffStep 2.4 files="index" module="server")

#### Step 2.4: Add /upload-profile-pic REST endpoint

##### Changed index.ts
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊require('dotenv').config()
+┊ ┊2┊
 ┊1┊3┊import 'reflect-metadata'
 ┊2┊4┊import { ApolloServer } from 'apollo-server-express'
 ┊3┊5┊import bodyParser from 'body-parser'
```

##### Changed modules&#x2F;user&#x2F;index.ts
```diff
@@ -1,18 +1,43 @@
+┊  ┊ 1┊/// <reference path="../../cloudinary.d.ts" />
 ┊ 1┊ 2┊import { GraphQLModule } from '@graphql-modules/core'
 ┊ 2┊ 3┊import { InjectFunction, ProviderScope } from '@graphql-modules/di'
 ┊ 3┊ 4┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 5┊import { Express } from 'express'
+┊  ┊ 6┊import multer from 'multer'
+┊  ┊ 7┊import tmp from 'tmp'
+┊  ┊ 8┊import cloudinary from 'cloudinary'
+┊  ┊ 9┊import { APP } from '../app.symbols'
 ┊ 4┊10┊import { AuthModule } from '../auth'
 ┊ 5┊11┊import { UserProvider } from './providers/user.provider'
 ┊ 6┊12┊
+┊  ┊13┊const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''
+┊  ┊14┊
 ┊ 7┊15┊export const UserModule = new GraphQLModule({
 ┊ 8┊16┊  name: 'User',
-┊ 9┊  ┊  imports: [
-┊10┊  ┊    AuthModule,
-┊11┊  ┊  ],
-┊12┊  ┊  providers: [
-┊13┊  ┊    UserProvider,
-┊14┊  ┊  ],
+┊  ┊17┊  imports: [AuthModule],
+┊  ┊18┊  providers: [UserProvider],
 ┊15┊19┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
 ┊16┊20┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
 ┊17┊21┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊22┊  middleware: InjectFunction(UserProvider, APP)((userProvider, app: Express) => {
+┊  ┊23┊    const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/)
+┊  ┊24┊
+┊  ┊25┊    if (match) {
+┊  ┊26┊      const [api_key, api_secret, cloud_name] = match.slice(1)
+┊  ┊27┊      cloudinary.config({ api_key, api_secret, cloud_name })
+┊  ┊28┊    }
+┊  ┊29┊
+┊  ┊30┊    const upload = multer({
+┊  ┊31┊      dest: tmp.dirSync({ unsafeCleanup: true }).name,
+┊  ┊32┊    })
+┊  ┊33┊
+┊  ┊34┊    app.post('/upload-profile-pic', upload.single('file'), async (req: any, res, done) => {
+┊  ┊35┊      try {
+┊  ┊36┊        res.json(await userProvider.uploadProfilePic(req.file.path))
+┊  ┊37┊      } catch (e) {
+┊  ┊38┊        done(e)
+┊  ┊39┊      }
+┊  ┊40┊    })
+┊  ┊41┊    return {}
+┊  ┊42┊  }),
 ┊18┊43┊})
```

[}]: #

> See [Cloudinary's NodeJS API](https://cloudinary.com/documentation/node_integration).
> See [API setup](https://cloudinary.com/documentation/solution_overview#account_and_api_setup).

And finally, we will implement a REST endpoint in the `user` module under `/upload-profile-pic`:

[{]: <helper> (diffStep 2.4 files="modules/user" module="server")

#### Step 2.4: Add /upload-profile-pic REST endpoint

##### Changed modules&#x2F;user&#x2F;index.ts
```diff
@@ -1,18 +1,43 @@
+┊  ┊ 1┊/// <reference path="../../cloudinary.d.ts" />
 ┊ 1┊ 2┊import { GraphQLModule } from '@graphql-modules/core'
 ┊ 2┊ 3┊import { InjectFunction, ProviderScope } from '@graphql-modules/di'
 ┊ 3┊ 4┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 5┊import { Express } from 'express'
+┊  ┊ 6┊import multer from 'multer'
+┊  ┊ 7┊import tmp from 'tmp'
+┊  ┊ 8┊import cloudinary from 'cloudinary'
+┊  ┊ 9┊import { APP } from '../app.symbols'
 ┊ 4┊10┊import { AuthModule } from '../auth'
 ┊ 5┊11┊import { UserProvider } from './providers/user.provider'
 ┊ 6┊12┊
+┊  ┊13┊const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''
+┊  ┊14┊
 ┊ 7┊15┊export const UserModule = new GraphQLModule({
 ┊ 8┊16┊  name: 'User',
-┊ 9┊  ┊  imports: [
-┊10┊  ┊    AuthModule,
-┊11┊  ┊  ],
-┊12┊  ┊  providers: [
-┊13┊  ┊    UserProvider,
-┊14┊  ┊  ],
+┊  ┊17┊  imports: [AuthModule],
+┊  ┊18┊  providers: [UserProvider],
 ┊15┊19┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
 ┊16┊20┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
 ┊17┊21┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊22┊  middleware: InjectFunction(UserProvider, APP)((userProvider, app: Express) => {
+┊  ┊23┊    const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/)
+┊  ┊24┊
+┊  ┊25┊    if (match) {
+┊  ┊26┊      const [api_key, api_secret, cloud_name] = match.slice(1)
+┊  ┊27┊      cloudinary.config({ api_key, api_secret, cloud_name })
+┊  ┊28┊    }
+┊  ┊29┊
+┊  ┊30┊    const upload = multer({
+┊  ┊31┊      dest: tmp.dirSync({ unsafeCleanup: true }).name,
+┊  ┊32┊    })
+┊  ┊33┊
+┊  ┊34┊    app.post('/upload-profile-pic', upload.single('file'), async (req: any, res, done) => {
+┊  ┊35┊      try {
+┊  ┊36┊        res.json(await userProvider.uploadProfilePic(req.file.path))
+┊  ┊37┊      } catch (e) {
+┊  ┊38┊        done(e)
+┊  ┊39┊      }
+┊  ┊40┊    })
+┊  ┊41┊    return {}
+┊  ┊42┊  }),
 ┊18┊43┊})
```

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { Injectable, ProviderScope } from '@graphql-modules/di'
+┊ ┊2┊import cloudinary from 'cloudinary'
 ┊2┊3┊import { Connection } from 'typeorm'
 ┊3┊4┊import { User } from '../../../entity/user'
 ┊4┊5┊import { AuthProvider } from '../../auth/providers/auth.provider'
```
```diff
@@ -42,4 +43,16 @@
 ┊42┊43┊
 ┊43┊44┊    return this.currentUser;
 ┊44┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  uploadProfilePic(filePath: string) {
+┊  ┊48┊    return new Promise((resolve, reject) => {
+┊  ┊49┊      cloudinary.v2.uploader.upload(filePath, (error, result) => {
+┊  ┊50┊        if (error) {
+┊  ┊51┊          reject(error)
+┊  ┊52┊        } else {
+┊  ┊53┊          resolve(result)
+┊  ┊54┊        }
+┊  ┊55┊      })
+┊  ┊56┊    })
+┊  ┊57┊  }
 ┊45┊58┊}
```

[}]: #

Now getting back to the client, we will implement a `picture.service` that will be responsible for uploading images in our application:

[{]: <helper> (diffStep 2.6 files="src/services/picture" module="client")

#### [Step 2.6: Implement image uploading](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/99fd034)

##### Added src&#x2F;services&#x2F;picture.service.tsx
```diff
@@ -0,0 +1,31 @@
+┊  ┊ 1┊import { getAuthHeader } from './auth.service'
+┊  ┊ 2┊
+┊  ┊ 3┊export const pickPicture = () => {
+┊  ┊ 4┊  return new Promise((resolve, reject) => {
+┊  ┊ 5┊    const input = document.createElement('input')
+┊  ┊ 6┊    input.type = 'file'
+┊  ┊ 7┊    input.accept = 'image/*'
+┊  ┊ 8┊    input.onchange = e => {
+┊  ┊ 9┊      const target = e.target as HTMLInputElement
+┊  ┊10┊      resolve(target.files[0])
+┊  ┊11┊    }
+┊  ┊12┊    input.onerror = reject
+┊  ┊13┊    input.click()
+┊  ┊14┊  })
+┊  ┊15┊}
+┊  ┊16┊
+┊  ┊17┊export const uploadProfilePicture = file => {
+┊  ┊18┊  const formData = new FormData()
+┊  ┊19┊  formData.append('file', file)
+┊  ┊20┊  formData.append('upload_preset', 'profile-pic')
+┊  ┊21┊
+┊  ┊22┊  return fetch(`${process.env.REACT_APP_SERVER_URL}/upload-profile-pic`, {
+┊  ┊23┊    method: 'POST',
+┊  ┊24┊    body: formData,
+┊  ┊25┊    headers: {
+┊  ┊26┊      Authorization: getAuthHeader(),
+┊  ┊27┊    }
+┊  ┊28┊  }).then(res => {
+┊  ┊29┊    return res.json()
+┊  ┊30┊  })
+┊  ┊31┊}
```

[}]: #

And we will use it in the settings screen:

[{]: <helper> (diffStep 2.6 files="src/components" module="client")

#### [Step 2.6: Implement image uploading](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/99fd034)

##### Changed src&#x2F;components&#x2F;SettingsScreen&#x2F;SettingsForm.tsx
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import * as fragments from '../../graphql/fragments'
 ┊11┊11┊import { SettingsFormMutation } from '../../graphql/types'
 ┊12┊12┊import { useMe } from '../../services/auth.service'
+┊  ┊13┊import { pickPicture, uploadProfilePicture } from '../../services/picture.service'
 ┊13┊14┊import Navbar from '../Navbar'
 ┊14┊15┊import SettingsNavbar from './SettingsNavbar'
 ┊15┊16┊
```
```diff
@@ -104,7 +105,13 @@
 ┊104┊105┊  }
 ┊105┊106┊
 ┊106┊107┊  const updatePicture = async () => {
-┊107┊   ┊    // TODO: Implement
+┊   ┊108┊    const file = await pickPicture()
+┊   ┊109┊
+┊   ┊110┊    if (!file) return
+┊   ┊111┊
+┊   ┊112┊    const { url } = await uploadProfilePicture(file)
+┊   ┊113┊
+┊   ┊114┊    setMyPicture(url)
 ┊108┊115┊  }
 ┊109┊116┊
 ┊110┊117┊  return (
```

[}]: #

The settings component is complete! We will connect it to the main flow by implementing the pop-over menu at the top right corner of the main screen where we will be able to navigate to the settings screen and sign-out:

[{]: <helper> (diffStep 2.7 module="client")

#### [Step 2.7: Make components navigatable](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/fcc5b70)

##### Changed src&#x2F;App.tsx
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import AnimatedSwitch from './components/AnimatedSwitch'
 ┊4┊4┊import AuthScreen from './components/AuthScreen'
 ┊5┊5┊import ChatsListScreen from './components/ChatsListScreen'
+┊ ┊6┊import SettingsScreen from './components/SettingsScreen'
 ┊6┊7┊import { withAuth } from './services/auth.service'
 ┊7┊8┊
 ┊8┊9┊const RedirectToChats = () => (
```
```diff
@@ -14,6 +15,7 @@
 ┊14┊15┊    <AnimatedSwitch>
 ┊15┊16┊      <Route exact path="/sign-(in|up)" component={AuthScreen} />
 ┊16┊17┊      <Route exact path="/chats" component={withAuth(ChatsListScreen)} />
+┊  ┊18┊      <Route exact path="/settings" component={withAuth(SettingsScreen)} />
 ┊17┊19┊      <Route component={RedirectToChats} />
 ┊18┊20┊    </AnimatedSwitch>
 ┊19┊21┊  </BrowserRouter>
```

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsNavbar.tsx
```diff
@@ -1,14 +1,95 @@
+┊  ┊ 1┊import Button from '@material-ui/core/Button'
+┊  ┊ 2┊import List from '@material-ui/core/List'
+┊  ┊ 3┊import ListItem from '@material-ui/core/ListItem'
+┊  ┊ 4┊import Popover from '@material-ui/core/Popover'
+┊  ┊ 5┊import MoreIcon from '@material-ui/icons/MoreVert'
+┊  ┊ 6┊import SignOutIcon from '@material-ui/icons/PowerSettingsNew'
+┊  ┊ 7┊import SettingsIcon from '@material-ui/icons/Settings'
+┊  ┊ 8┊import { History } from 'history'
 ┊ 1┊ 9┊import * as React from 'react'
+┊  ┊10┊import { useState } from 'react'
 ┊ 2┊11┊import styled from 'styled-components'
+┊  ┊12┊import { signOut } from '../../services/auth.service'
 ┊ 3┊13┊
 ┊ 4┊14┊const Style = styled.div`
+┊  ┊15┊  padding: 0;
+┊  ┊16┊  display: flex;
+┊  ┊17┊  flex-direction: row;
+┊  ┊18┊
 ┊ 5┊19┊  .ChatsNavbar-title {
-┊ 6┊  ┊    float: left;
+┊  ┊20┊    line-height: 56px;
+┊  ┊21┊  }
+┊  ┊22┊
+┊  ┊23┊  .ChatsNavbar-options-btn {
+┊  ┊24┊    float: right;
+┊  ┊25┊    height: 100%;
+┊  ┊26┊    font-size: 1.2em;
+┊  ┊27┊    margin-right: -15px;
+┊  ┊28┊    color: var(--primary-text);
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  .ChatsNavbar-rest {
+┊  ┊32┊    flex: 1;
+┊  ┊33┊    justify-content: flex-end;
+┊  ┊34┊  }
+┊  ┊35┊
+┊  ┊36┊  .ChatsNavbar-options-item svg {
+┊  ┊37┊    margin-right: 10px;
 ┊ 7┊38┊  }
 ┊ 8┊39┊`
 ┊ 9┊40┊
-┊10┊  ┊export default () => (
-┊11┊  ┊  <Style className="ChatsNavbar">
-┊12┊  ┊    <span className="ChatsNavbar-title">WhatsApp Clone</span>
-┊13┊  ┊  </Style>
-┊14┊  ┊)
+┊  ┊41┊interface ChatsNavbarProps {
+┊  ┊42┊  history: History
+┊  ┊43┊}
+┊  ┊44┊
+┊  ┊45┊export default ({ history }: ChatsNavbarProps) => {
+┊  ┊46┊  const [popped, setPopped] = useState(false)
+┊  ┊47┊
+┊  ┊48┊  const navToSettings = () => {
+┊  ┊49┊    setPopped(false)
+┊  ┊50┊    history.push('/settings')
+┊  ┊51┊  }
+┊  ┊52┊
+┊  ┊53┊  const handleSignOut = () => {
+┊  ┊54┊    setPopped(false)
+┊  ┊55┊    signOut()
+┊  ┊56┊
+┊  ┊57┊    history.push('/sign-in')
+┊  ┊58┊  }
+┊  ┊59┊
+┊  ┊60┊  return (
+┊  ┊61┊    <Style className="ChatsNavbar">
+┊  ┊62┊      <span className="ChatsNavbar-title">WhatsApp Clone</span>
+┊  ┊63┊      <div className="ChatsNavbar-rest">
+┊  ┊64┊        <Button className="ChatsNavbar-options-btn" onClick={setPopped.bind(null, true)}>
+┊  ┊65┊          <MoreIcon />
+┊  ┊66┊        </Button>
+┊  ┊67┊      </div>
+┊  ┊68┊      <Popover
+┊  ┊69┊        open={popped}
+┊  ┊70┊        onClose={setPopped.bind(null, false)}
+┊  ┊71┊        anchorOrigin={{
+┊  ┊72┊          vertical: 'top',
+┊  ┊73┊          horizontal: 'right',
+┊  ┊74┊        }}
+┊  ┊75┊        transformOrigin={{
+┊  ┊76┊          vertical: 'top',
+┊  ┊77┊          horizontal: 'right',
+┊  ┊78┊        }}
+┊  ┊79┊      >
+┊  ┊80┊        <Style>
+┊  ┊81┊          <List>
+┊  ┊82┊            <ListItem className="ChatsNavbar-options-item" button onClick={navToSettings}>
+┊  ┊83┊              <SettingsIcon />
+┊  ┊84┊              Settings
+┊  ┊85┊            </ListItem>
+┊  ┊86┊            <ListItem className="ChatsNavbar-options-item" button onClick={handleSignOut}>
+┊  ┊87┊              <SignOutIcon />
+┊  ┊88┊              Sign Out
+┊  ┊89┊            </ListItem>
+┊  ┊90┊          </List>
+┊  ┊91┊        </Style>
+┊  ┊92┊      </Popover>
+┊  ┊93┊    </Style>
+┊  ┊94┊  )
+┊  ┊95┊}
```

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
```diff
@@ -1,13 +1,14 @@
 ┊ 1┊ 1┊import * as React from 'react'
 ┊ 2┊ 2┊import { Suspense } from 'react'
+┊  ┊ 3┊import { RouteComponentProps } from 'react-router-dom'
 ┊ 3┊ 4┊import Navbar from '../Navbar'
 ┊ 4┊ 5┊import ChatsList from './ChatsList'
 ┊ 5┊ 6┊import ChatsNavbar from './ChatsNavbar'
 ┊ 6┊ 7┊
-┊ 7┊  ┊export default () => (
+┊  ┊ 8┊export default ({ history }: RouteComponentProps) => (
 ┊ 8┊ 9┊  <div className="ChatsListScreen Screen">
 ┊ 9┊10┊    <Navbar>
-┊10┊  ┊      <ChatsNavbar />
+┊  ┊11┊      <ChatsNavbar history={history} />
 ┊11┊12┊    </Navbar>
 ┊12┊13┊    <Suspense fallback={null}>
 ┊13┊14┊      <ChatsList />
```

[}]: #


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/master@next/.tortilla/manuals/views/step1.md) | [Next Step >](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/master@next/.tortilla/manuals/views/step3.md) |
|:--------------------------------|--------------------------------:|

[}]: #
