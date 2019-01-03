# Step 1: Creating a React App with Apollo Server

[//]: # (head-end)


To create a new React app we're simply gonna use [`create-react-app`](https://github.com/facebook/create-react-app). It comes with a built-in TypeScript support which is exactly what we need. First, install the CLI if you haven't already:

    $ yarn global add create-react-app

And then create the app itself:

    $ create-react-app whatsapp-clone-client

By default, `create-react-app` will create a JavaScript project. In order to use TypeScript, we will rename our app files to have the right extension `.tsx` (TypeScript + JSX):

    src$ mv App.js App.tsx
    src$ mv index.js index.tsx

And then we will add a couple of configuration files that will basically set the building and linting rules for the TypeScript compiler:

[{]: <helper> (diffStep 1.1 files="tsconfig.json, tslint.json" module="client")

#### [Step 1.1: Setup TypeScript](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/0a994b3)

##### Added tsconfig.json
```diff
@@ -0,0 +1,35 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "compilerOptions": {
+┊  ┊ 3┊    "outDir": "build/dist",
+┊  ┊ 4┊    "sourceMap": true,
+┊  ┊ 5┊    "declaration": false,
+┊  ┊ 6┊    "moduleResolution": "node",
+┊  ┊ 7┊    "emitDecoratorMetadata": true,
+┊  ┊ 8┊    "experimentalDecorators": true,
+┊  ┊ 9┊    "downlevelIteration": true,
+┊  ┊10┊    "resolveJsonModule": true,
+┊  ┊11┊    "target": "es5",
+┊  ┊12┊    "jsx": "preserve",
+┊  ┊13┊    "typeRoots": [
+┊  ┊14┊      "node_modules/@types"
+┊  ┊15┊    ],
+┊  ┊16┊    "lib": [
+┊  ┊17┊      "es2017",
+┊  ┊18┊      "dom",
+┊  ┊19┊      "esnext.asynciterable"
+┊  ┊20┊    ],
+┊  ┊21┊    "allowJs": true,
+┊  ┊22┊    "skipLibCheck": true,
+┊  ┊23┊    "esModuleInterop": false,
+┊  ┊24┊    "allowSyntheticDefaultImports": true,
+┊  ┊25┊    "forceConsistentCasingInFileNames": true,
+┊  ┊26┊    "isolatedModules": true,
+┊  ┊27┊    "noEmit": true,
+┊  ┊28┊    "noImplicitAny": false,
+┊  ┊29┊    "strict": false,
+┊  ┊30┊    "module": "esnext"
+┊  ┊31┊  },
+┊  ┊32┊  "include": [
+┊  ┊33┊    "src"
+┊  ┊34┊  ]
+┊  ┊35┊}
```

##### Added tslint.json
```diff
@@ -0,0 +1,29 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "extends": ["tslint:recommended", "tslint-react", "tslint-config-prettier"],
+┊  ┊ 3┊  "rules": {
+┊  ┊ 4┊    "ordered-imports": false,
+┊  ┊ 5┊    "object-literal-sort-keys": false,
+┊  ┊ 6┊    "jsx-boolean-value": false,
+┊  ┊ 7┊    "interface-name" : false,
+┊  ┊ 8┊    "variable-name": false,
+┊  ┊ 9┊    "no-string-literal": false,
+┊  ┊10┊    "no-namespace": false,
+┊  ┊11┊    "interface-over-type-literal": false,
+┊  ┊12┊    "no-shadowed-variable": false,
+┊  ┊13┊    "curly": false,
+┊  ┊14┊    "no-label": false,
+┊  ┊15┊    "no-empty": false,
+┊  ┊16┊    "no-debugger": false,
+┊  ┊17┊    "no-console": false,
+┊  ┊18┊    "array-type": false
+┊  ┊19┊  },
+┊  ┊20┊  "linterOptions": {
+┊  ┊21┊    "exclude": [
+┊  ┊22┊      "config/**/*.js",
+┊  ┊23┊      "node_modules/**/*.ts",
+┊  ┊24┊      "coverage/lcov-report/*.js",
+┊  ┊25┊      "*.json",
+┊  ┊26┊      "**/*.json"
+┊  ┊27┊    ]
+┊  ┊28┊  }
+┊  ┊29┊}
```

[}]: #

Once we will run the app for the first time, `react-scripts` (`create-react-app` utility scripts package) should automatically initialize some additional TypeScript related files.

    $ yarn start

Since in our app we'll be using the new React [hooks](https://reactjs.org/docs/hooks-intro.html) and [Suspense](https://reactjs.org/docs/react-api.html#reactsuspense) mechanisms, we will upgrade React's version to version `16.8`:

    $ yarn upgrade react@16.8.1 react-dom@16.8.1

The plan is to make our app talk with a [GraphQL](https://graphql.org/) back-end, so we'll be using [Apollo](https://www.apollographql.com/) to setup a client which is actually capable of such.

First we will install all the necessary packages:

    $ yarn add apollo-cache-inmemory@1.4.2 apollo-client@2.4.12 apollo-link@1.2.8 apollo-link-http@1.5.11 apollo-link-ws@1.0.14 apollo-utilities@1.1.2 graphql@14.1.1 react-apollo-hooks@0.3.1 subscriptions-transport-ws@0.9.15
    $ yarn add -D @types/graphql@14.0.5 @types/node@10.12.23

Then we will set the server's connection URL under the `.env` file which is basically used to define constants for our application. The constants can be addressed using `process.env[CONSTANT_NAME]`. The identifier should be replaced automatically by `react-scripts` with the stored value, just like macros:

[{]: <helper> (diffStep 1.3 files=".env" module="client")

#### [Step 1.3: Setup Apollo-client](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/438f0ac)

##### Added .env
```diff
@@ -0,0 +1 @@
+┊ ┊1┊REACT_APP_SERVER_URL=http://localhost:4000
```

[}]: #

And finally we can write our Apollo-GraphQL client module and connect it to our application:

[{]: <helper> (diffStep 1.3 files="src/apollo-client.ts, src/index.tsx" module="client")

#### [Step 1.3: Setup Apollo-client](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/438f0ac)

##### Added src&#x2F;apollo-client.ts
```diff
@@ -0,0 +1,38 @@
+┊  ┊ 1┊import { InMemoryCache } from 'apollo-cache-inmemory'
+┊  ┊ 2┊import { ApolloClient } from 'apollo-client'
+┊  ┊ 3┊import { ApolloLink, split } from 'apollo-link'
+┊  ┊ 4┊import { HttpLink } from 'apollo-link-http'
+┊  ┊ 5┊import { WebSocketLink } from 'apollo-link-ws'
+┊  ┊ 6┊import { getMainDefinition } from 'apollo-utilities'
+┊  ┊ 7┊import { OperationDefinitionNode } from 'graphql'
+┊  ┊ 8┊
+┊  ┊ 9┊const httpUri = process.env.REACT_APP_SERVER_URL + '/graphql'
+┊  ┊10┊const wsUri = httpUri.replace(/^https?/, 'ws')
+┊  ┊11┊
+┊  ┊12┊const httpLink = new HttpLink({
+┊  ┊13┊  uri: httpUri,
+┊  ┊14┊})
+┊  ┊15┊
+┊  ┊16┊const wsLink = new WebSocketLink({
+┊  ┊17┊  uri: wsUri,
+┊  ┊18┊  options: {
+┊  ┊19┊    reconnect: true,
+┊  ┊20┊  },
+┊  ┊21┊})
+┊  ┊22┊
+┊  ┊23┊const terminatingLink = split(
+┊  ┊24┊  ({ query }) => {
+┊  ┊25┊    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode
+┊  ┊26┊    return kind === 'OperationDefinition' && operation === 'subscription'
+┊  ┊27┊  },
+┊  ┊28┊  wsLink,
+┊  ┊29┊  httpLink,
+┊  ┊30┊)
+┊  ┊31┊
+┊  ┊32┊const link = ApolloLink.from([terminatingLink])
+┊  ┊33┊const cache = new InMemoryCache()
+┊  ┊34┊
+┊  ┊35┊export default new ApolloClient({
+┊  ┊36┊  link,
+┊  ┊37┊  cache,
+┊  ┊38┊})
```

##### Changed src&#x2F;index.tsx
```diff
@@ -1,10 +1,16 @@
 ┊ 1┊ 1┊import React from 'react';
 ┊ 2┊ 2┊import ReactDOM from 'react-dom';
+┊  ┊ 3┊import { ApolloProvider } from 'react-apollo-hooks';
 ┊ 3┊ 4┊import './index.css';
 ┊ 4┊ 5┊import App from './App';
+┊  ┊ 6┊import apolloClient from './apollo-client'
 ┊ 5┊ 7┊import * as serviceWorker from './serviceWorker';
 ┊ 6┊ 8┊
-┊ 7┊  ┊ReactDOM.render(<App />, document.getElementById('root'));
+┊  ┊ 9┊ReactDOM.render(
+┊  ┊10┊  <ApolloProvider client={apolloClient}>
+┊  ┊11┊    <App />
+┊  ┊12┊  </ApolloProvider>
+┊  ┊13┊, document.getElementById('root'));
 ┊ 8┊14┊
 ┊ 9┊15┊// If you want your app to work offline and load faster, you can change
 ┊10┊16┊// unregister() to register() below. Note this comes with some pitfalls.
```

[}]: #

> Note that this configuration assumes that the sever runs at `localhost:4000` and that it serves a GraphQL REST endpoint at `/graphql`. Feel free to make the right adjustments according to your needs.

Needless to say that we need a back-end for our application to function properly, and so this is what we're gonna focus on. We will initialize a second project for the server in a separate directory called `whatsapp-clone-server`:

    $ mkdir whatsapp-clone-server
    $ cd whatsapp-clone-server

And then we will initialize a new Node.JS project using NPM:

    $ npm init --yes

There's nothing special about this command, it only creates a basic `package.json` which we can add things on top (see [reference](https://docs.npmjs.com/cli/init)). We will be using TypeScript in our project, so let's set it up by installing the necessary packages:

    $ yarn add -D typescript@3.2.4 ts-node@8.0.1 @types/node@10.12.23

And creating a `tsconfig.json` file:

[{]: <helper> (diffStep 1.1 files="tsconfig.json" module="server")

#### [Step 1.1: Setup TypeScript](https://github.com/Urigo/WhatsApp-Clone-Server/commit/9302e04)

##### Added tsconfig.json
```diff
@@ -0,0 +1,64 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "compilerOptions": {
+┊  ┊ 3┊    /* Basic Options */
+┊  ┊ 4┊    "target": "es2018",                       /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017','ES2018' or 'ESNEXT'. */
+┊  ┊ 5┊    "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
+┊  ┊ 6┊    "lib": [                                  /* Specify library files to be included in the compilation. */
+┊  ┊ 7┊      "es2018",
+┊  ┊ 8┊      "esnext.asynciterable"
+┊  ┊ 9┊    ],
+┊  ┊10┊    // "allowJs": true,                       /* Allow javascript files to be compiled. */
+┊  ┊11┊    // "checkJs": true,                       /* Report errors in .js files. */
+┊  ┊12┊    // "jsx": "preserve",                     /* Specify JSX code generation: 'preserve', 'react-native', or 'react'. */
+┊  ┊13┊    // "declaration": true,                   /* Generates corresponding '.d.ts' file. */
+┊  ┊14┊    // "declarationMap": true,                /* Generates a sourcemap for each corresponding '.d.ts' file. */
+┊  ┊15┊    // "sourceMap": true,                     /* Generates corresponding '.map' file. */
+┊  ┊16┊    // "outFile": "./",                       /* Concatenate and emit output to single file. */
+┊  ┊17┊    // "outDir": "./",                        /* Redirect output structure to the directory. */
+┊  ┊18┊    // "rootDir": "./",                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
+┊  ┊19┊    // "composite": true,                     /* Enable project compilation */
+┊  ┊20┊    // "removeComments": true,                /* Do not emit comments to output. */
+┊  ┊21┊    // "noEmit": true,                        /* Do not emit outputs. */
+┊  ┊22┊    // "importHelpers": true,                 /* Import emit helpers from 'tslib'. */
+┊  ┊23┊    // "downlevelIteration": true,            /* Provide full support for iterables in 'for-of', spread, and destructuring when targeting 'ES5' or 'ES3'. */
+┊  ┊24┊    // "isolatedModules": true,               /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */
+┊  ┊25┊
+┊  ┊26┊    /* Strict Type-Checking Options */
+┊  ┊27┊    "strict": true,                           /* Enable all strict type-checking options. */
+┊  ┊28┊    // "noImplicitAny": true,                 /* Raise error on expressions and declarations with an implied 'any' type. */
+┊  ┊29┊    // "strictNullChecks": true,              /* Enable strict null checks. */
+┊  ┊30┊    // See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/21359
+┊  ┊31┊    "strictFunctionTypes": false,             /* Enable strict checking of function types. */
+┊  ┊32┊    // "strictBindCallApply": true,           /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
+┊  ┊33┊    "strictPropertyInitialization": false,    /* Enable strict checking of property initialization in classes. */
+┊  ┊34┊    // "noImplicitThis": true,                /* Raise error on 'this' expressions with an implied 'any' type. */
+┊  ┊35┊    // "alwaysStrict": true,                  /* Parse in strict mode and emit "use strict" for each source file. */
+┊  ┊36┊
+┊  ┊37┊    /* Additional Checks */
+┊  ┊38┊    // "noUnusedLocals": true,                /* Report errors on unused locals. */
+┊  ┊39┊    // "noUnusedParameters": true,            /* Report errors on unused parameters. */
+┊  ┊40┊    // "noImplicitReturns": true,             /* Report error when not all code paths in function return a value. */
+┊  ┊41┊    // "noFallthroughCasesInSwitch": true,    /* Report errors for fallthrough cases in switch statement. */
+┊  ┊42┊
+┊  ┊43┊    /* Module Resolution Options */
+┊  ┊44┊    // "moduleResolution": "node",            /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
+┊  ┊45┊    // "baseUrl": "./",                       /* Base directory to resolve non-absolute module names. */
+┊  ┊46┊    // "paths": {},                           /* A series of entries which re-map imports to lookup locations relative to the 'baseUrl'. */
+┊  ┊47┊    // "rootDirs": [],                        /* List of root folders whose combined content represents the structure of the project at runtime. */
+┊  ┊48┊    // "typeRoots": [],                       /* List of folders to include type definitions from. */
+┊  ┊49┊    // "types": [],                           /* Type declaration files to be included in compilation. */
+┊  ┊50┊    // "allowSyntheticDefaultImports": true,  /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */
+┊  ┊51┊    "esModuleInterop": true,                  /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
+┊  ┊52┊    // "preserveSymlinks": true,              /* Do not resolve the real path of symlinks. */
+┊  ┊53┊
+┊  ┊54┊    /* Source Map Options */
+┊  ┊55┊    // "sourceRoot": "",                      /* Specify the location where debugger should locate TypeScript files instead of source locations. */
+┊  ┊56┊    // "mapRoot": "",                         /* Specify the location where debugger should locate map files instead of generated locations. */
+┊  ┊57┊    // "inlineSourceMap": true,               /* Emit a single file with source maps instead of having a separate file. */
+┊  ┊58┊    // "inlineSources": true,                 /* Emit the source alongside the sourcemaps within a single file; requires '--inlineSourceMap' or '--sourceMap' to be set. */
+┊  ┊59┊
+┊  ┊60┊    /* Experimental Options */
+┊  ┊61┊    "experimentalDecorators": true,           /* Enables experimental support for ES7 decorators. */
+┊  ┊62┊    "emitDecoratorMetadata": true             /* Enables experimental support for emitting type metadata for decorators. */
+┊  ┊63┊  }
+┊  ┊64┊}
```

[}]: #

We will also set a script that will startup the server with `ts-node`, a TypeScript interpreter for Node.JS:

```json
{
  "start": "ts-node index.ts"
}
```

Our `pacakge.json` file should look like so by now:

[{]: <helper> (diffStep 1.1 files="package.json" module="server")

#### [Step 1.1: Setup TypeScript](https://github.com/Urigo/WhatsApp-Clone-Server/commit/9302e04)

##### Changed package.json
```diff
@@ -4,5 +4,13 @@
 ┊ 4┊ 4┊  "repository": {
 ┊ 5┊ 5┊    "type": "git",
 ┊ 6┊ 6┊    "url": "https://Urigo@github.com/Urigo/WhatsApp-Clone-Server.git"
+┊  ┊ 7┊  },
+┊  ┊ 8┊  "scripts": {
+┊  ┊ 9┊    "start": "ts-node index.ts"
+┊  ┊10┊  },
+┊  ┊11┊  "devDependencies": {
+┊  ┊12┊    "@types/node": "10.12.18",
+┊  ┊13┊    "ts-node": "8.0.1",
+┊  ┊14┊    "typescript": "3.2.4"
 ┊ 7┊15┊  }
 ┊ 8┊16┊}
```

[}]: #

In our server we will be using [Express](https://expressjs.com/) to serve our GraphQL REST endpoint which will be handled by Apollo. Accordingly, let's install the necessary dependencies:

    $ yarn add -D @types/body-parser@1.18.3 @types/cors@2.8.5 @types/express@4.16.4 @types/graphql@14.0.4
    $ yarn add apollo-server-express@2.3.1 body-parser@1.18.3 cors@2.8.5 express@4.16.4 graphql@14.0.2

And setup a basic express server with a `/graphql` REST endpoint:

[{]: <helper> (diffStep 1.2 files="index.ts, schema" module="server")

#### [Step 1.2: Setup a basic Express server with a GraphQL REST endpoint](https://github.com/Urigo/WhatsApp-Clone-Server/commit/6f524af)

##### Added index.ts
```diff
@@ -0,0 +1,30 @@
+┊  ┊ 1┊import { ApolloServer } from 'apollo-server-express'
+┊  ┊ 2┊import bodyParser from 'body-parser'
+┊  ┊ 3┊import cors from 'cors'
+┊  ┊ 4┊import express from 'express'
+┊  ┊ 5┊import gql from 'graphql-tag'
+┊  ┊ 6┊import { createServer } from 'http'
+┊  ┊ 7┊import schema from './schema'
+┊  ┊ 8┊
+┊  ┊ 9┊const PORT = 4000
+┊  ┊10┊
+┊  ┊11┊const app = express()
+┊  ┊12┊
+┊  ┊13┊app.use(cors())
+┊  ┊14┊app.use(bodyParser.json())
+┊  ┊15┊
+┊  ┊16┊const apollo = new ApolloServer({ schema })
+┊  ┊17┊
+┊  ┊18┊apollo.applyMiddleware({
+┊  ┊19┊  app,
+┊  ┊20┊  path: '/graphql',
+┊  ┊21┊})
+┊  ┊22┊
+┊  ┊23┊// Wrap the Express server
+┊  ┊24┊const ws = createServer(app)
+┊  ┊25┊
+┊  ┊26┊apollo.installSubscriptionHandlers(ws)
+┊  ┊27┊
+┊  ┊28┊ws.listen(PORT, () => {
+┊  ┊29┊  console.log(`Apollo Server is now running on http://localhost:${PORT}`)
+┊  ┊30┊})
```

##### Added schema&#x2F;index.ts
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊import { makeExecutableSchema } from 'apollo-server-express'
+┊ ┊2┊import resolvers from './resolvers'
+┊ ┊3┊import typeDefs from './typeDefs'
+┊ ┊4┊
+┊ ┊5┊export default makeExecutableSchema({
+┊ ┊6┊  typeDefs,
+┊ ┊7┊  resolvers,
+┊ ┊8┊})
```

##### Added schema&#x2F;resolvers.ts
```diff
@@ -0,0 +1,5 @@
+┊ ┊1┊export default {
+┊ ┊2┊  Query: {
+┊ ┊3┊    chats: () => [],
+┊ ┊4┊  },
+┊ ┊5┊}
```

##### Added schema&#x2F;typeDefs.ts
```diff
@@ -0,0 +1,9 @@
+┊ ┊1┊export default `
+┊ ┊2┊  type Chat {
+┊ ┊3┊    id: ID!
+┊ ┊4┊  }
+┊ ┊5┊
+┊ ┊6┊  type Query {
+┊ ┊7┊    chats: [Chat!]!
+┊ ┊8┊  }
+┊ ┊9┊`
```

[}]: #

Before we proceed any further there's an issue that needs to be clear. Since we're using TypeScript together with GraphQL, by default we will have to maintain 2 schemas: one for TypeScript and the other for GraphQL. Both schemas represent the same thing this way or another, which means that we will have to maintain the same thing twice. Instead of doing so, we will be using a tool called [GraphQL Code Generator](https://graphql-code-generator.com/) (Codegen, in short) to generate TypeScript definitions from our GraphQL schema.

Codegen will change its behavior and generate code based on a set of templates and a configuration file that we will provide. We highly recommend you to go through the [docs page](https://graphql-code-generator.com/docs/getting-started/) of Codegen to get a better understanding of what it is and how it works. Let's install Codegen then, along with the templates that we're gonna use:

    $ yarn -D add graphql-code-generator@0.16.0 graphql-codegen-typescript-common@0.16.0 graphql-codegen-typescript-resolvers@0.16.0

And write its config under `codegen.yml` file:

[{]: <helper> (diffStep 1.3 files="codegen.yml" module="server")

#### [Step 1.3: Setup codegen](https://github.com/Urigo/WhatsApp-Clone-Server/commit/535995c)

##### Added codegen.yml
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊overwrite: true
+┊ ┊2┊schema: ./schema/typeDefs.ts
+┊ ┊3┊require: ts-node/register/transpile-only
+┊ ┊4┊generates:
+┊ ┊5┊  ./types.d.ts:
+┊ ┊6┊    plugins:
+┊ ┊7┊      - typescript-common
+┊ ┊8┊      - typescript-resolvers
```

[}]: #

We will also update the `.gitignore` file to exclude the generated typings file:

[{]: <helper> (diffStep 1.3 files=".gitignore" module="server")

#### [Step 1.3: Setup codegen](https://github.com/Urigo/WhatsApp-Clone-Server/commit/535995c)

##### Changed .gitignore
```diff
@@ -1,2 +1,3 @@
 ┊1┊1┊node_modules
-┊2┊ ┊npm-debug.log🚫↵
+┊ ┊2┊npm-debug.log
+┊ ┊3┊types.d.ts
```

[}]: #

To make things easy, we will add a code generation command in our `package.json` so we can have it available to us whenever we need it. First we will add few utility packages that are necessary for the task:

    $ yarn -D add nodemon@1.18.9 concurrently@4.1.0

And we will update the scripts section in the `package.json` file to look like so:

```json
{
  "generate": "gql-gen",
  "generate:watch": "nodemon --exec yarn generate -e graphql",
  "start:server": "ts-node index.ts",
  "start:server:watch": "nodemon --exec yarn start:server -e ts",
  "dev": "concurrently \"yarn generate:watch\" \"yarn start:server:watch\"",
  "start": "yarn generate && yarn start:server"
}
```

The `package.json` file should look like so by now:

[{]: <helper> (diffStep 1.3 files="package.json" module="server")

#### [Step 1.3: Setup codegen](https://github.com/Urigo/WhatsApp-Clone-Server/commit/535995c)

##### Changed package.json
```diff
@@ -6,7 +6,12 @@
 ┊ 6┊ 6┊    "url": "https://Urigo@github.com/Urigo/WhatsApp-Clone-Server.git"
 ┊ 7┊ 7┊  },
 ┊ 8┊ 8┊  "scripts": {
-┊ 9┊  ┊    "start": "ts-node index.ts"
+┊  ┊ 9┊    "generate": "gql-gen",
+┊  ┊10┊    "generate:watch": "nodemon --exec yarn generate -e graphql",
+┊  ┊11┊    "start:server": "ts-node index.ts",
+┊  ┊12┊    "start:server:watch": "nodemon --exec yarn start:server -e ts",
+┊  ┊13┊    "dev": "concurrently \"yarn generate:watch\" \"yarn start:server:watch\"",
+┊  ┊14┊    "start": "yarn generate && yarn start:server"
 ┊10┊15┊  },
 ┊11┊16┊  "devDependencies": {
 ┊12┊17┊    "@types/body-parser": "1.17.0",
```
```diff
@@ -14,6 +19,11 @@
 ┊14┊19┊    "@types/express": "4.16.0",
 ┊15┊20┊    "@types/graphql": "14.0.4",
 ┊16┊21┊    "@types/node": "10.12.18",
+┊  ┊22┊    "concurrently": "4.1.0",
+┊  ┊23┊    "graphql-code-generator": "0.16.0",
+┊  ┊24┊    "graphql-codegen-typescript-common": "0.16.0",
+┊  ┊25┊    "graphql-codegen-typescript-resolvers": "^0.16.1",
+┊  ┊26┊    "nodemon": "1.18.9",
 ┊17┊27┊    "ts-node": "8.0.1",
 ┊18┊28┊    "typescript": "3.2.4"
 ┊19┊29┊  },
```

[}]: #

To generate some TypeScript definitions all we have to do is run:

    $ yarn generate

And then we can safely run the server with:

    $ yarn start

Alternatively, you can run the server and watch for changes with the following command:

    $ yarn start:server:watch

For practice purpose only, we're gonna serve some dummy data from our GraphQL API so we can have something to work with in our client. Later on we will connect everything to a real database. This would give us an easy start. Our dummy db will consist of a set of chats, each of them has a last message, a picture and a name:

[{]: <helper> (diffStep 1.4 files="index.ts, db.ts, entity, schema, codegen.yml" module="server")

#### [Step 1.4: Add fake DB](https://github.com/Urigo/WhatsApp-Clone-Server/commit/3223310)

##### Changed codegen.yml
```diff
@@ -6,3 +6,9 @@
 ┊ 6┊ 6┊    plugins:
 ┊ 7┊ 7┊      - typescript-common
 ┊ 8┊ 8┊      - typescript-resolvers
+┊  ┊ 9┊    config:
+┊  ┊10┊      optionalType: undefined | null
+┊  ┊11┊      mappers:
+┊  ┊12┊        Chat: ./entity/chat#Chat
+┊  ┊13┊        Message: ./entity/message#Message
+┊  ┊14┊        User: ./entity/user#User
```

##### Added db.ts
```diff
@@ -0,0 +1,274 @@
+┊   ┊  1┊import moment from 'moment'
+┊   ┊  2┊import Chat from './entity/chat'
+┊   ┊  3┊import Message, { MessageType } from './entity/message'
+┊   ┊  4┊import User from './entity/user'
+┊   ┊  5┊
+┊   ┊  6┊const users: User[] = [
+┊   ┊  7┊  {
+┊   ┊  8┊    id: '1',
+┊   ┊  9┊    username: 'ethan',
+┊   ┊ 10┊    password: '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm', // 111
+┊   ┊ 11┊    name: 'Ethan Gonzalez',
+┊   ┊ 12┊    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
+┊   ┊ 13┊  },
+┊   ┊ 14┊  {
+┊   ┊ 15┊    id: '2',
+┊   ┊ 16┊    username: 'bryan',
+┊   ┊ 17┊    password: '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO', // 222
+┊   ┊ 18┊    name: 'Bryan Wallace',
+┊   ┊ 19┊    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
+┊   ┊ 20┊  },
+┊   ┊ 21┊  {
+┊   ┊ 22┊    id: '3',
+┊   ┊ 23┊    username: 'avery',
+┊   ┊ 24┊    password: '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.', // 333
+┊   ┊ 25┊    name: 'Avery Stewart',
+┊   ┊ 26┊    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 27┊  },
+┊   ┊ 28┊  {
+┊   ┊ 29┊    id: '4',
+┊   ┊ 30┊    username: 'katie',
+┊   ┊ 31┊    password: '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi', // 444
+┊   ┊ 32┊    name: 'Katie Peterson',
+┊   ┊ 33┊    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 34┊  },
+┊   ┊ 35┊  {
+┊   ┊ 36┊    id: '5',
+┊   ┊ 37┊    username: 'ray',
+┊   ┊ 38┊    password: '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242', // 555
+┊   ┊ 39┊    name: 'Ray Edwards',
+┊   ┊ 40┊    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊ 41┊  },
+┊   ┊ 42┊  {
+┊   ┊ 43┊    id: '6',
+┊   ┊ 44┊    username: 'niko',
+┊   ┊ 45┊    password: '$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.', // 666
+┊   ┊ 46┊    name: 'Niccolò Belli',
+┊   ┊ 47┊    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊ 48┊  },
+┊   ┊ 49┊  {
+┊   ┊ 50┊    id: '7',
+┊   ┊ 51┊    username: 'mario',
+┊   ┊ 52┊    password: '$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO', // 777
+┊   ┊ 53┊    name: 'Mario Rossi',
+┊   ┊ 54┊    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
+┊   ┊ 55┊  },
+┊   ┊ 56┊]
+┊   ┊ 57┊
+┊   ┊ 58┊const chats: Chat[] = [
+┊   ┊ 59┊  {
+┊   ┊ 60┊    id: '1',
+┊   ┊ 61┊    name: null,
+┊   ┊ 62┊    picture: null,
+┊   ┊ 63┊    allTimeMemberIds: ['1', '3'],
+┊   ┊ 64┊    listingMemberIds: ['1', '3'],
+┊   ┊ 65┊    ownerId: null,
+┊   ┊ 66┊    messages: [
+┊   ┊ 67┊      {
+┊   ┊ 68┊        id: '1',
+┊   ┊ 69┊        chatId: '1',
+┊   ┊ 70┊        senderId: '1',
+┊   ┊ 71┊        content: 'You on your way?',
+┊   ┊ 72┊        createdAt: moment()
+┊   ┊ 73┊          .subtract(1, 'hours')
+┊   ┊ 74┊          .unix(),
+┊   ┊ 75┊        type: MessageType.TEXT,
+┊   ┊ 76┊        holderIds: ['1', '3'],
+┊   ┊ 77┊      },
+┊   ┊ 78┊      {
+┊   ┊ 79┊        id: '2',
+┊   ┊ 80┊        chatId: '1',
+┊   ┊ 81┊        senderId: '3',
+┊   ┊ 82┊        content: 'Yep!',
+┊   ┊ 83┊        createdAt: moment()
+┊   ┊ 84┊          .subtract(1, 'hours')
+┊   ┊ 85┊          .add(5, 'minutes')
+┊   ┊ 86┊          .unix(),
+┊   ┊ 87┊        type: MessageType.TEXT,
+┊   ┊ 88┊        holderIds: ['3', '1'],
+┊   ┊ 89┊      },
+┊   ┊ 90┊    ],
+┊   ┊ 91┊  },
+┊   ┊ 92┊  {
+┊   ┊ 93┊    id: '2',
+┊   ┊ 94┊    name: null,
+┊   ┊ 95┊    picture: null,
+┊   ┊ 96┊    allTimeMemberIds: ['1', '4'],
+┊   ┊ 97┊    listingMemberIds: ['1', '4'],
+┊   ┊ 98┊    ownerId: null,
+┊   ┊ 99┊    messages: [
+┊   ┊100┊      {
+┊   ┊101┊        id: '1',
+┊   ┊102┊        chatId: '2',
+┊   ┊103┊        senderId: '1',
+┊   ┊104┊        content: "Hey, it's me",
+┊   ┊105┊        createdAt: moment()
+┊   ┊106┊          .subtract(2, 'hours')
+┊   ┊107┊          .unix(),
+┊   ┊108┊        type: MessageType.TEXT,
+┊   ┊109┊        holderIds: ['1', '4'],
+┊   ┊110┊      },
+┊   ┊111┊    ],
+┊   ┊112┊  },
+┊   ┊113┊  {
+┊   ┊114┊    id: '3',
+┊   ┊115┊    name: null,
+┊   ┊116┊    picture: null,
+┊   ┊117┊    allTimeMemberIds: ['1', '5'],
+┊   ┊118┊    listingMemberIds: ['1', '5'],
+┊   ┊119┊    ownerId: null,
+┊   ┊120┊    messages: [
+┊   ┊121┊      {
+┊   ┊122┊        id: '1',
+┊   ┊123┊        chatId: '3',
+┊   ┊124┊        senderId: '1',
+┊   ┊125┊        content: 'I should buy a boat',
+┊   ┊126┊        createdAt: moment()
+┊   ┊127┊          .subtract(1, 'days')
+┊   ┊128┊          .unix(),
+┊   ┊129┊        type: MessageType.TEXT,
+┊   ┊130┊        holderIds: ['1', '5'],
+┊   ┊131┊      },
+┊   ┊132┊      {
+┊   ┊133┊        id: '2',
+┊   ┊134┊        chatId: '3',
+┊   ┊135┊        senderId: '1',
+┊   ┊136┊        content: 'You still there?',
+┊   ┊137┊        createdAt: moment()
+┊   ┊138┊          .subtract(1, 'days')
+┊   ┊139┊          .add(16, 'hours')
+┊   ┊140┊          .unix(),
+┊   ┊141┊        type: MessageType.TEXT,
+┊   ┊142┊        holderIds: ['1', '5'],
+┊   ┊143┊      },
+┊   ┊144┊    ],
+┊   ┊145┊  },
+┊   ┊146┊  {
+┊   ┊147┊    id: '4',
+┊   ┊148┊    name: null,
+┊   ┊149┊    picture: null,
+┊   ┊150┊    allTimeMemberIds: ['3', '4'],
+┊   ┊151┊    listingMemberIds: ['3', '4'],
+┊   ┊152┊    ownerId: null,
+┊   ┊153┊    messages: [
+┊   ┊154┊      {
+┊   ┊155┊        id: '1',
+┊   ┊156┊        chatId: '4',
+┊   ┊157┊        senderId: '3',
+┊   ┊158┊        content: 'Look at my mukluks!',
+┊   ┊159┊        createdAt: moment()
+┊   ┊160┊          .subtract(4, 'days')
+┊   ┊161┊          .unix(),
+┊   ┊162┊        type: MessageType.TEXT,
+┊   ┊163┊        holderIds: ['3', '4'],
+┊   ┊164┊      },
+┊   ┊165┊    ],
+┊   ┊166┊  },
+┊   ┊167┊  {
+┊   ┊168┊    id: '5',
+┊   ┊169┊    name: null,
+┊   ┊170┊    picture: null,
+┊   ┊171┊    allTimeMemberIds: ['2', '5'],
+┊   ┊172┊    listingMemberIds: ['2', '5'],
+┊   ┊173┊    ownerId: null,
+┊   ┊174┊    messages: [
+┊   ┊175┊      {
+┊   ┊176┊        id: '1',
+┊   ┊177┊        chatId: '5',
+┊   ┊178┊        senderId: '2',
+┊   ┊179┊        content: 'This is wicked good ice cream.',
+┊   ┊180┊        createdAt: moment()
+┊   ┊181┊          .subtract(2, 'weeks')
+┊   ┊182┊          .unix(),
+┊   ┊183┊        type: MessageType.TEXT,
+┊   ┊184┊        holderIds: ['2', '5'],
+┊   ┊185┊      },
+┊   ┊186┊      {
+┊   ┊187┊        id: '2',
+┊   ┊188┊        chatId: '6',
+┊   ┊189┊        senderId: '5',
+┊   ┊190┊        content: 'Love it!',
+┊   ┊191┊        createdAt: moment()
+┊   ┊192┊          .subtract(2, 'weeks')
+┊   ┊193┊          .add(10, 'minutes')
+┊   ┊194┊          .unix(),
+┊   ┊195┊        type: MessageType.TEXT,
+┊   ┊196┊        holderIds: ['5', '2'],
+┊   ┊197┊      },
+┊   ┊198┊    ],
+┊   ┊199┊  },
+┊   ┊200┊  {
+┊   ┊201┊    id: '6',
+┊   ┊202┊    name: null,
+┊   ┊203┊    picture: null,
+┊   ┊204┊    allTimeMemberIds: ['1', '6'],
+┊   ┊205┊    listingMemberIds: ['1'],
+┊   ┊206┊    ownerId: null,
+┊   ┊207┊    messages: [],
+┊   ┊208┊  },
+┊   ┊209┊  {
+┊   ┊210┊    id: '7',
+┊   ┊211┊    name: null,
+┊   ┊212┊    picture: null,
+┊   ┊213┊    allTimeMemberIds: ['2', '1'],
+┊   ┊214┊    listingMemberIds: ['2'],
+┊   ┊215┊    ownerId: null,
+┊   ┊216┊    messages: [],
+┊   ┊217┊  },
+┊   ┊218┊  {
+┊   ┊219┊    id: '8',
+┊   ┊220┊    name: 'A user 0 group',
+┊   ┊221┊    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊222┊    allTimeMemberIds: ['1', '3', '4', '6'],
+┊   ┊223┊    listingMemberIds: ['1', '3', '4', '6'],
+┊   ┊224┊    ownerId: '1',
+┊   ┊225┊    messages: [
+┊   ┊226┊      {
+┊   ┊227┊        id: '1',
+┊   ┊228┊        chatId: '8',
+┊   ┊229┊        senderId: '1',
+┊   ┊230┊        content: 'I made a group',
+┊   ┊231┊        createdAt: moment()
+┊   ┊232┊          .subtract(2, 'weeks')
+┊   ┊233┊          .unix(),
+┊   ┊234┊        type: MessageType.TEXT,
+┊   ┊235┊        holderIds: ['1', '3', '4', '6'],
+┊   ┊236┊      },
+┊   ┊237┊      {
+┊   ┊238┊        id: '2',
+┊   ┊239┊        chatId: '8',
+┊   ┊240┊        senderId: '1',
+┊   ┊241┊        content: 'Ops, user 3 was not supposed to be here',
+┊   ┊242┊        createdAt: moment()
+┊   ┊243┊          .subtract(2, 'weeks')
+┊   ┊244┊          .add(2, 'minutes')
+┊   ┊245┊          .unix(),
+┊   ┊246┊        type: MessageType.TEXT,
+┊   ┊247┊        holderIds: ['1', '4', '6'],
+┊   ┊248┊      },
+┊   ┊249┊      {
+┊   ┊250┊        id: '3',
+┊   ┊251┊        chatId: '8',
+┊   ┊252┊        senderId: '4',
+┊   ┊253┊        content: 'Awesome!',
+┊   ┊254┊        createdAt: moment()
+┊   ┊255┊          .subtract(2, 'weeks')
+┊   ┊256┊          .add(10, 'minutes')
+┊   ┊257┊          .unix(),
+┊   ┊258┊        type: MessageType.TEXT,
+┊   ┊259┊        holderIds: ['1', '4', '6'],
+┊   ┊260┊      },
+┊   ┊261┊    ],
+┊   ┊262┊  },
+┊   ┊263┊  {
+┊   ┊264┊    id: '9',
+┊   ┊265┊    name: 'A user 5 group',
+┊   ┊266┊    picture: null,
+┊   ┊267┊    allTimeMemberIds: ['6', '3'],
+┊   ┊268┊    listingMemberIds: ['6', '3'],
+┊   ┊269┊    ownerId: '6',
+┊   ┊270┊    messages: [],
+┊   ┊271┊  },
+┊   ┊272┊]
+┊   ┊273┊
+┊   ┊274┊export default { users, chats }
```

##### Added entity&#x2F;chat.ts
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊import Message from './message'
+┊  ┊ 2┊
+┊  ┊ 3┊export interface Chat {
+┊  ┊ 4┊  id: string
+┊  ┊ 5┊  name?: string | null
+┊  ┊ 6┊  picture?: string | null
+┊  ┊ 7┊  // All members, current and past ones.
+┊  ┊ 8┊  allTimeMemberIds: string[]
+┊  ┊ 9┊  // Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊  ┊10┊  listingMemberIds: string[]
+┊  ┊11┊  // Actual members of the group (they are not the only ones who get the group listed). Null for chats.
+┊  ┊12┊  actualGroupMemberIds?: string[] | null
+┊  ┊13┊  adminIds?: string[] | null
+┊  ┊14┊  ownerId?: string | null
+┊  ┊15┊  messages: Message[]
+┊  ┊16┊}
+┊  ┊17┊
+┊  ┊18┊export default Chat
```

##### Added entity&#x2F;message.ts
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import Recipient from './recipient'
+┊  ┊ 2┊
+┊  ┊ 3┊export enum MessageType {
+┊  ┊ 4┊  PICTURE,
+┊  ┊ 5┊  TEXT,
+┊  ┊ 6┊  LOCATION,
+┊  ┊ 7┊}
+┊  ┊ 8┊
+┊  ┊ 9┊export interface Message {
+┊  ┊10┊  id: string
+┊  ┊11┊  chatId: string
+┊  ┊12┊  senderId: string
+┊  ┊13┊  content: string
+┊  ┊14┊  createdAt: number
+┊  ┊15┊  type: MessageType
+┊  ┊16┊  recipients: Recipient[]
+┊  ┊17┊  holderIds: string[]
+┊  ┊18┊}
+┊  ┊19┊
+┊  ┊20┊export default Message
```

##### Added entity&#x2F;user.ts
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊export interface User {
+┊  ┊ 2┊  id: string
+┊  ┊ 3┊  username: string
+┊  ┊ 4┊  password: string
+┊  ┊ 5┊  name: string
+┊  ┊ 6┊  picture?: string | null
+┊  ┊ 7┊  phone?: string | null
+┊  ┊ 8┊}
+┊  ┊ 9┊
+┊  ┊10┊export default User
```

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,83 @@
+┊  ┊ 1┊import { IResolvers as IApolloResolvers } from 'apollo-server-express'
+┊  ┊ 2┊import { GraphQLDateTime } from 'graphql-iso-date'
+┊  ┊ 3┊import db from '../db'
+┊  ┊ 4┊import Chat from '../entity/chat'
+┊  ┊ 5┊import Message from '../entity/message'
+┊  ┊ 6┊import Recipient from '../entity/recipient'
+┊  ┊ 7┊import User from '../entity/user'
+┊  ┊ 8┊import { IResolvers } from '../types'
+┊  ┊ 9┊
+┊  ┊10┊let users = db.users
+┊  ┊11┊let chats = db.chats
+┊  ┊12┊const currentUser: string = '1'
+┊  ┊13┊
 ┊ 1┊14┊export default {
+┊  ┊15┊  Date: GraphQLDateTime,
 ┊ 2┊16┊  Query: {
-┊ 3┊  ┊    chats: () => [],
+┊  ┊17┊    // Show all users for the moment.
+┊  ┊18┊    users: () => users.filter(user => user.id !== currentUser),
+┊  ┊19┊    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
+┊  ┊20┊    chat: (obj, { chatId }) => chats.find(chat => chat.id === chatId) || null,
 ┊ 4┊21┊  },
-┊ 5┊  ┊}
+┊  ┊22┊  Chat: {
+┊  ┊23┊    name: (chat) =>
+┊  ┊24┊      chat.name
+┊  ┊25┊        ? chat.name
+┊  ┊26┊        : users.find(
+┊  ┊27┊            user => user.id === chat.allTimeMemberIds.find((userId: string) => userId !== currentUser)
+┊  ┊28┊          )!.name,
+┊  ┊29┊    picture: (chat) =>
+┊  ┊30┊      chat.name
+┊  ┊31┊        ? chat.picture
+┊  ┊32┊        : users.find(
+┊  ┊33┊            user => user.id === chat.allTimeMemberIds.find((userId: string) => userId !== currentUser)
+┊  ┊34┊          )!.picture,
+┊  ┊35┊    allTimeMembers: (chat) =>
+┊  ┊36┊      users.filter(user => chat.allTimeMemberIds.includes(user.id)),
+┊  ┊37┊    listingMembers: (chat) =>
+┊  ┊38┊      users.filter(user => chat.listingMemberIds.includes(user.id)),
+┊  ┊39┊    actualGroupMembers: (chat) =>
+┊  ┊40┊      users.filter(
+┊  ┊41┊        user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)
+┊  ┊42┊      ),
+┊  ┊43┊    admins: (chat) =>
+┊  ┊44┊      users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
+┊  ┊45┊    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
+┊  ┊46┊    messages: (chat, { amount = 0 }) => {
+┊  ┊47┊      const messages =
+┊  ┊48┊        chat.messages
+┊  ┊49┊          .filter((message: Message) => message.holderIds.includes(currentUser))
+┊  ┊50┊          .sort((a: Message, b: Message) => b.createdAt - a.createdAt) || []
+┊  ┊51┊      return (amount ? messages.slice(0, amount) : messages).reverse()
+┊  ┊52┊    },
+┊  ┊53┊    unreadMessages: (chat) =>
+┊  ┊54┊      chat.messages.filter(
+┊  ┊55┊        (message: Message) =>
+┊  ┊56┊          message.holderIds.includes(currentUser) &&
+┊  ┊57┊          message.recipients.find(
+┊  ┊58┊            (recipient: Recipient) => recipient.userId === currentUser && !recipient.readAt
+┊  ┊59┊          )
+┊  ┊60┊      ).length,
+┊  ┊61┊    lastMessage: (chat) => chat.messages[chat.messages.length - 1],
+┊  ┊62┊    isGroup: (chat) => !!chat.name,
+┊  ┊63┊  },
+┊  ┊64┊  Message: {
+┊  ┊65┊    chat: (message) =>
+┊  ┊66┊      chats.find(chat => message.chatId === chat.id) || null,
+┊  ┊67┊    sender: (message) =>
+┊  ┊68┊      users.find(user => user.id === message.senderId) || null,
+┊  ┊69┊    holders: (message) =>
+┊  ┊70┊      users.filter(user => message.holderIds.includes(user.id)),
+┊  ┊71┊    ownership: (message) => message.senderId === currentUser,
+┊  ┊72┊  },
+┊  ┊73┊  Recipient: {
+┊  ┊74┊    user: (recipient) =>
+┊  ┊75┊      users.find(user => recipient.userId === user.id) || null,
+┊  ┊76┊    message: (recipient) => {
+┊  ┊77┊      const chat = chats.find(chat => recipient.chatId === chat.id)
+┊  ┊78┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null
+┊  ┊79┊    },
+┊  ┊80┊    chat: (recipient) =>
+┊  ┊81┊      chats.find(chat => recipient.chatId === chat.id) || null,
+┊  ┊82┊  },
+┊  ┊83┊} as IResolvers as IApolloResolvers
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -1,9 +1,54 @@
 ┊ 1┊ 1┊export default `
+┊  ┊ 2┊  scalar Date
+┊  ┊ 3┊
+┊  ┊ 4┊  type Query {
+┊  ┊ 5┊    users: [User!]
+┊  ┊ 6┊    chats: [Chat!]
+┊  ┊ 7┊    chat(chatId: ID!): Chat
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  enum MessageType {
+┊  ┊11┊    LOCATION
+┊  ┊12┊    TEXT
+┊  ┊13┊    PICTURE
+┊  ┊14┊  }
+┊  ┊15┊
 ┊ 2┊16┊  type Chat {
+┊  ┊17┊    #May be a chat or a group
 ┊ 3┊18┊    id: ID!
+┊  ┊19┊    #Computed for chats
+┊  ┊20┊    name: String
+┊  ┊21┊    updatedAt: Date
+┊  ┊22┊    #Computed for chats
+┊  ┊23┊    picture: String
+┊  ┊24┊    #All members, current and past ones.
+┊  ┊25┊    allTimeMembers: [User!]!
+┊  ┊26┊    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊  ┊27┊    listingMembers: [User!]!
+┊  ┊28┊    #If null the group is read-only. Null for chats.
+┊  ┊29┊    owner: User
+┊  ┊30┊    messages(amount: Int): [Message]!
+┊  ┊31┊    lastMessage: Message
 ┊ 4┊32┊  }
 ┊ 5┊33┊
-┊ 6┊  ┊  type Query {
-┊ 7┊  ┊    chats: [Chat!]!
+┊  ┊34┊  type Message {
+┊  ┊35┊    id: ID!
+┊  ┊36┊    sender: User!
+┊  ┊37┊    chat: Chat!
+┊  ┊38┊    content: String!
+┊  ┊39┊    createdAt: Date!
+┊  ┊40┊    #FIXME: should return MessageType
+┊  ┊41┊    type: Int!
+┊  ┊42┊    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
+┊  ┊43┊    holders: [User!]!
+┊  ┊44┊    #Computed property
+┊  ┊45┊    ownership: Boolean!
+┊  ┊46┊  }
+┊  ┊47┊
+┊  ┊48┊  type User {
+┊  ┊49┊    id: ID!
+┊  ┊50┊    name: String
+┊  ┊51┊    picture: String
+┊  ┊52┊    phone: String
 ┊ 8┊53┊  }
 ┊ 9┊54┊`
```

[}]: #

As you can see, we've added an `entity` folder which treats each entity independently. This will server us greatly is the new future when we will connect each entity to a database. The GraphQL resolvers are the "projectors" of the data stored in the fake DB, and they will serve it based on their implementation and provided parameters.

Now, let's make the necessary modifications to our client so it can work alongside the server and show the data that it contains. Similarly to the server, we don't wanna maintain a TypeScript code base for our GraphQL documents, therefore we will install Codegen for the client as well. Let's install the necessary NPM packages:

    $ yarn add -D graphql-code-generator@0.16.0 graphql-codegen-typescript-client@0.16.0 graphql-codegen-typescript-common@0.16.0

Write a Codegen config:

[{]: <helper> (diffStep 1.4 files="codegen.yml, codegen-interpreter.ts" module="client")

#### [Step 1.4: Setup codegen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/08dcb57)

##### Added codegen-interpreter.ts
```diff
@@ -0,0 +1,6 @@
+┊ ┊1┊require('ts-node').register({
+┊ ┊2┊  transpileOnly: true,
+┊ ┊3┊  compilerOptions: {
+┊ ┊4┊    module: 'commonjs'
+┊ ┊5┊  }
+┊ ┊6┊})
```

##### Added codegen.yml
```diff
@@ -0,0 +1,12 @@
+┊  ┊ 1┊schema: ../WhatsApp-Clone-Server/schema/typeDefs.ts
+┊  ┊ 2┊documents:
+┊  ┊ 3┊  - ./src/**/*.tsx
+┊  ┊ 4┊  - ./src/**/*.ts
+┊  ┊ 5┊overwrite: true
+┊  ┊ 6┊require:
+┊  ┊ 7┊  - ts-node/../../codegen-interpreter.ts
+┊  ┊ 8┊generates:
+┊  ┊ 9┊  ./src/graphql/types.ts:
+┊  ┊10┊    plugins:
+┊  ┊11┊      - typescript-common
+┊  ┊12┊      - typescript-client
```

[}]: #

And define `.gitignore` rules that will not include generated files in our git project:

[{]: <helper> (diffStep 1.4 files="src/graphql/.gitignore" module="client")

#### [Step 1.4: Setup codegen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/08dcb57)

##### Added src&#x2F;graphql&#x2F;.gitignore
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊introspection.json
+┊ ┊2┊types.ts
```

[}]: #

Few things you should note:

- Our `codegen.yml` config references directly to the schema file in our server, which means that the server should be cloned alongside the client. Codegen also supports providing a REST endpoint, but if possible it's better to avoid it because this way you don't need to provide credentials. Indeed, the plan is to have an authentication mechanism to guard our GraphQL REST endpoint.
- The `codegen-interpreter.ts` file is necessary because it extends the `tsconfig.json` file without us actually changing it. If you'll try to edit the `tsconfig.json` file directly, then `react-scripts` will change it back to its original form.

We will also add the necessary scripts to our `pacakge.json` so we can run `code-gen`:

```json
{
  "start": "concurrently \"yarn generate:watch\" \"react-scripts start\"",
  "generate": "gql-gen",
  "generate:watch": "nodemon --exec yarn generate -e graphql"
}
```

Be sure to install `concurrently` and `nodemon` so the scripts can work as intended:

    $ yarn add -D nodemon@1.18.9 ts-node@7.0.1 concurrently@4.1.0

At this point our `package.json` file should look like this:

[{]: <helper> (diffStep 1.4 files="package.json" module="client")

#### [Step 1.4: Setup codegen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/08dcb57)

##### Changed package.json
```diff
@@ -22,13 +22,21 @@
 ┊22┊22┊  },
 ┊23┊23┊  "devDependencies": {
 ┊24┊24┊    "@types/graphql": "14.0.5",
-┊25┊  ┊    "@types/node": "10.12.18"
+┊  ┊25┊    "@types/node": "10.12.18",
+┊  ┊26┊    "concurrently": "4.1.0",
+┊  ┊27┊    "graphql-code-generator": "0.16.0",
+┊  ┊28┊    "graphql-codegen-typescript-client": "0.16.0",
+┊  ┊29┊    "graphql-codegen-typescript-common": "0.16.0",
+┊  ┊30┊    "nodemon": "1.18.9",
+┊  ┊31┊    "ts-node": "7.0.1"
 ┊26┊32┊  },
 ┊27┊33┊  "scripts": {
-┊28┊  ┊    "start": "react-scripts start",
+┊  ┊34┊    "start": "concurrently \"yarn generate:watch\" \"react-scripts start\"",
 ┊29┊35┊    "build": "react-scripts build",
 ┊30┊36┊    "test": "react-scripts test",
-┊31┊  ┊    "eject": "react-scripts eject"
+┊  ┊37┊    "eject": "react-scripts eject",
+┊  ┊38┊    "generate": "gql-gen",
+┊  ┊39┊    "generate:watch": "nodemon --exec yarn generate -e graphql"
 ┊32┊40┊  },
 ┊33┊41┊  "eslintConfig": {
 ┊34┊42┊    "extends": "react-app"
```

[}]: #

Now whenever we would like to generate some TypeScript definitions we can simply run:

    $ yarn generate

Alternatively we can just start the app on watch mode with `$ yarn start` and the Codegen should be listening for changes as well.

    $ yarn start

Now let's build a dashboard that will show all the chats in the server. Rather than implementing all the components and stylesheets from scratch, we will be using [`material-ui`](https://material-ui.com/) (aka Material). Material comes with pre-made components which are highly functional and work smooth with animations. To set it up we will first install it:

    $ yarn add @material-ui/core@3.9.2 @material-ui/icons@3.0.2

And then we will initialize it with the right theme values:

[{]: <helper> (diffStep 1.5 files="src/index.tsx" module="client")

#### [Step 1.5: Setup theme](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/056fc51)

##### Changed src&#x2F;index.tsx
```diff
@@ -1,3 +1,4 @@
+┊ ┊1┊import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
 ┊1┊2┊import React from 'react';
 ┊2┊3┊import ReactDOM from 'react-dom';
 ┊3┊4┊import { ApolloProvider } from 'react-apollo-hooks';
```
```diff
@@ -6,10 +7,22 @@
 ┊ 6┊ 7┊import apolloClient from './apollo-client'
 ┊ 7┊ 8┊import * as serviceWorker from './serviceWorker';
 ┊ 8┊ 9┊
+┊  ┊10┊const theme = createMuiTheme({
+┊  ┊11┊  palette: {
+┊  ┊12┊    primary: { main: '#2c6157' },
+┊  ┊13┊    secondary: { main: '#6fd056' },
+┊  ┊14┊  },
+┊  ┊15┊  typography: {
+┊  ┊16┊    useNextVariants: true,
+┊  ┊17┊  },
+┊  ┊18┊})
+┊  ┊19┊
 ┊ 9┊20┊ReactDOM.render(
-┊10┊  ┊  <ApolloProvider client={apolloClient}>
-┊11┊  ┊    <App />
-┊12┊  ┊  </ApolloProvider>
+┊  ┊21┊  <MuiThemeProvider theme={theme}>
+┊  ┊22┊    <ApolloProvider client={apolloClient}>
+┊  ┊23┊      <App />
+┊  ┊24┊    </ApolloProvider>
+┊  ┊25┊  </MuiThemeProvider>
 ┊13┊26┊, document.getElementById('root'));
 ┊14┊27┊
 ┊15┊28┊// If you want your app to work offline and load faster, you can change
```

[}]: #

The theme values represent the main colors in our app. If you're familiar with WhatsApp, you know that its main colors consist mostly of Green and White. The theme values will automatically give Material components the desired style.

We will also make sure that the same values are available in our CSS stylesheet so we can use it outside Material's scope:

[{]: <helper> (diffStep 1.5 files="src/index.css" module="client")

#### [Step 1.5: Setup theme](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/056fc51)

##### Changed src&#x2F;index.css
```diff
@@ -1,3 +1,10 @@
+┊  ┊ 1┊:root {
+┊  ┊ 2┊  --primary-bg: #2c6157;
+┊  ┊ 3┊  --secondary-bg: #6fd056;
+┊  ┊ 4┊  --primary-text: white;
+┊  ┊ 5┊  --secondary-text: white;
+┊  ┊ 6┊}
+┊  ┊ 7┊
 ┊ 1┊ 8┊body {
 ┊ 2┊ 9┊  margin: 0;
 ┊ 3┊10┊  padding: 0;
```

[}]: #

Now we're ready to start implementing the view itself. The logic is very simple, we will use a query to fetch the chats from our back-end. Accordingly we will need to define the right [GraphQL fragments](https://www.apollographql.com/docs/react/advanced/fragments.html) so we can use them to build the query. In short, a fragment is used to represent an entity in our app. **It doesn't necessarily has to represent a type**, but indeed it's the most common use case:

[{]: <helper> (diffStep 1.6 files="src/graphql/fragments" module="client")

#### [Step 1.6: Add ChatsListScreen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/f825cc5)

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;chat.fragment.ts
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import message from './message.fragment'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  fragment Chat on Chat {
+┊  ┊ 6┊    id
+┊  ┊ 7┊    name
+┊  ┊ 8┊    picture
+┊  ┊ 9┊    allTimeMembers {
+┊  ┊10┊      id
+┊  ┊11┊      name
+┊  ┊12┊      picture
+┊  ┊13┊    }
+┊  ┊14┊    owner {
+┊  ┊15┊      id
+┊  ┊16┊    }
+┊  ┊17┊    lastMessage {
+┊  ┊18┊      ...Message
+┊  ┊19┊    }
+┊  ┊20┊  }
+┊  ┊21┊  ${message}
+┊  ┊22┊`
```

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;index.ts
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊export { default as chat } from './chat.fragment'
+┊ ┊2┊export { default as message } from './message.fragment'
```

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;message.fragment.ts
```diff
@@ -0,0 +1,33 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊
+┊  ┊ 3┊export default gql`
+┊  ┊ 4┊  fragment Message on Message {
+┊  ┊ 5┊    id
+┊  ┊ 6┊    chat {
+┊  ┊ 7┊      id
+┊  ┊ 8┊    }
+┊  ┊ 9┊    sender {
+┊  ┊10┊      id
+┊  ┊11┊      name
+┊  ┊12┊    }
+┊  ┊13┊    content
+┊  ┊14┊    createdAt
+┊  ┊15┊    recipients {
+┊  ┊16┊      user {
+┊  ┊17┊        id
+┊  ┊18┊      }
+┊  ┊19┊      message {
+┊  ┊20┊        id
+┊  ┊21┊        chat {
+┊  ┊22┊          id
+┊  ┊23┊        }
+┊  ┊24┊      }
+┊  ┊25┊      chat {
+┊  ┊26┊        id
+┊  ┊27┊      }
+┊  ┊28┊      receivedAt
+┊  ┊29┊      readAt
+┊  ┊30┊    }
+┊  ┊31┊    ownership
+┊  ┊32┊  }
+┊  ┊33┊`
```

[}]: #

Let's move on to implementing the components. The layout is simple and consists of a navigation bar and a chats list. There are few important details you should note about the components:

- They use [Material's](https://material-ui.com) pre-made components and icons, which are styled and highly functional right out of the box.
- Instead of using CSS to style our components we use [`styled-components`](https://www.styled-components.com/). This way we can encapsulate the style and it will live right next to the component.
- We will use [`react-apollo-hooks`](https://github.com/trojanowski/react-apollo-hooks) to connect our Apollo client with our React components. **This library is experimental and shouldn't be used in production yet**.

[{]: <helper> (diffStep 1.6 files="src/components" module="client")

#### [Step 1.6: Add ChatsListScreen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/f825cc5)

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsList.tsx
```diff
@@ -0,0 +1,108 @@
+┊   ┊  1┊import List from '@material-ui/core/List'
+┊   ┊  2┊import ListItem from '@material-ui/core/ListItem'
+┊   ┊  3┊import gql from 'graphql-tag'
+┊   ┊  4┊import * as moment from 'moment'
+┊   ┊  5┊import * as React from 'react'
+┊   ┊  6┊import { useQuery } from 'react-apollo-hooks'
+┊   ┊  7┊import * as ReactDOM from 'react-dom'
+┊   ┊  8┊import styled from 'styled-components'
+┊   ┊  9┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 10┊import { ChatsListQuery } from '../../graphql/types'
+┊   ┊ 11┊
+┊   ┊ 12┊const Style = styled.div`
+┊   ┊ 13┊  height: calc(100% - 56px);
+┊   ┊ 14┊  overflow-y: overlay;
+┊   ┊ 15┊
+┊   ┊ 16┊  .ChatsList-chats-list {
+┊   ┊ 17┊    padding: 0;
+┊   ┊ 18┊  }
+┊   ┊ 19┊
+┊   ┊ 20┊  .ChatsList-chat-item {
+┊   ┊ 21┊    height: 76px;
+┊   ┊ 22┊    padding: 0 15px;
+┊   ┊ 23┊    display: flex;
+┊   ┊ 24┊  }
+┊   ┊ 25┊
+┊   ┊ 26┊  .ChatsList-profile-pic {
+┊   ┊ 27┊    height: 50px;
+┊   ┊ 28┊    width: 50px;
+┊   ┊ 29┊    object-fit: cover;
+┊   ┊ 30┊    border-radius: 50%;
+┊   ┊ 31┊  }
+┊   ┊ 32┊
+┊   ┊ 33┊  .ChatsList-info {
+┊   ┊ 34┊    width: calc(100% - 60px);
+┊   ┊ 35┊    height: calc(100% - 30px);
+┊   ┊ 36┊    padding: 15px 0;
+┊   ┊ 37┊    margin-left: 10px;
+┊   ┊ 38┊    border-bottom: 0.5px solid silver;
+┊   ┊ 39┊    position: relative;
+┊   ┊ 40┊  }
+┊   ┊ 41┊
+┊   ┊ 42┊  .ChatsList-name {
+┊   ┊ 43┊    margin-top: 5px;
+┊   ┊ 44┊  }
+┊   ┊ 45┊
+┊   ┊ 46┊  .ChatsList-last-message {
+┊   ┊ 47┊    color: gray;
+┊   ┊ 48┊    font-size: 15px;
+┊   ┊ 49┊    margin-top: 5px;
+┊   ┊ 50┊    text-overflow: ellipsis;
+┊   ┊ 51┊    overflow: hidden;
+┊   ┊ 52┊    white-space: nowrap;
+┊   ┊ 53┊  }
+┊   ┊ 54┊
+┊   ┊ 55┊  .ChatsList-timestamp {
+┊   ┊ 56┊    position: absolute;
+┊   ┊ 57┊    color: gray;
+┊   ┊ 58┊    top: 20px;
+┊   ┊ 59┊    right: 0;
+┊   ┊ 60┊    font-size: 13px;
+┊   ┊ 61┊  }
+┊   ┊ 62┊`
+┊   ┊ 63┊
+┊   ┊ 64┊const query = gql`
+┊   ┊ 65┊  query ChatsListQuery {
+┊   ┊ 66┊    chats {
+┊   ┊ 67┊      ...Chat
+┊   ┊ 68┊    }
+┊   ┊ 69┊  }
+┊   ┊ 70┊
+┊   ┊ 71┊  ${fragments.chat}
+┊   ┊ 72┊`
+┊   ┊ 73┊
+┊   ┊ 74┊export default () => {
+┊   ┊ 75┊  const {
+┊   ┊ 76┊    data: { chats },
+┊   ┊ 77┊  } = useQuery<ChatsListQuery.Query>(query)
+┊   ┊ 78┊
+┊   ┊ 79┊  return (
+┊   ┊ 80┊    <Style className="ChatsList">
+┊   ┊ 81┊      <List className="ChatsList-chats-list">
+┊   ┊ 82┊        {chats.map(chat => (
+┊   ┊ 83┊          <ListItem
+┊   ┊ 84┊            key={chat.id}
+┊   ┊ 85┊            className="ChatsList-chat-item"
+┊   ┊ 86┊            button
+┊   ┊ 87┊          >
+┊   ┊ 88┊            <img
+┊   ┊ 89┊              className="ChatsList-profile-pic"
+┊   ┊ 90┊              src={chat.picture || '/assets/default-profile-pic.jpg'}
+┊   ┊ 91┊            />
+┊   ┊ 92┊            <div className="ChatsList-info">
+┊   ┊ 93┊              <div className="ChatsList-name">{chat.name}</div>
+┊   ┊ 94┊              {chat.lastMessage && (
+┊   ┊ 95┊                <React.Fragment>
+┊   ┊ 96┊                  <div className="ChatsList-last-message">{chat.lastMessage.content}</div>
+┊   ┊ 97┊                  <div className="ChatsList-timestamp">
+┊   ┊ 98┊                    {moment(chat.lastMessage.createdAt).format('HH:mm')}
+┊   ┊ 99┊                  </div>
+┊   ┊100┊                </React.Fragment>
+┊   ┊101┊              )}
+┊   ┊102┊            </div>
+┊   ┊103┊          </ListItem>
+┊   ┊104┊        ))}
+┊   ┊105┊      </List>
+┊   ┊106┊    </Style>
+┊   ┊107┊  )
+┊   ┊108┊}
```

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsNavbar.tsx
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊import * as React from 'react'
+┊  ┊ 2┊import styled from 'styled-components'
+┊  ┊ 3┊
+┊  ┊ 4┊const Style = styled.div`
+┊  ┊ 5┊  .ChatsNavbar-title {
+┊  ┊ 6┊    float: left;
+┊  ┊ 7┊  }
+┊  ┊ 8┊`
+┊  ┊ 9┊
+┊  ┊10┊export default () => (
+┊  ┊11┊  <Style className="ChatsNavbar">
+┊  ┊12┊    <span className="ChatsNavbar-title">WhatsApp Clone</span>
+┊  ┊13┊  </Style>
+┊  ┊14┊)
```

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,16 @@
+┊  ┊ 1┊import * as React from 'react'
+┊  ┊ 2┊import { Suspense } from 'react'
+┊  ┊ 3┊import Navbar from '../Navbar'
+┊  ┊ 4┊import ChatsList from './ChatsList'
+┊  ┊ 5┊import ChatsNavbar from './ChatsNavbar'
+┊  ┊ 6┊
+┊  ┊ 7┊export default () => (
+┊  ┊ 8┊  <div className="ChatsListScreen Screen">
+┊  ┊ 9┊    <Navbar>
+┊  ┊10┊      <ChatsNavbar />
+┊  ┊11┊    </Navbar>
+┊  ┊12┊    <Suspense fallback={null}>
+┊  ┊13┊      <ChatsList />
+┊  ┊14┊    </Suspense>
+┊  ┊15┊  </div>
+┊  ┊16┊)
```

##### Added src&#x2F;components&#x2F;Navbar.tsx
```diff
@@ -0,0 +1,24 @@
+┊  ┊ 1┊import Toolbar from '@material-ui/core/Toolbar'
+┊  ┊ 2┊import * as React from 'react'
+┊  ┊ 3┊import styled from 'styled-components'
+┊  ┊ 4┊
+┊  ┊ 5┊const Style = styled(Toolbar)`
+┊  ┊ 6┊  background-color: var(--primary-bg);
+┊  ┊ 7┊  color: var(--primary-text);
+┊  ┊ 8┊  font-size: 20px;
+┊  ┊ 9┊  line-height: 40px;
+┊  ┊10┊
+┊  ┊11┊  .Navbar-body {
+┊  ┊12┊    width: 100%;
+┊  ┊13┊  }
+┊  ┊14┊`
+┊  ┊15┊
+┊  ┊16┊interface NavbarProps {
+┊  ┊17┊  children: any
+┊  ┊18┊}
+┊  ┊19┊
+┊  ┊20┊export default ({ children }: NavbarProps) => (
+┊  ┊21┊  <Style className="Navbar">
+┊  ┊22┊    <div className="Navbar-body">{children}</div>
+┊  ┊23┊  </Style>
+┊  ┊24┊)
```

[}]: #

Let's install the missing dependencies:

    $ yarn add -D @types/moment@2.13.0
    $ yarn add graphql-tag@2.10.1 moment@2.24.0 subscriptions-transport-ws@0.9.15 styled-components@4.1.3

And add a default profile picture to our assets directory under `public/assets/default-profile-pic.jpg`:

![default-profile-pic.jpg](https://user-images.githubusercontent.com/7648874/51983273-38229280-24d3-11e9-98bd-363764dc6d97.jpg)

The chats which are currently served by the server already have a picture, but it's not uncommon to have a chat without any picture in our app.

Lastly, in order to make the list that we've just created visible, we will mount it at the main app component:

[{]: <helper> (diffStep 1.6 files="src/App.tsx" module="client")

#### [Step 1.6: Add ChatsListScreen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/f825cc5)

##### Changed src&#x2F;App.tsx
```diff
@@ -1,25 +1,11 @@
 ┊ 1┊ 1┊import React, { Component } from 'react';
-┊ 2┊  ┊import logo from './logo.svg';
-┊ 3┊  ┊import './App.css';
+┊  ┊ 2┊import ChatsListScreen from './components/ChatsListScreen'
 ┊ 4┊ 3┊
 ┊ 5┊ 4┊class App extends Component {
 ┊ 6┊ 5┊  render() {
 ┊ 7┊ 6┊    return (
 ┊ 8┊ 7┊      <div className="App">
-┊ 9┊  ┊        <header className="App-header">
-┊10┊  ┊          <img src={logo} className="App-logo" alt="logo" />
-┊11┊  ┊          <p>
-┊12┊  ┊            Edit <code>src/App.js</code> and save to reload.
-┊13┊  ┊          </p>
-┊14┊  ┊          <a
-┊15┊  ┊            className="App-link"
-┊16┊  ┊            href="https://reactjs.org"
-┊17┊  ┊            target="_blank"
-┊18┊  ┊            rel="noopener noreferrer"
-┊19┊  ┊          >
-┊20┊  ┊            Learn React
-┊21┊  ┊          </a>
-┊22┊  ┊        </header>
+┊  ┊ 8┊        <ChatsListScreen />
 ┊23┊ 9┊      </div>
 ┊24┊10┊    );
 ┊25┊11┊  }
```

[}]: #

Now we should be able to see the chats in the React app! We can test it out by running

    # terminal 1
    server$ yarn generate
    server$ yarn start
    # terminal 2
    client$ yarn generate
    client$ yarn start

Everything works, but it's not over yet. Our application can't be based on a served hard-coded JSON. A real app has a database. There are many advantages for using a database over an in-memory or FS stored data:

- It is VERY fast, and can deal with large amounts of data.
- Data fetching can be optimized by defining indexes.
- You need the right read/write permissions which makes it very secure.
- Data will persist even if the server crashes or the machine is randomly closed.
- A lot more...

We will be using [PostgreSQL](https://www.postgresql.org/) (Postgres, in short) as our database with [TypeORM](https://github.com/typeorm/typeorm) as an ORM around Postgres. First make sure that you install Postgres on your machine by following the [official installation instructions](https://www.labkey.org/Documentation/wiki-page.view?name=commonInstall).

To make sure the whole shebang works with Node.JS, we will install few packages:

    $ yarn add pg@7.8.0 typeorm@0.2.12 reflect-metadata@0.1.13
    $ yarn add -D @types/pg@7.4.11

> The [`reflect-metadata`](https://www.npmjs.com/package/reflect-metadata) package will emit metadata for JavaScript [decorators](https://github.com/tc39/proposal-decorators). This will be used internally by TypeORM to determine column types based on their corresponding TypeScript type.

This would require us to set some configuration so TypeORM would know where and how to connect the DB. We will use the `whatsapp` DB with the `test` username:

[{]: <helper> (diffStep 1.5 files="ormconfig.json, index.ts" module="server")

#### [Step 1.5: Setup TypeORM](https://github.com/Urigo/WhatsApp-Clone-Server/commit/d89b9b3)

##### Changed index.ts
```diff
@@ -4,27 +4,33 @@
 ┊ 4┊ 4┊import express from 'express'
 ┊ 5┊ 5┊import gql from 'graphql-tag'
 ┊ 6┊ 6┊import { createServer } from 'http'
+┊  ┊ 7┊import { createConnection } from 'typeorm'
 ┊ 7┊ 8┊import schema from './schema'
 ┊ 8┊ 9┊
 ┊ 9┊10┊const PORT = 4000
 ┊10┊11┊
-┊11┊  ┊const app = express()
+┊  ┊12┊createConnection().then((connection) => {
+┊  ┊13┊  const app = express()
 ┊12┊14┊
-┊13┊  ┊app.use(cors())
-┊14┊  ┊app.use(bodyParser.json())
+┊  ┊15┊  app.use(cors())
+┊  ┊16┊  app.use(bodyParser.json())
 ┊15┊17┊
-┊16┊  ┊const apollo = new ApolloServer({ schema })
+┊  ┊18┊  const apollo = new ApolloServer({
+┊  ┊19┊    schema,
+┊  ┊20┊    context: () => ({ connection }),
+┊  ┊21┊  })
 ┊17┊22┊
-┊18┊  ┊apollo.applyMiddleware({
-┊19┊  ┊  app,
-┊20┊  ┊  path: '/graphql',
-┊21┊  ┊})
+┊  ┊23┊  apollo.applyMiddleware({
+┊  ┊24┊    app,
+┊  ┊25┊    path: '/graphql',
+┊  ┊26┊  })
 ┊22┊27┊
-┊23┊  ┊// Wrap the Express server
-┊24┊  ┊const ws = createServer(app)
+┊  ┊28┊  // Wrap the Express server
+┊  ┊29┊  const ws = createServer(app)
 ┊25┊30┊
-┊26┊  ┊apollo.installSubscriptionHandlers(ws)
+┊  ┊31┊  apollo.installSubscriptionHandlers(ws)
 ┊27┊32┊
-┊28┊  ┊ws.listen(PORT, () => {
-┊29┊  ┊  console.log(`Apollo Server is now running on http://localhost:${PORT}`)
+┊  ┊33┊  ws.listen(PORT, () => {
+┊  ┊34┊    console.log(`Apollo Server is now running on http://localhost:${PORT}`)
+┊  ┊35┊  })
 ┊30┊36┊})
```

##### Added ormconfig.json
```diff
@@ -0,0 +1,24 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊   "type": "postgres",
+┊  ┊ 3┊   "host": "localhost",
+┊  ┊ 4┊   "port": 5432,
+┊  ┊ 5┊   "username": "test",
+┊  ┊ 6┊   "password": "test",
+┊  ┊ 7┊   "database": "whatsapp",
+┊  ┊ 8┊   "synchronize": true,
+┊  ┊ 9┊   "logging": false,
+┊  ┊10┊   "entities": [
+┊  ┊11┊      "entity/**/*.ts"
+┊  ┊12┊   ],
+┊  ┊13┊   "migrations": [
+┊  ┊14┊      "migration/**/*.ts"
+┊  ┊15┊   ],
+┊  ┊16┊   "subscribers": [
+┊  ┊17┊      "subscriber/**/*.ts"
+┊  ┊18┊   ],
+┊  ┊19┊   "cli": {
+┊  ┊20┊      "entitiesDir": "entity",
+┊  ┊21┊      "migrationsDir": "migration",
+┊  ┊22┊      "subscribersDir": "subscriber"
+┊  ┊23┊   }
+┊  ┊24┊}
```

[}]: #

TypeORM wraps the official Postgres driver so you shouldn't worry about interacting with it. Feel free to edit `ormconfig.json` file based on your needs.

We will also define the type of expected GraphQL context using Codegen. All we have to do is to create a `context.ts` file and specify it in the `codegen.yml` file:

[{]: <helper> (diffStep 1.5 files="codegen.yml, context.ts" module="server")

#### [Step 1.5: Setup TypeORM](https://github.com/Urigo/WhatsApp-Clone-Server/commit/d89b9b3)

##### Changed codegen.yml
```diff
@@ -8,6 +8,7 @@
 ┊ 8┊ 8┊      - typescript-resolvers
 ┊ 9┊ 9┊    config:
 ┊10┊10┊      optionalType: undefined | null
+┊  ┊11┊      contextType: ./context#Context
 ┊11┊12┊      mappers:
 ┊12┊13┊        Chat: ./entity/chat#Chat
 ┊13┊14┊        Message: ./entity/message#Message
```

##### Added context.ts
```diff
@@ -0,0 +1,7 @@
+┊ ┊1┊import { Connection } from 'typeorm'
+┊ ┊2┊import User from './entity/user'
+┊ ┊3┊
+┊ ┊4┊export interface Context {
+┊ ┊5┊  connection: Connection
+┊ ┊6┊  user: User
+┊ ┊7┊}
```

[}]: #

TypeORM has a very defined structure for organizing a project. Each table in our database, its columns and its relationships should be defined in an entity file under the `entity` folder. Why `entity` folder? Because the `ormconfig.json` says so. This is why originally we defined a TypeScript definition for each entity under a separate file. As for now, we will have 3 entities:

- A chat entity.
- A message entity.
- A user entity.

As we make progress, we will add more entities and edit the relationships between them:

[{]: <helper> (diffStep 1.6 files="entity" module="server")

#### [Step 1.6: Implement resolvers against TypeORM](https://github.com/Urigo/WhatsApp-Clone-Server/commit/d4230cc)

##### Changed entity&#x2F;chat.ts
```diff
@@ -1,18 +1,89 @@
+┊  ┊ 1┊import {
+┊  ┊ 2┊  Entity,
+┊  ┊ 3┊  Column,
+┊  ┊ 4┊  PrimaryGeneratedColumn,
+┊  ┊ 5┊  OneToMany,
+┊  ┊ 6┊  JoinTable,
+┊  ┊ 7┊  ManyToMany,
+┊  ┊ 8┊  ManyToOne,
+┊  ┊ 9┊  CreateDateColumn,
+┊  ┊10┊} from 'typeorm'
 ┊ 1┊11┊import Message from './message'
+┊  ┊12┊import User from './user'
 ┊ 2┊13┊
-┊ 3┊  ┊export interface Chat {
+┊  ┊14┊interface ChatConstructor {
+┊  ┊15┊  name?: string
+┊  ┊16┊  picture?: string
+┊  ┊17┊  allTimeMembers?: User[]
+┊  ┊18┊  listingMembers?: User[]
+┊  ┊19┊  owner?: User
+┊  ┊20┊  messages?: Message[]
+┊  ┊21┊}
+┊  ┊22┊
+┊  ┊23┊@Entity()
+┊  ┊24┊export class Chat {
+┊  ┊25┊  @PrimaryGeneratedColumn()
 ┊ 4┊26┊  id: string
-┊ 5┊  ┊  name?: string | null
-┊ 6┊  ┊  picture?: string | null
-┊ 7┊  ┊  // All members, current and past ones.
-┊ 8┊  ┊  allTimeMemberIds: string[]
-┊ 9┊  ┊  // Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
-┊10┊  ┊  listingMemberIds: string[]
-┊11┊  ┊  // Actual members of the group (they are not the only ones who get the group listed). Null for chats.
-┊12┊  ┊  actualGroupMemberIds?: string[] | null
-┊13┊  ┊  adminIds?: string[] | null
-┊14┊  ┊  ownerId?: string | null
+┊  ┊27┊
+┊  ┊28┊  @CreateDateColumn({ nullable: true })
+┊  ┊29┊  createdAt: Date
+┊  ┊30┊
+┊  ┊31┊  @Column({ nullable: true })
+┊  ┊32┊  name: string
+┊  ┊33┊
+┊  ┊34┊  @Column({ nullable: true })
+┊  ┊35┊  picture: string
+┊  ┊36┊
+┊  ┊37┊  @ManyToMany(type => User, user => user.allTimeMemberChats, {
+┊  ┊38┊    cascade: ['insert', 'update'],
+┊  ┊39┊    eager: false,
+┊  ┊40┊  })
+┊  ┊41┊  @JoinTable()
+┊  ┊42┊  allTimeMembers: User[]
+┊  ┊43┊
+┊  ┊44┊  @ManyToMany(type => User, user => user.listingMemberChats, {
+┊  ┊45┊    cascade: ['insert', 'update'],
+┊  ┊46┊    eager: false,
+┊  ┊47┊  })
+┊  ┊48┊  @JoinTable()
+┊  ┊49┊  listingMembers: User[]
+┊  ┊50┊
+┊  ┊51┊  @ManyToOne(type => User, user => user.ownerChats, { cascade: ['insert', 'update'], eager: false })
+┊  ┊52┊  owner?: User | null
+┊  ┊53┊
+┊  ┊54┊  @OneToMany(type => Message, message => message.chat, {
+┊  ┊55┊    cascade: ['insert', 'update'],
+┊  ┊56┊    eager: true,
+┊  ┊57┊  })
 ┊15┊58┊  messages: Message[]
+┊  ┊59┊
+┊  ┊60┊  constructor({
+┊  ┊61┊    name,
+┊  ┊62┊    picture,
+┊  ┊63┊    allTimeMembers,
+┊  ┊64┊    listingMembers,
+┊  ┊65┊    owner,
+┊  ┊66┊    messages,
+┊  ┊67┊  }: ChatConstructor = {}) {
+┊  ┊68┊    if (name) {
+┊  ┊69┊      this.name = name
+┊  ┊70┊    }
+┊  ┊71┊    if (picture) {
+┊  ┊72┊      this.picture = picture
+┊  ┊73┊    }
+┊  ┊74┊    if (allTimeMembers) {
+┊  ┊75┊      this.allTimeMembers = allTimeMembers
+┊  ┊76┊    }
+┊  ┊77┊    if (listingMembers) {
+┊  ┊78┊      this.listingMembers = listingMembers
+┊  ┊79┊    }
+┊  ┊80┊    if (owner) {
+┊  ┊81┊      this.owner = owner
+┊  ┊82┊    }
+┊  ┊83┊    if (messages) {
+┊  ┊84┊      this.messages = messages
+┊  ┊85┊    }
+┊  ┊86┊  }
 ┊16┊87┊}
 ┊17┊88┊
 ┊18┊89┊export default Chat
```

##### Changed entity&#x2F;message.ts
```diff
@@ -1,20 +1,80 @@
-┊ 1┊  ┊import Recipient from './recipient'
+┊  ┊ 1┊import {
+┊  ┊ 2┊  Entity,
+┊  ┊ 3┊  Column,
+┊  ┊ 4┊  PrimaryGeneratedColumn,
+┊  ┊ 5┊  OneToMany,
+┊  ┊ 6┊  ManyToOne,
+┊  ┊ 7┊  ManyToMany,
+┊  ┊ 8┊  JoinTable,
+┊  ┊ 9┊  CreateDateColumn,
+┊  ┊10┊} from 'typeorm'
+┊  ┊11┊import Chat from './chat'
+┊  ┊12┊import User from './user'
+┊  ┊13┊import { MessageType } from '../db'
 ┊ 2┊14┊
-┊ 3┊  ┊export enum MessageType {
-┊ 4┊  ┊  PICTURE,
-┊ 5┊  ┊  TEXT,
-┊ 6┊  ┊  LOCATION,
+┊  ┊15┊interface MessageConstructor {
+┊  ┊16┊  sender?: User
+┊  ┊17┊  content?: string
+┊  ┊18┊  createdAt?: Date
+┊  ┊19┊  type?: MessageType
+┊  ┊20┊  holders?: User[]
+┊  ┊21┊  chat?: Chat
 ┊ 7┊22┊}
 ┊ 8┊23┊
-┊ 9┊  ┊export interface Message {
+┊  ┊24┊@Entity()
+┊  ┊25┊export class Message {
+┊  ┊26┊  @PrimaryGeneratedColumn()
 ┊10┊27┊  id: string
-┊11┊  ┊  chatId: string
-┊12┊  ┊  senderId: string
+┊  ┊28┊
+┊  ┊29┊  @ManyToOne(type => User, user => user.senderMessages, { eager: true })
+┊  ┊30┊  sender: User
+┊  ┊31┊
+┊  ┊32┊  @Column()
 ┊13┊33┊  content: string
-┊14┊  ┊  createdAt: number
-┊15┊  ┊  type: MessageType
-┊16┊  ┊  recipients: Recipient[]
-┊17┊  ┊  holderIds: string[]
+┊  ┊34┊
+┊  ┊35┊  @CreateDateColumn({ nullable: true })
+┊  ┊36┊  createdAt: Date
+┊  ┊37┊
+┊  ┊38┊  @Column()
+┊  ┊39┊  type: number
+┊  ┊40┊
+┊  ┊41┊  @ManyToMany(type => User, user => user.holderMessages, {
+┊  ┊42┊    cascade: ['insert', 'update'],
+┊  ┊43┊    eager: true,
+┊  ┊44┊  })
+┊  ┊45┊  @JoinTable()
+┊  ┊46┊  holders: User[]
+┊  ┊47┊
+┊  ┊48┊  @ManyToOne(type => Chat, chat => chat.messages)
+┊  ┊49┊  chat: Chat
+┊  ┊50┊
+┊  ┊51┊  constructor({
+┊  ┊52┊    sender,
+┊  ┊53┊    content,
+┊  ┊54┊    createdAt,
+┊  ┊55┊    type,
+┊  ┊56┊    holders,
+┊  ┊57┊    chat,
+┊  ┊58┊  }: MessageConstructor = {}) {
+┊  ┊59┊    if (sender) {
+┊  ┊60┊      this.sender = sender
+┊  ┊61┊    }
+┊  ┊62┊    if (content) {
+┊  ┊63┊      this.content = content
+┊  ┊64┊    }
+┊  ┊65┊    if (createdAt) {
+┊  ┊66┊      this.createdAt = createdAt
+┊  ┊67┊    }
+┊  ┊68┊    if (type) {
+┊  ┊69┊      this.type = type
+┊  ┊70┊    }
+┊  ┊71┊    if (holders) {
+┊  ┊72┊      this.holders = holders
+┊  ┊73┊    }
+┊  ┊74┊    if (chat) {
+┊  ┊75┊      this.chat = chat
+┊  ┊76┊    }
+┊  ┊77┊  }
 ┊18┊78┊}
 ┊19┊79┊
 ┊20┊80┊export default Message
```

##### Changed entity&#x2F;user.ts
```diff
@@ -1,10 +1,60 @@
-┊ 1┊  ┊export interface User {
+┊  ┊ 1┊import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm'
+┊  ┊ 2┊import Chat from './chat'
+┊  ┊ 3┊import Message from './message'
+┊  ┊ 4┊
+┊  ┊ 5┊interface UserConstructor {
+┊  ┊ 6┊  username?: string
+┊  ┊ 7┊  password?: string
+┊  ┊ 8┊  name?: string
+┊  ┊ 9┊  picture?: string
+┊  ┊10┊}
+┊  ┊11┊
+┊  ┊12┊@Entity('app_user')
+┊  ┊13┊export class User {
+┊  ┊14┊  @PrimaryGeneratedColumn()
 ┊ 2┊15┊  id: string
+┊  ┊16┊
+┊  ┊17┊  @Column()
 ┊ 3┊18┊  username: string
+┊  ┊19┊
+┊  ┊20┊  @Column()
 ┊ 4┊21┊  password: string
+┊  ┊22┊
+┊  ┊23┊  @Column()
 ┊ 5┊24┊  name: string
-┊ 6┊  ┊  picture?: string | null
-┊ 7┊  ┊  phone?: string | null
+┊  ┊25┊
+┊  ┊26┊  @Column({ nullable: true })
+┊  ┊27┊  picture: string
+┊  ┊28┊
+┊  ┊29┊  @ManyToMany(type => Chat, chat => chat.allTimeMembers)
+┊  ┊30┊  allTimeMemberChats: Chat[]
+┊  ┊31┊
+┊  ┊32┊  @ManyToMany(type => Chat, chat => chat.listingMembers)
+┊  ┊33┊  listingMemberChats: Chat[]
+┊  ┊34┊
+┊  ┊35┊  @ManyToMany(type => Message, message => message.holders)
+┊  ┊36┊  holderMessages: Message[]
+┊  ┊37┊
+┊  ┊38┊  @OneToMany(type => Chat, chat => chat.owner)
+┊  ┊39┊  ownerChats: Chat[]
+┊  ┊40┊
+┊  ┊41┊  @OneToMany(type => Message, message => message.sender)
+┊  ┊42┊  senderMessages: Message[]
+┊  ┊43┊
+┊  ┊44┊  constructor({ username, password, name, picture }: UserConstructor = {}) {
+┊  ┊45┊    if (username) {
+┊  ┊46┊      this.username = username
+┊  ┊47┊    }
+┊  ┊48┊    if (password) {
+┊  ┊49┊      this.password = password
+┊  ┊50┊    }
+┊  ┊51┊    if (name) {
+┊  ┊52┊      this.name = name
+┊  ┊53┊    }
+┊  ┊54┊    if (picture) {
+┊  ┊55┊      this.picture = picture
+┊  ┊56┊    }
+┊  ┊57┊  }
 ┊ 8┊58┊}
 ┊ 9┊59┊
 ┊10┊60┊export default User
```

[}]: #

Now that we have the entities set, we can make requests to Postgres. Let's edit our resolvers to use the entities:

[{]: <helper> (diffStep 1.6 files="schema" module="server")

#### [Step 1.6: Implement resolvers against TypeORM](https://github.com/Urigo/WhatsApp-Clone-Server/commit/d4230cc)

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,83 +1,197 @@
 ┊  1┊  1┊import { IResolvers as IApolloResolvers } from 'apollo-server-express'
 ┊  2┊  2┊import { GraphQLDateTime } from 'graphql-iso-date'
-┊  3┊   ┊import db from '../db'
 ┊  4┊  3┊import Chat from '../entity/chat'
 ┊  5┊  4┊import Message from '../entity/message'
-┊  6┊   ┊import Recipient from '../entity/recipient'
 ┊  7┊  5┊import User from '../entity/user'
 ┊  8┊  6┊import { IResolvers } from '../types'
 ┊  9┊  7┊
-┊ 10┊   ┊let users = db.users
-┊ 11┊   ┊let chats = db.chats
-┊ 12┊   ┊const currentUser: string = '1'
-┊ 13┊   ┊
 ┊ 14┊  8┊export default {
 ┊ 15┊  9┊  Date: GraphQLDateTime,
 ┊ 16┊ 10┊  Query: {
 ┊ 17┊ 11┊    // Show all users for the moment.
-┊ 18┊   ┊    users: () => users.filter(user => user.id !== currentUser),
-┊ 19┊   ┊    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
-┊ 20┊   ┊    chat: (obj, { chatId }) => chats.find(chat => chat.id === chatId) || null,
+┊   ┊ 12┊    users: (root, args, { connection, currentUser }) => {
+┊   ┊ 13┊      return connection.createQueryBuilder(User, 'user').where('user.id != :id', {id: currentUser.id}).getMany();
+┊   ┊ 14┊    },
+┊   ┊ 15┊
+┊   ┊ 16┊    chats: (root, args, { connection, currentUser }) => {
+┊   ┊ 17┊      return connection
+┊   ┊ 18┊        .createQueryBuilder(Chat, 'chat')
+┊   ┊ 19┊        .leftJoin('chat.listingMembers', 'listingMembers')
+┊   ┊ 20┊        .where('listingMembers.id = :id', { id: currentUser.id })
+┊   ┊ 21┊        .orderBy('chat.createdAt', 'DESC')
+┊   ┊ 22┊        .getMany();
+┊   ┊ 23┊    },
+┊   ┊ 24┊
+┊   ┊ 25┊    chat: async (root, { chatId }, { connection }) => {
+┊   ┊ 26┊      const chat = await connection
+┊   ┊ 27┊        .createQueryBuilder(Chat, 'chat')
+┊   ┊ 28┊        .whereInIds(chatId)
+┊   ┊ 29┊        .getOne();
+┊   ┊ 30┊
+┊   ┊ 31┊      return chat || null;
+┊   ┊ 32┊    },
 ┊ 21┊ 33┊  },
+┊   ┊ 34┊
 ┊ 22┊ 35┊  Chat: {
-┊ 23┊   ┊    name: (chat) =>
-┊ 24┊   ┊      chat.name
-┊ 25┊   ┊        ? chat.name
-┊ 26┊   ┊        : users.find(
-┊ 27┊   ┊            user => user.id === chat.allTimeMemberIds.find((userId: string) => userId !== currentUser)
-┊ 28┊   ┊          )!.name,
-┊ 29┊   ┊    picture: (chat) =>
-┊ 30┊   ┊      chat.name
-┊ 31┊   ┊        ? chat.picture
-┊ 32┊   ┊        : users.find(
-┊ 33┊   ┊            user => user.id === chat.allTimeMemberIds.find((userId: string) => userId !== currentUser)
-┊ 34┊   ┊          )!.picture,
-┊ 35┊   ┊    allTimeMembers: (chat) =>
-┊ 36┊   ┊      users.filter(user => chat.allTimeMemberIds.includes(user.id)),
-┊ 37┊   ┊    listingMembers: (chat) =>
-┊ 38┊   ┊      users.filter(user => chat.listingMemberIds.includes(user.id)),
-┊ 39┊   ┊    actualGroupMembers: (chat) =>
-┊ 40┊   ┊      users.filter(
-┊ 41┊   ┊        user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)
-┊ 42┊   ┊      ),
-┊ 43┊   ┊    admins: (chat) =>
-┊ 44┊   ┊      users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
-┊ 45┊   ┊    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
-┊ 46┊   ┊    messages: (chat, { amount = 0 }) => {
-┊ 47┊   ┊      const messages =
-┊ 48┊   ┊        chat.messages
-┊ 49┊   ┊          .filter((message: Message) => message.holderIds.includes(currentUser))
-┊ 50┊   ┊          .sort((a: Message, b: Message) => b.createdAt - a.createdAt) || []
-┊ 51┊   ┊      return (amount ? messages.slice(0, amount) : messages).reverse()
+┊   ┊ 36┊    name: async (chat, args, { connection, currentUser }) => {
+┊   ┊ 37┊      if (chat.name) {
+┊   ┊ 38┊        return chat.name;
+┊   ┊ 39┊      }
+┊   ┊ 40┊
+┊   ┊ 41┊      const user = await connection
+┊   ┊ 42┊        .createQueryBuilder(User, 'user')
+┊   ┊ 43┊        .where('user.id != :userId', { userId: currentUser.id })
+┊   ┊ 44┊        .innerJoin(
+┊   ┊ 45┊          'user.allTimeMemberChats',
+┊   ┊ 46┊          'allTimeMemberChats',
+┊   ┊ 47┊          'allTimeMemberChats.id = :chatId',
+┊   ┊ 48┊          { chatId: chat.id },
+┊   ┊ 49┊        )
+┊   ┊ 50┊        .getOne();
+┊   ┊ 51┊
+┊   ┊ 52┊      return user ? user.name : null
+┊   ┊ 53┊    },
+┊   ┊ 54┊
+┊   ┊ 55┊    picture: async (chat, args, { connection, currentUser }) => {
+┊   ┊ 56┊      if (chat.picture) {
+┊   ┊ 57┊        return chat.picture;
+┊   ┊ 58┊      }
+┊   ┊ 59┊
+┊   ┊ 60┊      const user = await connection
+┊   ┊ 61┊        .createQueryBuilder(User, 'user')
+┊   ┊ 62┊        .where('user.id != :userId', { userId: currentUser.id })
+┊   ┊ 63┊        .innerJoin(
+┊   ┊ 64┊          'user.allTimeMemberChats',
+┊   ┊ 65┊          'allTimeMemberChats',
+┊   ┊ 66┊          'allTimeMemberChats.id = :chatId',
+┊   ┊ 67┊          { chatId: chat.id },
+┊   ┊ 68┊        )
+┊   ┊ 69┊        .getOne();
+┊   ┊ 70┊
+┊   ┊ 71┊      return user ? user.picture : null
+┊   ┊ 72┊    },
+┊   ┊ 73┊
+┊   ┊ 74┊    allTimeMembers: (chat, args, { connection }) => {
+┊   ┊ 75┊      return connection
+┊   ┊ 76┊        .createQueryBuilder(User, 'user')
+┊   ┊ 77┊        .innerJoin(
+┊   ┊ 78┊          'user.listingMemberChats',
+┊   ┊ 79┊          'listingMemberChats',
+┊   ┊ 80┊          'listingMemberChats.id = :chatId',
+┊   ┊ 81┊          { chatId: chat.id },
+┊   ┊ 82┊        )
+┊   ┊ 83┊        .getMany()
+┊   ┊ 84┊    },
+┊   ┊ 85┊
+┊   ┊ 86┊    listingMembers: (chat, args, { connection }) => {
+┊   ┊ 87┊      return connection
+┊   ┊ 88┊        .createQueryBuilder(User, 'user')
+┊   ┊ 89┊        .innerJoin(
+┊   ┊ 90┊          'user.listingMemberChats',
+┊   ┊ 91┊          'listingMemberChats',
+┊   ┊ 92┊          'listingMemberChats.id = :chatId',
+┊   ┊ 93┊          { chatId: chat.id },
+┊   ┊ 94┊        )
+┊   ┊ 95┊        .getMany();
+┊   ┊ 96┊    },
+┊   ┊ 97┊
+┊   ┊ 98┊    owner: async (chat, args, { connection }) => {
+┊   ┊ 99┊      const owner = await connection
+┊   ┊100┊        .createQueryBuilder(User, 'user')
+┊   ┊101┊        .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {
+┊   ┊102┊          chatId: chat.id,
+┊   ┊103┊        })
+┊   ┊104┊        .getOne();
+┊   ┊105┊
+┊   ┊106┊      return owner || null;
+┊   ┊107┊    },
+┊   ┊108┊
+┊   ┊109┊    messages: async (chat, { amount = 0 }, { connection, currentUser }) => {
+┊   ┊110┊      if (chat.messages) {
+┊   ┊111┊        return amount ? chat.messages.slice(-amount) : chat.messages;
+┊   ┊112┊      }
+┊   ┊113┊
+┊   ┊114┊      let query = connection
+┊   ┊115┊        .createQueryBuilder(Message, 'message')
+┊   ┊116┊        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
+┊   ┊117┊        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
+┊   ┊118┊          userId: currentUser.id,
+┊   ┊119┊        })
+┊   ┊120┊        .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } });
+┊   ┊121┊
+┊   ┊122┊      if (amount) {
+┊   ┊123┊        query = query.take(amount);
+┊   ┊124┊      }
+┊   ┊125┊
+┊   ┊126┊      return (await query.getMany()).reverse();
+┊   ┊127┊    },
+┊   ┊128┊
+┊   ┊129┊    lastMessage: async (chat, args, { connection, currentUser }) => {
+┊   ┊130┊      if (chat.messages) {
+┊   ┊131┊        return chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
+┊   ┊132┊      }
+┊   ┊133┊
+┊   ┊134┊      const messages = await connection
+┊   ┊135┊        .createQueryBuilder(Message, 'message')
+┊   ┊136┊        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
+┊   ┊137┊        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
+┊   ┊138┊          userId: currentUser.id,
+┊   ┊139┊        })
+┊   ┊140┊        .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } })
+┊   ┊141┊        .getMany()
+┊   ┊142┊
+┊   ┊143┊      return messages && messages.length ? messages[messages.length - 1] : null;
 ┊ 52┊144┊    },
-┊ 53┊   ┊    unreadMessages: (chat) =>
-┊ 54┊   ┊      chat.messages.filter(
-┊ 55┊   ┊        (message: Message) =>
-┊ 56┊   ┊          message.holderIds.includes(currentUser) &&
-┊ 57┊   ┊          message.recipients.find(
-┊ 58┊   ┊            (recipient: Recipient) => recipient.userId === currentUser && !recipient.readAt
-┊ 59┊   ┊          )
-┊ 60┊   ┊      ).length,
-┊ 61┊   ┊    lastMessage: (chat) => chat.messages[chat.messages.length - 1],
-┊ 62┊   ┊    isGroup: (chat) => !!chat.name,
 ┊ 63┊145┊  },
+┊   ┊146┊
 ┊ 64┊147┊  Message: {
-┊ 65┊   ┊    chat: (message) =>
-┊ 66┊   ┊      chats.find(chat => message.chatId === chat.id) || null,
-┊ 67┊   ┊    sender: (message) =>
-┊ 68┊   ┊      users.find(user => user.id === message.senderId) || null,
-┊ 69┊   ┊    holders: (message) =>
-┊ 70┊   ┊      users.filter(user => message.holderIds.includes(user.id)),
-┊ 71┊   ┊    ownership: (message) => message.senderId === currentUser,
-┊ 72┊   ┊  },
-┊ 73┊   ┊  Recipient: {
-┊ 74┊   ┊    user: (recipient) =>
-┊ 75┊   ┊      users.find(user => recipient.userId === user.id) || null,
-┊ 76┊   ┊    message: (recipient) => {
-┊ 77┊   ┊      const chat = chats.find(chat => recipient.chatId === chat.id)
-┊ 78┊   ┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null
+┊   ┊148┊    chat: async (message, args, { connection }) => {
+┊   ┊149┊      const chat = await connection
+┊   ┊150┊        .createQueryBuilder(Chat, 'chat')
+┊   ┊151┊        .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {
+┊   ┊152┊          messageId: message.id
+┊   ┊153┊        })
+┊   ┊154┊        .getOne();
+┊   ┊155┊
+┊   ┊156┊      if (!chat) {
+┊   ┊157┊        throw new Error(`Message must have a chat.`);
+┊   ┊158┊      }
+┊   ┊159┊
+┊   ┊160┊      return chat;
+┊   ┊161┊    },
+┊   ┊162┊
+┊   ┊163┊    sender: async (message, args, { connection }) => {
+┊   ┊164┊      const sender = await connection
+┊   ┊165┊        .createQueryBuilder(User, 'user')
+┊   ┊166┊        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
+┊   ┊167┊          messageId: message.id,
+┊   ┊168┊        })
+┊   ┊169┊        .getOne();
+┊   ┊170┊
+┊   ┊171┊      if (!sender) {
+┊   ┊172┊        throw new Error(`Message must have a sender.`);
+┊   ┊173┊      }
+┊   ┊174┊
+┊   ┊175┊      return sender;
 ┊ 79┊176┊    },
-┊ 80┊   ┊    chat: (recipient) =>
-┊ 81┊   ┊      chats.find(chat => recipient.chatId === chat.id) || null,
+┊   ┊177┊
+┊   ┊178┊    holders: async (message, args, { connection }) => {
+┊   ┊179┊      return connection
+┊   ┊180┊        .createQueryBuilder(User, 'user')
+┊   ┊181┊        .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {
+┊   ┊182┊          messageId: message.id,
+┊   ┊183┊        })
+┊   ┊184┊        .getMany();
+┊   ┊185┊    },
+┊   ┊186┊
+┊   ┊187┊    ownership: async (message, args, { connection, currentUser }) => {
+┊   ┊188┊      return !!(await connection
+┊   ┊189┊        .createQueryBuilder(User, 'user')
+┊   ┊190┊        .whereInIds(currentUser.id)
+┊   ┊191┊        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
+┊   ┊192┊          messageId: message.id,
+┊   ┊193┊        })
+┊   ┊194┊        .getCount())
+┊   ┊195┊    }
 ┊ 82┊196┊  },
 ┊ 83┊197┊} as IResolvers as IApolloResolvers
```

[}]: #

Notice that we've used a custom scalar type to represent a `Date` object in our GraphQL schema using a package called [`graphql-iso-date`](https://www.npmjs.com/package/graphql-iso-date). Accordingly, let's install this package:

    $ yarn add graphql-iso-date@3.6.1
    $ yarn add -D @types/graphql-iso-date@3.3.1

And update `codegen.yml` to use it in the generated code file:

[{]: <helper> (diffStep 1.6 files="codegen" module="server")

#### [Step 1.6: Implement resolvers against TypeORM](https://github.com/Urigo/WhatsApp-Clone-Server/commit/d4230cc)

##### Changed codegen.yml
```diff
@@ -13,3 +13,5 @@
 ┊13┊13┊        Chat: ./entity/chat#Chat
 ┊14┊14┊        Message: ./entity/message#Message
 ┊15┊15┊        User: ./entity/user#User
+┊  ┊16┊      scalars:
+┊  ┊17┊        Date: Date
```

[}]: #

Instead of fabricating a DB into the memory, we will replace the `db.ts` module with a function that will add sample data, using entities of course. This will be very convenient because this way we can test our app:

[{]: <helper> (diffStep 1.6 files="db" module="server")

#### [Step 1.6: Implement resolvers against TypeORM](https://github.com/Urigo/WhatsApp-Clone-Server/commit/d4230cc)

##### Changed db.ts
```diff
@@ -1,274 +1,254 @@
+┊   ┊  1┊import 'reflect-metadata'
 ┊  1┊  2┊import moment from 'moment'
-┊  2┊   ┊import Chat from './entity/chat'
-┊  3┊   ┊import Message, { MessageType } from './entity/message'
-┊  4┊   ┊import User from './entity/user'
+┊   ┊  3┊import { Connection } from 'typeorm'
+┊   ┊  4┊import { Chat } from './entity/chat'
+┊   ┊  5┊import { Message } from './entity/message'
+┊   ┊  6┊import { User } from './entity/user'
 ┊  5┊  7┊
-┊  6┊   ┊const users: User[] = [
-┊  7┊   ┊  {
-┊  8┊   ┊    id: '1',
+┊   ┊  8┊export enum MessageType {
+┊   ┊  9┊  PICTURE,
+┊   ┊ 10┊  TEXT,
+┊   ┊ 11┊  LOCATION,
+┊   ┊ 12┊}
+┊   ┊ 13┊
+┊   ┊ 14┊export async function addSampleData(connection: Connection) {
+┊   ┊ 15┊  const user1 = new User({
 ┊  9┊ 16┊    username: 'ethan',
 ┊ 10┊ 17┊    password: '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm', // 111
 ┊ 11┊ 18┊    name: 'Ethan Gonzalez',
 ┊ 12┊ 19┊    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
-┊ 13┊   ┊  },
-┊ 14┊   ┊  {
-┊ 15┊   ┊    id: '2',
+┊   ┊ 20┊  })
+┊   ┊ 21┊  await connection.manager.save(user1)
+┊   ┊ 22┊
+┊   ┊ 23┊  const user2 = new User({
 ┊ 16┊ 24┊    username: 'bryan',
 ┊ 17┊ 25┊    password: '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO', // 222
 ┊ 18┊ 26┊    name: 'Bryan Wallace',
 ┊ 19┊ 27┊    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
-┊ 20┊   ┊  },
-┊ 21┊   ┊  {
-┊ 22┊   ┊    id: '3',
+┊   ┊ 28┊  })
+┊   ┊ 29┊  await connection.manager.save(user2)
+┊   ┊ 30┊
+┊   ┊ 31┊  const user3 = new User({
 ┊ 23┊ 32┊    username: 'avery',
 ┊ 24┊ 33┊    password: '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.', // 333
 ┊ 25┊ 34┊    name: 'Avery Stewart',
 ┊ 26┊ 35┊    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
-┊ 27┊   ┊  },
-┊ 28┊   ┊  {
-┊ 29┊   ┊    id: '4',
+┊   ┊ 36┊  })
+┊   ┊ 37┊  await connection.manager.save(user3)
+┊   ┊ 38┊
+┊   ┊ 39┊  const user4 = new User({
 ┊ 30┊ 40┊    username: 'katie',
 ┊ 31┊ 41┊    password: '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi', // 444
 ┊ 32┊ 42┊    name: 'Katie Peterson',
 ┊ 33┊ 43┊    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
-┊ 34┊   ┊  },
-┊ 35┊   ┊  {
-┊ 36┊   ┊    id: '5',
+┊   ┊ 44┊  })
+┊   ┊ 45┊  await connection.manager.save(user4)
+┊   ┊ 46┊
+┊   ┊ 47┊  const user5 = new User({
 ┊ 37┊ 48┊    username: 'ray',
 ┊ 38┊ 49┊    password: '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242', // 555
 ┊ 39┊ 50┊    name: 'Ray Edwards',
 ┊ 40┊ 51┊    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
-┊ 41┊   ┊  },
-┊ 42┊   ┊  {
-┊ 43┊   ┊    id: '6',
+┊   ┊ 52┊  })
+┊   ┊ 53┊  await connection.manager.save(user5)
+┊   ┊ 54┊
+┊   ┊ 55┊  const user6 = new User({
 ┊ 44┊ 56┊    username: 'niko',
 ┊ 45┊ 57┊    password: '$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.', // 666
 ┊ 46┊ 58┊    name: 'Niccolò Belli',
 ┊ 47┊ 59┊    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
-┊ 48┊   ┊  },
-┊ 49┊   ┊  {
-┊ 50┊   ┊    id: '7',
+┊   ┊ 60┊  })
+┊   ┊ 61┊  await connection.manager.save(user6)
+┊   ┊ 62┊
+┊   ┊ 63┊  const user7 = new User({
 ┊ 51┊ 64┊    username: 'mario',
 ┊ 52┊ 65┊    password: '$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO', // 777
 ┊ 53┊ 66┊    name: 'Mario Rossi',
 ┊ 54┊ 67┊    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
-┊ 55┊   ┊  },
-┊ 56┊   ┊]
+┊   ┊ 68┊  })
+┊   ┊ 69┊  await connection.manager.save(user7)
+┊   ┊ 70┊
+┊   ┊ 71┊  await connection.manager.save(
+┊   ┊ 72┊    new Chat({
+┊   ┊ 73┊      allTimeMembers: [user1, user3],
+┊   ┊ 74┊      listingMembers: [user1, user3],
+┊   ┊ 75┊      messages: [
+┊   ┊ 76┊        new Message({
+┊   ┊ 77┊          sender: user1,
+┊   ┊ 78┊          content: 'You on your way?',
+┊   ┊ 79┊          createdAt: moment()
+┊   ┊ 80┊            .subtract(1, 'hours')
+┊   ┊ 81┊            .toDate(),
+┊   ┊ 82┊          type: MessageType.TEXT,
+┊   ┊ 83┊          holders: [user1, user3],
+┊   ┊ 84┊        }),
+┊   ┊ 85┊        new Message({
+┊   ┊ 86┊          sender: user3,
+┊   ┊ 87┊          content: 'Yep!',
+┊   ┊ 88┊          createdAt: moment()
+┊   ┊ 89┊            .subtract(1, 'hours')
+┊   ┊ 90┊            .add(5, 'minutes')
+┊   ┊ 91┊            .toDate(),
+┊   ┊ 92┊          type: MessageType.TEXT,
+┊   ┊ 93┊          holders: [user1, user3],
+┊   ┊ 94┊        }),
+┊   ┊ 95┊      ],
+┊   ┊ 96┊    })
+┊   ┊ 97┊  )
+┊   ┊ 98┊
+┊   ┊ 99┊  await connection.manager.save(
+┊   ┊100┊    new Chat({
+┊   ┊101┊      allTimeMembers: [user1, user4],
+┊   ┊102┊      listingMembers: [user1, user4],
+┊   ┊103┊      messages: [
+┊   ┊104┊        new Message({
+┊   ┊105┊          sender: user1,
+┊   ┊106┊          content: "Hey, it's me",
+┊   ┊107┊          createdAt: moment()
+┊   ┊108┊            .subtract(2, 'hours')
+┊   ┊109┊            .toDate(),
+┊   ┊110┊          type: MessageType.TEXT,
+┊   ┊111┊          holders: [user1, user4],
+┊   ┊112┊        }),
+┊   ┊113┊      ],
+┊   ┊114┊    })
+┊   ┊115┊  )
+┊   ┊116┊
+┊   ┊117┊  await connection.manager.save(
+┊   ┊118┊    new Chat({
+┊   ┊119┊      allTimeMembers: [user1, user5],
+┊   ┊120┊      listingMembers: [user1, user5],
+┊   ┊121┊      messages: [
+┊   ┊122┊        new Message({
+┊   ┊123┊          sender: user1,
+┊   ┊124┊          content: 'I should buy a boat',
+┊   ┊125┊          createdAt: moment()
+┊   ┊126┊            .subtract(1, 'days')
+┊   ┊127┊            .toDate(),
+┊   ┊128┊          type: MessageType.TEXT,
+┊   ┊129┊          holders: [user1, user5],
+┊   ┊130┊        }),
+┊   ┊131┊        new Message({
+┊   ┊132┊          sender: user1,
+┊   ┊133┊          content: 'You still there?',
+┊   ┊134┊          createdAt: moment()
+┊   ┊135┊            .subtract(1, 'days')
+┊   ┊136┊            .add(16, 'hours')
+┊   ┊137┊            .toDate(),
+┊   ┊138┊          type: MessageType.TEXT,
+┊   ┊139┊          holders: [user1, user5],
+┊   ┊140┊        }),
+┊   ┊141┊      ],
+┊   ┊142┊    })
+┊   ┊143┊  )
+┊   ┊144┊
+┊   ┊145┊  await connection.manager.save(
+┊   ┊146┊    new Chat({
+┊   ┊147┊      allTimeMembers: [user3, user4],
+┊   ┊148┊      listingMembers: [user3, user4],
+┊   ┊149┊      messages: [
+┊   ┊150┊        new Message({
+┊   ┊151┊          sender: user3,
+┊   ┊152┊          content: 'Look at my mukluks!',
+┊   ┊153┊          createdAt: moment()
+┊   ┊154┊            .subtract(4, 'days')
+┊   ┊155┊            .toDate(),
+┊   ┊156┊          type: MessageType.TEXT,
+┊   ┊157┊          holders: [user3, user4],
+┊   ┊158┊        }),
+┊   ┊159┊      ],
+┊   ┊160┊    })
+┊   ┊161┊  )
+┊   ┊162┊
+┊   ┊163┊  await connection.manager.save(
+┊   ┊164┊    new Chat({
+┊   ┊165┊      allTimeMembers: [user2, user5],
+┊   ┊166┊      listingMembers: [user2, user5],
+┊   ┊167┊      messages: [
+┊   ┊168┊        new Message({
+┊   ┊169┊          sender: user2,
+┊   ┊170┊          content: 'This is wicked good ice cream.',
+┊   ┊171┊          createdAt: moment()
+┊   ┊172┊            .subtract(2, 'weeks')
+┊   ┊173┊            .toDate(),
+┊   ┊174┊          type: MessageType.TEXT,
+┊   ┊175┊          holders: [user2, user5],
+┊   ┊176┊        }),
+┊   ┊177┊        new Message({
+┊   ┊178┊          sender: user5,
+┊   ┊179┊          content: 'Love it!',
+┊   ┊180┊          createdAt: moment()
+┊   ┊181┊            .subtract(2, 'weeks')
+┊   ┊182┊            .add(10, 'minutes')
+┊   ┊183┊            .toDate(),
+┊   ┊184┊          type: MessageType.TEXT,
+┊   ┊185┊          holders: [user2, user5],
+┊   ┊186┊        }),
+┊   ┊187┊      ],
+┊   ┊188┊    })
+┊   ┊189┊  )
+┊   ┊190┊
+┊   ┊191┊  await connection.manager.save(
+┊   ┊192┊    new Chat({
+┊   ┊193┊      allTimeMembers: [user1, user6],
+┊   ┊194┊      listingMembers: [user1],
+┊   ┊195┊    })
+┊   ┊196┊  )
+┊   ┊197┊
+┊   ┊198┊  await connection.manager.save(
+┊   ┊199┊    new Chat({
+┊   ┊200┊      allTimeMembers: [user2, user1],
+┊   ┊201┊      listingMembers: [user2],
+┊   ┊202┊    })
+┊   ┊203┊  )
 ┊ 57┊204┊
-┊ 58┊   ┊const chats: Chat[] = [
-┊ 59┊   ┊  {
-┊ 60┊   ┊    id: '1',
-┊ 61┊   ┊    name: null,
-┊ 62┊   ┊    picture: null,
-┊ 63┊   ┊    allTimeMemberIds: ['1', '3'],
-┊ 64┊   ┊    listingMemberIds: ['1', '3'],
-┊ 65┊   ┊    ownerId: null,
-┊ 66┊   ┊    messages: [
-┊ 67┊   ┊      {
-┊ 68┊   ┊        id: '1',
-┊ 69┊   ┊        chatId: '1',
-┊ 70┊   ┊        senderId: '1',
-┊ 71┊   ┊        content: 'You on your way?',
-┊ 72┊   ┊        createdAt: moment()
-┊ 73┊   ┊          .subtract(1, 'hours')
-┊ 74┊   ┊          .unix(),
-┊ 75┊   ┊        type: MessageType.TEXT,
-┊ 76┊   ┊        holderIds: ['1', '3'],
-┊ 77┊   ┊      },
-┊ 78┊   ┊      {
-┊ 79┊   ┊        id: '2',
-┊ 80┊   ┊        chatId: '1',
-┊ 81┊   ┊        senderId: '3',
-┊ 82┊   ┊        content: 'Yep!',
-┊ 83┊   ┊        createdAt: moment()
-┊ 84┊   ┊          .subtract(1, 'hours')
-┊ 85┊   ┊          .add(5, 'minutes')
-┊ 86┊   ┊          .unix(),
-┊ 87┊   ┊        type: MessageType.TEXT,
-┊ 88┊   ┊        holderIds: ['3', '1'],
-┊ 89┊   ┊      },
-┊ 90┊   ┊    ],
-┊ 91┊   ┊  },
-┊ 92┊   ┊  {
-┊ 93┊   ┊    id: '2',
-┊ 94┊   ┊    name: null,
-┊ 95┊   ┊    picture: null,
-┊ 96┊   ┊    allTimeMemberIds: ['1', '4'],
-┊ 97┊   ┊    listingMemberIds: ['1', '4'],
-┊ 98┊   ┊    ownerId: null,
-┊ 99┊   ┊    messages: [
-┊100┊   ┊      {
-┊101┊   ┊        id: '1',
-┊102┊   ┊        chatId: '2',
-┊103┊   ┊        senderId: '1',
-┊104┊   ┊        content: "Hey, it's me",
-┊105┊   ┊        createdAt: moment()
-┊106┊   ┊          .subtract(2, 'hours')
-┊107┊   ┊          .unix(),
-┊108┊   ┊        type: MessageType.TEXT,
-┊109┊   ┊        holderIds: ['1', '4'],
-┊110┊   ┊      },
-┊111┊   ┊    ],
-┊112┊   ┊  },
-┊113┊   ┊  {
-┊114┊   ┊    id: '3',
-┊115┊   ┊    name: null,
-┊116┊   ┊    picture: null,
-┊117┊   ┊    allTimeMemberIds: ['1', '5'],
-┊118┊   ┊    listingMemberIds: ['1', '5'],
-┊119┊   ┊    ownerId: null,
-┊120┊   ┊    messages: [
-┊121┊   ┊      {
-┊122┊   ┊        id: '1',
-┊123┊   ┊        chatId: '3',
-┊124┊   ┊        senderId: '1',
-┊125┊   ┊        content: 'I should buy a boat',
-┊126┊   ┊        createdAt: moment()
-┊127┊   ┊          .subtract(1, 'days')
-┊128┊   ┊          .unix(),
-┊129┊   ┊        type: MessageType.TEXT,
-┊130┊   ┊        holderIds: ['1', '5'],
-┊131┊   ┊      },
-┊132┊   ┊      {
-┊133┊   ┊        id: '2',
-┊134┊   ┊        chatId: '3',
-┊135┊   ┊        senderId: '1',
-┊136┊   ┊        content: 'You still there?',
-┊137┊   ┊        createdAt: moment()
-┊138┊   ┊          .subtract(1, 'days')
-┊139┊   ┊          .add(16, 'hours')
-┊140┊   ┊          .unix(),
-┊141┊   ┊        type: MessageType.TEXT,
-┊142┊   ┊        holderIds: ['1', '5'],
-┊143┊   ┊      },
-┊144┊   ┊    ],
-┊145┊   ┊  },
-┊146┊   ┊  {
-┊147┊   ┊    id: '4',
-┊148┊   ┊    name: null,
-┊149┊   ┊    picture: null,
-┊150┊   ┊    allTimeMemberIds: ['3', '4'],
-┊151┊   ┊    listingMemberIds: ['3', '4'],
-┊152┊   ┊    ownerId: null,
-┊153┊   ┊    messages: [
-┊154┊   ┊      {
-┊155┊   ┊        id: '1',
-┊156┊   ┊        chatId: '4',
-┊157┊   ┊        senderId: '3',
-┊158┊   ┊        content: 'Look at my mukluks!',
-┊159┊   ┊        createdAt: moment()
-┊160┊   ┊          .subtract(4, 'days')
-┊161┊   ┊          .unix(),
-┊162┊   ┊        type: MessageType.TEXT,
-┊163┊   ┊        holderIds: ['3', '4'],
-┊164┊   ┊      },
-┊165┊   ┊    ],
-┊166┊   ┊  },
-┊167┊   ┊  {
-┊168┊   ┊    id: '5',
-┊169┊   ┊    name: null,
-┊170┊   ┊    picture: null,
-┊171┊   ┊    allTimeMemberIds: ['2', '5'],
-┊172┊   ┊    listingMemberIds: ['2', '5'],
-┊173┊   ┊    ownerId: null,
-┊174┊   ┊    messages: [
-┊175┊   ┊      {
-┊176┊   ┊        id: '1',
-┊177┊   ┊        chatId: '5',
-┊178┊   ┊        senderId: '2',
-┊179┊   ┊        content: 'This is wicked good ice cream.',
-┊180┊   ┊        createdAt: moment()
-┊181┊   ┊          .subtract(2, 'weeks')
-┊182┊   ┊          .unix(),
-┊183┊   ┊        type: MessageType.TEXT,
-┊184┊   ┊        holderIds: ['2', '5'],
-┊185┊   ┊      },
-┊186┊   ┊      {
-┊187┊   ┊        id: '2',
-┊188┊   ┊        chatId: '6',
-┊189┊   ┊        senderId: '5',
-┊190┊   ┊        content: 'Love it!',
-┊191┊   ┊        createdAt: moment()
-┊192┊   ┊          .subtract(2, 'weeks')
-┊193┊   ┊          .add(10, 'minutes')
-┊194┊   ┊          .unix(),
-┊195┊   ┊        type: MessageType.TEXT,
-┊196┊   ┊        holderIds: ['5', '2'],
-┊197┊   ┊      },
-┊198┊   ┊    ],
-┊199┊   ┊  },
-┊200┊   ┊  {
-┊201┊   ┊    id: '6',
-┊202┊   ┊    name: null,
-┊203┊   ┊    picture: null,
-┊204┊   ┊    allTimeMemberIds: ['1', '6'],
-┊205┊   ┊    listingMemberIds: ['1'],
-┊206┊   ┊    ownerId: null,
-┊207┊   ┊    messages: [],
-┊208┊   ┊  },
-┊209┊   ┊  {
-┊210┊   ┊    id: '7',
-┊211┊   ┊    name: null,
-┊212┊   ┊    picture: null,
-┊213┊   ┊    allTimeMemberIds: ['2', '1'],
-┊214┊   ┊    listingMemberIds: ['2'],
-┊215┊   ┊    ownerId: null,
-┊216┊   ┊    messages: [],
-┊217┊   ┊  },
-┊218┊   ┊  {
-┊219┊   ┊    id: '8',
-┊220┊   ┊    name: 'A user 0 group',
-┊221┊   ┊    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
-┊222┊   ┊    allTimeMemberIds: ['1', '3', '4', '6'],
-┊223┊   ┊    listingMemberIds: ['1', '3', '4', '6'],
-┊224┊   ┊    ownerId: '1',
-┊225┊   ┊    messages: [
-┊226┊   ┊      {
-┊227┊   ┊        id: '1',
-┊228┊   ┊        chatId: '8',
-┊229┊   ┊        senderId: '1',
-┊230┊   ┊        content: 'I made a group',
-┊231┊   ┊        createdAt: moment()
-┊232┊   ┊          .subtract(2, 'weeks')
-┊233┊   ┊          .unix(),
-┊234┊   ┊        type: MessageType.TEXT,
-┊235┊   ┊        holderIds: ['1', '3', '4', '6'],
-┊236┊   ┊      },
-┊237┊   ┊      {
-┊238┊   ┊        id: '2',
-┊239┊   ┊        chatId: '8',
-┊240┊   ┊        senderId: '1',
-┊241┊   ┊        content: 'Ops, user 3 was not supposed to be here',
-┊242┊   ┊        createdAt: moment()
-┊243┊   ┊          .subtract(2, 'weeks')
-┊244┊   ┊          .add(2, 'minutes')
-┊245┊   ┊          .unix(),
-┊246┊   ┊        type: MessageType.TEXT,
-┊247┊   ┊        holderIds: ['1', '4', '6'],
-┊248┊   ┊      },
-┊249┊   ┊      {
-┊250┊   ┊        id: '3',
-┊251┊   ┊        chatId: '8',
-┊252┊   ┊        senderId: '4',
-┊253┊   ┊        content: 'Awesome!',
-┊254┊   ┊        createdAt: moment()
-┊255┊   ┊          .subtract(2, 'weeks')
-┊256┊   ┊          .add(10, 'minutes')
-┊257┊   ┊          .unix(),
-┊258┊   ┊        type: MessageType.TEXT,
-┊259┊   ┊        holderIds: ['1', '4', '6'],
-┊260┊   ┊      },
-┊261┊   ┊    ],
-┊262┊   ┊  },
-┊263┊   ┊  {
-┊264┊   ┊    id: '9',
-┊265┊   ┊    name: 'A user 5 group',
-┊266┊   ┊    picture: null,
-┊267┊   ┊    allTimeMemberIds: ['6', '3'],
-┊268┊   ┊    listingMemberIds: ['6', '3'],
-┊269┊   ┊    ownerId: '6',
-┊270┊   ┊    messages: [],
-┊271┊   ┊  },
-┊272┊   ┊]
+┊   ┊205┊  await connection.manager.save(
+┊   ┊206┊    new Chat({
+┊   ┊207┊      name: "Ethan's group",
+┊   ┊208┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊209┊      allTimeMembers: [user1, user3, user4, user6],
+┊   ┊210┊      listingMembers: [user1, user3, user4, user6],
+┊   ┊211┊      owner: user1,
+┊   ┊212┊      messages: [
+┊   ┊213┊        new Message({
+┊   ┊214┊          sender: user1,
+┊   ┊215┊          content: 'I made a group',
+┊   ┊216┊          createdAt: moment()
+┊   ┊217┊            .subtract(2, 'weeks')
+┊   ┊218┊            .toDate(),
+┊   ┊219┊          type: MessageType.TEXT,
+┊   ┊220┊          holders: [user1, user3, user4, user6],
+┊   ┊221┊        }),
+┊   ┊222┊        new Message({
+┊   ┊223┊          sender: user1,
+┊   ┊224┊          content: 'Ops, Avery was not supposed to be here',
+┊   ┊225┊          createdAt: moment()
+┊   ┊226┊            .subtract(2, 'weeks')
+┊   ┊227┊            .add(2, 'minutes')
+┊   ┊228┊            .toDate(),
+┊   ┊229┊          type: MessageType.TEXT,
+┊   ┊230┊          holders: [user1, user4, user6],
+┊   ┊231┊        }),
+┊   ┊232┊        new Message({
+┊   ┊233┊          sender: user4,
+┊   ┊234┊          content: 'Awesome!',
+┊   ┊235┊          createdAt: moment()
+┊   ┊236┊            .subtract(2, 'weeks')
+┊   ┊237┊            .add(10, 'minutes')
+┊   ┊238┊            .toDate(),
+┊   ┊239┊          type: MessageType.TEXT,
+┊   ┊240┊          holders: [user1, user4, user6],
+┊   ┊241┊        }),
+┊   ┊242┊      ],
+┊   ┊243┊    })
+┊   ┊244┊  )
 ┊273┊245┊
-┊274┊   ┊export default { users, chats }
+┊   ┊246┊  await connection.manager.save(
+┊   ┊247┊    new Chat({
+┊   ┊248┊      name: "Ray's group",
+┊   ┊249┊      allTimeMembers: [user3, user6],
+┊   ┊250┊      listingMembers: [user3, user6],
+┊   ┊251┊      owner: user6,
+┊   ┊252┊    })
+┊   ┊253┊  )
+┊   ┊254┊}
```

[}]: #

Instead of adding the sample data any time we start the server, we will use an `--add-sample-data` flag which will be provided to the server's process:

[{]: <helper> (diffStep 1.6 files="index.ts" module="server")

#### [Step 1.6: Implement resolvers against TypeORM](https://github.com/Urigo/WhatsApp-Clone-Server/commit/d4230cc)

##### Changed index.ts
```diff
@@ -1,3 +1,4 @@
+┊ ┊1┊import 'reflect-metadata'
 ┊1┊2┊import { ApolloServer } from 'apollo-server-express'
 ┊2┊3┊import bodyParser from 'body-parser'
 ┊3┊4┊import cors from 'cors'
```
```diff
@@ -5,11 +6,16 @@
 ┊ 5┊ 6┊import gql from 'graphql-tag'
 ┊ 6┊ 7┊import { createServer } from 'http'
 ┊ 7┊ 8┊import { createConnection } from 'typeorm'
+┊  ┊ 9┊import { addSampleData } from './db'
 ┊ 8┊10┊import schema from './schema'
 ┊ 9┊11┊
 ┊10┊12┊const PORT = 4000
 ┊11┊13┊
 ┊12┊14┊createConnection().then((connection) => {
+┊  ┊15┊  if (process.argv.includes('--add-sample-data')) {
+┊  ┊16┊    addSampleData(connection)
+┊  ┊17┊  }
+┊  ┊18┊
 ┊13┊19┊  const app = express()
 ┊14┊20┊
 ┊15┊21┊  app.use(cors())
```
```diff
@@ -17,7 +23,10 @@
 ┊17┊23┊
 ┊18┊24┊  const apollo = new ApolloServer({
 ┊19┊25┊    schema,
-┊20┊  ┊    context: () => ({ connection }),
+┊  ┊26┊    context: () => ({
+┊  ┊27┊      connection,
+┊  ┊28┊      currentUser: { id: '1' },
+┊  ┊29┊    }),
 ┊21┊30┊  })
 ┊22┊31┊
 ┊23┊32┊  apollo.applyMiddleware({
```

[}]: #

> More about processes can be read [here](https://medium.com/the-guild/getting-to-know-nodes-child-process-module-8ed63038f3fa).

Most Apollo-server implementations will assemble the GraphQL schema by importing a bunch of resolvers from different modules, if not having everything in a single place. This often times leads to a lot of problems as maintenance becomes harder the bigger the server gets, especially if we don't have a defined structure. Instead of going with that approach, we will be using [GraphQL-Modules](https://graphql-modules.com) (GQLModules, in short).

The idea behind GQLModules is to implement the Separation of Concerns design pattern in GraphQL, and to allow you to write simple modules that only do what they need to. This way it's easier to write, maintain and test. You should get a better understanding of GQLModules as we go further with this tutorial.

To setup GQLModules we will install a couple of packages:

    $ yarn add @graphql-modules/core@0.4.2 @graphql-modules/sonar@0.4.2 @graphql-modules/di@0.4.2

- The `sonar` package will be sued to detect `.graphql` files within our server.
- The `di` package is responsible for dependencies injection.

Now we're gonna implement a dedicated GraphQL module for each of our entity:

[{]: <helper> (diffStep 1.7 files="modules/\(utils|auth|chat|message|user\)" module="server")

#### [Step 1.7: Transition to GraphQL Modules](https://github.com/Urigo/WhatsApp-Clone-Server/commit/b4376a5)

##### Added modules&#x2F;auth&#x2F;index.ts
```diff
@@ -0,0 +1,12 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { Connection } from 'typeorm'
+┊  ┊ 3┊import { AuthProvider } from './providers/auth.provider'
+┊  ┊ 4┊
+┊  ┊ 5┊export const AuthModule = new GraphQLModule({
+┊  ┊ 6┊  name: 'Auth',
+┊  ┊ 7┊  providers: ({ config: { connection } }) => [
+┊  ┊ 8┊    { provide: Connection, useValue: connection },
+┊  ┊ 9┊    AuthProvider,
+┊  ┊10┊  ],
+┊  ┊11┊  configRequired: true,
+┊  ┊12┊})
```

##### Added modules&#x2F;auth&#x2F;providers&#x2F;auth.provider.ts
```diff
@@ -0,0 +1,27 @@
+┊  ┊ 1┊import { OnRequest } from '@graphql-modules/core'
+┊  ┊ 2┊import { Injectable } from '@graphql-modules/di'
+┊  ┊ 3┊import { Connection } from 'typeorm'
+┊  ┊ 4┊import { User } from '../../../entity/user'
+┊  ┊ 5┊
+┊  ┊ 6┊@Injectable()
+┊  ┊ 7┊export class AuthProvider implements OnRequest {
+┊  ┊ 8┊  currentUser: User
+┊  ┊ 9┊
+┊  ┊10┊  constructor(
+┊  ┊11┊    private connection: Connection
+┊  ┊12┊  ) {}
+┊  ┊13┊
+┊  ┊14┊  async onRequest() {
+┊  ┊15┊    if (this.currentUser) return
+┊  ┊16┊
+┊  ┊17┊
+┊  ┊18┊    const currentUser = await this.connection
+┊  ┊19┊      .createQueryBuilder(User, 'user')
+┊  ┊20┊      .getOne()
+┊  ┊21┊
+┊  ┊22┊    if (currentUser) {
+┊  ┊23┊      console.log(currentUser)
+┊  ┊24┊      this.currentUser = currentUser
+┊  ┊25┊    }
+┊  ┊26┊  }
+┊  ┊27┊}
```

##### Added modules&#x2F;chat&#x2F;index.ts
```diff
@@ -0,0 +1,16 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { ProviderScope } from '@graphql-modules/di'
+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 4┊import { AuthModule } from '../auth'
+┊  ┊ 5┊import { UserModule } from '../user'
+┊  ┊ 6┊import { UtilsModule } from '../utils.module'
+┊  ┊ 7┊import { ChatProvider } from './providers/chat.provider'
+┊  ┊ 8┊
+┊  ┊ 9┊export const ChatModule = new GraphQLModule({
+┊  ┊10┊  name: 'Chat',
+┊  ┊11┊  imports: [AuthModule, UtilsModule, UserModule],
+┊  ┊12┊  providers: [ChatProvider],
+┊  ┊13┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊14┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊15┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
+┊  ┊16┊})
```

##### Added modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
```diff
@@ -0,0 +1,111 @@
+┊   ┊  1┊import { Injectable } from '@graphql-modules/di'
+┊   ┊  2┊import { Connection } from 'typeorm'
+┊   ┊  3┊import { Chat } from '../../../entity/chat'
+┊   ┊  4┊import { User } from '../../../entity/user'
+┊   ┊  5┊import { AuthProvider } from '../../auth/providers/auth.provider'
+┊   ┊  6┊import { UserProvider } from '../../user/providers/user.provider'
+┊   ┊  7┊
+┊   ┊  8┊@Injectable()
+┊   ┊  9┊export class ChatProvider {
+┊   ┊ 10┊  constructor(
+┊   ┊ 11┊    private connection: Connection,
+┊   ┊ 12┊    private userProvider: UserProvider,
+┊   ┊ 13┊    private authProvider: AuthProvider
+┊   ┊ 14┊  ) {}
+┊   ┊ 15┊
+┊   ┊ 16┊  repository = this.connection.getRepository(Chat)
+┊   ┊ 17┊  currentUser = this.authProvider.currentUser
+┊   ┊ 18┊
+┊   ┊ 19┊  createQueryBuilder() {
+┊   ┊ 20┊    return this.connection.createQueryBuilder(Chat, 'chat')
+┊   ┊ 21┊  }
+┊   ┊ 22┊
+┊   ┊ 23┊  async getChats() {
+┊   ┊ 24┊    return this.createQueryBuilder()
+┊   ┊ 25┊      .leftJoin('chat.listingMembers', 'listingMembers')
+┊   ┊ 26┊      .where('listingMembers.id = :id', { id: this.currentUser.id })
+┊   ┊ 27┊      .orderBy('chat.createdAt', 'DESC')
+┊   ┊ 28┊      .getMany()
+┊   ┊ 29┊  }
+┊   ┊ 30┊
+┊   ┊ 31┊  async getChat(chatId: string) {
+┊   ┊ 32┊    const chat = await this.createQueryBuilder()
+┊   ┊ 33┊      .whereInIds(chatId)
+┊   ┊ 34┊      .getOne()
+┊   ┊ 35┊
+┊   ┊ 36┊    return chat || null
+┊   ┊ 37┊  }
+┊   ┊ 38┊
+┊   ┊ 39┊  async getChatName(chat: Chat) {
+┊   ┊ 40┊    if (chat.name) {
+┊   ┊ 41┊      return chat.name
+┊   ┊ 42┊    }
+┊   ┊ 43┊
+┊   ┊ 44┊    const user = await this.userProvider
+┊   ┊ 45┊      .createQueryBuilder()
+┊   ┊ 46┊      .where('user.id != :userId', { userId: this.currentUser.id })
+┊   ┊ 47┊      .innerJoin(
+┊   ┊ 48┊        'user.allTimeMemberChats',
+┊   ┊ 49┊        'allTimeMemberChats',
+┊   ┊ 50┊        'allTimeMemberChats.id = :chatId',
+┊   ┊ 51┊        { chatId: chat.id }
+┊   ┊ 52┊      )
+┊   ┊ 53┊      .getOne()
+┊   ┊ 54┊
+┊   ┊ 55┊    return (user && user.name) || null
+┊   ┊ 56┊  }
+┊   ┊ 57┊
+┊   ┊ 58┊  async getChatPicture(chat: Chat) {
+┊   ┊ 59┊    if (chat.name) {
+┊   ┊ 60┊      return chat.picture
+┊   ┊ 61┊    }
+┊   ┊ 62┊
+┊   ┊ 63┊    const user = await this.userProvider
+┊   ┊ 64┊      .createQueryBuilder()
+┊   ┊ 65┊      .where('user.id != :userId', { userId: this.currentUser.id })
+┊   ┊ 66┊      .innerJoin(
+┊   ┊ 67┊        'user.allTimeMemberChats',
+┊   ┊ 68┊        'allTimeMemberChats',
+┊   ┊ 69┊        'allTimeMemberChats.id = :chatId',
+┊   ┊ 70┊        { chatId: chat.id }
+┊   ┊ 71┊      )
+┊   ┊ 72┊      .getOne()
+┊   ┊ 73┊
+┊   ┊ 74┊    return user ? user.picture : null
+┊   ┊ 75┊  }
+┊   ┊ 76┊
+┊   ┊ 77┊  getChatAllTimeMembers(chat: Chat) {
+┊   ┊ 78┊    return this.userProvider
+┊   ┊ 79┊      .createQueryBuilder()
+┊   ┊ 80┊      .innerJoin(
+┊   ┊ 81┊        'user.listingMemberChats',
+┊   ┊ 82┊        'listingMemberChats',
+┊   ┊ 83┊        'listingMemberChats.id = :chatId',
+┊   ┊ 84┊        { chatId: chat.id }
+┊   ┊ 85┊      )
+┊   ┊ 86┊      .getMany()
+┊   ┊ 87┊  }
+┊   ┊ 88┊
+┊   ┊ 89┊  getChatListingMembers(chat: Chat) {
+┊   ┊ 90┊    return this.userProvider
+┊   ┊ 91┊      .createQueryBuilder()
+┊   ┊ 92┊      .innerJoin(
+┊   ┊ 93┊        'user.listingMemberChats',
+┊   ┊ 94┊        'listingMemberChats',
+┊   ┊ 95┊        'listingMemberChats.id = :chatId',
+┊   ┊ 96┊        { chatId: chat.id }
+┊   ┊ 97┊      )
+┊   ┊ 98┊      .getMany()
+┊   ┊ 99┊  }
+┊   ┊100┊
+┊   ┊101┊  async getChatOwner(chat: Chat) {
+┊   ┊102┊    const owner = await this.userProvider
+┊   ┊103┊      .createQueryBuilder()
+┊   ┊104┊      .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {
+┊   ┊105┊        chatId: chat.id,
+┊   ┊106┊      })
+┊   ┊107┊      .getOne()
+┊   ┊108┊
+┊   ┊109┊    return owner || null
+┊   ┊110┊  }
+┊   ┊111┊}
```

##### Added modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -0,0 +1,19 @@
+┊  ┊ 1┊import { ModuleContext } from '@graphql-modules/core'
+┊  ┊ 2┊import { IResolvers } from '../../../types'
+┊  ┊ 3┊import { ChatProvider } from '../providers/chat.provider'
+┊  ┊ 4┊
+┊  ┊ 5┊export default {
+┊  ┊ 6┊  Query: {
+┊  ┊ 7┊    chats: (obj, args, { injector }) => injector.get(ChatProvider).getChats(),
+┊  ┊ 8┊    chat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).getChat(chatId),
+┊  ┊ 9┊  },
+┊  ┊10┊  Chat: {
+┊  ┊11┊    name: (chat, args, { injector }) => injector.get(ChatProvider).getChatName(chat),
+┊  ┊12┊    picture: (chat, args, { injector }) => injector.get(ChatProvider).getChatPicture(chat),
+┊  ┊13┊    allTimeMembers: (chat, args, { injector }) =>
+┊  ┊14┊      injector.get(ChatProvider).getChatAllTimeMembers(chat),
+┊  ┊15┊    listingMembers: (chat, args, { injector }) =>
+┊  ┊16┊      injector.get(ChatProvider).getChatListingMembers(chat),
+┊  ┊17┊    owner: (chat, args, { injector }) => injector.get(ChatProvider).getChatOwner(chat),
+┊  ┊18┊  },
+┊  ┊19┊} as IResolvers
```

##### Added modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -0,0 +1,19 @@
+┊  ┊ 1┊type Query {
+┊  ┊ 2┊  chats: [Chat!]!
+┊  ┊ 3┊  chat(chatId: ID!): Chat
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊type Chat {
+┊  ┊ 7┊  #May be a chat or a group
+┊  ┊ 8┊  id: ID!
+┊  ┊ 9┊  #Computed for chats
+┊  ┊10┊  name: String
+┊  ┊11┊  #Computed for chats
+┊  ┊12┊  picture: String
+┊  ┊13┊  #All members, current and past ones.
+┊  ┊14┊  allTimeMembers: [User!]!
+┊  ┊15┊  #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊  ┊16┊  listingMembers: [User!]!
+┊  ┊17┊  #If null the group is read-only. Null for chats.
+┊  ┊18┊  owner: User
+┊  ┊19┊}
```

##### Added modules&#x2F;message&#x2F;index.ts
```diff
@@ -0,0 +1,24 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { ProviderScope } from '@graphql-modules/di'
+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 4┊import { AuthModule } from '../auth'
+┊  ┊ 5┊import { ChatModule } from '../chat'
+┊  ┊ 6┊import { UserModule } from '../user'
+┊  ┊ 7┊import { UtilsModule } from '../utils.module'
+┊  ┊ 8┊import { MessageProvider } from './providers/message.provider'
+┊  ┊ 9┊
+┊  ┊10┊export const MessageModule = new GraphQLModule({
+┊  ┊11┊  name: 'Message',
+┊  ┊12┊  imports: [
+┊  ┊13┊    AuthModule,
+┊  ┊14┊    UtilsModule,
+┊  ┊15┊    UserModule,
+┊  ┊16┊    ChatModule,
+┊  ┊17┊  ],
+┊  ┊18┊  providers: [
+┊  ┊19┊    MessageProvider,
+┊  ┊20┊  ],
+┊  ┊21┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊22┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊23┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
+┊  ┊24┊})
```

##### Added modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
```diff
@@ -0,0 +1,142 @@
+┊   ┊  1┊import { Injectable } from '@graphql-modules/di'
+┊   ┊  2┊import { Connection } from 'typeorm'
+┊   ┊  3┊import { MessageType } from '../../../db'
+┊   ┊  4┊import { Chat } from '../../../entity/chat'
+┊   ┊  5┊import { Message } from '../../../entity/message'
+┊   ┊  6┊import { User } from '../../../entity/user'
+┊   ┊  7┊import { AuthProvider } from '../../auth/providers/auth.provider'
+┊   ┊  8┊import { ChatProvider } from '../../chat/providers/chat.provider'
+┊   ┊  9┊import { UserProvider } from '../../user/providers/user.provider'
+┊   ┊ 10┊
+┊   ┊ 11┊@Injectable()
+┊   ┊ 12┊export class MessageProvider {
+┊   ┊ 13┊  constructor(
+┊   ┊ 14┊    private connection: Connection,
+┊   ┊ 15┊    private chatProvider: ChatProvider,
+┊   ┊ 16┊    private authProvider: AuthProvider,
+┊   ┊ 17┊    private userProvider: UserProvider
+┊   ┊ 18┊  ) {}
+┊   ┊ 19┊
+┊   ┊ 20┊  repository = this.connection.getRepository(Message)
+┊   ┊ 21┊  currentUser = this.authProvider.currentUser
+┊   ┊ 22┊
+┊   ┊ 23┊  createQueryBuilder() {
+┊   ┊ 24┊    return this.connection.createQueryBuilder(Message, 'message')
+┊   ┊ 25┊  }
+┊   ┊ 26┊
+┊   ┊ 27┊  async getMessageSender(message: Message) {
+┊   ┊ 28┊    const sender = await this.userProvider
+┊   ┊ 29┊      .createQueryBuilder()
+┊   ┊ 30┊      .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
+┊   ┊ 31┊        messageId: message.id,
+┊   ┊ 32┊      })
+┊   ┊ 33┊      .getOne()
+┊   ┊ 34┊
+┊   ┊ 35┊    if (!sender) {
+┊   ┊ 36┊      throw new Error(`Message must have a sender.`)
+┊   ┊ 37┊    }
+┊   ┊ 38┊
+┊   ┊ 39┊    return sender
+┊   ┊ 40┊  }
+┊   ┊ 41┊
+┊   ┊ 42┊  async getMessageOwnership(message: Message) {
+┊   ┊ 43┊    return !!(await this.userProvider
+┊   ┊ 44┊      .createQueryBuilder()
+┊   ┊ 45┊      .whereInIds(this.currentUser.id)
+┊   ┊ 46┊      .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
+┊   ┊ 47┊        messageId: message.id,
+┊   ┊ 48┊      })
+┊   ┊ 49┊      .getCount())
+┊   ┊ 50┊  }
+┊   ┊ 51┊
+┊   ┊ 52┊  async getMessageHolders(message: Message) {
+┊   ┊ 53┊    return await this.userProvider
+┊   ┊ 54┊      .createQueryBuilder()
+┊   ┊ 55┊      .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {
+┊   ┊ 56┊        messageId: message.id,
+┊   ┊ 57┊      })
+┊   ┊ 58┊      .getMany()
+┊   ┊ 59┊  }
+┊   ┊ 60┊
+┊   ┊ 61┊  async getMessageChat(message: Message) {
+┊   ┊ 62┊    const chat = await this.chatProvider
+┊   ┊ 63┊      .createQueryBuilder()
+┊   ┊ 64┊      .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {
+┊   ┊ 65┊        messageId: message.id,
+┊   ┊ 66┊      })
+┊   ┊ 67┊      .getOne()
+┊   ┊ 68┊
+┊   ┊ 69┊    if (!chat) {
+┊   ┊ 70┊      throw new Error(`Message must have a chat.`)
+┊   ┊ 71┊    }
+┊   ┊ 72┊
+┊   ┊ 73┊    return chat
+┊   ┊ 74┊  }
+┊   ┊ 75┊
+┊   ┊ 76┊  async getChats() {
+┊   ┊ 77┊    const chats = await this.chatProvider
+┊   ┊ 78┊      .createQueryBuilder()
+┊   ┊ 79┊      .leftJoin('chat.listingMembers', 'listingMembers')
+┊   ┊ 80┊      .where('listingMembers.id = :id', { id: this.currentUser.id })
+┊   ┊ 81┊      .getMany()
+┊   ┊ 82┊
+┊   ┊ 83┊    for (let chat of chats) {
+┊   ┊ 84┊      chat.messages = await this.getChatMessages(chat)
+┊   ┊ 85┊    }
+┊   ┊ 86┊
+┊   ┊ 87┊    return chats.sort((chatA, chatB) => {
+┊   ┊ 88┊      const dateA = chatA.messages.length
+┊   ┊ 89┊        ? chatA.messages[chatA.messages.length - 1].createdAt
+┊   ┊ 90┊        : chatA.createdAt
+┊   ┊ 91┊      const dateB = chatB.messages.length
+┊   ┊ 92┊        ? chatB.messages[chatB.messages.length - 1].createdAt
+┊   ┊ 93┊        : chatB.createdAt
+┊   ┊ 94┊      return dateB.valueOf() - dateA.valueOf()
+┊   ┊ 95┊    })
+┊   ┊ 96┊  }
+┊   ┊ 97┊
+┊   ┊ 98┊  async getChatMessages(chat: Chat, amount?: number) {
+┊   ┊ 99┊    if (chat.messages) {
+┊   ┊100┊      return amount ? chat.messages.slice(-amount) : chat.messages
+┊   ┊101┊    }
+┊   ┊102┊
+┊   ┊103┊    let query = this.createQueryBuilder()
+┊   ┊104┊      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
+┊   ┊105┊      .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
+┊   ┊106┊        userId: this.currentUser.id,
+┊   ┊107┊      })
+┊   ┊108┊      .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } })
+┊   ┊109┊
+┊   ┊110┊    if (amount) {
+┊   ┊111┊      query = query.take(amount)
+┊   ┊112┊    }
+┊   ┊113┊
+┊   ┊114┊    return (await query.getMany()).reverse()
+┊   ┊115┊  }
+┊   ┊116┊
+┊   ┊117┊  async getChatLastMessage(chat: Chat) {
+┊   ┊118┊    if (chat.messages) {
+┊   ┊119┊      return chat.messages.length ? chat.messages[chat.messages.length - 1] : null
+┊   ┊120┊    }
+┊   ┊121┊
+┊   ┊122┊    const messages = await this.getChatMessages(chat, 1)
+┊   ┊123┊
+┊   ┊124┊    return messages && messages.length ? messages[0] : null
+┊   ┊125┊  }
+┊   ┊126┊
+┊   ┊127┊  async getChatUpdatedAt(chat: Chat) {
+┊   ┊128┊    if (chat.messages) {
+┊   ┊129┊      return chat.messages.length ? chat.messages[0].createdAt : null
+┊   ┊130┊    }
+┊   ┊131┊
+┊   ┊132┊    const latestMessage = await this.createQueryBuilder()
+┊   ┊133┊      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
+┊   ┊134┊      .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
+┊   ┊135┊        userId: this.currentUser.id,
+┊   ┊136┊      })
+┊   ┊137┊      .orderBy({ 'message.createdAt': 'DESC' })
+┊   ┊138┊      .getOne()
+┊   ┊139┊
+┊   ┊140┊    return latestMessage ? latestMessage.createdAt : null
+┊   ┊141┊  }
+┊   ┊142┊}
```

##### Added modules&#x2F;message&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -0,0 +1,29 @@
+┊  ┊ 1┊import { ModuleContext } from '@graphql-modules/core'
+┊  ┊ 2┊import { Message } from '../../../entity/message'
+┊  ┊ 3┊import { IResolvers } from '../../../types'
+┊  ┊ 4┊import { MessageProvider } from '../providers/message.provider'
+┊  ┊ 5┊
+┊  ┊ 6┊export default {
+┊  ┊ 7┊  Query: {
+┊  ┊ 8┊    // The ordering depends on the messages
+┊  ┊ 9┊    chats: (obj, args, { injector }) => injector.get(MessageProvider).getChats(),
+┊  ┊10┊  },
+┊  ┊11┊  Chat: {
+┊  ┊12┊    messages: async (chat, { amount }, { injector }) =>
+┊  ┊13┊      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
+┊  ┊14┊    lastMessage: async (chat, args, { injector }) =>
+┊  ┊15┊      injector.get(MessageProvider).getChatLastMessage(chat),
+┊  ┊16┊    updatedAt: async (chat, args, { injector }) =>
+┊  ┊17┊      injector.get(MessageProvider).getChatUpdatedAt(chat),
+┊  ┊18┊  },
+┊  ┊19┊  Message: {
+┊  ┊20┊    sender: async (message, args, { injector }) =>
+┊  ┊21┊      injector.get(MessageProvider).getMessageSender(message),
+┊  ┊22┊    ownership: async (message, args, { injector }) =>
+┊  ┊23┊      injector.get(MessageProvider).getMessageOwnership(message),
+┊  ┊24┊    holders: async (message, args, { injector }) =>
+┊  ┊25┊      injector.get(MessageProvider).getMessageHolders(message),
+┊  ┊26┊    chat: async (message, args, { injector }) =>
+┊  ┊27┊      injector.get(MessageProvider).getMessageChat(message),
+┊  ┊28┊  },
+┊  ┊29┊} as IResolvers
```

##### Added modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊enum MessageType {
+┊  ┊ 2┊  LOCATION
+┊  ┊ 3┊  TEXT
+┊  ┊ 4┊  PICTURE
+┊  ┊ 5┊}
+┊  ┊ 6┊
+┊  ┊ 7┊extend type Chat {
+┊  ┊ 8┊  messages(amount: Int): [Message]!
+┊  ┊ 9┊  lastMessage: Message
+┊  ┊10┊  updatedAt: Date!
+┊  ┊11┊}
+┊  ┊12┊
+┊  ┊13┊type Message {
+┊  ┊14┊  id: ID!
+┊  ┊15┊  sender: User!
+┊  ┊16┊  chat: Chat!
+┊  ┊17┊  content: String!
+┊  ┊18┊  createdAt: Date!
+┊  ┊19┊  #FIXME: should return MessageType
+┊  ┊20┊  type: Int!
+┊  ┊21┊  #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
+┊  ┊22┊  holders: [User!]!
+┊  ┊23┊  #Computed property
+┊  ┊24┊  ownership: Boolean!
+┊  ┊25┊}
```

##### Added modules&#x2F;user&#x2F;index.ts
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { InjectFunction, ProviderScope } from '@graphql-modules/di'
+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 4┊import { AuthModule } from '../auth'
+┊  ┊ 5┊import { UserProvider } from './providers/user.provider'
+┊  ┊ 6┊
+┊  ┊ 7┊export const UserModule = new GraphQLModule({
+┊  ┊ 8┊  name: 'User',
+┊  ┊ 9┊  imports: [
+┊  ┊10┊    AuthModule,
+┊  ┊11┊  ],
+┊  ┊12┊  providers: [
+┊  ┊13┊    UserProvider,
+┊  ┊14┊  ],
+┊  ┊15┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊16┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
+┊  ┊17┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊18┊})
```

##### Added modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊import { Injectable, ProviderScope } from '@graphql-modules/di'
+┊  ┊ 2┊import { Connection } from 'typeorm'
+┊  ┊ 3┊import { User } from '../../../entity/user'
+┊  ┊ 4┊import { AuthProvider } from '../../auth/providers/auth.provider'
+┊  ┊ 5┊
+┊  ┊ 6┊@Injectable()
+┊  ┊ 7┊export class UserProvider {
+┊  ┊ 8┊  constructor(private connection: Connection, private authProvider: AuthProvider) {}
+┊  ┊ 9┊
+┊  ┊10┊  public repository = this.connection.getRepository(User)
+┊  ┊11┊  private currentUser = this.authProvider.currentUser
+┊  ┊12┊
+┊  ┊13┊  createQueryBuilder() {
+┊  ┊14┊    return this.connection.createQueryBuilder(User, 'user')
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  getUsers() {
+┊  ┊18┊    return this.createQueryBuilder()
+┊  ┊19┊      .where('user.id != :id', { id: this.currentUser.id })
+┊  ┊20┊      .getMany()
+┊  ┊21┊  }
+┊  ┊22┊}
```

##### Added modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊import { ModuleContext } from '@graphql-modules/core'
+┊  ┊ 2┊import { User } from '../../../entity/User'
+┊  ┊ 3┊import { IResolvers } from '../../../types'
+┊  ┊ 4┊import { UserProvider } from '../providers/user.provider'
+┊  ┊ 5┊
+┊  ┊ 6┊export default {
+┊  ┊ 7┊  Query: {
+┊  ┊ 8┊    users: (obj, args, { injector }) => injector.get(UserProvider).getUsers(),
+┊  ┊ 9┊  },
+┊  ┊10┊} as IResolvers
```

##### Added modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊type Query {
+┊  ┊ 2┊  users: [User!]
+┊  ┊ 3┊}
+┊  ┊ 4┊
+┊  ┊ 5┊type User {
+┊  ┊ 6┊  id: ID!
+┊  ┊ 7┊  name: String
+┊  ┊ 8┊  picture: String
+┊  ┊ 9┊  phone: String
+┊  ┊10┊}
```

##### Added modules&#x2F;utils.module.ts
```diff
@@ -0,0 +1,12 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { GraphQLDateTime } from 'graphql-iso-date'
+┊  ┊ 3┊
+┊  ┊ 4┊export const UtilsModule = new GraphQLModule({
+┊  ┊ 5┊  name: 'Utils',
+┊  ┊ 6┊  typeDefs: `
+┊  ┊ 7┊    scalar Date
+┊  ┊ 8┊  `,
+┊  ┊ 9┊  resolvers: {
+┊  ┊10┊    Date: GraphQLDateTime,
+┊  ┊11┊  },
+┊  ┊12┊})
```

[}]: #

The implementation of the resolvers is NOT implemented in the resolver functions themselves, but rather in a separate provider. With this working model we can import and use the providers in various modules, not necessarily a specific one. In addition, we can mock the provider handlers, which makes it more testable.

We've also created a module called `auth`, which will be responsible for authentication in the near future. For now we use a constant for `currentUser` so we can implement the handlers as if we already have authentication.

We will use a main GQLModule called `app` to connect all our components and export a unified schema:

[{]: <helper> (diffStep 1.7 files="modules/app" module="server")

#### [Step 1.7: Transition to GraphQL Modules](https://github.com/Urigo/WhatsApp-Clone-Server/commit/b4376a5)

##### Added modules&#x2F;app.module.ts
```diff
@@ -0,0 +1,24 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { Connection } from 'typeorm'
+┊  ┊ 3┊import { Express } from 'express'
+┊  ┊ 4┊import { AuthModule } from './auth'
+┊  ┊ 5┊import { UserModule } from './user'
+┊  ┊ 6┊import { ChatModule } from './chat'
+┊  ┊ 7┊import { MessageModule } from './message'
+┊  ┊ 8┊
+┊  ┊ 9┊export interface IAppModuleConfig {
+┊  ┊10┊  connection: Connection;
+┊  ┊11┊}
+┊  ┊12┊
+┊  ┊13┊export const AppModule = new GraphQLModule<IAppModuleConfig>({
+┊  ┊14┊  name: 'App',
+┊  ┊15┊  imports: ({ config: { connection } }) => [
+┊  ┊16┊    AuthModule.forRoot({
+┊  ┊17┊      connection,
+┊  ┊18┊    }),
+┊  ┊19┊    UserModule,
+┊  ┊20┊    ChatModule,
+┊  ┊21┊    MessageModule,
+┊  ┊22┊  ],
+┊  ┊23┊  configRequired: true,
+┊  ┊24┊})
```

##### Added modules&#x2F;app.symbols.ts
```diff
@@ -0,0 +1 @@
+┊ ┊1┊export const APP = Symbol.for('APP')
```

[}]: #

Accordingly, we will update the server to use the schema exported by the module we've just created

[{]: <helper> (diffStep 1.7 files="index, schema" module="server")

#### [Step 1.7: Transition to GraphQL Modules](https://github.com/Urigo/WhatsApp-Clone-Server/commit/b4376a5)

##### Changed index.ts
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊import { createServer } from 'http'
 ┊ 8┊ 8┊import { createConnection } from 'typeorm'
 ┊ 9┊ 9┊import { addSampleData } from './db'
-┊10┊  ┊import schema from './schema'
+┊  ┊10┊import { AppModule } from './modules/app.module'
 ┊11┊11┊
 ┊12┊12┊const PORT = 4000
 ┊13┊13┊
```
```diff
@@ -21,12 +21,11 @@
 ┊21┊21┊  app.use(cors())
 ┊22┊22┊  app.use(bodyParser.json())
 ┊23┊23┊
+┊  ┊24┊  const { schema, context } = AppModule.forRoot({ connection })
+┊  ┊25┊
 ┊24┊26┊  const apollo = new ApolloServer({
 ┊25┊27┊    schema,
-┊26┊  ┊    context: () => ({
-┊27┊  ┊      connection,
-┊28┊  ┊      currentUser: { id: '1' },
-┊29┊  ┊    }),
+┊  ┊28┊    context,
 ┊30┊29┊  })
 ┊31┊30┊
 ┊32┊31┊  apollo.applyMiddleware({
```

##### Added modules&#x2F;auth&#x2F;index.ts
```diff
@@ -0,0 +1,12 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { Connection } from 'typeorm'
+┊  ┊ 3┊import { AuthProvider } from './providers/auth.provider'
+┊  ┊ 4┊
+┊  ┊ 5┊export const AuthModule = new GraphQLModule({
+┊  ┊ 6┊  name: 'Auth',
+┊  ┊ 7┊  providers: ({ config: { connection } }) => [
+┊  ┊ 8┊    { provide: Connection, useValue: connection },
+┊  ┊ 9┊    AuthProvider,
+┊  ┊10┊  ],
+┊  ┊11┊  configRequired: true,
+┊  ┊12┊})
```

##### Added modules&#x2F;chat&#x2F;index.ts
```diff
@@ -0,0 +1,16 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { ProviderScope } from '@graphql-modules/di'
+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 4┊import { AuthModule } from '../auth'
+┊  ┊ 5┊import { UserModule } from '../user'
+┊  ┊ 6┊import { UtilsModule } from '../utils.module'
+┊  ┊ 7┊import { ChatProvider } from './providers/chat.provider'
+┊  ┊ 8┊
+┊  ┊ 9┊export const ChatModule = new GraphQLModule({
+┊  ┊10┊  name: 'Chat',
+┊  ┊11┊  imports: [AuthModule, UtilsModule, UserModule],
+┊  ┊12┊  providers: [ChatProvider],
+┊  ┊13┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊14┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊15┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
+┊  ┊16┊})
```

##### Added modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -0,0 +1,19 @@
+┊  ┊ 1┊type Query {
+┊  ┊ 2┊  chats: [Chat!]!
+┊  ┊ 3┊  chat(chatId: ID!): Chat
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊type Chat {
+┊  ┊ 7┊  #May be a chat or a group
+┊  ┊ 8┊  id: ID!
+┊  ┊ 9┊  #Computed for chats
+┊  ┊10┊  name: String
+┊  ┊11┊  #Computed for chats
+┊  ┊12┊  picture: String
+┊  ┊13┊  #All members, current and past ones.
+┊  ┊14┊  allTimeMembers: [User!]!
+┊  ┊15┊  #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊  ┊16┊  listingMembers: [User!]!
+┊  ┊17┊  #If null the group is read-only. Null for chats.
+┊  ┊18┊  owner: User
+┊  ┊19┊}
```

##### Added modules&#x2F;message&#x2F;index.ts
```diff
@@ -0,0 +1,24 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { ProviderScope } from '@graphql-modules/di'
+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 4┊import { AuthModule } from '../auth'
+┊  ┊ 5┊import { ChatModule } from '../chat'
+┊  ┊ 6┊import { UserModule } from '../user'
+┊  ┊ 7┊import { UtilsModule } from '../utils.module'
+┊  ┊ 8┊import { MessageProvider } from './providers/message.provider'
+┊  ┊ 9┊
+┊  ┊10┊export const MessageModule = new GraphQLModule({
+┊  ┊11┊  name: 'Message',
+┊  ┊12┊  imports: [
+┊  ┊13┊    AuthModule,
+┊  ┊14┊    UtilsModule,
+┊  ┊15┊    UserModule,
+┊  ┊16┊    ChatModule,
+┊  ┊17┊  ],
+┊  ┊18┊  providers: [
+┊  ┊19┊    MessageProvider,
+┊  ┊20┊  ],
+┊  ┊21┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊22┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊23┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
+┊  ┊24┊})
```

##### Added modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊enum MessageType {
+┊  ┊ 2┊  LOCATION
+┊  ┊ 3┊  TEXT
+┊  ┊ 4┊  PICTURE
+┊  ┊ 5┊}
+┊  ┊ 6┊
+┊  ┊ 7┊extend type Chat {
+┊  ┊ 8┊  messages(amount: Int): [Message]!
+┊  ┊ 9┊  lastMessage: Message
+┊  ┊10┊  updatedAt: Date!
+┊  ┊11┊}
+┊  ┊12┊
+┊  ┊13┊type Message {
+┊  ┊14┊  id: ID!
+┊  ┊15┊  sender: User!
+┊  ┊16┊  chat: Chat!
+┊  ┊17┊  content: String!
+┊  ┊18┊  createdAt: Date!
+┊  ┊19┊  #FIXME: should return MessageType
+┊  ┊20┊  type: Int!
+┊  ┊21┊  #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
+┊  ┊22┊  holders: [User!]!
+┊  ┊23┊  #Computed property
+┊  ┊24┊  ownership: Boolean!
+┊  ┊25┊}
```

##### Added modules&#x2F;user&#x2F;index.ts
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core'
+┊  ┊ 2┊import { InjectFunction, ProviderScope } from '@graphql-modules/di'
+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
+┊  ┊ 4┊import { AuthModule } from '../auth'
+┊  ┊ 5┊import { UserProvider } from './providers/user.provider'
+┊  ┊ 6┊
+┊  ┊ 7┊export const UserModule = new GraphQLModule({
+┊  ┊ 8┊  name: 'User',
+┊  ┊ 9┊  imports: [
+┊  ┊10┊    AuthModule,
+┊  ┊11┊  ],
+┊  ┊12┊  providers: [
+┊  ┊13┊    UserProvider,
+┊  ┊14┊  ],
+┊  ┊15┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊16┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
+┊  ┊17┊  defaultProviderScope: ProviderScope.Session,
+┊  ┊18┊})
```

##### Added modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊type Query {
+┊  ┊ 2┊  users: [User!]
+┊  ┊ 3┊}
+┊  ┊ 4┊
+┊  ┊ 5┊type User {
+┊  ┊ 6┊  id: ID!
+┊  ┊ 7┊  name: String
+┊  ┊ 8┊  picture: String
+┊  ┊ 9┊  phone: String
+┊  ┊10┊}
```

##### Changed schema&#x2F;index.ts
```diff
@@ -1,8 +1,4 @@
-┊1┊ ┊import { makeExecutableSchema } from 'apollo-server-express'
-┊2┊ ┊import resolvers from './resolvers'
-┊3┊ ┊import typeDefs from './typeDefs'
+┊ ┊1┊import 'reflect-metadata'
+┊ ┊2┊import { AppModule } from '../modules/app.module'
 ┊4┊3┊
-┊5┊ ┊export default makeExecutableSchema({
-┊6┊ ┊  typeDefs,
-┊7┊ ┊  resolvers,
-┊8┊ ┊})
+┊ ┊4┊export default AppModule.forRoot({} as any).schema
```

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,197 +1,4 @@
-┊  1┊   ┊import { IResolvers as IApolloResolvers } from 'apollo-server-express'
-┊  2┊   ┊import { GraphQLDateTime } from 'graphql-iso-date'
-┊  3┊   ┊import Chat from '../entity/chat'
-┊  4┊   ┊import Message from '../entity/message'
-┊  5┊   ┊import User from '../entity/user'
-┊  6┊   ┊import { IResolvers } from '../types'
+┊   ┊  1┊import 'reflect-metadata'
+┊   ┊  2┊import { AppModule } from '../modules/app.module'
 ┊  7┊  3┊
-┊  8┊   ┊export default {
-┊  9┊   ┊  Date: GraphQLDateTime,
-┊ 10┊   ┊  Query: {
-┊ 11┊   ┊    // Show all users for the moment.
-┊ 12┊   ┊    users: (root, args, { connection, currentUser }) => {
-┊ 13┊   ┊      return connection.createQueryBuilder(User, 'user').where('user.id != :id', {id: currentUser.id}).getMany();
-┊ 14┊   ┊    },
-┊ 15┊   ┊
-┊ 16┊   ┊    chats: (root, args, { connection, currentUser }) => {
-┊ 17┊   ┊      return connection
-┊ 18┊   ┊        .createQueryBuilder(Chat, 'chat')
-┊ 19┊   ┊        .leftJoin('chat.listingMembers', 'listingMembers')
-┊ 20┊   ┊        .where('listingMembers.id = :id', { id: currentUser.id })
-┊ 21┊   ┊        .orderBy('chat.createdAt', 'DESC')
-┊ 22┊   ┊        .getMany();
-┊ 23┊   ┊    },
-┊ 24┊   ┊
-┊ 25┊   ┊    chat: async (root, { chatId }, { connection }) => {
-┊ 26┊   ┊      const chat = await connection
-┊ 27┊   ┊        .createQueryBuilder(Chat, 'chat')
-┊ 28┊   ┊        .whereInIds(chatId)
-┊ 29┊   ┊        .getOne();
-┊ 30┊   ┊
-┊ 31┊   ┊      return chat || null;
-┊ 32┊   ┊    },
-┊ 33┊   ┊  },
-┊ 34┊   ┊
-┊ 35┊   ┊  Chat: {
-┊ 36┊   ┊    name: async (chat, args, { connection, currentUser }) => {
-┊ 37┊   ┊      if (chat.name) {
-┊ 38┊   ┊        return chat.name;
-┊ 39┊   ┊      }
-┊ 40┊   ┊
-┊ 41┊   ┊      const user = await connection
-┊ 42┊   ┊        .createQueryBuilder(User, 'user')
-┊ 43┊   ┊        .where('user.id != :userId', { userId: currentUser.id })
-┊ 44┊   ┊        .innerJoin(
-┊ 45┊   ┊          'user.allTimeMemberChats',
-┊ 46┊   ┊          'allTimeMemberChats',
-┊ 47┊   ┊          'allTimeMemberChats.id = :chatId',
-┊ 48┊   ┊          { chatId: chat.id },
-┊ 49┊   ┊        )
-┊ 50┊   ┊        .getOne();
-┊ 51┊   ┊
-┊ 52┊   ┊      return user ? user.name : null
-┊ 53┊   ┊    },
-┊ 54┊   ┊
-┊ 55┊   ┊    picture: async (chat, args, { connection, currentUser }) => {
-┊ 56┊   ┊      if (chat.picture) {
-┊ 57┊   ┊        return chat.picture;
-┊ 58┊   ┊      }
-┊ 59┊   ┊
-┊ 60┊   ┊      const user = await connection
-┊ 61┊   ┊        .createQueryBuilder(User, 'user')
-┊ 62┊   ┊        .where('user.id != :userId', { userId: currentUser.id })
-┊ 63┊   ┊        .innerJoin(
-┊ 64┊   ┊          'user.allTimeMemberChats',
-┊ 65┊   ┊          'allTimeMemberChats',
-┊ 66┊   ┊          'allTimeMemberChats.id = :chatId',
-┊ 67┊   ┊          { chatId: chat.id },
-┊ 68┊   ┊        )
-┊ 69┊   ┊        .getOne();
-┊ 70┊   ┊
-┊ 71┊   ┊      return user ? user.picture : null
-┊ 72┊   ┊    },
-┊ 73┊   ┊
-┊ 74┊   ┊    allTimeMembers: (chat, args, { connection }) => {
-┊ 75┊   ┊      return connection
-┊ 76┊   ┊        .createQueryBuilder(User, 'user')
-┊ 77┊   ┊        .innerJoin(
-┊ 78┊   ┊          'user.listingMemberChats',
-┊ 79┊   ┊          'listingMemberChats',
-┊ 80┊   ┊          'listingMemberChats.id = :chatId',
-┊ 81┊   ┊          { chatId: chat.id },
-┊ 82┊   ┊        )
-┊ 83┊   ┊        .getMany()
-┊ 84┊   ┊    },
-┊ 85┊   ┊
-┊ 86┊   ┊    listingMembers: (chat, args, { connection }) => {
-┊ 87┊   ┊      return connection
-┊ 88┊   ┊        .createQueryBuilder(User, 'user')
-┊ 89┊   ┊        .innerJoin(
-┊ 90┊   ┊          'user.listingMemberChats',
-┊ 91┊   ┊          'listingMemberChats',
-┊ 92┊   ┊          'listingMemberChats.id = :chatId',
-┊ 93┊   ┊          { chatId: chat.id },
-┊ 94┊   ┊        )
-┊ 95┊   ┊        .getMany();
-┊ 96┊   ┊    },
-┊ 97┊   ┊
-┊ 98┊   ┊    owner: async (chat, args, { connection }) => {
-┊ 99┊   ┊      const owner = await connection
-┊100┊   ┊        .createQueryBuilder(User, 'user')
-┊101┊   ┊        .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {
-┊102┊   ┊          chatId: chat.id,
-┊103┊   ┊        })
-┊104┊   ┊        .getOne();
-┊105┊   ┊
-┊106┊   ┊      return owner || null;
-┊107┊   ┊    },
-┊108┊   ┊
-┊109┊   ┊    messages: async (chat, { amount = 0 }, { connection, currentUser }) => {
-┊110┊   ┊      if (chat.messages) {
-┊111┊   ┊        return amount ? chat.messages.slice(-amount) : chat.messages;
-┊112┊   ┊      }
-┊113┊   ┊
-┊114┊   ┊      let query = connection
-┊115┊   ┊        .createQueryBuilder(Message, 'message')
-┊116┊   ┊        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
-┊117┊   ┊        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
-┊118┊   ┊          userId: currentUser.id,
-┊119┊   ┊        })
-┊120┊   ┊        .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } });
-┊121┊   ┊
-┊122┊   ┊      if (amount) {
-┊123┊   ┊        query = query.take(amount);
-┊124┊   ┊      }
-┊125┊   ┊
-┊126┊   ┊      return (await query.getMany()).reverse();
-┊127┊   ┊    },
-┊128┊   ┊
-┊129┊   ┊    lastMessage: async (chat, args, { connection, currentUser }) => {
-┊130┊   ┊      if (chat.messages) {
-┊131┊   ┊        return chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
-┊132┊   ┊      }
-┊133┊   ┊
-┊134┊   ┊      const messages = await connection
-┊135┊   ┊        .createQueryBuilder(Message, 'message')
-┊136┊   ┊        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
-┊137┊   ┊        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
-┊138┊   ┊          userId: currentUser.id,
-┊139┊   ┊        })
-┊140┊   ┊        .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } })
-┊141┊   ┊        .getMany()
-┊142┊   ┊
-┊143┊   ┊      return messages && messages.length ? messages[messages.length - 1] : null;
-┊144┊   ┊    },
-┊145┊   ┊  },
-┊146┊   ┊
-┊147┊   ┊  Message: {
-┊148┊   ┊    chat: async (message, args, { connection }) => {
-┊149┊   ┊      const chat = await connection
-┊150┊   ┊        .createQueryBuilder(Chat, 'chat')
-┊151┊   ┊        .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {
-┊152┊   ┊          messageId: message.id
-┊153┊   ┊        })
-┊154┊   ┊        .getOne();
-┊155┊   ┊
-┊156┊   ┊      if (!chat) {
-┊157┊   ┊        throw new Error(`Message must have a chat.`);
-┊158┊   ┊      }
-┊159┊   ┊
-┊160┊   ┊      return chat;
-┊161┊   ┊    },
-┊162┊   ┊
-┊163┊   ┊    sender: async (message, args, { connection }) => {
-┊164┊   ┊      const sender = await connection
-┊165┊   ┊        .createQueryBuilder(User, 'user')
-┊166┊   ┊        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
-┊167┊   ┊          messageId: message.id,
-┊168┊   ┊        })
-┊169┊   ┊        .getOne();
-┊170┊   ┊
-┊171┊   ┊      if (!sender) {
-┊172┊   ┊        throw new Error(`Message must have a sender.`);
-┊173┊   ┊      }
-┊174┊   ┊
-┊175┊   ┊      return sender;
-┊176┊   ┊    },
-┊177┊   ┊
-┊178┊   ┊    holders: async (message, args, { connection }) => {
-┊179┊   ┊      return connection
-┊180┊   ┊        .createQueryBuilder(User, 'user')
-┊181┊   ┊        .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {
-┊182┊   ┊          messageId: message.id,
-┊183┊   ┊        })
-┊184┊   ┊        .getMany();
-┊185┊   ┊    },
-┊186┊   ┊
-┊187┊   ┊    ownership: async (message, args, { connection, currentUser }) => {
-┊188┊   ┊      return !!(await connection
-┊189┊   ┊        .createQueryBuilder(User, 'user')
-┊190┊   ┊        .whereInIds(currentUser.id)
-┊191┊   ┊        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
-┊192┊   ┊          messageId: message.id,
-┊193┊   ┊        })
-┊194┊   ┊        .getCount())
-┊195┊   ┊    }
-┊196┊   ┊  },
-┊197┊   ┊} as IResolvers as IApolloResolvers
+┊   ┊  4┊export default AppModule.forRoot({} as any).resolvers
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -1,54 +1,4 @@
-┊ 1┊  ┊export default `
-┊ 2┊  ┊  scalar Date
+┊  ┊ 1┊import 'reflect-metadata'
+┊  ┊ 2┊import { AppModule } from '../modules/app.module'
 ┊ 3┊ 3┊
-┊ 4┊  ┊  type Query {
-┊ 5┊  ┊    users: [User!]
-┊ 6┊  ┊    chats: [Chat!]
-┊ 7┊  ┊    chat(chatId: ID!): Chat
-┊ 8┊  ┊  }
-┊ 9┊  ┊
-┊10┊  ┊  enum MessageType {
-┊11┊  ┊    LOCATION
-┊12┊  ┊    TEXT
-┊13┊  ┊    PICTURE
-┊14┊  ┊  }
-┊15┊  ┊
-┊16┊  ┊  type Chat {
-┊17┊  ┊    #May be a chat or a group
-┊18┊  ┊    id: ID!
-┊19┊  ┊    #Computed for chats
-┊20┊  ┊    name: String
-┊21┊  ┊    updatedAt: Date
-┊22┊  ┊    #Computed for chats
-┊23┊  ┊    picture: String
-┊24┊  ┊    #All members, current and past ones.
-┊25┊  ┊    allTimeMembers: [User!]!
-┊26┊  ┊    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
-┊27┊  ┊    listingMembers: [User!]!
-┊28┊  ┊    #If null the group is read-only. Null for chats.
-┊29┊  ┊    owner: User
-┊30┊  ┊    messages(amount: Int): [Message]!
-┊31┊  ┊    lastMessage: Message
-┊32┊  ┊  }
-┊33┊  ┊
-┊34┊  ┊  type Message {
-┊35┊  ┊    id: ID!
-┊36┊  ┊    sender: User!
-┊37┊  ┊    chat: Chat!
-┊38┊  ┊    content: String!
-┊39┊  ┊    createdAt: Date!
-┊40┊  ┊    #FIXME: should return MessageType
-┊41┊  ┊    type: Int!
-┊42┊  ┊    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
-┊43┊  ┊    holders: [User!]!
-┊44┊  ┊    #Computed property
-┊45┊  ┊    ownership: Boolean!
-┊46┊  ┊  }
-┊47┊  ┊
-┊48┊  ┊  type User {
-┊49┊  ┊    id: ID!
-┊50┊  ┊    name: String
-┊51┊  ┊    picture: String
-┊52┊  ┊    phone: String
-┊53┊  ┊  }
-┊54┊  ┊`
+┊  ┊ 4┊export default AppModule.forRoot({} as any).typeDefs
```

[}]: #

Now try to run the app again and see how things work. Of course, there shouldn't be any visual differences, but know that having a DB as an essential step.

    $ yarn start --reset-dummy-data

In the next step we refactor our back-end so it can be more maintainable, and we will setup a basic authentication mechanism. WhatsApp is not WhatsApp without authentication!


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Intro](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/master@next/README.md) | [Next Step >](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/master@next/.tortilla/manuals/views/step2.md) |
|:--------------------------------|--------------------------------:|

[}]: #
