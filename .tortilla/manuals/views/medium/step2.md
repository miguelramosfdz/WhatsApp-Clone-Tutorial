# Step 2: Authentication

[//]: # (head-end)


![login](https://user-images.githubusercontent.com/7648874/50938848-18401600-14b5-11e9-8cd5-ebfa8c8403bd.png)

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
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊import { MessageModule } from &#x27;./message&#x27;
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊export interface IAppModuleConfig {
<b>+┊  ┊10┊  connection: Connection</b>
<b>+┊  ┊11┊  app: Express</b>
 ┊11┊12┊}
 ┊12┊13┊
 ┊13┊14┊export const AppModule &#x3D; new GraphQLModule&lt;IAppModuleConfig&gt;({
 ┊14┊15┊  name: &#x27;App&#x27;,
<b>+┊  ┊16┊  imports: ({ config: { app, connection } }) &#x3D;&gt; [</b>
 ┊16┊17┊    AuthModule.forRoot({
<b>+┊  ┊18┊      app,</b>
 ┊17┊19┊      connection,
 ┊18┊20┊    }),
 ┊19┊21┊    UserModule,
</pre>

##### Changed modules&#x2F;auth&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;
<b>+┊  ┊ 2┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;</b>
<b>+┊  ┊ 3┊import { Express } from &#x27;express&#x27;</b>
 ┊ 2┊ 4┊import { Connection } from &#x27;typeorm&#x27;
 ┊ 3┊ 5┊import { AuthProvider } from &#x27;./providers/auth.provider&#x27;
<b>+┊  ┊ 6┊import { APP } from &#x27;../app.symbols&#x27;</b>
<b>+┊  ┊ 7┊import { PubSub } from &#x27;apollo-server-express&#x27;</b>
<b>+┊  ┊ 8┊import passport from &#x27;passport&#x27;</b>
<b>+┊  ┊ 9┊import basicStrategy from &#x27;passport-http&#x27;</b>
<b>+┊  ┊10┊import { InjectFunction } from &#x27;@graphql-modules/di&#x27;</b>
 ┊ 4┊11┊
<b>+┊  ┊12┊export interface IAppModuleConfig {</b>
<b>+┊  ┊13┊  connection: Connection</b>
<b>+┊  ┊14┊  app: Express</b>
<b>+┊  ┊15┊}</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊export const AuthModule &#x3D; new GraphQLModule&lt;IAppModuleConfig&gt;({</b>
 ┊ 6┊18┊  name: &#x27;Auth&#x27;,
<b>+┊  ┊19┊  providers: ({ config: { connection, app } }) &#x3D;&gt; [</b>
 ┊ 8┊20┊    { provide: Connection, useValue: connection },
<b>+┊  ┊21┊    { provide: APP, useValue: app },</b>
<b>+┊  ┊22┊    PubSub,</b>
 ┊ 9┊23┊    AuthProvider,
 ┊10┊24┊  ],
<b>+┊  ┊25┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊26┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
 ┊11┊27┊  configRequired: true,
<b>+┊  ┊28┊  middleware: InjectFunction(AuthProvider, APP)((authProvider, app: Express) &#x3D;&gt; {</b>
<b>+┊  ┊29┊    passport.use(</b>
<b>+┊  ┊30┊      &#x27;basic-signin&#x27;,</b>
<b>+┊  ┊31┊      new basicStrategy.BasicStrategy(async (username: string, password: string, done: any) &#x3D;&gt; {</b>
<b>+┊  ┊32┊        done(null, await authProvider.signIn(username, password))</b>
<b>+┊  ┊33┊      })</b>
<b>+┊  ┊34┊    )</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊    passport.use(</b>
<b>+┊  ┊37┊      &#x27;basic-signup&#x27;,</b>
<b>+┊  ┊38┊      new basicStrategy.BasicStrategy(</b>
<b>+┊  ┊39┊        { passReqToCallback: true },</b>
<b>+┊  ┊40┊        async (</b>
<b>+┊  ┊41┊          req: Express.Request &amp; { body: { name?: string } },</b>
<b>+┊  ┊42┊          username: string,</b>
<b>+┊  ┊43┊          password: string,</b>
<b>+┊  ┊44┊          done: any</b>
<b>+┊  ┊45┊        ) &#x3D;&gt; {</b>
<b>+┊  ┊46┊          const name &#x3D; req.body.name</b>
<b>+┊  ┊47┊          return done(null, !!name &amp;&amp; (await authProvider.signUp(username, password, name)))</b>
<b>+┊  ┊48┊        }</b>
<b>+┊  ┊49┊      )</b>
<b>+┊  ┊50┊    )</b>
<b>+┊  ┊51┊</b>
<b>+┊  ┊52┊    app.post(&#x27;/signup&#x27;, passport.authenticate(&#x27;basic-signup&#x27;, { session: false }), (req, res) &#x3D;&gt;</b>
<b>+┊  ┊53┊      res.json(req.user)</b>
<b>+┊  ┊54┊    )</b>
<b>+┊  ┊55┊</b>
<b>+┊  ┊56┊    app.use(passport.authenticate(&#x27;basic-signin&#x27;, { session: false }))</b>
<b>+┊  ┊57┊</b>
<b>+┊  ┊58┊    app.post(&#x27;/signin&#x27;, (req, res) &#x3D;&gt; res.json(req.user))</b>
<b>+┊  ┊59┊    return {}</b>
<b>+┊  ┊60┊  }),</b>
 ┊12┊61┊})
</pre>

##### Changed modules&#x2F;auth&#x2F;providers&#x2F;auth.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Injectable, ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 2┊import { ModuleSessionInfo, OnRequest, OnConnect } from &#x27;@graphql-modules/core&#x27;</b>
 ┊ 3┊ 3┊import { Connection } from &#x27;typeorm&#x27;
 ┊ 4┊ 4┊import { User } from &#x27;../../../entity/user&#x27;
<b>+┊  ┊ 5┊import bcrypt from &#x27;bcrypt-nodejs&#x27;</b>
 ┊ 5┊ 6┊
<b>+┊  ┊ 7┊@Injectable({</b>
<b>+┊  ┊ 8┊  scope: ProviderScope.Session,</b>
<b>+┊  ┊ 9┊})</b>
<b>+┊  ┊10┊export class AuthProvider implements OnRequest, OnConnect {</b>
 ┊ 8┊11┊  currentUser: User
 ┊ 9┊12┊
<b>+┊  ┊13┊  constructor(private connection: Connection) {}</b>
 ┊13┊14┊
<b>+┊  ┊15┊  onRequest({ session }: ModuleSessionInfo) {</b>
<b>+┊  ┊16┊    if (&#x27;req&#x27; in session) {</b>
<b>+┊  ┊17┊      this.currentUser &#x3D; session.req.user</b>
<b>+┊  ┊18┊    }</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊</b>
<b>+┊  ┊21┊  async onConnect(connectionParams: { authToken?: string }) {</b>
<b>+┊  ┊22┊    if (connectionParams.authToken) {</b>
<b>+┊  ┊23┊      // Create a buffer and tell it the data coming in is base64</b>
<b>+┊  ┊24┊      const buf &#x3D; Buffer.from(connectionParams.authToken.split(&#x27; &#x27;)[1], &#x27;base64&#x27;)</b>
<b>+┊  ┊25┊      // Read it back out as a string</b>
<b>+┊  ┊26┊      const [username, password]: string[] &#x3D; buf.toString().split(&#x27;:&#x27;)</b>
<b>+┊  ┊27┊      const user &#x3D; await this.signIn(username, password)</b>
<b>+┊  ┊28┊      if (user) {</b>
<b>+┊  ┊29┊        // Set context for the WebSocket</b>
<b>+┊  ┊30┊        this.currentUser &#x3D; user</b>
<b>+┊  ┊31┊      } else {</b>
<b>+┊  ┊32┊        throw new Error(&#x27;Wrong credentials!&#x27;)</b>
<b>+┊  ┊33┊      }</b>
<b>+┊  ┊34┊    } else {</b>
<b>+┊  ┊35┊      throw new Error(&#x27;Missing auth token!&#x27;)</b>
<b>+┊  ┊36┊    }</b>
<b>+┊  ┊37┊  }</b>
 ┊16┊38┊
<b>+┊  ┊39┊  getUserByUsername(username: string) {</b>
<b>+┊  ┊40┊    return this.connection.getRepository(User).findOne({ where: { username } })</b>
<b>+┊  ┊41┊  }</b>
 ┊17┊42┊
<b>+┊  ┊43┊  async signIn(username: string, password: string): Promise&lt;User | false&gt; {</b>
<b>+┊  ┊44┊    const user &#x3D; await this.getUserByUsername(username)</b>
<b>+┊  ┊45┊    if (user &amp;&amp; this.validPassword(password, user.password)) {</b>
<b>+┊  ┊46┊      return user</b>
<b>+┊  ┊47┊    } else {</b>
<b>+┊  ┊48┊      return false</b>
<b>+┊  ┊49┊    }</b>
<b>+┊  ┊50┊  }</b>
 ┊21┊51┊
<b>+┊  ┊52┊  async signUp(username: string, password: string, name: string): Promise&lt;User | false&gt; {</b>
<b>+┊  ┊53┊    const userExists &#x3D; !!(await this.getUserByUsername(username))</b>
<b>+┊  ┊54┊    if (!userExists) {</b>
<b>+┊  ┊55┊      const user &#x3D; this.connection.manager.save(</b>
<b>+┊  ┊56┊        new User({</b>
<b>+┊  ┊57┊          username,</b>
<b>+┊  ┊58┊          password: this.generateHash(password),</b>
<b>+┊  ┊59┊          name,</b>
<b>+┊  ┊60┊        })</b>
<b>+┊  ┊61┊      )</b>
<b>+┊  ┊62┊      return user</b>
<b>+┊  ┊63┊    } else {</b>
<b>+┊  ┊64┊      return false</b>
 ┊25┊65┊    }
 ┊26┊66┊  }
<b>+┊  ┊67┊</b>
<b>+┊  ┊68┊  generateHash(password: string) {</b>
<b>+┊  ┊69┊    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))</b>
<b>+┊  ┊70┊  }</b>
<b>+┊  ┊71┊</b>
<b>+┊  ┊72┊  validPassword(password: string, localPassword: string) {</b>
<b>+┊  ┊73┊    return bcrypt.compareSync(password, localPassword)</b>
<b>+┊  ┊74┊  }</b>
 ┊27┊75┊}
</pre>

[}]: #

We are going to store hashes instead of plain passwords, that's why we're using `bcrypt-nodejs`. With `passport.use('basic-signin')` and `passport.use('basic-signup')` we define how the auth framework deals with our database. `app.post('/signup')` is the endpoint for creating new accounts, so we left it out of the authentication middleware (`app.use(passport.authenticate('basic-signin')`).

We will also add an additional query called `me` which will simply return the user which is currently logged in. This will come in handy in the client:

[{]: <helper> (diffStep 2.1 files="modules/user" module="server")

#### Step 2.1: Add auth routes

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊14┊    return this.connection.createQueryBuilder(User, &#x27;user&#x27;)
 ┊15┊15┊  }
 ┊16┊16┊
<b>+┊  ┊17┊  getMe() {</b>
<b>+┊  ┊18┊    return this.currentUser</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊</b>
 ┊17┊21┊  getUsers() {
 ┊18┊22┊    return this.createQueryBuilder()
 ┊19┊23┊      .where(&#x27;user.id !&#x3D; :id&#x27;, { id: this.currentUser.id })
</pre>

##### Changed modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊export default {
 ┊ 7┊ 7┊  Query: {
<b>+┊  ┊ 8┊    me: (obj, args, { injector }) &#x3D;&gt; injector.get(UserProvider).getMe(),</b>
 ┊ 8┊ 9┊    users: (obj, args, { injector }) &#x3D;&gt; injector.get(UserProvider).getUsers(),
 ┊ 9┊10┊  },
 ┊10┊11┊} as IResolvers
</pre>

##### Changed modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊type Query {
<b>+┊ ┊2┊  me: User</b>
 ┊2┊3┊  users: [User!]
 ┊3┊4┊}
 ┊4┊5┊
</pre>

[}]: #

### Client authentication

To make things more convenient, we will create a dedicated authentication service under a separate module called `auth.service.tsx`. The auth service will take care of:

- Performing sign-in/sign-up against the server.
- Storing received auth token in local storage.
- Providing a wrapper around guarded routes that require authorization.

[{]: <helper> (diffStep 2.1 files="src/services, src/graphql" module="client")

#### Step 2.1: Add auth service

##### Changed src&#x2F;graphql&#x2F;fragments&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export { default as chat } from &#x27;./chat.fragment&#x27;
 ┊2┊2┊export { default as message } from &#x27;./message.fragment&#x27;
<b>+┊ ┊3┊export { default as user } from &#x27;./user.fragment&#x27;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;user.fragment.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊ ┊2┊</b>
<b>+┊ ┊3┊export default gql&#x60;</b>
<b>+┊ ┊4┊  fragment User on User {</b>
<b>+┊ ┊5┊    id</b>
<b>+┊ ┊6┊    name</b>
<b>+┊ ┊7┊    picture</b>
<b>+┊ ┊8┊  }</b>
<b>+┊ ┊9┊&#x60;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;queries&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊export { default as me } from &#x27;./me.query&#x27;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;queries&#x2F;me.query.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../fragments&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  query Me {</b>
<b>+┊  ┊ 6┊    me {</b>
<b>+┊  ┊ 7┊      ...User</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊  ${fragments.user}</b>
<b>+┊  ┊11┊&#x60;</b>
</pre>

##### Added src&#x2F;services&#x2F;auth.service.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 2┊import { useContext } from &#x27;react&#x27;</b>
<b>+┊  ┊ 3┊import { useQuery } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊  ┊ 4┊import { Redirect } from &#x27;react-router-dom&#x27;</b>
<b>+┊  ┊ 5┊import store from &#x27;../apollo-client&#x27;</b>
<b>+┊  ┊ 6┊import * as queries from &#x27;../graphql/queries&#x27;</b>
<b>+┊  ┊ 7┊import { Me, User } from &#x27;../graphql/types&#x27;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊const MyContext &#x3D; React.createContext&lt;User.Fragment&gt;(null)</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊export const useMe &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊12┊  return useContext(MyContext)</b>
<b>+┊  ┊13┊}</b>
<b>+┊  ┊14┊</b>
<b>+┊  ┊15┊export const withAuth &#x3D; (Component: React.ComponentType) &#x3D;&gt; {</b>
<b>+┊  ┊16┊  return props &#x3D;&gt; {</b>
<b>+┊  ┊17┊    if (!getAuthHeader()) return &lt;Redirect to&#x3D;&quot;/sign-in&quot; /&gt;</b>
<b>+┊  ┊18┊</b>
<b>+┊  ┊19┊    // Validating against server</b>
<b>+┊  ┊20┊    const myResult &#x3D; useQuery&lt;Me.Query&gt;(queries.me)</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊    // Override TypeScript definition issue with the current version</b>
<b>+┊  ┊23┊    if (myResult.error) return &lt;Redirect to&#x3D;&quot;/sign-in&quot; /&gt;</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊    return (</b>
<b>+┊  ┊26┊      &lt;MyContext.Provider value&#x3D;{myResult.data.me}&gt;</b>
<b>+┊  ┊27┊        &lt;Component {...props} /&gt;</b>
<b>+┊  ┊28┊      &lt;/MyContext.Provider&gt;</b>
<b>+┊  ┊29┊    )</b>
<b>+┊  ┊30┊  }</b>
<b>+┊  ┊31┊}</b>
<b>+┊  ┊32┊</b>
<b>+┊  ┊33┊export const storeAuthHeader &#x3D; (auth: string) &#x3D;&gt; {</b>
<b>+┊  ┊34┊  localStorage.setItem(&#x27;Authorization&#x27;, auth)</b>
<b>+┊  ┊35┊}</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊export const getAuthHeader &#x3D; (): string | null &#x3D;&gt; {</b>
<b>+┊  ┊38┊  return localStorage.getItem(&#x27;Authorization&#x27;) || null</b>
<b>+┊  ┊39┊}</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊export const signIn &#x3D; ({ username, password }) &#x3D;&gt; {</b>
<b>+┊  ┊42┊  const auth &#x3D; &#x60;Basic ${btoa(&#x60;${username}:${password}&#x60;)}&#x60;</b>
<b>+┊  ┊43┊</b>
<b>+┊  ┊44┊  return fetch(&#x60;${process.env.REACT_APP_SERVER_URL}/signin&#x60;, {</b>
<b>+┊  ┊45┊    method: &#x27;POST&#x27;,</b>
<b>+┊  ┊46┊    headers: {</b>
<b>+┊  ┊47┊      Authorization: auth,</b>
<b>+┊  ┊48┊    },</b>
<b>+┊  ┊49┊  }).then(res &#x3D;&gt; {</b>
<b>+┊  ┊50┊    if (res.status &lt; 400) {</b>
<b>+┊  ┊51┊      storeAuthHeader(auth)</b>
<b>+┊  ┊52┊    } else {</b>
<b>+┊  ┊53┊      return Promise.reject(res.statusText)</b>
<b>+┊  ┊54┊    }</b>
<b>+┊  ┊55┊  })</b>
<b>+┊  ┊56┊}</b>
<b>+┊  ┊57┊</b>
<b>+┊  ┊58┊export const signUp &#x3D; ({ username, password, name }) &#x3D;&gt; {</b>
<b>+┊  ┊59┊  return fetch(&#x60;${process.env.REACT_APP_SERVER_URL}/signup&#x60;, {</b>
<b>+┊  ┊60┊    method: &#x27;POST&#x27;,</b>
<b>+┊  ┊61┊    body: JSON.stringify({ name }),</b>
<b>+┊  ┊62┊    headers: {</b>
<b>+┊  ┊63┊      Accept: &#x27;application/json&#x27;,</b>
<b>+┊  ┊64┊      &#x27;Content-Type&#x27;: &#x27;application/json&#x27;,</b>
<b>+┊  ┊65┊      Authorization: &#x60;Basic ${btoa(&#x60;${username}:${password}&#x60;)}&#x60;,</b>
<b>+┊  ┊66┊    },</b>
<b>+┊  ┊67┊  })</b>
<b>+┊  ┊68┊}</b>
<b>+┊  ┊69┊</b>
<b>+┊  ┊70┊export const signOut &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊71┊  localStorage.removeItem(&#x27;Authorization&#x27;)</b>
<b>+┊  ┊72┊</b>
<b>+┊  ┊73┊  return store.clearStore()</b>
<b>+┊  ┊74┊}</b>
<b>+┊  ┊75┊</b>
<b>+┊  ┊76┊export default {</b>
<b>+┊  ┊77┊  useMe,</b>
<b>+┊  ┊78┊  withAuth,</b>
<b>+┊  ┊79┊  storeAuthHeader,</b>
<b>+┊  ┊80┊  getAuthHeader,</b>
<b>+┊  ┊81┊  signIn,</b>
<b>+┊  ┊82┊  signUp,</b>
<b>+┊  ┊83┊  signOut,</b>
<b>+┊  ┊84┊}</b>
</pre>

[}]: #

The service also includes a `useMe()` GraphQL hook that will fetch the current user. Its definition is separate since it's used vastly and shared between many components.

Since we're using token oriented authentication, it means that any time we make a request to our GraphQL back-end we would need to authorize ourselves by sending this token. This can easily be done thanks to Apollo. By setting the client correctly we can automatically set the headers and parameters for each request that is being done.

[{]: <helper> (diffStep 2.1 files="src/apollo-client.ts" module="client")

#### Step 2.1: Add auth service

##### Changed src&#x2F;apollo-client.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { InMemoryCache } from &#x27;apollo-cache-inmemory&#x27;
 ┊ 2┊ 2┊import { ApolloClient } from &#x27;apollo-client&#x27;
 ┊ 3┊ 3┊import { ApolloLink, split } from &#x27;apollo-link&#x27;
<b>+┊  ┊ 4┊import { setContext } from &#x27;apollo-link-context&#x27;</b>
 ┊ 4┊ 5┊import { HttpLink } from &#x27;apollo-link-http&#x27;
 ┊ 5┊ 6┊import { WebSocketLink } from &#x27;apollo-link-ws&#x27;
 ┊ 6┊ 7┊import { getMainDefinition } from &#x27;apollo-utilities&#x27;
 ┊ 7┊ 8┊import { OperationDefinitionNode } from &#x27;graphql&#x27;
<b>+┊  ┊ 9┊import { getAuthHeader } from &#x27;./services/auth.service&#x27;</b>
 ┊ 8┊10┊
 ┊ 9┊11┊const httpUri &#x3D; process.env.REACT_APP_SERVER_URL + &#x27;/graphql&#x27;
 ┊10┊12┊const wsUri &#x3D; httpUri.replace(/^https?/, &#x27;ws&#x27;)
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊19┊  uri: wsUri,
 ┊18┊20┊  options: {
 ┊19┊21┊    reconnect: true,
<b>+┊  ┊22┊    connectionParams: () &#x3D;&gt; ({</b>
<b>+┊  ┊23┊      authToken: getAuthHeader(),</b>
<b>+┊  ┊24┊    }),</b>
 ┊20┊25┊  },
 ┊21┊26┊})
 ┊22┊27┊
<b>+┊  ┊28┊const authLink &#x3D; setContext((_, { headers }) &#x3D;&gt; {</b>
<b>+┊  ┊29┊  const auth &#x3D; getAuthHeader()</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  return {</b>
<b>+┊  ┊32┊    headers: {</b>
<b>+┊  ┊33┊      ...headers,</b>
<b>+┊  ┊34┊      Authorization: auth,</b>
<b>+┊  ┊35┊    },</b>
<b>+┊  ┊36┊  }</b>
<b>+┊  ┊37┊})</b>
<b>+┊  ┊38┊</b>
 ┊23┊39┊const terminatingLink &#x3D; split(
 ┊24┊40┊  ({ query }) &#x3D;&gt; {
 ┊25┊41┊    const { kind, operation } &#x3D; getMainDefinition(query) as OperationDefinitionNode
 ┊26┊42┊    return kind &#x3D;&#x3D;&#x3D; &#x27;OperationDefinition&#x27; &amp;&amp; operation &#x3D;&#x3D;&#x3D; &#x27;subscription&#x27;
 ┊27┊43┊  },
 ┊28┊44┊  wsLink,
<b>+┊  ┊45┊  authLink.concat(httpLink),</b>
 ┊30┊46┊)
 ┊31┊47┊
 ┊32┊48┊const link &#x3D; ApolloLink.from([terminatingLink])
</pre>

[}]: #

This would require us to install a package called `apollo-link-context`:

    $ yarn add apollo-link-context@1.0.12

Now that we have that mechanism implemented we need a way to access it. For that purpose we will be implementing a sign-in form and a sign-up form. Once we create a user and sign-in we will be promoted to the main chats list screen.

[{]: <helper> (diffStep 2.2 files="src/components/AuthScreen" module="client")

#### Step 2.2: Implement auth components

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignInForm.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊  ┊ 2┊import TextField from &#x27;@material-ui/core/TextField&#x27;</b>
<b>+┊  ┊ 3┊import { History } from &#x27;history&#x27;</b>
<b>+┊  ┊ 4┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 5┊import { useState } from &#x27;react&#x27;</b>
<b>+┊  ┊ 6┊import { signIn } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊interface SignInFormProps {</b>
<b>+┊  ┊ 9┊  history: History</b>
<b>+┊  ┊10┊}</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊export default ({ history }: SignInFormProps) &#x3D;&gt; {</b>
<b>+┊  ┊13┊  const [username, setUsername] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊  ┊14┊  const [password, setPassword] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊  ┊15┊  const [error, setError] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  const onUsernameChange &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊  ┊18┊    setError(&#x27;&#x27;)</b>
<b>+┊  ┊19┊    setUsername(target.value)</b>
<b>+┊  ┊20┊  }</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊  const onPasswordChange &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊  ┊23┊    setError(&#x27;&#x27;)</b>
<b>+┊  ┊24┊    setPassword(target.value)</b>
<b>+┊  ┊25┊  }</b>
<b>+┊  ┊26┊</b>
<b>+┊  ┊27┊  const maySignIn &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊28┊    return !!(username &amp;&amp; password)</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  const handleSignIn &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊32┊    signIn({ username, password })</b>
<b>+┊  ┊33┊      .then(() &#x3D;&gt; {</b>
<b>+┊  ┊34┊        history.push(&#x27;/chats&#x27;)</b>
<b>+┊  ┊35┊      })</b>
<b>+┊  ┊36┊      .catch(error &#x3D;&gt; {</b>
<b>+┊  ┊37┊        setError(error.message || error)</b>
<b>+┊  ┊38┊      })</b>
<b>+┊  ┊39┊  }</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊  const handleSignUp &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊42┊    history.push(&#x27;/sign-up&#x27;)</b>
<b>+┊  ┊43┊  }</b>
<b>+┊  ┊44┊</b>
<b>+┊  ┊45┊  return (</b>
<b>+┊  ┊46┊    &lt;div className&#x3D;&quot;SignInForm Screen&quot;&gt;</b>
<b>+┊  ┊47┊      &lt;form&gt;</b>
<b>+┊  ┊48┊        &lt;legend&gt;Sign in&lt;/legend&gt;</b>
<b>+┊  ┊49┊        &lt;div style&#x3D;{{ width: &#x27;100%&#x27; }}&gt;</b>
<b>+┊  ┊50┊          &lt;TextField</b>
<b>+┊  ┊51┊            className&#x3D;&quot;AuthScreen-text-field&quot;</b>
<b>+┊  ┊52┊            label&#x3D;&quot;Username&quot;</b>
<b>+┊  ┊53┊            value&#x3D;{username}</b>
<b>+┊  ┊54┊            onChange&#x3D;{onUsernameChange}</b>
<b>+┊  ┊55┊            margin&#x3D;&quot;normal&quot;</b>
<b>+┊  ┊56┊            placeholder&#x3D;&quot;Enter your username&quot;</b>
<b>+┊  ┊57┊          /&gt;</b>
<b>+┊  ┊58┊          &lt;TextField</b>
<b>+┊  ┊59┊            className&#x3D;&quot;AuthScreen-text-field&quot;</b>
<b>+┊  ┊60┊            label&#x3D;&quot;Password&quot;</b>
<b>+┊  ┊61┊            type&#x3D;&quot;password&quot;</b>
<b>+┊  ┊62┊            value&#x3D;{password}</b>
<b>+┊  ┊63┊            onChange&#x3D;{onPasswordChange}</b>
<b>+┊  ┊64┊            margin&#x3D;&quot;normal&quot;</b>
<b>+┊  ┊65┊            placeholder&#x3D;&quot;Enter your password&quot;</b>
<b>+┊  ┊66┊          /&gt;</b>
<b>+┊  ┊67┊        &lt;/div&gt;</b>
<b>+┊  ┊68┊        &lt;Button</b>
<b>+┊  ┊69┊          type&#x3D;&quot;button&quot;</b>
<b>+┊  ┊70┊          color&#x3D;&quot;secondary&quot;</b>
<b>+┊  ┊71┊          variant&#x3D;&quot;contained&quot;</b>
<b>+┊  ┊72┊          disabled&#x3D;{!maySignIn()}</b>
<b>+┊  ┊73┊          onClick&#x3D;{handleSignIn}</b>
<b>+┊  ┊74┊        &gt;</b>
<b>+┊  ┊75┊          Sign in</b>
<b>+┊  ┊76┊        &lt;/Button&gt;</b>
<b>+┊  ┊77┊        &lt;div className&#x3D;&quot;AuthScreen-error&quot;&gt;{error}&lt;/div&gt;</b>
<b>+┊  ┊78┊        &lt;span className&#x3D;&quot;AuthScreen-alternative&quot;&gt;</b>
<b>+┊  ┊79┊          Don&#x27;t have an account yet? &lt;a onClick&#x3D;{handleSignUp}&gt;Sign up!&lt;/a&gt;</b>
<b>+┊  ┊80┊        &lt;/span&gt;</b>
<b>+┊  ┊81┊      &lt;/form&gt;</b>
<b>+┊  ┊82┊    &lt;/div&gt;</b>
<b>+┊  ┊83┊  )</b>
<b>+┊  ┊84┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;SignUpForm.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊   ┊  2┊import TextField from &#x27;@material-ui/core/TextField&#x27;</b>
<b>+┊   ┊  3┊import { History } from &#x27;history&#x27;</b>
<b>+┊   ┊  4┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  5┊import { useState } from &#x27;react&#x27;</b>
<b>+┊   ┊  6┊import { signUp } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊  7┊</b>
<b>+┊   ┊  8┊interface SignUpFormProps {</b>
<b>+┊   ┊  9┊  history: History</b>
<b>+┊   ┊ 10┊}</b>
<b>+┊   ┊ 11┊</b>
<b>+┊   ┊ 12┊export default ({ history }: SignUpFormProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 13┊  const [name, setName] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊ 14┊  const [username, setUsername] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊ 15┊  const [oldPassword, setOldPassword] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊ 16┊  const [password, setPassword] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊ 17┊  const [error, setError] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊ 18┊</b>
<b>+┊   ┊ 19┊  const updateName &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊ 20┊    setError(&#x27;&#x27;)</b>
<b>+┊   ┊ 21┊    setName(target.value)</b>
<b>+┊   ┊ 22┊  }</b>
<b>+┊   ┊ 23┊</b>
<b>+┊   ┊ 24┊  const updateUsername &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊ 25┊    setError(&#x27;&#x27;)</b>
<b>+┊   ┊ 26┊    setUsername(target.value)</b>
<b>+┊   ┊ 27┊  }</b>
<b>+┊   ┊ 28┊</b>
<b>+┊   ┊ 29┊  const updateOldPassword &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊ 30┊    setError(&#x27;&#x27;)</b>
<b>+┊   ┊ 31┊    setOldPassword(target.value)</b>
<b>+┊   ┊ 32┊  }</b>
<b>+┊   ┊ 33┊</b>
<b>+┊   ┊ 34┊  const updateNewPassword &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊ 35┊    setError(&#x27;&#x27;)</b>
<b>+┊   ┊ 36┊    setPassword(target.value)</b>
<b>+┊   ┊ 37┊  }</b>
<b>+┊   ┊ 38┊</b>
<b>+┊   ┊ 39┊  const maySignUp &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊ 40┊    return !!(name &amp;&amp; username &amp;&amp; oldPassword &amp;&amp; oldPassword &#x3D;&#x3D;&#x3D; password)</b>
<b>+┊   ┊ 41┊  }</b>
<b>+┊   ┊ 42┊</b>
<b>+┊   ┊ 43┊  const handleSignUp &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊ 44┊    signUp({ username, password, name })</b>
<b>+┊   ┊ 45┊      .then(() &#x3D;&gt; {</b>
<b>+┊   ┊ 46┊        history.push(&#x27;/sign-in&#x27;)</b>
<b>+┊   ┊ 47┊      })</b>
<b>+┊   ┊ 48┊      .catch(error &#x3D;&gt; {</b>
<b>+┊   ┊ 49┊        setError(error.message || error)</b>
<b>+┊   ┊ 50┊      })</b>
<b>+┊   ┊ 51┊  }</b>
<b>+┊   ┊ 52┊</b>
<b>+┊   ┊ 53┊  const handleSignIn &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊ 54┊    history.push(&#x27;/sign-in&#x27;)</b>
<b>+┊   ┊ 55┊  }</b>
<b>+┊   ┊ 56┊</b>
<b>+┊   ┊ 57┊  return (</b>
<b>+┊   ┊ 58┊    &lt;div className&#x3D;&quot;SignUpForm Screen&quot;&gt;</b>
<b>+┊   ┊ 59┊      &lt;form&gt;</b>
<b>+┊   ┊ 60┊        &lt;legend&gt;Sign up&lt;/legend&gt;</b>
<b>+┊   ┊ 61┊        &lt;div</b>
<b>+┊   ┊ 62┊          style&#x3D;{{</b>
<b>+┊   ┊ 63┊            float: &#x27;left&#x27;,</b>
<b>+┊   ┊ 64┊            width: &#x27;calc(50% - 10px)&#x27;,</b>
<b>+┊   ┊ 65┊            paddingRight: &#x27;10px&#x27;,</b>
<b>+┊   ┊ 66┊          }}</b>
<b>+┊   ┊ 67┊        &gt;</b>
<b>+┊   ┊ 68┊          &lt;TextField</b>
<b>+┊   ┊ 69┊            className&#x3D;&quot;AuthScreen-text-field&quot;</b>
<b>+┊   ┊ 70┊            label&#x3D;&quot;Name&quot;</b>
<b>+┊   ┊ 71┊            value&#x3D;{name}</b>
<b>+┊   ┊ 72┊            onChange&#x3D;{updateName}</b>
<b>+┊   ┊ 73┊            autoComplete&#x3D;&quot;off&quot;</b>
<b>+┊   ┊ 74┊            margin&#x3D;&quot;normal&quot;</b>
<b>+┊   ┊ 75┊          /&gt;</b>
<b>+┊   ┊ 76┊          &lt;TextField</b>
<b>+┊   ┊ 77┊            className&#x3D;&quot;AuthScreen-text-field&quot;</b>
<b>+┊   ┊ 78┊            label&#x3D;&quot;Username&quot;</b>
<b>+┊   ┊ 79┊            value&#x3D;{username}</b>
<b>+┊   ┊ 80┊            onChange&#x3D;{updateUsername}</b>
<b>+┊   ┊ 81┊            autoComplete&#x3D;&quot;off&quot;</b>
<b>+┊   ┊ 82┊            margin&#x3D;&quot;normal&quot;</b>
<b>+┊   ┊ 83┊          /&gt;</b>
<b>+┊   ┊ 84┊        &lt;/div&gt;</b>
<b>+┊   ┊ 85┊        &lt;div</b>
<b>+┊   ┊ 86┊          style&#x3D;{{</b>
<b>+┊   ┊ 87┊            float: &#x27;right&#x27;,</b>
<b>+┊   ┊ 88┊            width: &#x27;calc(50% - 10px)&#x27;,</b>
<b>+┊   ┊ 89┊            paddingLeft: &#x27;10px&#x27;,</b>
<b>+┊   ┊ 90┊          }}</b>
<b>+┊   ┊ 91┊        &gt;</b>
<b>+┊   ┊ 92┊          &lt;TextField</b>
<b>+┊   ┊ 93┊            className&#x3D;&quot;AuthScreen-text-field&quot;</b>
<b>+┊   ┊ 94┊            label&#x3D;&quot;Old password&quot;</b>
<b>+┊   ┊ 95┊            type&#x3D;&quot;password&quot;</b>
<b>+┊   ┊ 96┊            value&#x3D;{oldPassword}</b>
<b>+┊   ┊ 97┊            onChange&#x3D;{updateOldPassword}</b>
<b>+┊   ┊ 98┊            autoComplete&#x3D;&quot;off&quot;</b>
<b>+┊   ┊ 99┊            margin&#x3D;&quot;normal&quot;</b>
<b>+┊   ┊100┊          /&gt;</b>
<b>+┊   ┊101┊          &lt;TextField</b>
<b>+┊   ┊102┊            className&#x3D;&quot;AuthScreen-text-field&quot;</b>
<b>+┊   ┊103┊            label&#x3D;&quot;New password&quot;</b>
<b>+┊   ┊104┊            type&#x3D;&quot;password&quot;</b>
<b>+┊   ┊105┊            value&#x3D;{password}</b>
<b>+┊   ┊106┊            onChange&#x3D;{updateNewPassword}</b>
<b>+┊   ┊107┊            autoComplete&#x3D;&quot;off&quot;</b>
<b>+┊   ┊108┊            margin&#x3D;&quot;normal&quot;</b>
<b>+┊   ┊109┊          /&gt;</b>
<b>+┊   ┊110┊        &lt;/div&gt;</b>
<b>+┊   ┊111┊        &lt;Button</b>
<b>+┊   ┊112┊          type&#x3D;&quot;button&quot;</b>
<b>+┊   ┊113┊          color&#x3D;&quot;secondary&quot;</b>
<b>+┊   ┊114┊          variant&#x3D;&quot;contained&quot;</b>
<b>+┊   ┊115┊          disabled&#x3D;{!maySignUp()}</b>
<b>+┊   ┊116┊          onClick&#x3D;{handleSignUp}</b>
<b>+┊   ┊117┊        &gt;</b>
<b>+┊   ┊118┊          Sign up</b>
<b>+┊   ┊119┊        &lt;/Button&gt;</b>
<b>+┊   ┊120┊        &lt;div className&#x3D;&quot;AuthScreen-error&quot;&gt;{error}&lt;/div&gt;</b>
<b>+┊   ┊121┊        &lt;span className&#x3D;&quot;AuthScreen-alternative&quot;&gt;</b>
<b>+┊   ┊122┊          Already have an accout? &lt;a onClick&#x3D;{handleSignIn}&gt;Sign in!&lt;/a&gt;</b>
<b>+┊   ┊123┊        &lt;/span&gt;</b>
<b>+┊   ┊124┊      &lt;/form&gt;</b>
<b>+┊   ┊125┊    &lt;/div&gt;</b>
<b>+┊   ┊126┊  )</b>
<b>+┊   ┊127┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;AuthScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  2┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊  3┊import { Route } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊  4┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  5┊import AnimatedSwitch from &#x27;../AnimatedSwitch&#x27;</b>
<b>+┊   ┊  6┊import SignInForm from &#x27;./SignInForm&#x27;</b>
<b>+┊   ┊  7┊import SignUpForm from &#x27;./SignUpForm&#x27;</b>
<b>+┊   ┊  8┊</b>
<b>+┊   ┊  9┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 10┊  background: radial-gradient(rgb(34, 65, 67), rgb(17, 48, 50)),</b>
<b>+┊   ┊ 11┊    url(/assets/chat-background.jpg) no-repeat;</b>
<b>+┊   ┊ 12┊  background-size: cover;</b>
<b>+┊   ┊ 13┊  background-blend-mode: multiply;</b>
<b>+┊   ┊ 14┊  color: white;</b>
<b>+┊   ┊ 15┊</b>
<b>+┊   ┊ 16┊  .AuthScreen-intro {</b>
<b>+┊   ┊ 17┊    height: 265px;</b>
<b>+┊   ┊ 18┊  }</b>
<b>+┊   ┊ 19┊</b>
<b>+┊   ┊ 20┊  .AuthScreen-icon {</b>
<b>+┊   ┊ 21┊    width: 125px;</b>
<b>+┊   ┊ 22┊    height: auto;</b>
<b>+┊   ┊ 23┊    margin-left: auto;</b>
<b>+┊   ┊ 24┊    margin-right: auto;</b>
<b>+┊   ┊ 25┊    padding-top: 70px;</b>
<b>+┊   ┊ 26┊    display: block;</b>
<b>+┊   ┊ 27┊  }</b>
<b>+┊   ┊ 28┊</b>
<b>+┊   ┊ 29┊  .AuthScreen-title {</b>
<b>+┊   ┊ 30┊    width: 100%;</b>
<b>+┊   ┊ 31┊    text-align: center;</b>
<b>+┊   ┊ 32┊    color: white;</b>
<b>+┊   ┊ 33┊  }</b>
<b>+┊   ┊ 34┊</b>
<b>+┊   ┊ 35┊  .AuthScreen-text-field {</b>
<b>+┊   ┊ 36┊    width: 100%;</b>
<b>+┊   ┊ 37┊    position: relative;</b>
<b>+┊   ┊ 38┊  }</b>
<b>+┊   ┊ 39┊</b>
<b>+┊   ┊ 40┊  .AuthScreen-text-field &gt; div::before {</b>
<b>+┊   ┊ 41┊    border-color: white !important;</b>
<b>+┊   ┊ 42┊  }</b>
<b>+┊   ┊ 43┊</b>
<b>+┊   ┊ 44┊  .AuthScreen-error {</b>
<b>+┊   ┊ 45┊    position: absolute;</b>
<b>+┊   ┊ 46┊    color: red;</b>
<b>+┊   ┊ 47┊    font-size: 15px;</b>
<b>+┊   ┊ 48┊    margin-top: 20px;</b>
<b>+┊   ┊ 49┊  }</b>
<b>+┊   ┊ 50┊</b>
<b>+┊   ┊ 51┊  .AuthScreen-alternative {</b>
<b>+┊   ┊ 52┊    position: absolute;</b>
<b>+┊   ┊ 53┊    bottom: 10px;</b>
<b>+┊   ┊ 54┊    left: 10px;</b>
<b>+┊   ┊ 55┊</b>
<b>+┊   ┊ 56┊    a {</b>
<b>+┊   ┊ 57┊      color: var(--secondary-bg);</b>
<b>+┊   ┊ 58┊    }</b>
<b>+┊   ┊ 59┊  }</b>
<b>+┊   ┊ 60┊</b>
<b>+┊   ┊ 61┊  .Screen {</b>
<b>+┊   ┊ 62┊    height: calc(100% - 265px);</b>
<b>+┊   ┊ 63┊  }</b>
<b>+┊   ┊ 64┊</b>
<b>+┊   ┊ 65┊  form {</b>
<b>+┊   ┊ 66┊    padding: 20px;</b>
<b>+┊   ┊ 67┊</b>
<b>+┊   ┊ 68┊    &gt; div {</b>
<b>+┊   ┊ 69┊      padding-bottom: 35px;</b>
<b>+┊   ┊ 70┊    }</b>
<b>+┊   ┊ 71┊  }</b>
<b>+┊   ┊ 72┊</b>
<b>+┊   ┊ 73┊  legend {</b>
<b>+┊   ┊ 74┊    font-weight: bold;</b>
<b>+┊   ┊ 75┊    color: white;</b>
<b>+┊   ┊ 76┊  }</b>
<b>+┊   ┊ 77┊</b>
<b>+┊   ┊ 78┊  label {</b>
<b>+┊   ┊ 79┊    color: white !important;</b>
<b>+┊   ┊ 80┊  }</b>
<b>+┊   ┊ 81┊</b>
<b>+┊   ┊ 82┊  input {</b>
<b>+┊   ┊ 83┊    color: white;</b>
<b>+┊   ┊ 84┊</b>
<b>+┊   ┊ 85┊    &amp;::placeholder {</b>
<b>+┊   ┊ 86┊      color: var(--primary-bg);</b>
<b>+┊   ┊ 87┊    }</b>
<b>+┊   ┊ 88┊  }</b>
<b>+┊   ┊ 89┊</b>
<b>+┊   ┊ 90┊  button {</b>
<b>+┊   ┊ 91┊    width: 100px;</b>
<b>+┊   ┊ 92┊    display: block;</b>
<b>+┊   ┊ 93┊    margin-left: auto;</b>
<b>+┊   ┊ 94┊    margin-right: auto;</b>
<b>+┊   ┊ 95┊    background-color: var(--secondary-bg) !important;</b>
<b>+┊   ┊ 96┊</b>
<b>+┊   ┊ 97┊    &amp;[disabled] {</b>
<b>+┊   ┊ 98┊      color: #38a81c;</b>
<b>+┊   ┊ 99┊    }</b>
<b>+┊   ┊100┊</b>
<b>+┊   ┊101┊    &amp;:not([disabled]) {</b>
<b>+┊   ┊102┊      color: white;</b>
<b>+┊   ┊103┊    }</b>
<b>+┊   ┊104┊  }</b>
<b>+┊   ┊105┊&#x60;</b>
<b>+┊   ┊106┊</b>
<b>+┊   ┊107┊export default ({ history, location }: RouteComponentProps) &#x3D;&gt; (</b>
<b>+┊   ┊108┊  &lt;Style className&#x3D;&quot;AuthScreen Screen&quot;&gt;</b>
<b>+┊   ┊109┊    &lt;div className&#x3D;&quot;AuthScreen-intro&quot;&gt;</b>
<b>+┊   ┊110┊      &lt;img src&#x3D;&quot;assets/whatsapp-icon.png&quot; className&#x3D;&quot;AuthScreen-icon&quot; /&gt;</b>
<b>+┊   ┊111┊      &lt;h2 className&#x3D;&quot;AuthScreen-title&quot;&gt;WhatsApp Clone&lt;/h2&gt;</b>
<b>+┊   ┊112┊    &lt;/div&gt;</b>
<b>+┊   ┊113┊    &lt;AnimatedSwitch&gt;</b>
<b>+┊   ┊114┊      &lt;Route exact path&#x3D;&quot;/sign-in&quot; component&#x3D;{SignInForm} /&gt;</b>
<b>+┊   ┊115┊      &lt;Route exact path&#x3D;&quot;/sign-up&quot; component&#x3D;{SignUpForm} /&gt;</b>
<b>+┊   ┊116┊    &lt;/AnimatedSwitch&gt;</b>
<b>+┊   ┊117┊  &lt;/Style&gt;</b>
<b>+┊   ┊118┊)</b>
</pre>

[}]: #

If you'll look at the main AuthScreen component you'll see that we use a router to alternate between the sign-in and the sign-up forms. That's the meaning behind a Switch component. However, you can also notice that we use an AnimatedSwitch. As it sounds, this component will ensure that transition between routes is animated. This upgrade our UX in the app, and it is also designated to be used across other routes. If so, let's implement it. First we will need to install a package called `react-router-transition`:

    $ yarn add react-router-transition@1.2.1

This will enable the transition between the routes. However, we will need to specify the characteristics of the transition, so, let's implement our own version of AnimatedSwitch:

[{]: <helper> (diffStep 2.2 files="src/components/AnimatedSwitch" module="client")

#### Step 2.2: Implement auth components

##### Added src&#x2F;components&#x2F;AnimatedSwitch.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 2┊import { AnimatedSwitch, spring } from &#x27;react-router-transition&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊const glide &#x3D; val &#x3D;&gt;</b>
<b>+┊  ┊ 5┊  spring(val, {</b>
<b>+┊  ┊ 6┊    stiffness: 174,</b>
<b>+┊  ┊ 7┊    damping: 24,</b>
<b>+┊  ┊ 8┊  })</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊const mapStyles &#x3D; styles &#x3D;&gt; ({</b>
<b>+┊  ┊11┊  transform: &#x60;translateX(${styles.offset}%)&#x60;,</b>
<b>+┊  ┊12┊})</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊export default styled(AnimatedSwitch).attrs(() &#x3D;&gt; ({</b>
<b>+┊  ┊15┊  atEnter: { offset: 100 },</b>
<b>+┊  ┊16┊  atLeave: { offset: glide(-100) },</b>
<b>+┊  ┊17┊  atActive: { offset: glide(0) },</b>
<b>+┊  ┊18┊  mapStyles,</b>
<b>+┊  ┊19┊}))&#x60;</b>
<b>+┊  ┊20┊  position: relative;</b>
<b>+┊  ┊21┊  overflow: hidden;</b>
<b>+┊  ┊22┊  width: 100%;</b>
<b>+┊  ┊23┊  height: 100%;</b>
<b>+┊  ┊24┊  &gt; div {</b>
<b>+┊  ┊25┊    position: absolute;</b>
<b>+┊  ┊26┊    overflow: hidden;</b>
<b>+┊  ┊27┊    width: 100%;</b>
<b>+┊  ┊28┊    height: 100%;</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊&#x60;</b>
</pre>

[}]: #

As shown in the screenshot at the top of this page, the auth screen includes few assets that we should download: a background picture and a logo. Please download the assets below and save them in the `public/assets` directory as `chat-background.jpg` and `whatsapp-icon.jpg` respectively:

![chat-background.jpg](https://user-images.githubusercontent.com/7648874/51983290-3f49a080-24d3-11e9-9de9-cf57354d1e3a.jpg)

![whatsapp-icon.jpg](https://user-images.githubusercontent.com/7648874/51983285-3d7fdd00-24d3-11e9-99ae-add703b979be.png)

So following that, we would need to define a router that will handle changes in routes. We will be using `react-router-dom`:

    $ yarn add react-router-dom@4.3.1

Now that we have it let's define our routes. Note how we take advantage of the `withAuth()` method to guard our routes and make them available only to users who are authorized:

[{]: <helper> (diffStep 2.3 files="src/App" module="client")

#### Step 2.3: Create router with guarded routes

##### Changed src&#x2F;App.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 2┊import { BrowserRouter, Route, Redirect } from &#x27;react-router-dom&#x27;</b>
<b>+┊  ┊ 3┊import AnimatedSwitch from &#x27;./components/AnimatedSwitch&#x27;</b>
<b>+┊  ┊ 4┊import AuthScreen from &#x27;./components/AuthScreen&#x27;</b>
 ┊ 2┊ 5┊import ChatsListScreen from &#x27;./components/ChatsListScreen&#x27;
<b>+┊  ┊ 6┊import { withAuth } from &#x27;./services/auth.service&#x27;</b>
 ┊ 3┊ 7┊
<b>+┊  ┊ 8┊const RedirectToChats &#x3D; () &#x3D;&gt; (</b>
<b>+┊  ┊ 9┊  &lt;Redirect to&#x3D;&quot;/chats&quot; /&gt;</b>
<b>+┊  ┊10┊)</b>
 ┊13┊11┊
<b>+┊  ┊12┊export default () &#x3D;&gt; (</b>
<b>+┊  ┊13┊  &lt;BrowserRouter&gt;</b>
<b>+┊  ┊14┊    &lt;AnimatedSwitch&gt;</b>
<b>+┊  ┊15┊      &lt;Route exact path&#x3D;&quot;/sign-(in|up)&quot; component&#x3D;{AuthScreen} /&gt;</b>
<b>+┊  ┊16┊      &lt;Route exact path&#x3D;&quot;/chats&quot; component&#x3D;{withAuth(ChatsListScreen)} /&gt;</b>
<b>+┊  ┊17┊      &lt;Route component&#x3D;{RedirectToChats} /&gt;</b>
<b>+┊  ┊18┊    &lt;/AnimatedSwitch&gt;</b>
<b>+┊  ┊19┊  &lt;/BrowserRouter&gt;</b>
<b>+┊  ┊20┊)</b>
</pre>

[}]: #

Since in our auth service we basically check if the user is logged in by actually querying the server with a React hook, we will need to use a Suspense component that will catch the pending request.

[{]: <helper> (diffStep 2.3 files="src/index" module="client")

#### Step 2.3: Create router with guarded routes

##### Changed src&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { MuiThemeProvider, createMuiTheme } from &#x27;@material-ui/core/styles&#x27;
 ┊2┊2┊import React from &#x27;react&#x27;;
<b>+┊ ┊3┊import { Suspense } from &#x27;react&#x27;</b>
 ┊3┊4┊import ReactDOM from &#x27;react-dom&#x27;;
 ┊4┊5┊import { ApolloProvider } from &#x27;react-apollo-hooks&#x27;;
 ┊5┊6┊import &#x27;./index.css&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊20┊21┊ReactDOM.render(
 ┊21┊22┊  &lt;MuiThemeProvider theme&#x3D;{theme}&gt;
 ┊22┊23┊    &lt;ApolloProvider client&#x3D;{apolloClient}&gt;
<b>+┊  ┊24┊      &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊  ┊25┊        &lt;App /&gt;</b>
<b>+┊  ┊26┊      &lt;/Suspense&gt;</b>
 ┊24┊27┊    &lt;/ApolloProvider&gt;
 ┊25┊28┊  &lt;/MuiThemeProvider&gt;
 ┊26┊29┊, document.getElementById(&#x27;root&#x27;));
</pre>

[}]: #

> It's highly recommended to go through the [docs of Suspense](https://reactjs.org/docs/react-api.html#reactsuspense) before you proceed if you're not familiar with it.

Perfect. Now we can sign-in and sign-up, and we can view chats which belong to us. Now we're gonna implement the settings screen, where we will be able to set our profile details, such as name and picture. Let's keep the image uploading thing for a bit later, we will focus on the component itself first. The settings screen layout includes:

- A navbar.
- A form with inputs.

Accordingly, the implementation of the screen should look like so:

[{]: <helper> (diffStep 2.4 files="src/components" module="client")

#### Step 2.4: Implement settings screen

##### Added src&#x2F;components&#x2F;SettingsScreen&#x2F;SettingsForm.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import TextField from &#x27;@material-ui/core/TextField&#x27;</b>
<b>+┊   ┊  2┊import EditIcon from &#x27;@material-ui/icons/Edit&#x27;</b>
<b>+┊   ┊  3┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  4┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  5┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  6┊import { useEffect, useState } from &#x27;react&#x27;</b>
<b>+┊   ┊  7┊import { useQuery, useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  8┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊  9┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊ 10┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 11┊import { SettingsFormMutation } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 12┊import { useMe } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊ 13┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊   ┊ 14┊import SettingsNavbar from &#x27;./SettingsNavbar&#x27;</b>
<b>+┊   ┊ 15┊</b>
<b>+┊   ┊ 16┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 17┊  .SettingsForm-picture {</b>
<b>+┊   ┊ 18┊    max-width: 300px;</b>
<b>+┊   ┊ 19┊    display: block;</b>
<b>+┊   ┊ 20┊    margin: auto;</b>
<b>+┊   ┊ 21┊    margin-top: 50px;</b>
<b>+┊   ┊ 22┊</b>
<b>+┊   ┊ 23┊    img {</b>
<b>+┊   ┊ 24┊      object-fit: cover;</b>
<b>+┊   ┊ 25┊      border-radius: 50%;</b>
<b>+┊   ┊ 26┊      margin-bottom: -34px;</b>
<b>+┊   ┊ 27┊      width: 300px;</b>
<b>+┊   ┊ 28┊      height: 300px;</b>
<b>+┊   ┊ 29┊    }</b>
<b>+┊   ┊ 30┊</b>
<b>+┊   ┊ 31┊    svg {</b>
<b>+┊   ┊ 32┊      float: right;</b>
<b>+┊   ┊ 33┊      font-size: 30px;</b>
<b>+┊   ┊ 34┊      opacity: 0.5;</b>
<b>+┊   ┊ 35┊      border-left: black solid 1px;</b>
<b>+┊   ┊ 36┊      padding-left: 5px;</b>
<b>+┊   ┊ 37┊      cursor: pointer;</b>
<b>+┊   ┊ 38┊    }</b>
<b>+┊   ┊ 39┊  }</b>
<b>+┊   ┊ 40┊</b>
<b>+┊   ┊ 41┊  .SettingsForm-name-input {</b>
<b>+┊   ┊ 42┊    display: block;</b>
<b>+┊   ┊ 43┊    margin: auto;</b>
<b>+┊   ┊ 44┊    width: calc(100% - 50px);</b>
<b>+┊   ┊ 45┊    margin-top: 50px;</b>
<b>+┊   ┊ 46┊</b>
<b>+┊   ┊ 47┊    &gt; div {</b>
<b>+┊   ┊ 48┊      width: 100%;</b>
<b>+┊   ┊ 49┊    }</b>
<b>+┊   ┊ 50┊  }</b>
<b>+┊   ┊ 51┊&#x60;</b>
<b>+┊   ┊ 52┊</b>
<b>+┊   ┊ 53┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 54┊  mutation SettingsFormMutation($name: String, $picture: String) {</b>
<b>+┊   ┊ 55┊    updateUser(name: $name, picture: $picture) {</b>
<b>+┊   ┊ 56┊      ...User</b>
<b>+┊   ┊ 57┊    }</b>
<b>+┊   ┊ 58┊  }</b>
<b>+┊   ┊ 59┊  ${fragments.user}</b>
<b>+┊   ┊ 60┊&#x60;</b>
<b>+┊   ┊ 61┊</b>
<b>+┊   ┊ 62┊export default ({ history }: RouteComponentProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 63┊  const me &#x3D; useMe()</b>
<b>+┊   ┊ 64┊  const [myName, setMyName] &#x3D; useState(me.name)</b>
<b>+┊   ┊ 65┊  const [myPicture, setMyPicture] &#x3D; useState(me.picture)</b>
<b>+┊   ┊ 66┊</b>
<b>+┊   ┊ 67┊  const updateUser &#x3D; useMutation&lt;SettingsFormMutation.Mutation, SettingsFormMutation.Variables&gt;(</b>
<b>+┊   ┊ 68┊    mutation,</b>
<b>+┊   ┊ 69┊    {</b>
<b>+┊   ┊ 70┊      variables: { name: myName, picture: myPicture },</b>
<b>+┊   ┊ 71┊      optimisticResponse: {</b>
<b>+┊   ┊ 72┊        __typename: &#x27;Mutation&#x27;,</b>
<b>+┊   ┊ 73┊        updateUser: {</b>
<b>+┊   ┊ 74┊          __typename: &#x27;User&#x27;,</b>
<b>+┊   ┊ 75┊          id: me.id,</b>
<b>+┊   ┊ 76┊          picture: myPicture,</b>
<b>+┊   ┊ 77┊          name: myName,</b>
<b>+┊   ┊ 78┊        },</b>
<b>+┊   ┊ 79┊      },</b>
<b>+┊   ┊ 80┊      update: (client, { data: { updateUser } }) &#x3D;&gt; {</b>
<b>+┊   ┊ 81┊        me.picture &#x3D; myPicture</b>
<b>+┊   ┊ 82┊        me.name &#x3D; myPicture</b>
<b>+┊   ┊ 83┊</b>
<b>+┊   ┊ 84┊        client.writeFragment({</b>
<b>+┊   ┊ 85┊          id: defaultDataIdFromObject(me),</b>
<b>+┊   ┊ 86┊          fragment: fragments.user,</b>
<b>+┊   ┊ 87┊          data: me,</b>
<b>+┊   ┊ 88┊        })</b>
<b>+┊   ┊ 89┊      },</b>
<b>+┊   ┊ 90┊    },</b>
<b>+┊   ┊ 91┊  )</b>
<b>+┊   ┊ 92┊</b>
<b>+┊   ┊ 93┊  useEffect(</b>
<b>+┊   ┊ 94┊    () &#x3D;&gt; {</b>
<b>+┊   ┊ 95┊      if (myPicture !&#x3D;&#x3D; me.picture) {</b>
<b>+┊   ┊ 96┊        updateUser()</b>
<b>+┊   ┊ 97┊      }</b>
<b>+┊   ┊ 98┊    },</b>
<b>+┊   ┊ 99┊    [myPicture],</b>
<b>+┊   ┊100┊  )</b>
<b>+┊   ┊101┊</b>
<b>+┊   ┊102┊  const updateName &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊103┊    setMyName(target.value)</b>
<b>+┊   ┊104┊  }</b>
<b>+┊   ┊105┊</b>
<b>+┊   ┊106┊  const updatePicture &#x3D; async () &#x3D;&gt; {</b>
<b>+┊   ┊107┊    // TODO: Implement</b>
<b>+┊   ┊108┊  }</b>
<b>+┊   ┊109┊</b>
<b>+┊   ┊110┊  return (</b>
<b>+┊   ┊111┊    &lt;Style className&#x3D;{name}&gt;</b>
<b>+┊   ┊112┊      &lt;div className&#x3D;&quot;SettingsForm-picture&quot;&gt;</b>
<b>+┊   ┊113┊        &lt;img src&#x3D;{myPicture || &#x27;/assets/default-profile-pic.jpg&#x27;} /&gt;</b>
<b>+┊   ┊114┊        &lt;EditIcon onClick&#x3D;{updatePicture} /&gt;</b>
<b>+┊   ┊115┊      &lt;/div&gt;</b>
<b>+┊   ┊116┊      &lt;TextField</b>
<b>+┊   ┊117┊        className&#x3D;&quot;SettingsForm-name-input&quot;</b>
<b>+┊   ┊118┊        label&#x3D;&quot;Name&quot;</b>
<b>+┊   ┊119┊        value&#x3D;{myName}</b>
<b>+┊   ┊120┊        onChange&#x3D;{updateName}</b>
<b>+┊   ┊121┊        onBlur&#x3D;{updateUser}</b>
<b>+┊   ┊122┊        margin&#x3D;&quot;normal&quot;</b>
<b>+┊   ┊123┊        placeholder&#x3D;&quot;Enter your name&quot;</b>
<b>+┊   ┊124┊      /&gt;</b>
<b>+┊   ┊125┊    &lt;/Style&gt;</b>
<b>+┊   ┊126┊  )</b>
<b>+┊   ┊127┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;SettingsScreen&#x2F;SettingsNavbar.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊  ┊ 2┊import ArrowBackIcon from &#x27;@material-ui/icons/ArrowBack&#x27;</b>
<b>+┊  ┊ 3┊import { History } from &#x27;history&#x27;</b>
<b>+┊  ┊ 4┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 5┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊  ┊ 8┊  padding: 0;</b>
<b>+┊  ┊ 9┊  display: flex;</b>
<b>+┊  ┊10┊  flex-direction: row;</b>
<b>+┊  ┊11┊  margin-left: -20px;</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊  .SettingsNavbar-title {</b>
<b>+┊  ┊14┊    line-height: 56px;</b>
<b>+┊  ┊15┊  }</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  .SettingsNavbar-back-button {</b>
<b>+┊  ┊18┊    color: var(--primary-text);</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊</b>
<b>+┊  ┊21┊  .SettingsNavbar-picture {</b>
<b>+┊  ┊22┊    height: 40px;</b>
<b>+┊  ┊23┊    width: 40px;</b>
<b>+┊  ┊24┊    margin-top: 3px;</b>
<b>+┊  ┊25┊    margin-left: -22px;</b>
<b>+┊  ┊26┊    object-fit: cover;</b>
<b>+┊  ┊27┊    padding: 5px;</b>
<b>+┊  ┊28┊    border-radius: 50%;</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊&#x60;</b>
<b>+┊  ┊31┊</b>
<b>+┊  ┊32┊interface SettingsNavbarProps {</b>
<b>+┊  ┊33┊  history: History</b>
<b>+┊  ┊34┊}</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊export default ({ history }: SettingsNavbarProps) &#x3D;&gt; {</b>
<b>+┊  ┊37┊  const navToChats &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊38┊    history.push(&#x27;/chats&#x27;)</b>
<b>+┊  ┊39┊  }</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊  return (</b>
<b>+┊  ┊42┊    &lt;Style className&#x3D;{name}&gt;</b>
<b>+┊  ┊43┊      &lt;Button className&#x3D;&quot;SettingsNavbar-back-button&quot; onClick&#x3D;{navToChats}&gt;</b>
<b>+┊  ┊44┊        &lt;ArrowBackIcon /&gt;</b>
<b>+┊  ┊45┊      &lt;/Button&gt;</b>
<b>+┊  ┊46┊      &lt;div className&#x3D;&quot;SettingsNavbar-title&quot;&gt;Settings&lt;/div&gt;</b>
<b>+┊  ┊47┊    &lt;/Style&gt;</b>
<b>+┊  ┊48┊  )</b>
<b>+┊  ┊49┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;SettingsScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 2┊import { Suspense } from &#x27;react&#x27;</b>
<b>+┊  ┊ 3┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊  ┊ 4┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊  ┊ 5┊import SettingsForm from &#x27;./SettingsForm&#x27;</b>
<b>+┊  ┊ 6┊import SettingsNavbar from &#x27;./SettingsNavbar&#x27;</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊export default ({ history }: RouteComponentProps) &#x3D;&gt; (</b>
<b>+┊  ┊ 9┊  &lt;div className&#x3D;&quot;SettingsScreen Screen&quot;&gt;</b>
<b>+┊  ┊10┊    &lt;Navbar&gt;</b>
<b>+┊  ┊11┊      &lt;SettingsNavbar history&#x3D;{history} /&gt;</b>
<b>+┊  ┊12┊    &lt;/Navbar&gt;</b>
<b>+┊  ┊13┊    &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊  ┊14┊      &lt;SettingsForm /&gt;</b>
<b>+┊  ┊15┊    &lt;/Suspense&gt;</b>
<b>+┊  ┊16┊  &lt;/div&gt;</b>
<b>+┊  ┊17┊)</b>
</pre>

[}]: #

The `optimisticResponse` object is used to predict the response so we can have it immediately and the `update` callback is used to update the cache. Anytime we receive a response from our GraphQL back-end we should update the cache, otherwise the data presented in our app will be out-dated.

The user should be updated on 2 scenarios: Either we loose focus on the name input or we upload a new image. We used the [`useEffect`](https://reactjs.org/docs/hooks-effect.html) to determine changes in the profile picture URL and trigger an update.

We will need to update our back-end to have an `updateUser` mutation:

[{]: <helper> (diffStep 2.2 files="modules/user" module="server")

#### Step 2.2: Add updateUser() mutation

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊23┊23┊      .where(&#x27;user.id !&#x3D; :id&#x27;, { id: this.currentUser.id })
 ┊24┊24┊      .getMany()
 ┊25┊25┊  }
<b>+┊  ┊26┊</b>
<b>+┊  ┊27┊  async updateUser({</b>
<b>+┊  ┊28┊    name,</b>
<b>+┊  ┊29┊    picture,</b>
<b>+┊  ┊30┊  }: {</b>
<b>+┊  ┊31┊    name?: string,</b>
<b>+┊  ┊32┊    picture?: string,</b>
<b>+┊  ┊33┊  } &#x3D; {}) {</b>
<b>+┊  ┊34┊    if (name &#x3D;&#x3D;&#x3D; this.currentUser.name &amp;&amp; picture &#x3D;&#x3D;&#x3D; this.currentUser.picture) {</b>
<b>+┊  ┊35┊      return this.currentUser;</b>
<b>+┊  ┊36┊    }</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊    this.currentUser.name &#x3D; name || this.currentUser.name;</b>
<b>+┊  ┊39┊    this.currentUser.picture &#x3D; picture || this.currentUser.picture;</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊    await this.repository.save(this.currentUser);</b>
<b>+┊  ┊42┊</b>
<b>+┊  ┊43┊    return this.currentUser;</b>
<b>+┊  ┊44┊  }</b>
 ┊26┊45┊}
</pre>

##### Changed modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 8┊ 8┊    me: (obj, args, { injector }) &#x3D;&gt; injector.get(UserProvider).getMe(),
 ┊ 9┊ 9┊    users: (obj, args, { injector }) &#x3D;&gt; injector.get(UserProvider).getUsers(),
 ┊10┊10┊  },
<b>+┊  ┊11┊  Mutation: {</b>
<b>+┊  ┊12┊    updateUser: (obj, { name, picture }, { injector }) &#x3D;&gt; injector.get(UserProvider).updateUser({</b>
<b>+┊  ┊13┊      name: name || &#x27;&#x27;,</b>
<b>+┊  ┊14┊      picture: picture || &#x27;&#x27;,</b>
<b>+┊  ┊15┊    }),</b>
<b>+┊  ┊16┊  },</b>
 ┊11┊17┊} as IResolvers
</pre>

##### Changed modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊  users: [User!]
 ┊ 4┊ 4┊}
 ┊ 5┊ 5┊
<b>+┊  ┊ 6┊type Mutation {</b>
<b>+┊  ┊ 7┊  updateUser(name: String, picture: String): User!</b>
<b>+┊  ┊ 8┊}</b>
<b>+┊  ┊ 9┊</b>
 ┊ 6┊10┊type User {
 ┊ 7┊11┊  id: ID!
 ┊ 8┊12┊  name: String
</pre>

[}]: #

Remember that a user could be correlated to a chat, for example, if a user changes its information such as name or picture, the chat informationshould be changed as well. This means that we will need to listen to changes with a [subscription](https://www.apollographql.com/docs/react/advanced/subscriptions.html) and update our cache accordingly.

Since `react-apollo-hooks` doesn't have a built-in `useSubscription()` hook as for version `0.3.1`, we will implement a polyfill that will do exactly that. First we will ad a utility package:

    $ yarn add react-fast-compare@2.0.4

And then we will implement the `useSubscription()` hook:

[{]: <helper> (diffStep 2.5 files="src/polyfills" module="client")

#### Step 2.5: Handle chat update subscription

##### Added src&#x2F;polyfills&#x2F;react-apollo-hooks.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { DataProxy } from &#x27;apollo-cache&#x27;</b>
<b>+┊  ┊ 2┊import { OperationVariables, FetchPolicy } from &#x27;apollo-client&#x27;</b>
<b>+┊  ┊ 3┊import { DocumentNode, GraphQLError } from &#x27;graphql&#x27;</b>
<b>+┊  ┊ 4┊import { useEffect, useMemo, useRef, useState } from &#x27;react&#x27;</b>
<b>+┊  ┊ 5┊import { useApolloClient } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊  ┊ 6┊import * as isEqual from &#x27;react-fast-compare&#x27;</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊export type SubscriptionOptions&lt;T, TVariables&gt; &#x3D; {</b>
<b>+┊  ┊ 9┊  variables?: TVariables</b>
<b>+┊  ┊10┊  fetchPolicy?: FetchPolicy</b>
<b>+┊  ┊11┊  onSubscriptionData?: (options?: { client?: DataProxy; subscriptionData?: T }) &#x3D;&gt; any</b>
<b>+┊  ┊12┊}</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊export const useSubscription &#x3D; &lt;T, TVariables &#x3D; OperationVariables&gt;(</b>
<b>+┊  ┊15┊  query: DocumentNode,</b>
<b>+┊  ┊16┊  options: SubscriptionOptions&lt;T, TVariables&gt; &#x3D; {},</b>
<b>+┊  ┊17┊): {</b>
<b>+┊  ┊18┊  data: T | { [key: string]: void }</b>
<b>+┊  ┊19┊  error?: GraphQLError</b>
<b>+┊  ┊20┊  loading: boolean</b>
<b>+┊  ┊21┊} &#x3D;&gt; {</b>
<b>+┊  ┊22┊  const onSubscriptionData &#x3D; options.onSubscriptionData</b>
<b>+┊  ┊23┊  const prevOptions &#x3D; useRef&lt;typeof options | null&gt;(null)</b>
<b>+┊  ┊24┊  const client &#x3D; useApolloClient()</b>
<b>+┊  ┊25┊  const [data, setData] &#x3D; useState&lt;T | {}&gt;({})</b>
<b>+┊  ┊26┊  const [error, setError] &#x3D; useState&lt;GraphQLError | null&gt;(null)</b>
<b>+┊  ┊27┊  const [loading, setLoading] &#x3D; useState&lt;boolean&gt;(true)</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊  const subscriptionOptions &#x3D; {</b>
<b>+┊  ┊30┊    query,</b>
<b>+┊  ┊31┊    variables: options.variables,</b>
<b>+┊  ┊32┊    fetchPolicy: options.fetchPolicy,</b>
<b>+┊  ┊33┊  }</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊  useEffect(</b>
<b>+┊  ┊36┊    () &#x3D;&gt; {</b>
<b>+┊  ┊37┊      prevOptions.current &#x3D; subscriptionOptions</b>
<b>+┊  ┊38┊      const subscription &#x3D; client</b>
<b>+┊  ┊39┊        .subscribe&lt;{ data: T }, TVariables&gt;(subscriptionOptions)</b>
<b>+┊  ┊40┊        .subscribe({</b>
<b>+┊  ┊41┊          next: ({ data }) &#x3D;&gt; {</b>
<b>+┊  ┊42┊            setData(data)</b>
<b>+┊  ┊43┊</b>
<b>+┊  ┊44┊            if (onSubscriptionData) {</b>
<b>+┊  ┊45┊              onSubscriptionData({ client, subscriptionData: data })</b>
<b>+┊  ┊46┊            }</b>
<b>+┊  ┊47┊          },</b>
<b>+┊  ┊48┊          error: err &#x3D;&gt; {</b>
<b>+┊  ┊49┊            setError(err)</b>
<b>+┊  ┊50┊            setLoading(false)</b>
<b>+┊  ┊51┊          },</b>
<b>+┊  ┊52┊          complete: () &#x3D;&gt; {</b>
<b>+┊  ┊53┊            setLoading(false)</b>
<b>+┊  ┊54┊          },</b>
<b>+┊  ┊55┊        })</b>
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊      return () &#x3D;&gt; {</b>
<b>+┊  ┊58┊        subscription.unsubscribe()</b>
<b>+┊  ┊59┊      }</b>
<b>+┊  ┊60┊    },</b>
<b>+┊  ┊61┊    [isEqual(prevOptions.current, subscriptionOptions) ? prevOptions.current : subscriptionOptions],</b>
<b>+┊  ┊62┊  )</b>
<b>+┊  ┊63┊</b>
<b>+┊  ┊64┊  return useMemo(</b>
<b>+┊  ┊65┊    () &#x3D;&gt; ({</b>
<b>+┊  ┊66┊      data,</b>
<b>+┊  ┊67┊      error,</b>
<b>+┊  ┊68┊      loading,</b>
<b>+┊  ┊69┊    }),</b>
<b>+┊  ┊70┊    [data, error, loading],</b>
<b>+┊  ┊71┊  )</b>
<b>+┊  ┊72┊}</b>
</pre>

[}]: #

Then we will define the subscription document and listen to it in a dedicated service called `cache.service`, which is responsible for updating the cache:

[{]: <helper> (diffStep 2.5 files="src/graphql, src/services/cache" module="client")

#### Step 2.5: Handle chat update subscription

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;chatUpdated.subscription.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../fragments&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  subscription ChatUpdated {</b>
<b>+┊  ┊ 6┊    chatUpdated {</b>
<b>+┊  ┊ 7┊      ...Chat</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊  ${fragments.chat}</b>
<b>+┊  ┊11┊&#x60;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊export { default as chatUpdated } from &#x27;./chatUpdated.subscription&#x27;</b>
</pre>

##### Added src&#x2F;services&#x2F;cache.service.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../graphql/fragments&#x27;</b>
<b>+┊  ┊ 3┊import * as subscriptions from &#x27;../graphql/subscriptions&#x27;</b>
<b>+┊  ┊ 4┊import { ChatUpdated } from &#x27;../graphql/types&#x27;</b>
<b>+┊  ┊ 5┊import { useSubscription } from &#x27;../polyfills/react-apollo-hooks&#x27;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊export const useSubscriptions &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊ 8┊  useSubscription&lt;ChatUpdated.Subscription&gt;(subscriptions.chatUpdated, {</b>
<b>+┊  ┊ 9┊    onSubscriptionData: ({ client, subscriptionData: { chatUpdated } }) &#x3D;&gt; {</b>
<b>+┊  ┊10┊      client.writeFragment({</b>
<b>+┊  ┊11┊        id: defaultDataIdFromObject(chatUpdated),</b>
<b>+┊  ┊12┊        fragment: fragments.chat,</b>
<b>+┊  ┊13┊        fragmentName: &#x27;Chat&#x27;,</b>
<b>+┊  ┊14┊        data: chatUpdated,</b>
<b>+┊  ┊15┊      })</b>
<b>+┊  ┊16┊    },</b>
<b>+┊  ┊17┊  })</b>
<b>+┊  ┊18┊}</b>
</pre>

[}]: #

We should listen to subscriptions only once we're logged-in, therefore let's use the `useSubscriptions()` hook that we've just created in the `auth.service`:

[{]: <helper> (diffStep 2.5 files="src/services/auth" module="client")

#### Step 2.5: Handle chat update subscription

##### Changed src&#x2F;services&#x2F;auth.service.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import store from &#x27;../apollo-client&#x27;
 ┊ 6┊ 6┊import * as queries from &#x27;../graphql/queries&#x27;
 ┊ 7┊ 7┊import { Me, User } from &#x27;../graphql/types&#x27;
<b>+┊  ┊ 8┊import { useSubscriptions } from &#x27;./cache.service&#x27;</b>
 ┊ 8┊ 9┊
 ┊ 9┊10┊const MyContext &#x3D; React.createContext&lt;User.Fragment&gt;(null)
 ┊10┊11┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊23┊    // Override TypeScript definition issue with the current version
 ┊23┊24┊    if (myResult.error) return &lt;Redirect to&#x3D;&quot;/sign-in&quot; /&gt;
 ┊24┊25┊
<b>+┊  ┊26┊    useSubscriptions()</b>
<b>+┊  ┊27┊</b>
 ┊25┊28┊    return (
 ┊26┊29┊      &lt;MyContext.Provider value&#x3D;{myResult.data.me}&gt;
 ┊27┊30┊        &lt;Component {...props} /&gt;
</pre>

[}]: #

Now we will have to implement the subscription in our server. GraphQL subscriptions are a way to push data from the server to the clients that choose to listen to real time messages from the server. To trigger a subscription event we will use a method called `publish` which is used by a class called `PubSub`. Pubsub sits between your application's logic and the GraphQL subscriptions engine - it receives a publish command from your app logic and pushes it to your GraphQL execution engine. This is how it should look like in code, in relation to `chatUpdated` subscription:

[{]: <helper> (diffStep 2.3 module="server")

#### Step 2.3: Add chatUpdated subscription

##### Changed index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊21┊  app.use(cors())
 ┊22┊22┊  app.use(bodyParser.json())
 ┊23┊23┊
<b>+┊  ┊24┊  const { schema, context, subscriptions } &#x3D; AppModule.forRoot({ app, connection })</b>
 ┊25┊25┊
 ┊26┊26┊  const apollo &#x3D; new ApolloServer({
 ┊27┊27┊    schema,
 ┊28┊28┊    context,
<b>+┊  ┊29┊    subscriptions,</b>
 ┊29┊30┊  })
 ┊30┊31┊
 ┊31┊32┊  apollo.applyMiddleware({
</pre>

##### Changed modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Injectable } from &#x27;@graphql-modules/di&#x27;
<b>+┊ ┊2┊import { PubSub } from &#x27;apollo-server-express&#x27;</b>
 ┊2┊3┊import { Connection } from &#x27;typeorm&#x27;
 ┊3┊4┊import { Chat } from &#x27;../../../entity/chat&#x27;
 ┊4┊5┊import { User } from &#x27;../../../entity/user&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 8┊ 9┊@Injectable()
 ┊ 9┊10┊export class ChatProvider {
 ┊10┊11┊  constructor(
<b>+┊  ┊12┊    private pubsub: PubSub,</b>
 ┊11┊13┊    private connection: Connection,
 ┊12┊14┊    private userProvider: UserProvider,
 ┊13┊15┊    private authProvider: AuthProvider
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊108┊110┊
 ┊109┊111┊    return owner || null
 ┊110┊112┊  }
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊  async filterChatAddedOrUpdated(chatAddedOrUpdated: Chat, creatorOrUpdaterId: string) {</b>
<b>+┊   ┊115┊    return (</b>
<b>+┊   ┊116┊      creatorOrUpdaterId !&#x3D;&#x3D; this.currentUser.id &amp;&amp;</b>
<b>+┊   ┊117┊      chatAddedOrUpdated.listingMembers.some((user: User) &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; this.currentUser.id)</b>
<b>+┊   ┊118┊    )</b>
<b>+┊   ┊119┊  }</b>
<b>+┊   ┊120┊</b>
<b>+┊   ┊121┊  async updateUser({</b>
<b>+┊   ┊122┊    name,</b>
<b>+┊   ┊123┊    picture,</b>
<b>+┊   ┊124┊  }: {</b>
<b>+┊   ┊125┊    name?: string</b>
<b>+┊   ┊126┊    picture?: string</b>
<b>+┊   ┊127┊  } &#x3D; {}) {</b>
<b>+┊   ┊128┊    await this.userProvider.updateUser({ name, picture })</b>
<b>+┊   ┊129┊</b>
<b>+┊   ┊130┊    const data &#x3D; await this.connection</b>
<b>+┊   ┊131┊      .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊132┊      .where(&#x27;user.id &#x3D; :id&#x27;, { id: this.currentUser.id })</b>
<b>+┊   ┊133┊      // Get a list of the chats who have/had currentUser involved</b>
<b>+┊   ┊134┊      .innerJoinAndSelect(</b>
<b>+┊   ┊135┊        &#x27;user.allTimeMemberChats&#x27;,</b>
<b>+┊   ┊136┊        &#x27;allTimeMemberChats&#x27;,</b>
<b>+┊   ┊137┊        // Groups are unaffected</b>
<b>+┊   ┊138┊        &#x27;allTimeMemberChats.name IS NULL&#x27;</b>
<b>+┊   ┊139┊      )</b>
<b>+┊   ┊140┊      // We need to notify only those who get the chat listed (except currentUser of course)</b>
<b>+┊   ┊141┊      .innerJoin(</b>
<b>+┊   ┊142┊        &#x27;allTimeMemberChats.listingMembers&#x27;,</b>
<b>+┊   ┊143┊        &#x27;listingMembers&#x27;,</b>
<b>+┊   ┊144┊        &#x27;listingMembers.id !&#x3D; :currentUserId&#x27;,</b>
<b>+┊   ┊145┊        {</b>
<b>+┊   ┊146┊          currentUserId: this.currentUser.id,</b>
<b>+┊   ┊147┊        }</b>
<b>+┊   ┊148┊      )</b>
<b>+┊   ┊149┊      .getOne()</b>
<b>+┊   ┊150┊</b>
<b>+┊   ┊151┊    const chatsAffected &#x3D; (data &amp;&amp; data.allTimeMemberChats) || []</b>
<b>+┊   ┊152┊</b>
<b>+┊   ┊153┊    chatsAffected.forEach(chat &#x3D;&gt; {</b>
<b>+┊   ┊154┊      this.pubsub.publish(&#x27;chatUpdated&#x27;, {</b>
<b>+┊   ┊155┊        updaterId: this.currentUser.id,</b>
<b>+┊   ┊156┊        chatUpdated: chat,</b>
<b>+┊   ┊157┊      })</b>
<b>+┊   ┊158┊    })</b>
<b>+┊   ┊159┊</b>
<b>+┊   ┊160┊    return this.currentUser</b>
<b>+┊   ┊161┊  }</b>
 ┊111┊162┊}
</pre>

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { PubSub, withFilter } from &#x27;apollo-server-express&#x27;</b>
 ┊ 1┊ 2┊import { ModuleContext } from &#x27;@graphql-modules/core&#x27;
 ┊ 2┊ 3┊import { IResolvers } from &#x27;../../../types&#x27;
 ┊ 3┊ 4┊import { ChatProvider } from &#x27;../providers/chat.provider&#x27;
<b>+┊  ┊ 5┊import { Chat } from &#x27;../../../entity/chat&#x27;</b>
 ┊ 4┊ 6┊
 ┊ 5┊ 7┊export default {
 ┊ 6┊ 8┊  Query: {
 ┊ 7┊ 9┊    chats: (obj, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChats(),
 ┊ 8┊10┊    chat: (obj, { chatId }, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChat(chatId),
 ┊ 9┊11┊  },
<b>+┊  ┊12┊  Mutation: {</b>
<b>+┊  ┊13┊    updateUser: (obj, { name, picture }, { injector }) &#x3D;&gt; injector.get(ChatProvider).updateUser({</b>
<b>+┊  ┊14┊      name: name || &#x27;&#x27;,</b>
<b>+┊  ┊15┊      picture: picture || &#x27;&#x27;,</b>
<b>+┊  ┊16┊    }),</b>
<b>+┊  ┊17┊  },</b>
<b>+┊  ┊18┊  Subscription: {</b>
<b>+┊  ┊19┊    chatUpdated: {</b>
<b>+┊  ┊20┊      subscribe: withFilter((root, args, { injector }: ModuleContext) &#x3D;&gt; injector.get(PubSub).asyncIterator(&#x27;chatUpdated&#x27;),</b>
<b>+┊  ┊21┊        (data: { chatUpdated: Chat, updaterId: string }, variables, { injector }: ModuleContext) &#x3D;&gt;</b>
<b>+┊  ┊22┊          data &amp;&amp; injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatUpdated, data.updaterId)</b>
<b>+┊  ┊23┊      ),</b>
<b>+┊  ┊24┊    },</b>
<b>+┊  ┊25┊  },</b>
 ┊10┊26┊  Chat: {
 ┊11┊27┊    name: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatName(chat),
 ┊12┊28┊    picture: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatPicture(chat),
</pre>

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊  chat(chatId: ID!): Chat
 ┊ 4┊ 4┊}
 ┊ 5┊ 5┊
<b>+┊  ┊ 6┊type Subscription {</b>
<b>+┊  ┊ 7┊  chatUpdated: Chat</b>
<b>+┊  ┊ 8┊}</b>
<b>+┊  ┊ 9┊</b>
 ┊ 6┊10┊type Chat {
 ┊ 7┊11┊  #May be a chat or a group
 ┊ 8┊12┊  id: ID!
</pre>

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
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊declare module &#x27;cloudinary&#x27; {</b>
<b>+┊  ┊ 2┊  export function config(config: { cloud_name: string; api_key: string; api_secret: string }): void</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊  export var v2: {</b>
<b>+┊  ┊ 5┊    uploader: {</b>
<b>+┊  ┊ 6┊      upload_stream: (callback?: (error: Error, result: any) &#x3D;&gt; any) &#x3D;&gt; NodeJS.WritableStream</b>
<b>+┊  ┊ 7┊      upload: (path: string, callback?: (error: Error, result: any) &#x3D;&gt; any) &#x3D;&gt; any</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊}</b>
</pre>

[}]: #

Then we will set the right API keys in the `.env` file:

[{]: <helper> (diffStep 2.4 files=".env" module="server")

#### Step 2.4: Add /upload-profile-pic REST endpoint

##### Added .env
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊# NEVER DEFINE HERE ONLY ON CLOUD</b>
<b>+┊ ┊2┊CLOUDINARY_URL&#x3D;cloudinary://756494366771661:OttZILiLRKaB5tKR8F3vQhMrNRg@whatsapp-clone</b>
</pre>

[}]: #

The purpose of the `.env` file is to load environment variables into our app in a more comfortable way. For that to apply we will need to install and require a package which is called [`dotenv`](https://www.npmjs.com/package/dotenv).

    $ yarn add dotenv@6.2.0

[{]: <helper> (diffStep 2.4 files="index" module="server")

#### Step 2.4: Add /upload-profile-pic REST endpoint

##### Changed index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊require(&#x27;dotenv&#x27;).config()</b>
<b>+┊ ┊2┊</b>
 ┊1┊3┊import &#x27;reflect-metadata&#x27;
 ┊2┊4┊import { ApolloServer } from &#x27;apollo-server-express&#x27;
 ┊3┊5┊import bodyParser from &#x27;body-parser&#x27;
</pre>

##### Changed modules&#x2F;user&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊/// &lt;reference path&#x3D;&quot;../../cloudinary.d.ts&quot; /&gt;</b>
 ┊ 1┊ 2┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;
 ┊ 2┊ 3┊import { InjectFunction, ProviderScope } from &#x27;@graphql-modules/di&#x27;
 ┊ 3┊ 4┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;
<b>+┊  ┊ 5┊import { Express } from &#x27;express&#x27;</b>
<b>+┊  ┊ 6┊import multer from &#x27;multer&#x27;</b>
<b>+┊  ┊ 7┊import tmp from &#x27;tmp&#x27;</b>
<b>+┊  ┊ 8┊import cloudinary from &#x27;cloudinary&#x27;</b>
<b>+┊  ┊ 9┊import { APP } from &#x27;../app.symbols&#x27;</b>
 ┊ 4┊10┊import { AuthModule } from &#x27;../auth&#x27;
 ┊ 5┊11┊import { UserProvider } from &#x27;./providers/user.provider&#x27;
 ┊ 6┊12┊
<b>+┊  ┊13┊const CLOUDINARY_URL &#x3D; process.env.CLOUDINARY_URL || &#x27;&#x27;</b>
<b>+┊  ┊14┊</b>
 ┊ 7┊15┊export const UserModule &#x3D; new GraphQLModule({
 ┊ 8┊16┊  name: &#x27;User&#x27;,
<b>+┊  ┊17┊  imports: [AuthModule],</b>
<b>+┊  ┊18┊  providers: [UserProvider],</b>
 ┊15┊19┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),
 ┊16┊20┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),
 ┊17┊21┊  defaultProviderScope: ProviderScope.Session,
<b>+┊  ┊22┊  middleware: InjectFunction(UserProvider, APP)((userProvider, app: Express) &#x3D;&gt; {</b>
<b>+┊  ┊23┊    const match &#x3D; CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/)</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊    if (match) {</b>
<b>+┊  ┊26┊      const [api_key, api_secret, cloud_name] &#x3D; match.slice(1)</b>
<b>+┊  ┊27┊      cloudinary.config({ api_key, api_secret, cloud_name })</b>
<b>+┊  ┊28┊    }</b>
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊    const upload &#x3D; multer({</b>
<b>+┊  ┊31┊      dest: tmp.dirSync({ unsafeCleanup: true }).name,</b>
<b>+┊  ┊32┊    })</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊    app.post(&#x27;/upload-profile-pic&#x27;, upload.single(&#x27;file&#x27;), async (req: any, res, done) &#x3D;&gt; {</b>
<b>+┊  ┊35┊      try {</b>
<b>+┊  ┊36┊        res.json(await userProvider.uploadProfilePic(req.file.path))</b>
<b>+┊  ┊37┊      } catch (e) {</b>
<b>+┊  ┊38┊        done(e)</b>
<b>+┊  ┊39┊      }</b>
<b>+┊  ┊40┊    })</b>
<b>+┊  ┊41┊    return {}</b>
<b>+┊  ┊42┊  }),</b>
 ┊18┊43┊})
</pre>

[}]: #

> See [Cloudinary's NodeJS API](https://cloudinary.com/documentation/node_integration).
> See [API setup](https://cloudinary.com/documentation/solution_overview#account_and_api_setup).

And finally, we will implement a REST endpoint in the `user` module under `/upload-profile-pic`:

[{]: <helper> (diffStep 2.4 files="modules/user" module="server")

#### Step 2.4: Add /upload-profile-pic REST endpoint

##### Changed modules&#x2F;user&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊/// &lt;reference path&#x3D;&quot;../../cloudinary.d.ts&quot; /&gt;</b>
 ┊ 1┊ 2┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;
 ┊ 2┊ 3┊import { InjectFunction, ProviderScope } from &#x27;@graphql-modules/di&#x27;
 ┊ 3┊ 4┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;
<b>+┊  ┊ 5┊import { Express } from &#x27;express&#x27;</b>
<b>+┊  ┊ 6┊import multer from &#x27;multer&#x27;</b>
<b>+┊  ┊ 7┊import tmp from &#x27;tmp&#x27;</b>
<b>+┊  ┊ 8┊import cloudinary from &#x27;cloudinary&#x27;</b>
<b>+┊  ┊ 9┊import { APP } from &#x27;../app.symbols&#x27;</b>
 ┊ 4┊10┊import { AuthModule } from &#x27;../auth&#x27;
 ┊ 5┊11┊import { UserProvider } from &#x27;./providers/user.provider&#x27;
 ┊ 6┊12┊
<b>+┊  ┊13┊const CLOUDINARY_URL &#x3D; process.env.CLOUDINARY_URL || &#x27;&#x27;</b>
<b>+┊  ┊14┊</b>
 ┊ 7┊15┊export const UserModule &#x3D; new GraphQLModule({
 ┊ 8┊16┊  name: &#x27;User&#x27;,
<b>+┊  ┊17┊  imports: [AuthModule],</b>
<b>+┊  ┊18┊  providers: [UserProvider],</b>
 ┊15┊19┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),
 ┊16┊20┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),
 ┊17┊21┊  defaultProviderScope: ProviderScope.Session,
<b>+┊  ┊22┊  middleware: InjectFunction(UserProvider, APP)((userProvider, app: Express) &#x3D;&gt; {</b>
<b>+┊  ┊23┊    const match &#x3D; CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/)</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊    if (match) {</b>
<b>+┊  ┊26┊      const [api_key, api_secret, cloud_name] &#x3D; match.slice(1)</b>
<b>+┊  ┊27┊      cloudinary.config({ api_key, api_secret, cloud_name })</b>
<b>+┊  ┊28┊    }</b>
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊    const upload &#x3D; multer({</b>
<b>+┊  ┊31┊      dest: tmp.dirSync({ unsafeCleanup: true }).name,</b>
<b>+┊  ┊32┊    })</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊    app.post(&#x27;/upload-profile-pic&#x27;, upload.single(&#x27;file&#x27;), async (req: any, res, done) &#x3D;&gt; {</b>
<b>+┊  ┊35┊      try {</b>
<b>+┊  ┊36┊        res.json(await userProvider.uploadProfilePic(req.file.path))</b>
<b>+┊  ┊37┊      } catch (e) {</b>
<b>+┊  ┊38┊        done(e)</b>
<b>+┊  ┊39┊      }</b>
<b>+┊  ┊40┊    })</b>
<b>+┊  ┊41┊    return {}</b>
<b>+┊  ┊42┊  }),</b>
 ┊18┊43┊})
</pre>

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Injectable, ProviderScope } from &#x27;@graphql-modules/di&#x27;
<b>+┊ ┊2┊import cloudinary from &#x27;cloudinary&#x27;</b>
 ┊2┊3┊import { Connection } from &#x27;typeorm&#x27;
 ┊3┊4┊import { User } from &#x27;../../../entity/user&#x27;
 ┊4┊5┊import { AuthProvider } from &#x27;../../auth/providers/auth.provider&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊42┊43┊
 ┊43┊44┊    return this.currentUser;
 ┊44┊45┊  }
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊  uploadProfilePic(filePath: string) {</b>
<b>+┊  ┊48┊    return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊49┊      cloudinary.v2.uploader.upload(filePath, (error, result) &#x3D;&gt; {</b>
<b>+┊  ┊50┊        if (error) {</b>
<b>+┊  ┊51┊          reject(error)</b>
<b>+┊  ┊52┊        } else {</b>
<b>+┊  ┊53┊          resolve(result)</b>
<b>+┊  ┊54┊        }</b>
<b>+┊  ┊55┊      })</b>
<b>+┊  ┊56┊    })</b>
<b>+┊  ┊57┊  }</b>
 ┊45┊58┊}
</pre>

[}]: #

Now getting back to the client, we will implement a `picture.service` that will be responsible for uploading images in our application:

[{]: <helper> (diffStep 2.6 files="src/services/picture" module="client")

#### Step 2.6: Implement image uploading

##### Added src&#x2F;services&#x2F;picture.service.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { getAuthHeader } from &#x27;./auth.service&#x27;</b>
<b>+┊  ┊ 2┊</b>
<b>+┊  ┊ 3┊export const pickPicture &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊ 4┊  return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊ 5┊    const input &#x3D; document.createElement(&#x27;input&#x27;)</b>
<b>+┊  ┊ 6┊    input.type &#x3D; &#x27;file&#x27;</b>
<b>+┊  ┊ 7┊    input.accept &#x3D; &#x27;image/*&#x27;</b>
<b>+┊  ┊ 8┊    input.onchange &#x3D; e &#x3D;&gt; {</b>
<b>+┊  ┊ 9┊      const target &#x3D; e.target as HTMLInputElement</b>
<b>+┊  ┊10┊      resolve(target.files[0])</b>
<b>+┊  ┊11┊    }</b>
<b>+┊  ┊12┊    input.onerror &#x3D; reject</b>
<b>+┊  ┊13┊    input.click()</b>
<b>+┊  ┊14┊  })</b>
<b>+┊  ┊15┊}</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊export const uploadProfilePicture &#x3D; file &#x3D;&gt; {</b>
<b>+┊  ┊18┊  const formData &#x3D; new FormData()</b>
<b>+┊  ┊19┊  formData.append(&#x27;file&#x27;, file)</b>
<b>+┊  ┊20┊  formData.append(&#x27;upload_preset&#x27;, &#x27;profile-pic&#x27;)</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊  return fetch(&#x60;${process.env.REACT_APP_SERVER_URL}/upload-profile-pic&#x60;, {</b>
<b>+┊  ┊23┊    method: &#x27;POST&#x27;,</b>
<b>+┊  ┊24┊    body: formData,</b>
<b>+┊  ┊25┊    headers: {</b>
<b>+┊  ┊26┊      Authorization: getAuthHeader(),</b>
<b>+┊  ┊27┊    }</b>
<b>+┊  ┊28┊  }).then(res &#x3D;&gt; {</b>
<b>+┊  ┊29┊    return res.json()</b>
<b>+┊  ┊30┊  })</b>
<b>+┊  ┊31┊}</b>
</pre>

[}]: #

And we will use it in the settings screen:

[{]: <helper> (diffStep 2.6 files="src/components" module="client")

#### Step 2.6: Implement image uploading

##### Changed src&#x2F;components&#x2F;SettingsScreen&#x2F;SettingsForm.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊10┊10┊import * as fragments from &#x27;../../graphql/fragments&#x27;
 ┊11┊11┊import { SettingsFormMutation } from &#x27;../../graphql/types&#x27;
 ┊12┊12┊import { useMe } from &#x27;../../services/auth.service&#x27;
<b>+┊  ┊13┊import { pickPicture, uploadProfilePicture } from &#x27;../../services/picture.service&#x27;</b>
 ┊13┊14┊import Navbar from &#x27;../Navbar&#x27;
 ┊14┊15┊import SettingsNavbar from &#x27;./SettingsNavbar&#x27;
 ┊15┊16┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊104┊105┊  }
 ┊105┊106┊
 ┊106┊107┊  const updatePicture &#x3D; async () &#x3D;&gt; {
<b>+┊   ┊108┊    const file &#x3D; await pickPicture()</b>
<b>+┊   ┊109┊</b>
<b>+┊   ┊110┊    if (!file) return</b>
<b>+┊   ┊111┊</b>
<b>+┊   ┊112┊    const { url } &#x3D; await uploadProfilePicture(file)</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊    setMyPicture(url)</b>
 ┊108┊115┊  }
 ┊109┊116┊
 ┊110┊117┊  return (
</pre>

[}]: #

The settings component is complete! We will connect it to the main flow by implementing the pop-over menu at the top right corner of the main screen where we will be able to navigate to the settings screen and sign-out:

[{]: <helper> (diffStep 2.7 module="client")

#### Step 2.7: Make components navigatable

##### Changed src&#x2F;App.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import AnimatedSwitch from &#x27;./components/AnimatedSwitch&#x27;
 ┊4┊4┊import AuthScreen from &#x27;./components/AuthScreen&#x27;
 ┊5┊5┊import ChatsListScreen from &#x27;./components/ChatsListScreen&#x27;
<b>+┊ ┊6┊import SettingsScreen from &#x27;./components/SettingsScreen&#x27;</b>
 ┊6┊7┊import { withAuth } from &#x27;./services/auth.service&#x27;
 ┊7┊8┊
 ┊8┊9┊const RedirectToChats &#x3D; () &#x3D;&gt; (
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊15┊    &lt;AnimatedSwitch&gt;
 ┊15┊16┊      &lt;Route exact path&#x3D;&quot;/sign-(in|up)&quot; component&#x3D;{AuthScreen} /&gt;
 ┊16┊17┊      &lt;Route exact path&#x3D;&quot;/chats&quot; component&#x3D;{withAuth(ChatsListScreen)} /&gt;
<b>+┊  ┊18┊      &lt;Route exact path&#x3D;&quot;/settings&quot; component&#x3D;{withAuth(SettingsScreen)} /&gt;</b>
 ┊17┊19┊      &lt;Route component&#x3D;{RedirectToChats} /&gt;
 ┊18┊20┊    &lt;/AnimatedSwitch&gt;
 ┊19┊21┊  &lt;/BrowserRouter&gt;
</pre>

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsNavbar.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊  ┊ 2┊import List from &#x27;@material-ui/core/List&#x27;</b>
<b>+┊  ┊ 3┊import ListItem from &#x27;@material-ui/core/ListItem&#x27;</b>
<b>+┊  ┊ 4┊import Popover from &#x27;@material-ui/core/Popover&#x27;</b>
<b>+┊  ┊ 5┊import MoreIcon from &#x27;@material-ui/icons/MoreVert&#x27;</b>
<b>+┊  ┊ 6┊import SignOutIcon from &#x27;@material-ui/icons/PowerSettingsNew&#x27;</b>
<b>+┊  ┊ 7┊import SettingsIcon from &#x27;@material-ui/icons/Settings&#x27;</b>
<b>+┊  ┊ 8┊import { History } from &#x27;history&#x27;</b>
 ┊ 1┊ 9┊import * as React from &#x27;react&#x27;
<b>+┊  ┊10┊import { useState } from &#x27;react&#x27;</b>
 ┊ 2┊11┊import styled from &#x27;styled-components&#x27;
<b>+┊  ┊12┊import { signOut } from &#x27;../../services/auth.service&#x27;</b>
 ┊ 3┊13┊
 ┊ 4┊14┊const Style &#x3D; styled.div&#x60;
<b>+┊  ┊15┊  padding: 0;</b>
<b>+┊  ┊16┊  display: flex;</b>
<b>+┊  ┊17┊  flex-direction: row;</b>
<b>+┊  ┊18┊</b>
 ┊ 5┊19┊  .ChatsNavbar-title {
<b>+┊  ┊20┊    line-height: 56px;</b>
<b>+┊  ┊21┊  }</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊  .ChatsNavbar-options-btn {</b>
<b>+┊  ┊24┊    float: right;</b>
<b>+┊  ┊25┊    height: 100%;</b>
<b>+┊  ┊26┊    font-size: 1.2em;</b>
<b>+┊  ┊27┊    margin-right: -15px;</b>
<b>+┊  ┊28┊    color: var(--primary-text);</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  .ChatsNavbar-rest {</b>
<b>+┊  ┊32┊    flex: 1;</b>
<b>+┊  ┊33┊    justify-content: flex-end;</b>
<b>+┊  ┊34┊  }</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊  .ChatsNavbar-options-item svg {</b>
<b>+┊  ┊37┊    margin-right: 10px;</b>
 ┊ 7┊38┊  }
 ┊ 8┊39┊&#x60;
 ┊ 9┊40┊
<b>+┊  ┊41┊interface ChatsNavbarProps {</b>
<b>+┊  ┊42┊  history: History</b>
<b>+┊  ┊43┊}</b>
<b>+┊  ┊44┊</b>
<b>+┊  ┊45┊export default ({ history }: ChatsNavbarProps) &#x3D;&gt; {</b>
<b>+┊  ┊46┊  const [popped, setPopped] &#x3D; useState(false)</b>
<b>+┊  ┊47┊</b>
<b>+┊  ┊48┊  const navToSettings &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊49┊    setPopped(false)</b>
<b>+┊  ┊50┊    history.push(&#x27;/settings&#x27;)</b>
<b>+┊  ┊51┊  }</b>
<b>+┊  ┊52┊</b>
<b>+┊  ┊53┊  const handleSignOut &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊54┊    setPopped(false)</b>
<b>+┊  ┊55┊    signOut()</b>
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊    history.push(&#x27;/sign-in&#x27;)</b>
<b>+┊  ┊58┊  }</b>
<b>+┊  ┊59┊</b>
<b>+┊  ┊60┊  return (</b>
<b>+┊  ┊61┊    &lt;Style className&#x3D;&quot;ChatsNavbar&quot;&gt;</b>
<b>+┊  ┊62┊      &lt;span className&#x3D;&quot;ChatsNavbar-title&quot;&gt;WhatsApp Clone&lt;/span&gt;</b>
<b>+┊  ┊63┊      &lt;div className&#x3D;&quot;ChatsNavbar-rest&quot;&gt;</b>
<b>+┊  ┊64┊        &lt;Button className&#x3D;&quot;ChatsNavbar-options-btn&quot; onClick&#x3D;{setPopped.bind(null, true)}&gt;</b>
<b>+┊  ┊65┊          &lt;MoreIcon /&gt;</b>
<b>+┊  ┊66┊        &lt;/Button&gt;</b>
<b>+┊  ┊67┊      &lt;/div&gt;</b>
<b>+┊  ┊68┊      &lt;Popover</b>
<b>+┊  ┊69┊        open&#x3D;{popped}</b>
<b>+┊  ┊70┊        onClose&#x3D;{setPopped.bind(null, false)}</b>
<b>+┊  ┊71┊        anchorOrigin&#x3D;{{</b>
<b>+┊  ┊72┊          vertical: &#x27;top&#x27;,</b>
<b>+┊  ┊73┊          horizontal: &#x27;right&#x27;,</b>
<b>+┊  ┊74┊        }}</b>
<b>+┊  ┊75┊        transformOrigin&#x3D;{{</b>
<b>+┊  ┊76┊          vertical: &#x27;top&#x27;,</b>
<b>+┊  ┊77┊          horizontal: &#x27;right&#x27;,</b>
<b>+┊  ┊78┊        }}</b>
<b>+┊  ┊79┊      &gt;</b>
<b>+┊  ┊80┊        &lt;Style&gt;</b>
<b>+┊  ┊81┊          &lt;List&gt;</b>
<b>+┊  ┊82┊            &lt;ListItem className&#x3D;&quot;ChatsNavbar-options-item&quot; button onClick&#x3D;{navToSettings}&gt;</b>
<b>+┊  ┊83┊              &lt;SettingsIcon /&gt;</b>
<b>+┊  ┊84┊              Settings</b>
<b>+┊  ┊85┊            &lt;/ListItem&gt;</b>
<b>+┊  ┊86┊            &lt;ListItem className&#x3D;&quot;ChatsNavbar-options-item&quot; button onClick&#x3D;{handleSignOut}&gt;</b>
<b>+┊  ┊87┊              &lt;SignOutIcon /&gt;</b>
<b>+┊  ┊88┊              Sign Out</b>
<b>+┊  ┊89┊            &lt;/ListItem&gt;</b>
<b>+┊  ┊90┊          &lt;/List&gt;</b>
<b>+┊  ┊91┊        &lt;/Style&gt;</b>
<b>+┊  ┊92┊      &lt;/Popover&gt;</b>
<b>+┊  ┊93┊    &lt;/Style&gt;</b>
<b>+┊  ┊94┊  )</b>
<b>+┊  ┊95┊}</b>
</pre>

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import * as React from &#x27;react&#x27;
 ┊ 2┊ 2┊import { Suspense } from &#x27;react&#x27;
<b>+┊  ┊ 3┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
 ┊ 3┊ 4┊import Navbar from &#x27;../Navbar&#x27;
 ┊ 4┊ 5┊import ChatsList from &#x27;./ChatsList&#x27;
 ┊ 5┊ 6┊import ChatsNavbar from &#x27;./ChatsNavbar&#x27;
 ┊ 6┊ 7┊
<b>+┊  ┊ 8┊export default ({ history }: RouteComponentProps) &#x3D;&gt; (</b>
 ┊ 8┊ 9┊  &lt;div className&#x3D;&quot;ChatsListScreen Screen&quot;&gt;
 ┊ 9┊10┊    &lt;Navbar&gt;
<b>+┊  ┊11┊      &lt;ChatsNavbar history&#x3D;{history} /&gt;</b>
 ┊11┊12┊    &lt;/Navbar&gt;
 ┊12┊13┊    &lt;Suspense fallback&#x3D;{null}&gt;
 ┊13┊14┊      &lt;ChatsList /&gt;
</pre>

[}]: #


[//]: # (foot-start)

[{]: <helper> (navStep)

⟸ <a href="step1.md">PREVIOUS STEP</a> <b>║</b> <a href="step3.md">NEXT STEP</a> ⟹

[}]: #
