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

#### Step 1.1: Setup TypeScript

##### Added tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊{</b>
<b>+┊  ┊ 2┊  &quot;compilerOptions&quot;: {</b>
<b>+┊  ┊ 3┊    &quot;outDir&quot;: &quot;build/dist&quot;,</b>
<b>+┊  ┊ 4┊    &quot;sourceMap&quot;: true,</b>
<b>+┊  ┊ 5┊    &quot;declaration&quot;: false,</b>
<b>+┊  ┊ 6┊    &quot;moduleResolution&quot;: &quot;node&quot;,</b>
<b>+┊  ┊ 7┊    &quot;emitDecoratorMetadata&quot;: true,</b>
<b>+┊  ┊ 8┊    &quot;experimentalDecorators&quot;: true,</b>
<b>+┊  ┊ 9┊    &quot;downlevelIteration&quot;: true,</b>
<b>+┊  ┊10┊    &quot;resolveJsonModule&quot;: true,</b>
<b>+┊  ┊11┊    &quot;target&quot;: &quot;es5&quot;,</b>
<b>+┊  ┊12┊    &quot;jsx&quot;: &quot;preserve&quot;,</b>
<b>+┊  ┊13┊    &quot;typeRoots&quot;: [</b>
<b>+┊  ┊14┊      &quot;node_modules/@types&quot;</b>
<b>+┊  ┊15┊    ],</b>
<b>+┊  ┊16┊    &quot;lib&quot;: [</b>
<b>+┊  ┊17┊      &quot;es2017&quot;,</b>
<b>+┊  ┊18┊      &quot;dom&quot;,</b>
<b>+┊  ┊19┊      &quot;esnext.asynciterable&quot;</b>
<b>+┊  ┊20┊    ],</b>
<b>+┊  ┊21┊    &quot;allowJs&quot;: true,</b>
<b>+┊  ┊22┊    &quot;skipLibCheck&quot;: true,</b>
<b>+┊  ┊23┊    &quot;esModuleInterop&quot;: false,</b>
<b>+┊  ┊24┊    &quot;allowSyntheticDefaultImports&quot;: true,</b>
<b>+┊  ┊25┊    &quot;forceConsistentCasingInFileNames&quot;: true,</b>
<b>+┊  ┊26┊    &quot;isolatedModules&quot;: true,</b>
<b>+┊  ┊27┊    &quot;noEmit&quot;: true,</b>
<b>+┊  ┊28┊    &quot;noImplicitAny&quot;: false,</b>
<b>+┊  ┊29┊    &quot;strict&quot;: false,</b>
<b>+┊  ┊30┊    &quot;module&quot;: &quot;esnext&quot;</b>
<b>+┊  ┊31┊  },</b>
<b>+┊  ┊32┊  &quot;include&quot;: [</b>
<b>+┊  ┊33┊    &quot;src&quot;</b>
<b>+┊  ┊34┊  ]</b>
<b>+┊  ┊35┊}</b>
</pre>

##### Added tslint.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊{</b>
<b>+┊  ┊ 2┊  &quot;extends&quot;: [&quot;tslint:recommended&quot;, &quot;tslint-react&quot;, &quot;tslint-config-prettier&quot;],</b>
<b>+┊  ┊ 3┊  &quot;rules&quot;: {</b>
<b>+┊  ┊ 4┊    &quot;ordered-imports&quot;: false,</b>
<b>+┊  ┊ 5┊    &quot;object-literal-sort-keys&quot;: false,</b>
<b>+┊  ┊ 6┊    &quot;jsx-boolean-value&quot;: false,</b>
<b>+┊  ┊ 7┊    &quot;interface-name&quot; : false,</b>
<b>+┊  ┊ 8┊    &quot;variable-name&quot;: false,</b>
<b>+┊  ┊ 9┊    &quot;no-string-literal&quot;: false,</b>
<b>+┊  ┊10┊    &quot;no-namespace&quot;: false,</b>
<b>+┊  ┊11┊    &quot;interface-over-type-literal&quot;: false,</b>
<b>+┊  ┊12┊    &quot;no-shadowed-variable&quot;: false,</b>
<b>+┊  ┊13┊    &quot;curly&quot;: false,</b>
<b>+┊  ┊14┊    &quot;no-label&quot;: false,</b>
<b>+┊  ┊15┊    &quot;no-empty&quot;: false,</b>
<b>+┊  ┊16┊    &quot;no-debugger&quot;: false,</b>
<b>+┊  ┊17┊    &quot;no-console&quot;: false,</b>
<b>+┊  ┊18┊    &quot;array-type&quot;: false</b>
<b>+┊  ┊19┊  },</b>
<b>+┊  ┊20┊  &quot;linterOptions&quot;: {</b>
<b>+┊  ┊21┊    &quot;exclude&quot;: [</b>
<b>+┊  ┊22┊      &quot;config/**/*.js&quot;,</b>
<b>+┊  ┊23┊      &quot;node_modules/**/*.ts&quot;,</b>
<b>+┊  ┊24┊      &quot;coverage/lcov-report/*.js&quot;,</b>
<b>+┊  ┊25┊      &quot;*.json&quot;,</b>
<b>+┊  ┊26┊      &quot;**/*.json&quot;</b>
<b>+┊  ┊27┊    ]</b>
<b>+┊  ┊28┊  }</b>
<b>+┊  ┊29┊}</b>
</pre>

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

#### Step 1.3: Setup Apollo-client

##### Added .env
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊REACT_APP_SERVER_URL&#x3D;http://localhost:4000</b>
</pre>

[}]: #

And finally we can write our Apollo-GraphQL client module and connect it to our application:

[{]: <helper> (diffStep 1.3 files="src/apollo-client.ts, src/index.tsx" module="client")

#### Step 1.3: Setup Apollo-client

##### Added src&#x2F;apollo-client.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { InMemoryCache } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊  ┊ 2┊import { ApolloClient } from &#x27;apollo-client&#x27;</b>
<b>+┊  ┊ 3┊import { ApolloLink, split } from &#x27;apollo-link&#x27;</b>
<b>+┊  ┊ 4┊import { HttpLink } from &#x27;apollo-link-http&#x27;</b>
<b>+┊  ┊ 5┊import { WebSocketLink } from &#x27;apollo-link-ws&#x27;</b>
<b>+┊  ┊ 6┊import { getMainDefinition } from &#x27;apollo-utilities&#x27;</b>
<b>+┊  ┊ 7┊import { OperationDefinitionNode } from &#x27;graphql&#x27;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊const httpUri &#x3D; process.env.REACT_APP_SERVER_URL + &#x27;/graphql&#x27;</b>
<b>+┊  ┊10┊const wsUri &#x3D; httpUri.replace(/^https?/, &#x27;ws&#x27;)</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊const httpLink &#x3D; new HttpLink({</b>
<b>+┊  ┊13┊  uri: httpUri,</b>
<b>+┊  ┊14┊})</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊const wsLink &#x3D; new WebSocketLink({</b>
<b>+┊  ┊17┊  uri: wsUri,</b>
<b>+┊  ┊18┊  options: {</b>
<b>+┊  ┊19┊    reconnect: true,</b>
<b>+┊  ┊20┊  },</b>
<b>+┊  ┊21┊})</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊const terminatingLink &#x3D; split(</b>
<b>+┊  ┊24┊  ({ query }) &#x3D;&gt; {</b>
<b>+┊  ┊25┊    const { kind, operation } &#x3D; getMainDefinition(query) as OperationDefinitionNode</b>
<b>+┊  ┊26┊    return kind &#x3D;&#x3D;&#x3D; &#x27;OperationDefinition&#x27; &amp;&amp; operation &#x3D;&#x3D;&#x3D; &#x27;subscription&#x27;</b>
<b>+┊  ┊27┊  },</b>
<b>+┊  ┊28┊  wsLink,</b>
<b>+┊  ┊29┊  httpLink,</b>
<b>+┊  ┊30┊)</b>
<b>+┊  ┊31┊</b>
<b>+┊  ┊32┊const link &#x3D; ApolloLink.from([terminatingLink])</b>
<b>+┊  ┊33┊const cache &#x3D; new InMemoryCache()</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊export default new ApolloClient({</b>
<b>+┊  ┊36┊  link,</b>
<b>+┊  ┊37┊  cache,</b>
<b>+┊  ┊38┊})</b>
</pre>

##### Changed src&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import React from &#x27;react&#x27;;
 ┊ 2┊ 2┊import ReactDOM from &#x27;react-dom&#x27;;
<b>+┊  ┊ 3┊import { ApolloProvider } from &#x27;react-apollo-hooks&#x27;;</b>
 ┊ 3┊ 4┊import &#x27;./index.css&#x27;;
 ┊ 4┊ 5┊import App from &#x27;./App&#x27;;
<b>+┊  ┊ 6┊import apolloClient from &#x27;./apollo-client&#x27;</b>
 ┊ 5┊ 7┊import * as serviceWorker from &#x27;./serviceWorker&#x27;;
 ┊ 6┊ 8┊
<b>+┊  ┊ 9┊ReactDOM.render(</b>
<b>+┊  ┊10┊  &lt;ApolloProvider client&#x3D;{apolloClient}&gt;</b>
<b>+┊  ┊11┊    &lt;App /&gt;</b>
<b>+┊  ┊12┊  &lt;/ApolloProvider&gt;</b>
<b>+┊  ┊13┊, document.getElementById(&#x27;root&#x27;));</b>
 ┊ 8┊14┊
 ┊ 9┊15┊// If you want your app to work offline and load faster, you can change
 ┊10┊16┊// unregister() to register() below. Note this comes with some pitfalls.
</pre>

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

#### Step 1.1: Setup TypeScript

##### Added tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊{</b>
<b>+┊  ┊ 2┊  &quot;compilerOptions&quot;: {</b>
<b>+┊  ┊ 3┊    /* Basic Options */</b>
<b>+┊  ┊ 4┊    &quot;target&quot;: &quot;es2018&quot;,                       /* Specify ECMAScript target version: &#x27;ES3&#x27; (default), &#x27;ES5&#x27;, &#x27;ES2015&#x27;, &#x27;ES2016&#x27;, &#x27;ES2017&#x27;,&#x27;ES2018&#x27; or &#x27;ESNEXT&#x27;. */</b>
<b>+┊  ┊ 5┊    &quot;module&quot;: &quot;commonjs&quot;,                     /* Specify module code generation: &#x27;none&#x27;, &#x27;commonjs&#x27;, &#x27;amd&#x27;, &#x27;system&#x27;, &#x27;umd&#x27;, &#x27;es2015&#x27;, or &#x27;ESNext&#x27;. */</b>
<b>+┊  ┊ 6┊    &quot;lib&quot;: [                                  /* Specify library files to be included in the compilation. */</b>
<b>+┊  ┊ 7┊      &quot;es2018&quot;,</b>
<b>+┊  ┊ 8┊      &quot;esnext.asynciterable&quot;</b>
<b>+┊  ┊ 9┊    ],</b>
<b>+┊  ┊10┊    // &quot;allowJs&quot;: true,                       /* Allow javascript files to be compiled. */</b>
<b>+┊  ┊11┊    // &quot;checkJs&quot;: true,                       /* Report errors in .js files. */</b>
<b>+┊  ┊12┊    // &quot;jsx&quot;: &quot;preserve&quot;,                     /* Specify JSX code generation: &#x27;preserve&#x27;, &#x27;react-native&#x27;, or &#x27;react&#x27;. */</b>
<b>+┊  ┊13┊    // &quot;declaration&quot;: true,                   /* Generates corresponding &#x27;.d.ts&#x27; file. */</b>
<b>+┊  ┊14┊    // &quot;declarationMap&quot;: true,                /* Generates a sourcemap for each corresponding &#x27;.d.ts&#x27; file. */</b>
<b>+┊  ┊15┊    // &quot;sourceMap&quot;: true,                     /* Generates corresponding &#x27;.map&#x27; file. */</b>
<b>+┊  ┊16┊    // &quot;outFile&quot;: &quot;./&quot;,                       /* Concatenate and emit output to single file. */</b>
<b>+┊  ┊17┊    // &quot;outDir&quot;: &quot;./&quot;,                        /* Redirect output structure to the directory. */</b>
<b>+┊  ┊18┊    // &quot;rootDir&quot;: &quot;./&quot;,                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */</b>
<b>+┊  ┊19┊    // &quot;composite&quot;: true,                     /* Enable project compilation */</b>
<b>+┊  ┊20┊    // &quot;removeComments&quot;: true,                /* Do not emit comments to output. */</b>
<b>+┊  ┊21┊    // &quot;noEmit&quot;: true,                        /* Do not emit outputs. */</b>
<b>+┊  ┊22┊    // &quot;importHelpers&quot;: true,                 /* Import emit helpers from &#x27;tslib&#x27;. */</b>
<b>+┊  ┊23┊    // &quot;downlevelIteration&quot;: true,            /* Provide full support for iterables in &#x27;for-of&#x27;, spread, and destructuring when targeting &#x27;ES5&#x27; or &#x27;ES3&#x27;. */</b>
<b>+┊  ┊24┊    // &quot;isolatedModules&quot;: true,               /* Transpile each file as a separate module (similar to &#x27;ts.transpileModule&#x27;). */</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊    /* Strict Type-Checking Options */</b>
<b>+┊  ┊27┊    &quot;strict&quot;: true,                           /* Enable all strict type-checking options. */</b>
<b>+┊  ┊28┊    // &quot;noImplicitAny&quot;: true,                 /* Raise error on expressions and declarations with an implied &#x27;any&#x27; type. */</b>
<b>+┊  ┊29┊    // &quot;strictNullChecks&quot;: true,              /* Enable strict null checks. */</b>
<b>+┊  ┊30┊    // See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/21359</b>
<b>+┊  ┊31┊    &quot;strictFunctionTypes&quot;: false,             /* Enable strict checking of function types. */</b>
<b>+┊  ┊32┊    // &quot;strictBindCallApply&quot;: true,           /* Enable strict &#x27;bind&#x27;, &#x27;call&#x27;, and &#x27;apply&#x27; methods on functions. */</b>
<b>+┊  ┊33┊    &quot;strictPropertyInitialization&quot;: false,    /* Enable strict checking of property initialization in classes. */</b>
<b>+┊  ┊34┊    // &quot;noImplicitThis&quot;: true,                /* Raise error on &#x27;this&#x27; expressions with an implied &#x27;any&#x27; type. */</b>
<b>+┊  ┊35┊    // &quot;alwaysStrict&quot;: true,                  /* Parse in strict mode and emit &quot;use strict&quot; for each source file. */</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊    /* Additional Checks */</b>
<b>+┊  ┊38┊    // &quot;noUnusedLocals&quot;: true,                /* Report errors on unused locals. */</b>
<b>+┊  ┊39┊    // &quot;noUnusedParameters&quot;: true,            /* Report errors on unused parameters. */</b>
<b>+┊  ┊40┊    // &quot;noImplicitReturns&quot;: true,             /* Report error when not all code paths in function return a value. */</b>
<b>+┊  ┊41┊    // &quot;noFallthroughCasesInSwitch&quot;: true,    /* Report errors for fallthrough cases in switch statement. */</b>
<b>+┊  ┊42┊</b>
<b>+┊  ┊43┊    /* Module Resolution Options */</b>
<b>+┊  ┊44┊    // &quot;moduleResolution&quot;: &quot;node&quot;,            /* Specify module resolution strategy: &#x27;node&#x27; (Node.js) or &#x27;classic&#x27; (TypeScript pre-1.6). */</b>
<b>+┊  ┊45┊    // &quot;baseUrl&quot;: &quot;./&quot;,                       /* Base directory to resolve non-absolute module names. */</b>
<b>+┊  ┊46┊    // &quot;paths&quot;: {},                           /* A series of entries which re-map imports to lookup locations relative to the &#x27;baseUrl&#x27;. */</b>
<b>+┊  ┊47┊    // &quot;rootDirs&quot;: [],                        /* List of root folders whose combined content represents the structure of the project at runtime. */</b>
<b>+┊  ┊48┊    // &quot;typeRoots&quot;: [],                       /* List of folders to include type definitions from. */</b>
<b>+┊  ┊49┊    // &quot;types&quot;: [],                           /* Type declaration files to be included in compilation. */</b>
<b>+┊  ┊50┊    // &quot;allowSyntheticDefaultImports&quot;: true,  /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */</b>
<b>+┊  ┊51┊    &quot;esModuleInterop&quot;: true,                  /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies &#x27;allowSyntheticDefaultImports&#x27;. */</b>
<b>+┊  ┊52┊    // &quot;preserveSymlinks&quot;: true,              /* Do not resolve the real path of symlinks. */</b>
<b>+┊  ┊53┊</b>
<b>+┊  ┊54┊    /* Source Map Options */</b>
<b>+┊  ┊55┊    // &quot;sourceRoot&quot;: &quot;&quot;,                      /* Specify the location where debugger should locate TypeScript files instead of source locations. */</b>
<b>+┊  ┊56┊    // &quot;mapRoot&quot;: &quot;&quot;,                         /* Specify the location where debugger should locate map files instead of generated locations. */</b>
<b>+┊  ┊57┊    // &quot;inlineSourceMap&quot;: true,               /* Emit a single file with source maps instead of having a separate file. */</b>
<b>+┊  ┊58┊    // &quot;inlineSources&quot;: true,                 /* Emit the source alongside the sourcemaps within a single file; requires &#x27;--inlineSourceMap&#x27; or &#x27;--sourceMap&#x27; to be set. */</b>
<b>+┊  ┊59┊</b>
<b>+┊  ┊60┊    /* Experimental Options */</b>
<b>+┊  ┊61┊    &quot;experimentalDecorators&quot;: true,           /* Enables experimental support for ES7 decorators. */</b>
<b>+┊  ┊62┊    &quot;emitDecoratorMetadata&quot;: true             /* Enables experimental support for emitting type metadata for decorators. */</b>
<b>+┊  ┊63┊  }</b>
<b>+┊  ┊64┊}</b>
</pre>

[}]: #

We will also set a script that will startup the server with `ts-node`, a TypeScript interpreter for Node.JS:

```json
{
  "start": "ts-node index.ts"
}
```

Our `pacakge.json` file should look like so by now:

[{]: <helper> (diffStep 1.1 files="package.json" module="server")

#### Step 1.1: Setup TypeScript

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊{
 ┊ 2┊ 2┊  &quot;name&quot;: &quot;whatsapp-clone-server&quot;,
 ┊ 3┊ 3┊  &quot;description&quot;: &quot;A newly created Tortilla project&quot;,
<b>+┊  ┊ 4┊  &quot;private&quot;: true,</b>
<b>+┊  ┊ 5┊  &quot;scripts&quot;: {</b>
<b>+┊  ┊ 6┊    &quot;start&quot;: &quot;ts-node index.ts&quot;</b>
<b>+┊  ┊ 7┊  },</b>
<b>+┊  ┊ 8┊  &quot;devDependencies&quot;: {</b>
<b>+┊  ┊ 9┊    &quot;@types/node&quot;: &quot;10.12.18&quot;,</b>
<b>+┊  ┊10┊    &quot;ts-node&quot;: &quot;8.0.1&quot;,</b>
<b>+┊  ┊11┊    &quot;typescript&quot;: &quot;3.2.4&quot;</b>
<b>+┊  ┊12┊  }</b>
 ┊ 5┊13┊}
</pre>

[}]: #

In our server we will be using [Express](https://expressjs.com/) to serve our GraphQL REST endpoint which will be handled by Apollo. Accordingly, let's install the necessary dependencies:

    $ yarn add -D @types/body-parser@1.18.3 @types/cors@2.8.5 @types/express@4.16.4 @types/graphql@14.0.4
    $ yarn add apollo-server-express@2.3.1 body-parser@1.18.3 cors@2.8.5 express@4.16.4 graphql@14.0.2

And setup a basic express server with a `/graphql` REST endpoint:

[{]: <helper> (diffStep 1.2 files="index.ts, schema" module="server")

#### Step 1.2: Setup a basic Express server with a GraphQL REST endpoint

##### Added index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { ApolloServer } from &#x27;apollo-server-express&#x27;</b>
<b>+┊  ┊ 2┊import bodyParser from &#x27;body-parser&#x27;</b>
<b>+┊  ┊ 3┊import cors from &#x27;cors&#x27;</b>
<b>+┊  ┊ 4┊import express from &#x27;express&#x27;</b>
<b>+┊  ┊ 5┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 6┊import { createServer } from &#x27;http&#x27;</b>
<b>+┊  ┊ 7┊import schema from &#x27;./schema&#x27;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊const PORT &#x3D; 4000</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊const app &#x3D; express()</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊app.use(cors())</b>
<b>+┊  ┊14┊app.use(bodyParser.json())</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊const apollo &#x3D; new ApolloServer({ schema })</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊apollo.applyMiddleware({</b>
<b>+┊  ┊19┊  app,</b>
<b>+┊  ┊20┊  path: &#x27;/graphql&#x27;,</b>
<b>+┊  ┊21┊})</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊// Wrap the Express server</b>
<b>+┊  ┊24┊const ws &#x3D; createServer(app)</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊apollo.installSubscriptionHandlers(ws)</b>
<b>+┊  ┊27┊</b>
<b>+┊  ┊28┊ws.listen(PORT, () &#x3D;&gt; {</b>
<b>+┊  ┊29┊  console.log(&#x60;Apollo Server is now running on http://localhost:${PORT}&#x60;)</b>
<b>+┊  ┊30┊})</b>
</pre>

##### Added schema&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { makeExecutableSchema } from &#x27;apollo-server-express&#x27;</b>
<b>+┊ ┊2┊import resolvers from &#x27;./resolvers&#x27;</b>
<b>+┊ ┊3┊import typeDefs from &#x27;./typeDefs&#x27;</b>
<b>+┊ ┊4┊</b>
<b>+┊ ┊5┊export default makeExecutableSchema({</b>
<b>+┊ ┊6┊  typeDefs,</b>
<b>+┊ ┊7┊  resolvers,</b>
<b>+┊ ┊8┊})</b>
</pre>

##### Added schema&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊export default {</b>
<b>+┊ ┊2┊  Query: {</b>
<b>+┊ ┊3┊    chats: () &#x3D;&gt; [],</b>
<b>+┊ ┊4┊  },</b>
<b>+┊ ┊5┊}</b>
</pre>

##### Added schema&#x2F;typeDefs.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊export default &#x60;</b>
<b>+┊ ┊2┊  type Chat {</b>
<b>+┊ ┊3┊    id: ID!</b>
<b>+┊ ┊4┊  }</b>
<b>+┊ ┊5┊</b>
<b>+┊ ┊6┊  type Query {</b>
<b>+┊ ┊7┊    chats: [Chat!]!</b>
<b>+┊ ┊8┊  }</b>
<b>+┊ ┊9┊&#x60;</b>
</pre>

[}]: #

Before we proceed any further there's an issue that needs to be clear. Since we're using TypeScript together with GraphQL, by default we will have to maintain 2 schemas: one for TypeScript and the other for GraphQL. Both schemas represent the same thing this way or another, which means that we will have to maintain the same thing twice. Instead of doing so, we will be using a tool called [GraphQL Code Generator](https://graphql-code-generator.com/) (Codegen, in short) to generate TypeScript definitions from our GraphQL schema.

Codegen will change its behavior and generate code based on a set of templates and a configuration file that we will provide. We highly recommend you to go through the [docs page](https://graphql-code-generator.com/docs/getting-started/) of Codegen to get a better understanding of what it is and how it works. Let's install Codegen then, along with the templates that we're gonna use:

    $ yarn -D add graphql-code-generator@0.16.0 graphql-codegen-typescript-common@0.16.0 graphql-codegen-typescript-resolvers@0.16.0

And write its config under `codegen.yml` file:

[{]: <helper> (diffStep 1.3 files="codegen.yml" module="server")

#### Step 1.3: Setup codegen

##### Added codegen.yml
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊overwrite: true</b>
<b>+┊ ┊2┊schema: ./schema/typeDefs.ts</b>
<b>+┊ ┊3┊require: ts-node/register/transpile-only</b>
<b>+┊ ┊4┊generates:</b>
<b>+┊ ┊5┊  ./types.d.ts:</b>
<b>+┊ ┊6┊    plugins:</b>
<b>+┊ ┊7┊      - typescript-common</b>
<b>+┊ ┊8┊      - typescript-resolvers</b>
</pre>

[}]: #

We will also update the `.gitignore` file to exclude the generated typings file:

[{]: <helper> (diffStep 1.3 files=".gitignore" module="server")

#### Step 1.3: Setup codegen

##### Changed .gitignore
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊node_modules
<b>+┊ ┊2┊npm-debug.log</b>
<b>+┊ ┊3┊types.d.ts</b>
</pre>

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

#### Step 1.3: Setup codegen

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊  &quot;description&quot;: &quot;A newly created Tortilla project&quot;,
 ┊ 4┊ 4┊  &quot;private&quot;: true,
 ┊ 5┊ 5┊  &quot;scripts&quot;: {
<b>+┊  ┊ 6┊    &quot;generate&quot;: &quot;gql-gen&quot;,</b>
<b>+┊  ┊ 7┊    &quot;generate:watch&quot;: &quot;nodemon --exec yarn generate -e graphql&quot;,</b>
<b>+┊  ┊ 8┊    &quot;start:server&quot;: &quot;ts-node index.ts&quot;,</b>
<b>+┊  ┊ 9┊    &quot;start:server:watch&quot;: &quot;nodemon --exec yarn start:server -e ts&quot;,</b>
<b>+┊  ┊10┊    &quot;dev&quot;: &quot;concurrently \&quot;yarn generate:watch\&quot; \&quot;yarn start:server:watch\&quot;&quot;,</b>
<b>+┊  ┊11┊    &quot;start&quot;: &quot;yarn generate &amp;&amp; yarn start:server&quot;</b>
 ┊ 7┊12┊  },
 ┊ 8┊13┊  &quot;devDependencies&quot;: {
 ┊ 9┊14┊    &quot;@types/body-parser&quot;: &quot;1.17.0&quot;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊11┊16┊    &quot;@types/express&quot;: &quot;4.16.0&quot;,
 ┊12┊17┊    &quot;@types/graphql&quot;: &quot;14.0.4&quot;,
 ┊13┊18┊    &quot;@types/node&quot;: &quot;10.12.18&quot;,
<b>+┊  ┊19┊    &quot;concurrently&quot;: &quot;4.1.0&quot;,</b>
<b>+┊  ┊20┊    &quot;graphql-code-generator&quot;: &quot;0.16.0&quot;,</b>
<b>+┊  ┊21┊    &quot;graphql-codegen-typescript-common&quot;: &quot;0.16.0&quot;,</b>
<b>+┊  ┊22┊    &quot;graphql-codegen-typescript-resolvers&quot;: &quot;^0.16.1&quot;,</b>
<b>+┊  ┊23┊    &quot;nodemon&quot;: &quot;1.18.9&quot;,</b>
 ┊14┊24┊    &quot;ts-node&quot;: &quot;8.0.1&quot;,
 ┊15┊25┊    &quot;typescript&quot;: &quot;3.2.4&quot;
 ┊16┊26┊  },
</pre>

[}]: #

To generate some TypeScript definitions all we have to do is run:

    $ yarn generate

And then we can safely run the server with:

    $ yarn start

Alternatively, you can run the server and watch for changes with the following command:

    $ yarn start:server:watch

For practice purpose only, we're gonna serve some dummy data from our GraphQL API so we can have something to work with in our client. Later on we will connect everything to a real database. This would give us an easy start. Our dummy db will consist of a set of chats, each of them has a last message, a picture and a name:

[{]: <helper> (diffStep 1.4 files="index.ts, db.ts, entity, schema, codegen.yml" module="server")

#### Step 1.4: Add fake DB

##### Changed codegen.yml
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 6┊    plugins:
 ┊ 7┊ 7┊      - typescript-common
 ┊ 8┊ 8┊      - typescript-resolvers
<b>+┊  ┊ 9┊    config:</b>
<b>+┊  ┊10┊      optionalType: undefined | null</b>
<b>+┊  ┊11┊      mappers:</b>
<b>+┊  ┊12┊        Chat: ./entity/chat#Chat</b>
<b>+┊  ┊13┊        Message: ./entity/message#Message</b>
<b>+┊  ┊14┊        User: ./entity/user#User</b>
</pre>

##### Added db.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import moment from &#x27;moment&#x27;</b>
<b>+┊   ┊  2┊import Chat from &#x27;./entity/chat&#x27;</b>
<b>+┊   ┊  3┊import Message, { MessageType } from &#x27;./entity/message&#x27;</b>
<b>+┊   ┊  4┊import User from &#x27;./entity/user&#x27;</b>
<b>+┊   ┊  5┊</b>
<b>+┊   ┊  6┊const users: User[] &#x3D; [</b>
<b>+┊   ┊  7┊  {</b>
<b>+┊   ┊  8┊    id: &#x27;1&#x27;,</b>
<b>+┊   ┊  9┊    username: &#x27;ethan&#x27;,</b>
<b>+┊   ┊ 10┊    password: &#x27;$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm&#x27;, // 111</b>
<b>+┊   ┊ 11┊    name: &#x27;Ethan Gonzalez&#x27;,</b>
<b>+┊   ┊ 12┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/1.jpg&#x27;,</b>
<b>+┊   ┊ 13┊  },</b>
<b>+┊   ┊ 14┊  {</b>
<b>+┊   ┊ 15┊    id: &#x27;2&#x27;,</b>
<b>+┊   ┊ 16┊    username: &#x27;bryan&#x27;,</b>
<b>+┊   ┊ 17┊    password: &#x27;$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO&#x27;, // 222</b>
<b>+┊   ┊ 18┊    name: &#x27;Bryan Wallace&#x27;,</b>
<b>+┊   ┊ 19┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/2.jpg&#x27;,</b>
<b>+┊   ┊ 20┊  },</b>
<b>+┊   ┊ 21┊  {</b>
<b>+┊   ┊ 22┊    id: &#x27;3&#x27;,</b>
<b>+┊   ┊ 23┊    username: &#x27;avery&#x27;,</b>
<b>+┊   ┊ 24┊    password: &#x27;$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.&#x27;, // 333</b>
<b>+┊   ┊ 25┊    name: &#x27;Avery Stewart&#x27;,</b>
<b>+┊   ┊ 26┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/women/1.jpg&#x27;,</b>
<b>+┊   ┊ 27┊  },</b>
<b>+┊   ┊ 28┊  {</b>
<b>+┊   ┊ 29┊    id: &#x27;4&#x27;,</b>
<b>+┊   ┊ 30┊    username: &#x27;katie&#x27;,</b>
<b>+┊   ┊ 31┊    password: &#x27;$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi&#x27;, // 444</b>
<b>+┊   ┊ 32┊    name: &#x27;Katie Peterson&#x27;,</b>
<b>+┊   ┊ 33┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/women/2.jpg&#x27;,</b>
<b>+┊   ┊ 34┊  },</b>
<b>+┊   ┊ 35┊  {</b>
<b>+┊   ┊ 36┊    id: &#x27;5&#x27;,</b>
<b>+┊   ┊ 37┊    username: &#x27;ray&#x27;,</b>
<b>+┊   ┊ 38┊    password: &#x27;$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242&#x27;, // 555</b>
<b>+┊   ┊ 39┊    name: &#x27;Ray Edwards&#x27;,</b>
<b>+┊   ┊ 40┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/3.jpg&#x27;,</b>
<b>+┊   ┊ 41┊  },</b>
<b>+┊   ┊ 42┊  {</b>
<b>+┊   ┊ 43┊    id: &#x27;6&#x27;,</b>
<b>+┊   ┊ 44┊    username: &#x27;niko&#x27;,</b>
<b>+┊   ┊ 45┊    password: &#x27;$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.&#x27;, // 666</b>
<b>+┊   ┊ 46┊    name: &#x27;Niccolò Belli&#x27;,</b>
<b>+┊   ┊ 47┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/4.jpg&#x27;,</b>
<b>+┊   ┊ 48┊  },</b>
<b>+┊   ┊ 49┊  {</b>
<b>+┊   ┊ 50┊    id: &#x27;7&#x27;,</b>
<b>+┊   ┊ 51┊    username: &#x27;mario&#x27;,</b>
<b>+┊   ┊ 52┊    password: &#x27;$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO&#x27;, // 777</b>
<b>+┊   ┊ 53┊    name: &#x27;Mario Rossi&#x27;,</b>
<b>+┊   ┊ 54┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/5.jpg&#x27;,</b>
<b>+┊   ┊ 55┊  },</b>
<b>+┊   ┊ 56┊]</b>
<b>+┊   ┊ 57┊</b>
<b>+┊   ┊ 58┊const chats: Chat[] &#x3D; [</b>
<b>+┊   ┊ 59┊  {</b>
<b>+┊   ┊ 60┊    id: &#x27;1&#x27;,</b>
<b>+┊   ┊ 61┊    name: null,</b>
<b>+┊   ┊ 62┊    picture: null,</b>
<b>+┊   ┊ 63┊    allTimeMemberIds: [&#x27;1&#x27;, &#x27;3&#x27;],</b>
<b>+┊   ┊ 64┊    listingMemberIds: [&#x27;1&#x27;, &#x27;3&#x27;],</b>
<b>+┊   ┊ 65┊    ownerId: null,</b>
<b>+┊   ┊ 66┊    messages: [</b>
<b>+┊   ┊ 67┊      {</b>
<b>+┊   ┊ 68┊        id: &#x27;1&#x27;,</b>
<b>+┊   ┊ 69┊        chatId: &#x27;1&#x27;,</b>
<b>+┊   ┊ 70┊        senderId: &#x27;1&#x27;,</b>
<b>+┊   ┊ 71┊        content: &#x27;You on your way?&#x27;,</b>
<b>+┊   ┊ 72┊        createdAt: moment()</b>
<b>+┊   ┊ 73┊          .subtract(1, &#x27;hours&#x27;)</b>
<b>+┊   ┊ 74┊          .unix(),</b>
<b>+┊   ┊ 75┊        type: MessageType.TEXT,</b>
<b>+┊   ┊ 76┊        holderIds: [&#x27;1&#x27;, &#x27;3&#x27;],</b>
<b>+┊   ┊ 77┊      },</b>
<b>+┊   ┊ 78┊      {</b>
<b>+┊   ┊ 79┊        id: &#x27;2&#x27;,</b>
<b>+┊   ┊ 80┊        chatId: &#x27;1&#x27;,</b>
<b>+┊   ┊ 81┊        senderId: &#x27;3&#x27;,</b>
<b>+┊   ┊ 82┊        content: &#x27;Yep!&#x27;,</b>
<b>+┊   ┊ 83┊        createdAt: moment()</b>
<b>+┊   ┊ 84┊          .subtract(1, &#x27;hours&#x27;)</b>
<b>+┊   ┊ 85┊          .add(5, &#x27;minutes&#x27;)</b>
<b>+┊   ┊ 86┊          .unix(),</b>
<b>+┊   ┊ 87┊        type: MessageType.TEXT,</b>
<b>+┊   ┊ 88┊        holderIds: [&#x27;3&#x27;, &#x27;1&#x27;],</b>
<b>+┊   ┊ 89┊      },</b>
<b>+┊   ┊ 90┊    ],</b>
<b>+┊   ┊ 91┊  },</b>
<b>+┊   ┊ 92┊  {</b>
<b>+┊   ┊ 93┊    id: &#x27;2&#x27;,</b>
<b>+┊   ┊ 94┊    name: null,</b>
<b>+┊   ┊ 95┊    picture: null,</b>
<b>+┊   ┊ 96┊    allTimeMemberIds: [&#x27;1&#x27;, &#x27;4&#x27;],</b>
<b>+┊   ┊ 97┊    listingMemberIds: [&#x27;1&#x27;, &#x27;4&#x27;],</b>
<b>+┊   ┊ 98┊    ownerId: null,</b>
<b>+┊   ┊ 99┊    messages: [</b>
<b>+┊   ┊100┊      {</b>
<b>+┊   ┊101┊        id: &#x27;1&#x27;,</b>
<b>+┊   ┊102┊        chatId: &#x27;2&#x27;,</b>
<b>+┊   ┊103┊        senderId: &#x27;1&#x27;,</b>
<b>+┊   ┊104┊        content: &quot;Hey, it&#x27;s me&quot;,</b>
<b>+┊   ┊105┊        createdAt: moment()</b>
<b>+┊   ┊106┊          .subtract(2, &#x27;hours&#x27;)</b>
<b>+┊   ┊107┊          .unix(),</b>
<b>+┊   ┊108┊        type: MessageType.TEXT,</b>
<b>+┊   ┊109┊        holderIds: [&#x27;1&#x27;, &#x27;4&#x27;],</b>
<b>+┊   ┊110┊      },</b>
<b>+┊   ┊111┊    ],</b>
<b>+┊   ┊112┊  },</b>
<b>+┊   ┊113┊  {</b>
<b>+┊   ┊114┊    id: &#x27;3&#x27;,</b>
<b>+┊   ┊115┊    name: null,</b>
<b>+┊   ┊116┊    picture: null,</b>
<b>+┊   ┊117┊    allTimeMemberIds: [&#x27;1&#x27;, &#x27;5&#x27;],</b>
<b>+┊   ┊118┊    listingMemberIds: [&#x27;1&#x27;, &#x27;5&#x27;],</b>
<b>+┊   ┊119┊    ownerId: null,</b>
<b>+┊   ┊120┊    messages: [</b>
<b>+┊   ┊121┊      {</b>
<b>+┊   ┊122┊        id: &#x27;1&#x27;,</b>
<b>+┊   ┊123┊        chatId: &#x27;3&#x27;,</b>
<b>+┊   ┊124┊        senderId: &#x27;1&#x27;,</b>
<b>+┊   ┊125┊        content: &#x27;I should buy a boat&#x27;,</b>
<b>+┊   ┊126┊        createdAt: moment()</b>
<b>+┊   ┊127┊          .subtract(1, &#x27;days&#x27;)</b>
<b>+┊   ┊128┊          .unix(),</b>
<b>+┊   ┊129┊        type: MessageType.TEXT,</b>
<b>+┊   ┊130┊        holderIds: [&#x27;1&#x27;, &#x27;5&#x27;],</b>
<b>+┊   ┊131┊      },</b>
<b>+┊   ┊132┊      {</b>
<b>+┊   ┊133┊        id: &#x27;2&#x27;,</b>
<b>+┊   ┊134┊        chatId: &#x27;3&#x27;,</b>
<b>+┊   ┊135┊        senderId: &#x27;1&#x27;,</b>
<b>+┊   ┊136┊        content: &#x27;You still there?&#x27;,</b>
<b>+┊   ┊137┊        createdAt: moment()</b>
<b>+┊   ┊138┊          .subtract(1, &#x27;days&#x27;)</b>
<b>+┊   ┊139┊          .add(16, &#x27;hours&#x27;)</b>
<b>+┊   ┊140┊          .unix(),</b>
<b>+┊   ┊141┊        type: MessageType.TEXT,</b>
<b>+┊   ┊142┊        holderIds: [&#x27;1&#x27;, &#x27;5&#x27;],</b>
<b>+┊   ┊143┊      },</b>
<b>+┊   ┊144┊    ],</b>
<b>+┊   ┊145┊  },</b>
<b>+┊   ┊146┊  {</b>
<b>+┊   ┊147┊    id: &#x27;4&#x27;,</b>
<b>+┊   ┊148┊    name: null,</b>
<b>+┊   ┊149┊    picture: null,</b>
<b>+┊   ┊150┊    allTimeMemberIds: [&#x27;3&#x27;, &#x27;4&#x27;],</b>
<b>+┊   ┊151┊    listingMemberIds: [&#x27;3&#x27;, &#x27;4&#x27;],</b>
<b>+┊   ┊152┊    ownerId: null,</b>
<b>+┊   ┊153┊    messages: [</b>
<b>+┊   ┊154┊      {</b>
<b>+┊   ┊155┊        id: &#x27;1&#x27;,</b>
<b>+┊   ┊156┊        chatId: &#x27;4&#x27;,</b>
<b>+┊   ┊157┊        senderId: &#x27;3&#x27;,</b>
<b>+┊   ┊158┊        content: &#x27;Look at my mukluks!&#x27;,</b>
<b>+┊   ┊159┊        createdAt: moment()</b>
<b>+┊   ┊160┊          .subtract(4, &#x27;days&#x27;)</b>
<b>+┊   ┊161┊          .unix(),</b>
<b>+┊   ┊162┊        type: MessageType.TEXT,</b>
<b>+┊   ┊163┊        holderIds: [&#x27;3&#x27;, &#x27;4&#x27;],</b>
<b>+┊   ┊164┊      },</b>
<b>+┊   ┊165┊    ],</b>
<b>+┊   ┊166┊  },</b>
<b>+┊   ┊167┊  {</b>
<b>+┊   ┊168┊    id: &#x27;5&#x27;,</b>
<b>+┊   ┊169┊    name: null,</b>
<b>+┊   ┊170┊    picture: null,</b>
<b>+┊   ┊171┊    allTimeMemberIds: [&#x27;2&#x27;, &#x27;5&#x27;],</b>
<b>+┊   ┊172┊    listingMemberIds: [&#x27;2&#x27;, &#x27;5&#x27;],</b>
<b>+┊   ┊173┊    ownerId: null,</b>
<b>+┊   ┊174┊    messages: [</b>
<b>+┊   ┊175┊      {</b>
<b>+┊   ┊176┊        id: &#x27;1&#x27;,</b>
<b>+┊   ┊177┊        chatId: &#x27;5&#x27;,</b>
<b>+┊   ┊178┊        senderId: &#x27;2&#x27;,</b>
<b>+┊   ┊179┊        content: &#x27;This is wicked good ice cream.&#x27;,</b>
<b>+┊   ┊180┊        createdAt: moment()</b>
<b>+┊   ┊181┊          .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊182┊          .unix(),</b>
<b>+┊   ┊183┊        type: MessageType.TEXT,</b>
<b>+┊   ┊184┊        holderIds: [&#x27;2&#x27;, &#x27;5&#x27;],</b>
<b>+┊   ┊185┊      },</b>
<b>+┊   ┊186┊      {</b>
<b>+┊   ┊187┊        id: &#x27;2&#x27;,</b>
<b>+┊   ┊188┊        chatId: &#x27;6&#x27;,</b>
<b>+┊   ┊189┊        senderId: &#x27;5&#x27;,</b>
<b>+┊   ┊190┊        content: &#x27;Love it!&#x27;,</b>
<b>+┊   ┊191┊        createdAt: moment()</b>
<b>+┊   ┊192┊          .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊193┊          .add(10, &#x27;minutes&#x27;)</b>
<b>+┊   ┊194┊          .unix(),</b>
<b>+┊   ┊195┊        type: MessageType.TEXT,</b>
<b>+┊   ┊196┊        holderIds: [&#x27;5&#x27;, &#x27;2&#x27;],</b>
<b>+┊   ┊197┊      },</b>
<b>+┊   ┊198┊    ],</b>
<b>+┊   ┊199┊  },</b>
<b>+┊   ┊200┊  {</b>
<b>+┊   ┊201┊    id: &#x27;6&#x27;,</b>
<b>+┊   ┊202┊    name: null,</b>
<b>+┊   ┊203┊    picture: null,</b>
<b>+┊   ┊204┊    allTimeMemberIds: [&#x27;1&#x27;, &#x27;6&#x27;],</b>
<b>+┊   ┊205┊    listingMemberIds: [&#x27;1&#x27;],</b>
<b>+┊   ┊206┊    ownerId: null,</b>
<b>+┊   ┊207┊    messages: [],</b>
<b>+┊   ┊208┊  },</b>
<b>+┊   ┊209┊  {</b>
<b>+┊   ┊210┊    id: &#x27;7&#x27;,</b>
<b>+┊   ┊211┊    name: null,</b>
<b>+┊   ┊212┊    picture: null,</b>
<b>+┊   ┊213┊    allTimeMemberIds: [&#x27;2&#x27;, &#x27;1&#x27;],</b>
<b>+┊   ┊214┊    listingMemberIds: [&#x27;2&#x27;],</b>
<b>+┊   ┊215┊    ownerId: null,</b>
<b>+┊   ┊216┊    messages: [],</b>
<b>+┊   ┊217┊  },</b>
<b>+┊   ┊218┊  {</b>
<b>+┊   ┊219┊    id: &#x27;8&#x27;,</b>
<b>+┊   ┊220┊    name: &#x27;A user 0 group&#x27;,</b>
<b>+┊   ┊221┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/lego/1.jpg&#x27;,</b>
<b>+┊   ┊222┊    allTimeMemberIds: [&#x27;1&#x27;, &#x27;3&#x27;, &#x27;4&#x27;, &#x27;6&#x27;],</b>
<b>+┊   ┊223┊    listingMemberIds: [&#x27;1&#x27;, &#x27;3&#x27;, &#x27;4&#x27;, &#x27;6&#x27;],</b>
<b>+┊   ┊224┊    ownerId: &#x27;1&#x27;,</b>
<b>+┊   ┊225┊    messages: [</b>
<b>+┊   ┊226┊      {</b>
<b>+┊   ┊227┊        id: &#x27;1&#x27;,</b>
<b>+┊   ┊228┊        chatId: &#x27;8&#x27;,</b>
<b>+┊   ┊229┊        senderId: &#x27;1&#x27;,</b>
<b>+┊   ┊230┊        content: &#x27;I made a group&#x27;,</b>
<b>+┊   ┊231┊        createdAt: moment()</b>
<b>+┊   ┊232┊          .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊233┊          .unix(),</b>
<b>+┊   ┊234┊        type: MessageType.TEXT,</b>
<b>+┊   ┊235┊        holderIds: [&#x27;1&#x27;, &#x27;3&#x27;, &#x27;4&#x27;, &#x27;6&#x27;],</b>
<b>+┊   ┊236┊      },</b>
<b>+┊   ┊237┊      {</b>
<b>+┊   ┊238┊        id: &#x27;2&#x27;,</b>
<b>+┊   ┊239┊        chatId: &#x27;8&#x27;,</b>
<b>+┊   ┊240┊        senderId: &#x27;1&#x27;,</b>
<b>+┊   ┊241┊        content: &#x27;Ops, user 3 was not supposed to be here&#x27;,</b>
<b>+┊   ┊242┊        createdAt: moment()</b>
<b>+┊   ┊243┊          .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊244┊          .add(2, &#x27;minutes&#x27;)</b>
<b>+┊   ┊245┊          .unix(),</b>
<b>+┊   ┊246┊        type: MessageType.TEXT,</b>
<b>+┊   ┊247┊        holderIds: [&#x27;1&#x27;, &#x27;4&#x27;, &#x27;6&#x27;],</b>
<b>+┊   ┊248┊      },</b>
<b>+┊   ┊249┊      {</b>
<b>+┊   ┊250┊        id: &#x27;3&#x27;,</b>
<b>+┊   ┊251┊        chatId: &#x27;8&#x27;,</b>
<b>+┊   ┊252┊        senderId: &#x27;4&#x27;,</b>
<b>+┊   ┊253┊        content: &#x27;Awesome!&#x27;,</b>
<b>+┊   ┊254┊        createdAt: moment()</b>
<b>+┊   ┊255┊          .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊256┊          .add(10, &#x27;minutes&#x27;)</b>
<b>+┊   ┊257┊          .unix(),</b>
<b>+┊   ┊258┊        type: MessageType.TEXT,</b>
<b>+┊   ┊259┊        holderIds: [&#x27;1&#x27;, &#x27;4&#x27;, &#x27;6&#x27;],</b>
<b>+┊   ┊260┊      },</b>
<b>+┊   ┊261┊    ],</b>
<b>+┊   ┊262┊  },</b>
<b>+┊   ┊263┊  {</b>
<b>+┊   ┊264┊    id: &#x27;9&#x27;,</b>
<b>+┊   ┊265┊    name: &#x27;A user 5 group&#x27;,</b>
<b>+┊   ┊266┊    picture: null,</b>
<b>+┊   ┊267┊    allTimeMemberIds: [&#x27;6&#x27;, &#x27;3&#x27;],</b>
<b>+┊   ┊268┊    listingMemberIds: [&#x27;6&#x27;, &#x27;3&#x27;],</b>
<b>+┊   ┊269┊    ownerId: &#x27;6&#x27;,</b>
<b>+┊   ┊270┊    messages: [],</b>
<b>+┊   ┊271┊  },</b>
<b>+┊   ┊272┊]</b>
<b>+┊   ┊273┊</b>
<b>+┊   ┊274┊export default { users, chats }</b>
</pre>

##### Added entity&#x2F;chat.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Message from &#x27;./message&#x27;</b>
<b>+┊  ┊ 2┊</b>
<b>+┊  ┊ 3┊export interface Chat {</b>
<b>+┊  ┊ 4┊  id: string</b>
<b>+┊  ┊ 5┊  name?: string | null</b>
<b>+┊  ┊ 6┊  picture?: string | null</b>
<b>+┊  ┊ 7┊  // All members, current and past ones.</b>
<b>+┊  ┊ 8┊  allTimeMemberIds: string[]</b>
<b>+┊  ┊ 9┊  // Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group.</b>
<b>+┊  ┊10┊  listingMemberIds: string[]</b>
<b>+┊  ┊11┊  // Actual members of the group (they are not the only ones who get the group listed). Null for chats.</b>
<b>+┊  ┊12┊  actualGroupMemberIds?: string[] | null</b>
<b>+┊  ┊13┊  adminIds?: string[] | null</b>
<b>+┊  ┊14┊  ownerId?: string | null</b>
<b>+┊  ┊15┊  messages: Message[]</b>
<b>+┊  ┊16┊}</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊export default Chat</b>
</pre>

##### Added entity&#x2F;message.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Recipient from &#x27;./recipient&#x27;</b>
<b>+┊  ┊ 2┊</b>
<b>+┊  ┊ 3┊export enum MessageType {</b>
<b>+┊  ┊ 4┊  PICTURE,</b>
<b>+┊  ┊ 5┊  TEXT,</b>
<b>+┊  ┊ 6┊  LOCATION,</b>
<b>+┊  ┊ 7┊}</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊export interface Message {</b>
<b>+┊  ┊10┊  id: string</b>
<b>+┊  ┊11┊  chatId: string</b>
<b>+┊  ┊12┊  senderId: string</b>
<b>+┊  ┊13┊  content: string</b>
<b>+┊  ┊14┊  createdAt: number</b>
<b>+┊  ┊15┊  type: MessageType</b>
<b>+┊  ┊16┊  recipients: Recipient[]</b>
<b>+┊  ┊17┊  holderIds: string[]</b>
<b>+┊  ┊18┊}</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊export default Message</b>
</pre>

##### Added entity&#x2F;user.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊export interface User {</b>
<b>+┊  ┊ 2┊  id: string</b>
<b>+┊  ┊ 3┊  username: string</b>
<b>+┊  ┊ 4┊  password: string</b>
<b>+┊  ┊ 5┊  name: string</b>
<b>+┊  ┊ 6┊  picture?: string | null</b>
<b>+┊  ┊ 7┊  phone?: string | null</b>
<b>+┊  ┊ 8┊}</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊export default User</b>
</pre>

##### Changed schema&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { IResolvers as IApolloResolvers } from &#x27;apollo-server-express&#x27;</b>
<b>+┊  ┊ 2┊import { GraphQLDateTime } from &#x27;graphql-iso-date&#x27;</b>
<b>+┊  ┊ 3┊import db from &#x27;../db&#x27;</b>
<b>+┊  ┊ 4┊import Chat from &#x27;../entity/chat&#x27;</b>
<b>+┊  ┊ 5┊import Message from &#x27;../entity/message&#x27;</b>
<b>+┊  ┊ 6┊import Recipient from &#x27;../entity/recipient&#x27;</b>
<b>+┊  ┊ 7┊import User from &#x27;../entity/user&#x27;</b>
<b>+┊  ┊ 8┊import { IResolvers } from &#x27;../types&#x27;</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊let users &#x3D; db.users</b>
<b>+┊  ┊11┊let chats &#x3D; db.chats</b>
<b>+┊  ┊12┊const currentUser: string &#x3D; &#x27;1&#x27;</b>
<b>+┊  ┊13┊</b>
 ┊ 1┊14┊export default {
<b>+┊  ┊15┊  Date: GraphQLDateTime,</b>
 ┊ 2┊16┊  Query: {
<b>+┊  ┊17┊    // Show all users for the moment.</b>
<b>+┊  ┊18┊    users: () &#x3D;&gt; users.filter(user &#x3D;&gt; user.id !&#x3D;&#x3D; currentUser),</b>
<b>+┊  ┊19┊    chats: () &#x3D;&gt; chats.filter(chat &#x3D;&gt; chat.listingMemberIds.includes(currentUser)),</b>
<b>+┊  ┊20┊    chat: (obj, { chatId }) &#x3D;&gt; chats.find(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; chatId) || null,</b>
 ┊ 4┊21┊  },
<b>+┊  ┊22┊  Chat: {</b>
<b>+┊  ┊23┊    name: (chat) &#x3D;&gt;</b>
<b>+┊  ┊24┊      chat.name</b>
<b>+┊  ┊25┊        ? chat.name</b>
<b>+┊  ┊26┊        : users.find(</b>
<b>+┊  ┊27┊            user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; chat.allTimeMemberIds.find((userId: string) &#x3D;&gt; userId !&#x3D;&#x3D; currentUser)</b>
<b>+┊  ┊28┊          )!.name,</b>
<b>+┊  ┊29┊    picture: (chat) &#x3D;&gt;</b>
<b>+┊  ┊30┊      chat.name</b>
<b>+┊  ┊31┊        ? chat.picture</b>
<b>+┊  ┊32┊        : users.find(</b>
<b>+┊  ┊33┊            user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; chat.allTimeMemberIds.find((userId: string) &#x3D;&gt; userId !&#x3D;&#x3D; currentUser)</b>
<b>+┊  ┊34┊          )!.picture,</b>
<b>+┊  ┊35┊    allTimeMembers: (chat) &#x3D;&gt;</b>
<b>+┊  ┊36┊      users.filter(user &#x3D;&gt; chat.allTimeMemberIds.includes(user.id)),</b>
<b>+┊  ┊37┊    listingMembers: (chat) &#x3D;&gt;</b>
<b>+┊  ┊38┊      users.filter(user &#x3D;&gt; chat.listingMemberIds.includes(user.id)),</b>
<b>+┊  ┊39┊    actualGroupMembers: (chat) &#x3D;&gt;</b>
<b>+┊  ┊40┊      users.filter(</b>
<b>+┊  ┊41┊        user &#x3D;&gt; chat.actualGroupMemberIds &amp;&amp; chat.actualGroupMemberIds.includes(user.id)</b>
<b>+┊  ┊42┊      ),</b>
<b>+┊  ┊43┊    admins: (chat) &#x3D;&gt;</b>
<b>+┊  ┊44┊      users.filter(user &#x3D;&gt; chat.adminIds &amp;&amp; chat.adminIds.includes(user.id)),</b>
<b>+┊  ┊45┊    owner: (chat) &#x3D;&gt; users.find(user &#x3D;&gt; chat.ownerId &#x3D;&#x3D;&#x3D; user.id) || null,</b>
<b>+┊  ┊46┊    messages: (chat, { amount &#x3D; 0 }) &#x3D;&gt; {</b>
<b>+┊  ┊47┊      const messages &#x3D;</b>
<b>+┊  ┊48┊        chat.messages</b>
<b>+┊  ┊49┊          .filter((message: Message) &#x3D;&gt; message.holderIds.includes(currentUser))</b>
<b>+┊  ┊50┊          .sort((a: Message, b: Message) &#x3D;&gt; b.createdAt - a.createdAt) || []</b>
<b>+┊  ┊51┊      return (amount ? messages.slice(0, amount) : messages).reverse()</b>
<b>+┊  ┊52┊    },</b>
<b>+┊  ┊53┊    unreadMessages: (chat) &#x3D;&gt;</b>
<b>+┊  ┊54┊      chat.messages.filter(</b>
<b>+┊  ┊55┊        (message: Message) &#x3D;&gt;</b>
<b>+┊  ┊56┊          message.holderIds.includes(currentUser) &amp;&amp;</b>
<b>+┊  ┊57┊          message.recipients.find(</b>
<b>+┊  ┊58┊            (recipient: Recipient) &#x3D;&gt; recipient.userId &#x3D;&#x3D;&#x3D; currentUser &amp;&amp; !recipient.readAt</b>
<b>+┊  ┊59┊          )</b>
<b>+┊  ┊60┊      ).length,</b>
<b>+┊  ┊61┊    lastMessage: (chat) &#x3D;&gt; chat.messages[chat.messages.length - 1],</b>
<b>+┊  ┊62┊    isGroup: (chat) &#x3D;&gt; !!chat.name,</b>
<b>+┊  ┊63┊  },</b>
<b>+┊  ┊64┊  Message: {</b>
<b>+┊  ┊65┊    chat: (message) &#x3D;&gt;</b>
<b>+┊  ┊66┊      chats.find(chat &#x3D;&gt; message.chatId &#x3D;&#x3D;&#x3D; chat.id) || null,</b>
<b>+┊  ┊67┊    sender: (message) &#x3D;&gt;</b>
<b>+┊  ┊68┊      users.find(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; message.senderId) || null,</b>
<b>+┊  ┊69┊    holders: (message) &#x3D;&gt;</b>
<b>+┊  ┊70┊      users.filter(user &#x3D;&gt; message.holderIds.includes(user.id)),</b>
<b>+┊  ┊71┊    ownership: (message) &#x3D;&gt; message.senderId &#x3D;&#x3D;&#x3D; currentUser,</b>
<b>+┊  ┊72┊  },</b>
<b>+┊  ┊73┊  Recipient: {</b>
<b>+┊  ┊74┊    user: (recipient) &#x3D;&gt;</b>
<b>+┊  ┊75┊      users.find(user &#x3D;&gt; recipient.userId &#x3D;&#x3D;&#x3D; user.id) || null,</b>
<b>+┊  ┊76┊    message: (recipient) &#x3D;&gt; {</b>
<b>+┊  ┊77┊      const chat &#x3D; chats.find(chat &#x3D;&gt; recipient.chatId &#x3D;&#x3D;&#x3D; chat.id)</b>
<b>+┊  ┊78┊      return chat ? chat.messages.find(message &#x3D;&gt; recipient.messageId &#x3D;&#x3D;&#x3D; message.id) || null : null</b>
<b>+┊  ┊79┊    },</b>
<b>+┊  ┊80┊    chat: (recipient) &#x3D;&gt;</b>
<b>+┊  ┊81┊      chats.find(chat &#x3D;&gt; recipient.chatId &#x3D;&#x3D;&#x3D; chat.id) || null,</b>
<b>+┊  ┊82┊  },</b>
<b>+┊  ┊83┊} as IResolvers as IApolloResolvers</b>
</pre>

##### Changed schema&#x2F;typeDefs.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊export default &#x60;
<b>+┊  ┊ 2┊  scalar Date</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊  type Query {</b>
<b>+┊  ┊ 5┊    users: [User!]</b>
<b>+┊  ┊ 6┊    chats: [Chat!]</b>
<b>+┊  ┊ 7┊    chat(chatId: ID!): Chat</b>
<b>+┊  ┊ 8┊  }</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  enum MessageType {</b>
<b>+┊  ┊11┊    LOCATION</b>
<b>+┊  ┊12┊    TEXT</b>
<b>+┊  ┊13┊    PICTURE</b>
<b>+┊  ┊14┊  }</b>
<b>+┊  ┊15┊</b>
 ┊ 2┊16┊  type Chat {
<b>+┊  ┊17┊    #May be a chat or a group</b>
 ┊ 3┊18┊    id: ID!
<b>+┊  ┊19┊    #Computed for chats</b>
<b>+┊  ┊20┊    name: String</b>
<b>+┊  ┊21┊    updatedAt: Date</b>
<b>+┊  ┊22┊    #Computed for chats</b>
<b>+┊  ┊23┊    picture: String</b>
<b>+┊  ┊24┊    #All members, current and past ones.</b>
<b>+┊  ┊25┊    allTimeMembers: [User!]!</b>
<b>+┊  ┊26┊    #Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group.</b>
<b>+┊  ┊27┊    listingMembers: [User!]!</b>
<b>+┊  ┊28┊    #If null the group is read-only. Null for chats.</b>
<b>+┊  ┊29┊    owner: User</b>
<b>+┊  ┊30┊    messages(amount: Int): [Message]!</b>
<b>+┊  ┊31┊    lastMessage: Message</b>
 ┊ 4┊32┊  }
 ┊ 5┊33┊
<b>+┊  ┊34┊  type Message {</b>
<b>+┊  ┊35┊    id: ID!</b>
<b>+┊  ┊36┊    sender: User!</b>
<b>+┊  ┊37┊    chat: Chat!</b>
<b>+┊  ┊38┊    content: String!</b>
<b>+┊  ┊39┊    createdAt: Date!</b>
<b>+┊  ┊40┊    #FIXME: should return MessageType</b>
<b>+┊  ┊41┊    type: Int!</b>
<b>+┊  ┊42┊    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise</b>
<b>+┊  ┊43┊    holders: [User!]!</b>
<b>+┊  ┊44┊    #Computed property</b>
<b>+┊  ┊45┊    ownership: Boolean!</b>
<b>+┊  ┊46┊  }</b>
<b>+┊  ┊47┊</b>
<b>+┊  ┊48┊  type User {</b>
<b>+┊  ┊49┊    id: ID!</b>
<b>+┊  ┊50┊    name: String</b>
<b>+┊  ┊51┊    picture: String</b>
<b>+┊  ┊52┊    phone: String</b>
 ┊ 8┊53┊  }
 ┊ 9┊54┊&#x60;
</pre>

[}]: #

As you can see, we've added an `entity` folder which treats each entity independently. This will server us greatly is the new future when we will connect each entity to a database. The GraphQL resolvers are the "projectors" of the data stored in the fake DB, and they will serve it based on their implementation and provided parameters.

Now, let's make the necessary modifications to our client so it can work alongside the server and show the data that it contains. Similarly to the server, we don't wanna maintain a TypeScript code base for our GraphQL documents, therefore we will install Codegen for the client as well. Let's install the necessary NPM packages:

    $ yarn add -D graphql-code-generator@0.16.0 graphql-codegen-typescript-client@0.16.0 graphql-codegen-typescript-common@0.16.0

Write a Codegen config:

[{]: <helper> (diffStep 1.4 files="codegen.yml, codegen-interpreter.ts" module="client")

#### Step 1.4: Setup codegen

##### Added codegen-interpreter.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊require(&#x27;ts-node&#x27;).register({</b>
<b>+┊ ┊2┊  transpileOnly: true,</b>
<b>+┊ ┊3┊  compilerOptions: {</b>
<b>+┊ ┊4┊    module: &#x27;commonjs&#x27;</b>
<b>+┊ ┊5┊  }</b>
<b>+┊ ┊6┊})</b>
</pre>

##### Added codegen.yml
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊schema: ../WhatsApp-Clone-Server/schema/typeDefs.ts</b>
<b>+┊  ┊ 2┊documents:</b>
<b>+┊  ┊ 3┊  - ./src/**/*.tsx</b>
<b>+┊  ┊ 4┊  - ./src/**/*.ts</b>
<b>+┊  ┊ 5┊overwrite: true</b>
<b>+┊  ┊ 6┊require:</b>
<b>+┊  ┊ 7┊  - ts-node/../../codegen-interpreter.ts</b>
<b>+┊  ┊ 8┊generates:</b>
<b>+┊  ┊ 9┊  ./src/graphql/types.ts:</b>
<b>+┊  ┊10┊    plugins:</b>
<b>+┊  ┊11┊      - typescript-common</b>
<b>+┊  ┊12┊      - typescript-client</b>
</pre>

[}]: #

And define `.gitignore` rules that will not include generated files in our git project:

[{]: <helper> (diffStep 1.4 files="src/graphql/.gitignore" module="client")

#### Step 1.4: Setup codegen

##### Added src&#x2F;graphql&#x2F;.gitignore
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊introspection.json</b>
<b>+┊ ┊2┊types.ts</b>
</pre>

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

#### Step 1.4: Setup codegen

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊18┊  },
 ┊19┊19┊  &quot;devDependencies&quot;: {
 ┊20┊20┊    &quot;@types/graphql&quot;: &quot;14.0.5&quot;,
<b>+┊  ┊21┊    &quot;@types/node&quot;: &quot;10.12.18&quot;,</b>
<b>+┊  ┊22┊    &quot;concurrently&quot;: &quot;4.1.0&quot;,</b>
<b>+┊  ┊23┊    &quot;graphql-code-generator&quot;: &quot;0.16.0&quot;,</b>
<b>+┊  ┊24┊    &quot;graphql-codegen-typescript-client&quot;: &quot;0.16.0&quot;,</b>
<b>+┊  ┊25┊    &quot;graphql-codegen-typescript-common&quot;: &quot;0.16.0&quot;,</b>
<b>+┊  ┊26┊    &quot;nodemon&quot;: &quot;1.18.9&quot;,</b>
<b>+┊  ┊27┊    &quot;ts-node&quot;: &quot;7.0.1&quot;</b>
 ┊22┊28┊  },
 ┊23┊29┊  &quot;scripts&quot;: {
<b>+┊  ┊30┊    &quot;start&quot;: &quot;concurrently \&quot;yarn generate:watch\&quot; \&quot;react-scripts start\&quot;&quot;,</b>
 ┊25┊31┊    &quot;build&quot;: &quot;react-scripts build&quot;,
 ┊26┊32┊    &quot;test&quot;: &quot;react-scripts test&quot;,
<b>+┊  ┊33┊    &quot;eject&quot;: &quot;react-scripts eject&quot;,</b>
<b>+┊  ┊34┊    &quot;generate&quot;: &quot;gql-gen&quot;,</b>
<b>+┊  ┊35┊    &quot;generate:watch&quot;: &quot;nodemon --exec yarn generate -e graphql&quot;</b>
 ┊28┊36┊  },
 ┊29┊37┊  &quot;eslintConfig&quot;: {
 ┊30┊38┊    &quot;extends&quot;: &quot;react-app&quot;
</pre>

[}]: #

Now whenever we would like to generate some TypeScript definitions we can simply run:

    $ yarn generate

Alternatively we can just start the app on watch mode with `$ yarn start` and the Codegen should be listening for changes as well.

    $ yarn start

Now let's build a dashboard that will show all the chats in the server. Rather than implementing all the components and stylesheets from scratch, we will be using [`material-ui`](https://material-ui.com/) (aka Material). Material comes with pre-made components which are highly functional and work smooth with animations. To set it up we will first install it:

    $ yarn add @material-ui/core@3.9.2 @material-ui/icons@3.0.2

And then we will initialize it with the right theme values:

[{]: <helper> (diffStep 1.5 files="src/index.tsx" module="client")

#### Step 1.5: Setup theme

##### Changed src&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { MuiThemeProvider, createMuiTheme } from &#x27;@material-ui/core/styles&#x27;</b>
 ┊1┊2┊import React from &#x27;react&#x27;;
 ┊2┊3┊import ReactDOM from &#x27;react-dom&#x27;;
 ┊3┊4┊import { ApolloProvider } from &#x27;react-apollo-hooks&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 7┊import apolloClient from &#x27;./apollo-client&#x27;
 ┊ 7┊ 8┊import * as serviceWorker from &#x27;./serviceWorker&#x27;;
 ┊ 8┊ 9┊
<b>+┊  ┊10┊const theme &#x3D; createMuiTheme({</b>
<b>+┊  ┊11┊  palette: {</b>
<b>+┊  ┊12┊    primary: { main: &#x27;#2c6157&#x27; },</b>
<b>+┊  ┊13┊    secondary: { main: &#x27;#6fd056&#x27; },</b>
<b>+┊  ┊14┊  },</b>
<b>+┊  ┊15┊  typography: {</b>
<b>+┊  ┊16┊    useNextVariants: true,</b>
<b>+┊  ┊17┊  },</b>
<b>+┊  ┊18┊})</b>
<b>+┊  ┊19┊</b>
 ┊ 9┊20┊ReactDOM.render(
<b>+┊  ┊21┊  &lt;MuiThemeProvider theme&#x3D;{theme}&gt;</b>
<b>+┊  ┊22┊    &lt;ApolloProvider client&#x3D;{apolloClient}&gt;</b>
<b>+┊  ┊23┊      &lt;App /&gt;</b>
<b>+┊  ┊24┊    &lt;/ApolloProvider&gt;</b>
<b>+┊  ┊25┊  &lt;/MuiThemeProvider&gt;</b>
 ┊13┊26┊, document.getElementById(&#x27;root&#x27;));
 ┊14┊27┊
 ┊15┊28┊// If you want your app to work offline and load faster, you can change
</pre>

[}]: #

The theme values represent the main colors in our app. If you're familiar with WhatsApp, you know that its main colors consist mostly of Green and White. The theme values will automatically give Material components the desired style.

We will also make sure that the same values are available in our CSS stylesheet so we can use it outside Material's scope:

[{]: <helper> (diffStep 1.5 files="src/index.css" module="client")

#### Step 1.5: Setup theme

##### Changed src&#x2F;index.css
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊:root {</b>
<b>+┊  ┊ 2┊  --primary-bg: #2c6157;</b>
<b>+┊  ┊ 3┊  --secondary-bg: #6fd056;</b>
<b>+┊  ┊ 4┊  --primary-text: white;</b>
<b>+┊  ┊ 5┊  --secondary-text: white;</b>
<b>+┊  ┊ 6┊}</b>
<b>+┊  ┊ 7┊</b>
 ┊ 1┊ 8┊body {
 ┊ 2┊ 9┊  margin: 0;
 ┊ 3┊10┊  padding: 0;
</pre>

[}]: #

Now we're ready to start implementing the view itself. The logic is very simple, we will use a query to fetch the chats from our back-end. Accordingly we will need to define the right [GraphQL fragments](https://www.apollographql.com/docs/react/advanced/fragments.html) so we can use them to build the query. In short, a fragment is used to represent an entity in our app. **It doesn't necessarily has to represent a type**, but indeed it's the most common use case:

[{]: <helper> (diffStep 1.6 files="src/graphql/fragments" module="client")

#### Step 1.6: Add ChatsListScreen

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;chat.fragment.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import message from &#x27;./message.fragment&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  fragment Chat on Chat {</b>
<b>+┊  ┊ 6┊    id</b>
<b>+┊  ┊ 7┊    name</b>
<b>+┊  ┊ 8┊    picture</b>
<b>+┊  ┊ 9┊    allTimeMembers {</b>
<b>+┊  ┊10┊      id</b>
<b>+┊  ┊11┊      name</b>
<b>+┊  ┊12┊      picture</b>
<b>+┊  ┊13┊    }</b>
<b>+┊  ┊14┊    owner {</b>
<b>+┊  ┊15┊      id</b>
<b>+┊  ┊16┊    }</b>
<b>+┊  ┊17┊    lastMessage {</b>
<b>+┊  ┊18┊      ...Message</b>
<b>+┊  ┊19┊    }</b>
<b>+┊  ┊20┊  }</b>
<b>+┊  ┊21┊  ${message}</b>
<b>+┊  ┊22┊&#x60;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊export { default as chat } from &#x27;./chat.fragment&#x27;</b>
<b>+┊ ┊2┊export { default as message } from &#x27;./message.fragment&#x27;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;message.fragment.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊</b>
<b>+┊  ┊ 3┊export default gql&#x60;</b>
<b>+┊  ┊ 4┊  fragment Message on Message {</b>
<b>+┊  ┊ 5┊    id</b>
<b>+┊  ┊ 6┊    chat {</b>
<b>+┊  ┊ 7┊      id</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊    sender {</b>
<b>+┊  ┊10┊      id</b>
<b>+┊  ┊11┊      name</b>
<b>+┊  ┊12┊    }</b>
<b>+┊  ┊13┊    content</b>
<b>+┊  ┊14┊    createdAt</b>
<b>+┊  ┊15┊    recipients {</b>
<b>+┊  ┊16┊      user {</b>
<b>+┊  ┊17┊        id</b>
<b>+┊  ┊18┊      }</b>
<b>+┊  ┊19┊      message {</b>
<b>+┊  ┊20┊        id</b>
<b>+┊  ┊21┊        chat {</b>
<b>+┊  ┊22┊          id</b>
<b>+┊  ┊23┊        }</b>
<b>+┊  ┊24┊      }</b>
<b>+┊  ┊25┊      chat {</b>
<b>+┊  ┊26┊        id</b>
<b>+┊  ┊27┊      }</b>
<b>+┊  ┊28┊      receivedAt</b>
<b>+┊  ┊29┊      readAt</b>
<b>+┊  ┊30┊    }</b>
<b>+┊  ┊31┊    ownership</b>
<b>+┊  ┊32┊  }</b>
<b>+┊  ┊33┊&#x60;</b>
</pre>

[}]: #

Let's move on to implementing the components. The layout is simple and consists of a navigation bar and a chats list. There are few important details you should note about the components:

- They use [Material's](https://material-ui.com) pre-made components and icons, which are styled and highly functional right out of the box.
- Instead of using CSS to style our components we use [`styled-components`](https://www.styled-components.com/). This way we can encapsulate the style and it will live right next to the component.
- We will use [`react-apollo-hooks`](https://github.com/trojanowski/react-apollo-hooks) to connect our Apollo client with our React components. **This library is experimental and shouldn't be used in production yet**.

[{]: <helper> (diffStep 1.6 files="src/components" module="client")

#### Step 1.6: Add ChatsListScreen

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsList.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import List from &#x27;@material-ui/core/List&#x27;</b>
<b>+┊   ┊  2┊import ListItem from &#x27;@material-ui/core/ListItem&#x27;</b>
<b>+┊   ┊  3┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  4┊import * as moment from &#x27;moment&#x27;</b>
<b>+┊   ┊  5┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  6┊import { useQuery } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  7┊import * as ReactDOM from &#x27;react-dom&#x27;</b>
<b>+┊   ┊  8┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  9┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 10┊import { ChatsListQuery } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 11┊</b>
<b>+┊   ┊ 12┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 13┊  height: calc(100% - 56px);</b>
<b>+┊   ┊ 14┊  overflow-y: overlay;</b>
<b>+┊   ┊ 15┊</b>
<b>+┊   ┊ 16┊  .ChatsList-chats-list {</b>
<b>+┊   ┊ 17┊    padding: 0;</b>
<b>+┊   ┊ 18┊  }</b>
<b>+┊   ┊ 19┊</b>
<b>+┊   ┊ 20┊  .ChatsList-chat-item {</b>
<b>+┊   ┊ 21┊    height: 76px;</b>
<b>+┊   ┊ 22┊    padding: 0 15px;</b>
<b>+┊   ┊ 23┊    display: flex;</b>
<b>+┊   ┊ 24┊  }</b>
<b>+┊   ┊ 25┊</b>
<b>+┊   ┊ 26┊  .ChatsList-profile-pic {</b>
<b>+┊   ┊ 27┊    height: 50px;</b>
<b>+┊   ┊ 28┊    width: 50px;</b>
<b>+┊   ┊ 29┊    object-fit: cover;</b>
<b>+┊   ┊ 30┊    border-radius: 50%;</b>
<b>+┊   ┊ 31┊  }</b>
<b>+┊   ┊ 32┊</b>
<b>+┊   ┊ 33┊  .ChatsList-info {</b>
<b>+┊   ┊ 34┊    width: calc(100% - 60px);</b>
<b>+┊   ┊ 35┊    height: calc(100% - 30px);</b>
<b>+┊   ┊ 36┊    padding: 15px 0;</b>
<b>+┊   ┊ 37┊    margin-left: 10px;</b>
<b>+┊   ┊ 38┊    border-bottom: 0.5px solid silver;</b>
<b>+┊   ┊ 39┊    position: relative;</b>
<b>+┊   ┊ 40┊  }</b>
<b>+┊   ┊ 41┊</b>
<b>+┊   ┊ 42┊  .ChatsList-name {</b>
<b>+┊   ┊ 43┊    margin-top: 5px;</b>
<b>+┊   ┊ 44┊  }</b>
<b>+┊   ┊ 45┊</b>
<b>+┊   ┊ 46┊  .ChatsList-last-message {</b>
<b>+┊   ┊ 47┊    color: gray;</b>
<b>+┊   ┊ 48┊    font-size: 15px;</b>
<b>+┊   ┊ 49┊    margin-top: 5px;</b>
<b>+┊   ┊ 50┊    text-overflow: ellipsis;</b>
<b>+┊   ┊ 51┊    overflow: hidden;</b>
<b>+┊   ┊ 52┊    white-space: nowrap;</b>
<b>+┊   ┊ 53┊  }</b>
<b>+┊   ┊ 54┊</b>
<b>+┊   ┊ 55┊  .ChatsList-timestamp {</b>
<b>+┊   ┊ 56┊    position: absolute;</b>
<b>+┊   ┊ 57┊    color: gray;</b>
<b>+┊   ┊ 58┊    top: 20px;</b>
<b>+┊   ┊ 59┊    right: 0;</b>
<b>+┊   ┊ 60┊    font-size: 13px;</b>
<b>+┊   ┊ 61┊  }</b>
<b>+┊   ┊ 62┊&#x60;</b>
<b>+┊   ┊ 63┊</b>
<b>+┊   ┊ 64┊const query &#x3D; gql&#x60;</b>
<b>+┊   ┊ 65┊  query ChatsListQuery {</b>
<b>+┊   ┊ 66┊    chats {</b>
<b>+┊   ┊ 67┊      ...Chat</b>
<b>+┊   ┊ 68┊    }</b>
<b>+┊   ┊ 69┊  }</b>
<b>+┊   ┊ 70┊</b>
<b>+┊   ┊ 71┊  ${fragments.chat}</b>
<b>+┊   ┊ 72┊&#x60;</b>
<b>+┊   ┊ 73┊</b>
<b>+┊   ┊ 74┊export default () &#x3D;&gt; {</b>
<b>+┊   ┊ 75┊  const {</b>
<b>+┊   ┊ 76┊    data: { chats },</b>
<b>+┊   ┊ 77┊  } &#x3D; useQuery&lt;ChatsListQuery.Query&gt;(query)</b>
<b>+┊   ┊ 78┊</b>
<b>+┊   ┊ 79┊  return (</b>
<b>+┊   ┊ 80┊    &lt;Style className&#x3D;&quot;ChatsList&quot;&gt;</b>
<b>+┊   ┊ 81┊      &lt;List className&#x3D;&quot;ChatsList-chats-list&quot;&gt;</b>
<b>+┊   ┊ 82┊        {chats.map(chat &#x3D;&gt; (</b>
<b>+┊   ┊ 83┊          &lt;ListItem</b>
<b>+┊   ┊ 84┊            key&#x3D;{chat.id}</b>
<b>+┊   ┊ 85┊            className&#x3D;&quot;ChatsList-chat-item&quot;</b>
<b>+┊   ┊ 86┊            button</b>
<b>+┊   ┊ 87┊          &gt;</b>
<b>+┊   ┊ 88┊            &lt;img</b>
<b>+┊   ┊ 89┊              className&#x3D;&quot;ChatsList-profile-pic&quot;</b>
<b>+┊   ┊ 90┊              src&#x3D;{chat.picture || &#x27;/assets/default-profile-pic.jpg&#x27;}</b>
<b>+┊   ┊ 91┊            /&gt;</b>
<b>+┊   ┊ 92┊            &lt;div className&#x3D;&quot;ChatsList-info&quot;&gt;</b>
<b>+┊   ┊ 93┊              &lt;div className&#x3D;&quot;ChatsList-name&quot;&gt;{chat.name}&lt;/div&gt;</b>
<b>+┊   ┊ 94┊              {chat.lastMessage &amp;&amp; (</b>
<b>+┊   ┊ 95┊                &lt;React.Fragment&gt;</b>
<b>+┊   ┊ 96┊                  &lt;div className&#x3D;&quot;ChatsList-last-message&quot;&gt;{chat.lastMessage.content}&lt;/div&gt;</b>
<b>+┊   ┊ 97┊                  &lt;div className&#x3D;&quot;ChatsList-timestamp&quot;&gt;</b>
<b>+┊   ┊ 98┊                    {moment(chat.lastMessage.createdAt).format(&#x27;HH:mm&#x27;)}</b>
<b>+┊   ┊ 99┊                  &lt;/div&gt;</b>
<b>+┊   ┊100┊                &lt;/React.Fragment&gt;</b>
<b>+┊   ┊101┊              )}</b>
<b>+┊   ┊102┊            &lt;/div&gt;</b>
<b>+┊   ┊103┊          &lt;/ListItem&gt;</b>
<b>+┊   ┊104┊        ))}</b>
<b>+┊   ┊105┊      &lt;/List&gt;</b>
<b>+┊   ┊106┊    &lt;/Style&gt;</b>
<b>+┊   ┊107┊  )</b>
<b>+┊   ┊108┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsNavbar.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 2┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊  ┊ 5┊  .ChatsNavbar-title {</b>
<b>+┊  ┊ 6┊    float: left;</b>
<b>+┊  ┊ 7┊  }</b>
<b>+┊  ┊ 8┊&#x60;</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊export default () &#x3D;&gt; (</b>
<b>+┊  ┊11┊  &lt;Style className&#x3D;&quot;ChatsNavbar&quot;&gt;</b>
<b>+┊  ┊12┊    &lt;span className&#x3D;&quot;ChatsNavbar-title&quot;&gt;WhatsApp Clone&lt;/span&gt;</b>
<b>+┊  ┊13┊  &lt;/Style&gt;</b>
<b>+┊  ┊14┊)</b>
</pre>

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 2┊import { Suspense } from &#x27;react&#x27;</b>
<b>+┊  ┊ 3┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊  ┊ 4┊import ChatsList from &#x27;./ChatsList&#x27;</b>
<b>+┊  ┊ 5┊import ChatsNavbar from &#x27;./ChatsNavbar&#x27;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊export default () &#x3D;&gt; (</b>
<b>+┊  ┊ 8┊  &lt;div className&#x3D;&quot;ChatsListScreen Screen&quot;&gt;</b>
<b>+┊  ┊ 9┊    &lt;Navbar&gt;</b>
<b>+┊  ┊10┊      &lt;ChatsNavbar /&gt;</b>
<b>+┊  ┊11┊    &lt;/Navbar&gt;</b>
<b>+┊  ┊12┊    &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊  ┊13┊      &lt;ChatsList /&gt;</b>
<b>+┊  ┊14┊    &lt;/Suspense&gt;</b>
<b>+┊  ┊15┊  &lt;/div&gt;</b>
<b>+┊  ┊16┊)</b>
</pre>

##### Added src&#x2F;components&#x2F;Navbar.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Toolbar from &#x27;@material-ui/core/Toolbar&#x27;</b>
<b>+┊  ┊ 2┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 3┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊const Style &#x3D; styled(Toolbar)&#x60;</b>
<b>+┊  ┊ 6┊  background-color: var(--primary-bg);</b>
<b>+┊  ┊ 7┊  color: var(--primary-text);</b>
<b>+┊  ┊ 8┊  font-size: 20px;</b>
<b>+┊  ┊ 9┊  line-height: 40px;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊  .Navbar-body {</b>
<b>+┊  ┊12┊    width: 100%;</b>
<b>+┊  ┊13┊  }</b>
<b>+┊  ┊14┊&#x60;</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊interface NavbarProps {</b>
<b>+┊  ┊17┊  children: any</b>
<b>+┊  ┊18┊}</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊export default ({ children }: NavbarProps) &#x3D;&gt; (</b>
<b>+┊  ┊21┊  &lt;Style className&#x3D;&quot;Navbar&quot;&gt;</b>
<b>+┊  ┊22┊    &lt;div className&#x3D;&quot;Navbar-body&quot;&gt;{children}&lt;/div&gt;</b>
<b>+┊  ┊23┊  &lt;/Style&gt;</b>
<b>+┊  ┊24┊)</b>
</pre>

[}]: #

Let's install the missing dependencies:

    $ yarn add -D @types/moment@2.13.0
    $ yarn add graphql-tag@2.10.1 moment@2.24.0 subscriptions-transport-ws@0.9.15 styled-components@4.1.3

And add a default profile picture to our assets directory under `public/assets/default-profile-pic.jpg`:

![default-profile-pic.jpg](https://user-images.githubusercontent.com/7648874/51983273-38229280-24d3-11e9-98bd-363764dc6d97.jpg)

The chats which are currently served by the server already have a picture, but it's not uncommon to have a chat without any picture in our app.

Lastly, in order to make the list that we've just created visible, we will mount it at the main app component:

[{]: <helper> (diffStep 1.6 files="src/App.tsx" module="client")

#### Step 1.6: Add ChatsListScreen

##### Changed src&#x2F;App.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import React, { Component } from &#x27;react&#x27;;
<b>+┊  ┊ 2┊import ChatsListScreen from &#x27;./components/ChatsListScreen&#x27;</b>
 ┊ 4┊ 3┊
 ┊ 5┊ 4┊class App extends Component {
 ┊ 6┊ 5┊  render() {
 ┊ 7┊ 6┊    return (
 ┊ 8┊ 7┊      &lt;div className&#x3D;&quot;App&quot;&gt;
<b>+┊  ┊ 8┊        &lt;ChatsListScreen /&gt;</b>
 ┊23┊ 9┊      &lt;/div&gt;
 ┊24┊10┊    );
 ┊25┊11┊  }
</pre>

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

#### Step 1.5: Setup TypeORM

##### Changed index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊import express from &#x27;express&#x27;
 ┊ 5┊ 5┊import gql from &#x27;graphql-tag&#x27;
 ┊ 6┊ 6┊import { createServer } from &#x27;http&#x27;
<b>+┊  ┊ 7┊import { createConnection } from &#x27;typeorm&#x27;</b>
 ┊ 7┊ 8┊import schema from &#x27;./schema&#x27;
 ┊ 8┊ 9┊
 ┊ 9┊10┊const PORT &#x3D; 4000
 ┊10┊11┊
<b>+┊  ┊12┊createConnection().then((connection) &#x3D;&gt; {</b>
<b>+┊  ┊13┊  const app &#x3D; express()</b>
 ┊12┊14┊
<b>+┊  ┊15┊  app.use(cors())</b>
<b>+┊  ┊16┊  app.use(bodyParser.json())</b>
 ┊15┊17┊
<b>+┊  ┊18┊  const apollo &#x3D; new ApolloServer({</b>
<b>+┊  ┊19┊    schema,</b>
<b>+┊  ┊20┊    context: () &#x3D;&gt; ({ connection }),</b>
<b>+┊  ┊21┊  })</b>
 ┊17┊22┊
<b>+┊  ┊23┊  apollo.applyMiddleware({</b>
<b>+┊  ┊24┊    app,</b>
<b>+┊  ┊25┊    path: &#x27;/graphql&#x27;,</b>
<b>+┊  ┊26┊  })</b>
 ┊22┊27┊
<b>+┊  ┊28┊  // Wrap the Express server</b>
<b>+┊  ┊29┊  const ws &#x3D; createServer(app)</b>
 ┊25┊30┊
<b>+┊  ┊31┊  apollo.installSubscriptionHandlers(ws)</b>
 ┊27┊32┊
<b>+┊  ┊33┊  ws.listen(PORT, () &#x3D;&gt; {</b>
<b>+┊  ┊34┊    console.log(&#x60;Apollo Server is now running on http://localhost:${PORT}&#x60;)</b>
<b>+┊  ┊35┊  })</b>
 ┊30┊36┊})
</pre>

##### Added ormconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊{</b>
<b>+┊  ┊ 2┊   &quot;type&quot;: &quot;postgres&quot;,</b>
<b>+┊  ┊ 3┊   &quot;host&quot;: &quot;localhost&quot;,</b>
<b>+┊  ┊ 4┊   &quot;port&quot;: 5432,</b>
<b>+┊  ┊ 5┊   &quot;username&quot;: &quot;test&quot;,</b>
<b>+┊  ┊ 6┊   &quot;password&quot;: &quot;test&quot;,</b>
<b>+┊  ┊ 7┊   &quot;database&quot;: &quot;whatsapp&quot;,</b>
<b>+┊  ┊ 8┊   &quot;synchronize&quot;: true,</b>
<b>+┊  ┊ 9┊   &quot;logging&quot;: false,</b>
<b>+┊  ┊10┊   &quot;entities&quot;: [</b>
<b>+┊  ┊11┊      &quot;entity/**/*.ts&quot;</b>
<b>+┊  ┊12┊   ],</b>
<b>+┊  ┊13┊   &quot;migrations&quot;: [</b>
<b>+┊  ┊14┊      &quot;migration/**/*.ts&quot;</b>
<b>+┊  ┊15┊   ],</b>
<b>+┊  ┊16┊   &quot;subscribers&quot;: [</b>
<b>+┊  ┊17┊      &quot;subscriber/**/*.ts&quot;</b>
<b>+┊  ┊18┊   ],</b>
<b>+┊  ┊19┊   &quot;cli&quot;: {</b>
<b>+┊  ┊20┊      &quot;entitiesDir&quot;: &quot;entity&quot;,</b>
<b>+┊  ┊21┊      &quot;migrationsDir&quot;: &quot;migration&quot;,</b>
<b>+┊  ┊22┊      &quot;subscribersDir&quot;: &quot;subscriber&quot;</b>
<b>+┊  ┊23┊   }</b>
<b>+┊  ┊24┊}</b>
</pre>

[}]: #

TypeORM wraps the official Postgres driver so you shouldn't worry about interacting with it. Feel free to edit `ormconfig.json` file based on your needs.

We will also define the type of expected GraphQL context using Codegen. All we have to do is to create a `context.ts` file and specify it in the `codegen.yml` file:

[{]: <helper> (diffStep 1.5 files="codegen.yml, context.ts" module="server")

#### Step 1.5: Setup TypeORM

##### Changed codegen.yml
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 8┊ 8┊      - typescript-resolvers
 ┊ 9┊ 9┊    config:
 ┊10┊10┊      optionalType: undefined | null
<b>+┊  ┊11┊      contextType: ./context#Context</b>
 ┊11┊12┊      mappers:
 ┊12┊13┊        Chat: ./entity/chat#Chat
 ┊13┊14┊        Message: ./entity/message#Message
</pre>

##### Added context.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊ ┊2┊import User from &#x27;./entity/user&#x27;</b>
<b>+┊ ┊3┊</b>
<b>+┊ ┊4┊export interface Context {</b>
<b>+┊ ┊5┊  connection: Connection</b>
<b>+┊ ┊6┊  user: User</b>
<b>+┊ ┊7┊}</b>
</pre>

[}]: #

TypeORM has a very defined structure for organizing a project. Each table in our database, its columns and its relationships should be defined in an entity file under the `entity` folder. Why `entity` folder? Because the `ormconfig.json` says so. This is why originally we defined a TypeScript definition for each entity under a separate file. As for now, we will have 3 entities:

- A chat entity.
- A message entity.
- A user entity.

As we make progress, we will add more entities and edit the relationships between them:

[{]: <helper> (diffStep 1.6 files="entity" module="server")

#### Step 1.6: Implement resolvers against TypeORM

##### Changed entity&#x2F;chat.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import {</b>
<b>+┊  ┊ 2┊  Entity,</b>
<b>+┊  ┊ 3┊  Column,</b>
<b>+┊  ┊ 4┊  PrimaryGeneratedColumn,</b>
<b>+┊  ┊ 5┊  OneToMany,</b>
<b>+┊  ┊ 6┊  JoinTable,</b>
<b>+┊  ┊ 7┊  ManyToMany,</b>
<b>+┊  ┊ 8┊  ManyToOne,</b>
<b>+┊  ┊ 9┊  CreateDateColumn,</b>
<b>+┊  ┊10┊} from &#x27;typeorm&#x27;</b>
 ┊ 1┊11┊import Message from &#x27;./message&#x27;
<b>+┊  ┊12┊import User from &#x27;./user&#x27;</b>
 ┊ 2┊13┊
<b>+┊  ┊14┊interface ChatConstructor {</b>
<b>+┊  ┊15┊  name?: string</b>
<b>+┊  ┊16┊  picture?: string</b>
<b>+┊  ┊17┊  allTimeMembers?: User[]</b>
<b>+┊  ┊18┊  listingMembers?: User[]</b>
<b>+┊  ┊19┊  owner?: User</b>
<b>+┊  ┊20┊  messages?: Message[]</b>
<b>+┊  ┊21┊}</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊@Entity()</b>
<b>+┊  ┊24┊export class Chat {</b>
<b>+┊  ┊25┊  @PrimaryGeneratedColumn()</b>
 ┊ 4┊26┊  id: string
<b>+┊  ┊27┊</b>
<b>+┊  ┊28┊  @CreateDateColumn({ nullable: true })</b>
<b>+┊  ┊29┊  createdAt: Date</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  @Column({ nullable: true })</b>
<b>+┊  ┊32┊  name: string</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊  @Column({ nullable: true })</b>
<b>+┊  ┊35┊  picture: string</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊  @ManyToMany(type &#x3D;&gt; User, user &#x3D;&gt; user.allTimeMemberChats, {</b>
<b>+┊  ┊38┊    cascade: [&#x27;insert&#x27;, &#x27;update&#x27;],</b>
<b>+┊  ┊39┊    eager: false,</b>
<b>+┊  ┊40┊  })</b>
<b>+┊  ┊41┊  @JoinTable()</b>
<b>+┊  ┊42┊  allTimeMembers: User[]</b>
<b>+┊  ┊43┊</b>
<b>+┊  ┊44┊  @ManyToMany(type &#x3D;&gt; User, user &#x3D;&gt; user.listingMemberChats, {</b>
<b>+┊  ┊45┊    cascade: [&#x27;insert&#x27;, &#x27;update&#x27;],</b>
<b>+┊  ┊46┊    eager: false,</b>
<b>+┊  ┊47┊  })</b>
<b>+┊  ┊48┊  @JoinTable()</b>
<b>+┊  ┊49┊  listingMembers: User[]</b>
<b>+┊  ┊50┊</b>
<b>+┊  ┊51┊  @ManyToOne(type &#x3D;&gt; User, user &#x3D;&gt; user.ownerChats, { cascade: [&#x27;insert&#x27;, &#x27;update&#x27;], eager: false })</b>
<b>+┊  ┊52┊  owner?: User | null</b>
<b>+┊  ┊53┊</b>
<b>+┊  ┊54┊  @OneToMany(type &#x3D;&gt; Message, message &#x3D;&gt; message.chat, {</b>
<b>+┊  ┊55┊    cascade: [&#x27;insert&#x27;, &#x27;update&#x27;],</b>
<b>+┊  ┊56┊    eager: true,</b>
<b>+┊  ┊57┊  })</b>
 ┊15┊58┊  messages: Message[]
<b>+┊  ┊59┊</b>
<b>+┊  ┊60┊  constructor({</b>
<b>+┊  ┊61┊    name,</b>
<b>+┊  ┊62┊    picture,</b>
<b>+┊  ┊63┊    allTimeMembers,</b>
<b>+┊  ┊64┊    listingMembers,</b>
<b>+┊  ┊65┊    owner,</b>
<b>+┊  ┊66┊    messages,</b>
<b>+┊  ┊67┊  }: ChatConstructor &#x3D; {}) {</b>
<b>+┊  ┊68┊    if (name) {</b>
<b>+┊  ┊69┊      this.name &#x3D; name</b>
<b>+┊  ┊70┊    }</b>
<b>+┊  ┊71┊    if (picture) {</b>
<b>+┊  ┊72┊      this.picture &#x3D; picture</b>
<b>+┊  ┊73┊    }</b>
<b>+┊  ┊74┊    if (allTimeMembers) {</b>
<b>+┊  ┊75┊      this.allTimeMembers &#x3D; allTimeMembers</b>
<b>+┊  ┊76┊    }</b>
<b>+┊  ┊77┊    if (listingMembers) {</b>
<b>+┊  ┊78┊      this.listingMembers &#x3D; listingMembers</b>
<b>+┊  ┊79┊    }</b>
<b>+┊  ┊80┊    if (owner) {</b>
<b>+┊  ┊81┊      this.owner &#x3D; owner</b>
<b>+┊  ┊82┊    }</b>
<b>+┊  ┊83┊    if (messages) {</b>
<b>+┊  ┊84┊      this.messages &#x3D; messages</b>
<b>+┊  ┊85┊    }</b>
<b>+┊  ┊86┊  }</b>
 ┊16┊87┊}
 ┊17┊88┊
 ┊18┊89┊export default Chat
</pre>

##### Changed entity&#x2F;message.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import {</b>
<b>+┊  ┊ 2┊  Entity,</b>
<b>+┊  ┊ 3┊  Column,</b>
<b>+┊  ┊ 4┊  PrimaryGeneratedColumn,</b>
<b>+┊  ┊ 5┊  OneToMany,</b>
<b>+┊  ┊ 6┊  ManyToOne,</b>
<b>+┊  ┊ 7┊  ManyToMany,</b>
<b>+┊  ┊ 8┊  JoinTable,</b>
<b>+┊  ┊ 9┊  CreateDateColumn,</b>
<b>+┊  ┊10┊} from &#x27;typeorm&#x27;</b>
<b>+┊  ┊11┊import Chat from &#x27;./chat&#x27;</b>
<b>+┊  ┊12┊import User from &#x27;./user&#x27;</b>
<b>+┊  ┊13┊import { MessageType } from &#x27;../db&#x27;</b>
 ┊ 2┊14┊
<b>+┊  ┊15┊interface MessageConstructor {</b>
<b>+┊  ┊16┊  sender?: User</b>
<b>+┊  ┊17┊  content?: string</b>
<b>+┊  ┊18┊  createdAt?: Date</b>
<b>+┊  ┊19┊  type?: MessageType</b>
<b>+┊  ┊20┊  holders?: User[]</b>
<b>+┊  ┊21┊  chat?: Chat</b>
 ┊ 7┊22┊}
 ┊ 8┊23┊
<b>+┊  ┊24┊@Entity()</b>
<b>+┊  ┊25┊export class Message {</b>
<b>+┊  ┊26┊  @PrimaryGeneratedColumn()</b>
 ┊10┊27┊  id: string
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊  @ManyToOne(type &#x3D;&gt; User, user &#x3D;&gt; user.senderMessages, { eager: true })</b>
<b>+┊  ┊30┊  sender: User</b>
<b>+┊  ┊31┊</b>
<b>+┊  ┊32┊  @Column()</b>
 ┊13┊33┊  content: string
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊  @CreateDateColumn({ nullable: true })</b>
<b>+┊  ┊36┊  createdAt: Date</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊  @Column()</b>
<b>+┊  ┊39┊  type: number</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊  @ManyToMany(type &#x3D;&gt; User, user &#x3D;&gt; user.holderMessages, {</b>
<b>+┊  ┊42┊    cascade: [&#x27;insert&#x27;, &#x27;update&#x27;],</b>
<b>+┊  ┊43┊    eager: true,</b>
<b>+┊  ┊44┊  })</b>
<b>+┊  ┊45┊  @JoinTable()</b>
<b>+┊  ┊46┊  holders: User[]</b>
<b>+┊  ┊47┊</b>
<b>+┊  ┊48┊  @ManyToOne(type &#x3D;&gt; Chat, chat &#x3D;&gt; chat.messages)</b>
<b>+┊  ┊49┊  chat: Chat</b>
<b>+┊  ┊50┊</b>
<b>+┊  ┊51┊  constructor({</b>
<b>+┊  ┊52┊    sender,</b>
<b>+┊  ┊53┊    content,</b>
<b>+┊  ┊54┊    createdAt,</b>
<b>+┊  ┊55┊    type,</b>
<b>+┊  ┊56┊    holders,</b>
<b>+┊  ┊57┊    chat,</b>
<b>+┊  ┊58┊  }: MessageConstructor &#x3D; {}) {</b>
<b>+┊  ┊59┊    if (sender) {</b>
<b>+┊  ┊60┊      this.sender &#x3D; sender</b>
<b>+┊  ┊61┊    }</b>
<b>+┊  ┊62┊    if (content) {</b>
<b>+┊  ┊63┊      this.content &#x3D; content</b>
<b>+┊  ┊64┊    }</b>
<b>+┊  ┊65┊    if (createdAt) {</b>
<b>+┊  ┊66┊      this.createdAt &#x3D; createdAt</b>
<b>+┊  ┊67┊    }</b>
<b>+┊  ┊68┊    if (type) {</b>
<b>+┊  ┊69┊      this.type &#x3D; type</b>
<b>+┊  ┊70┊    }</b>
<b>+┊  ┊71┊    if (holders) {</b>
<b>+┊  ┊72┊      this.holders &#x3D; holders</b>
<b>+┊  ┊73┊    }</b>
<b>+┊  ┊74┊    if (chat) {</b>
<b>+┊  ┊75┊      this.chat &#x3D; chat</b>
<b>+┊  ┊76┊    }</b>
<b>+┊  ┊77┊  }</b>
 ┊18┊78┊}
 ┊19┊79┊
 ┊20┊80┊export default Message
</pre>

##### Changed entity&#x2F;user.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from &#x27;typeorm&#x27;</b>
<b>+┊  ┊ 2┊import Chat from &#x27;./chat&#x27;</b>
<b>+┊  ┊ 3┊import Message from &#x27;./message&#x27;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊interface UserConstructor {</b>
<b>+┊  ┊ 6┊  username?: string</b>
<b>+┊  ┊ 7┊  password?: string</b>
<b>+┊  ┊ 8┊  name?: string</b>
<b>+┊  ┊ 9┊  picture?: string</b>
<b>+┊  ┊10┊}</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊@Entity(&#x27;app_user&#x27;)</b>
<b>+┊  ┊13┊export class User {</b>
<b>+┊  ┊14┊  @PrimaryGeneratedColumn()</b>
 ┊ 2┊15┊  id: string
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  @Column()</b>
 ┊ 3┊18┊  username: string
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  @Column()</b>
 ┊ 4┊21┊  password: string
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊  @Column()</b>
 ┊ 5┊24┊  name: string
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊  @Column({ nullable: true })</b>
<b>+┊  ┊27┊  picture: string</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊  @ManyToMany(type &#x3D;&gt; Chat, chat &#x3D;&gt; chat.allTimeMembers)</b>
<b>+┊  ┊30┊  allTimeMemberChats: Chat[]</b>
<b>+┊  ┊31┊</b>
<b>+┊  ┊32┊  @ManyToMany(type &#x3D;&gt; Chat, chat &#x3D;&gt; chat.listingMembers)</b>
<b>+┊  ┊33┊  listingMemberChats: Chat[]</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊  @ManyToMany(type &#x3D;&gt; Message, message &#x3D;&gt; message.holders)</b>
<b>+┊  ┊36┊  holderMessages: Message[]</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊  @OneToMany(type &#x3D;&gt; Chat, chat &#x3D;&gt; chat.owner)</b>
<b>+┊  ┊39┊  ownerChats: Chat[]</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊  @OneToMany(type &#x3D;&gt; Message, message &#x3D;&gt; message.sender)</b>
<b>+┊  ┊42┊  senderMessages: Message[]</b>
<b>+┊  ┊43┊</b>
<b>+┊  ┊44┊  constructor({ username, password, name, picture }: UserConstructor &#x3D; {}) {</b>
<b>+┊  ┊45┊    if (username) {</b>
<b>+┊  ┊46┊      this.username &#x3D; username</b>
<b>+┊  ┊47┊    }</b>
<b>+┊  ┊48┊    if (password) {</b>
<b>+┊  ┊49┊      this.password &#x3D; password</b>
<b>+┊  ┊50┊    }</b>
<b>+┊  ┊51┊    if (name) {</b>
<b>+┊  ┊52┊      this.name &#x3D; name</b>
<b>+┊  ┊53┊    }</b>
<b>+┊  ┊54┊    if (picture) {</b>
<b>+┊  ┊55┊      this.picture &#x3D; picture</b>
<b>+┊  ┊56┊    }</b>
<b>+┊  ┊57┊  }</b>
 ┊ 8┊58┊}
 ┊ 9┊59┊
 ┊10┊60┊export default User
</pre>

[}]: #

Now that we have the entities set, we can make requests to Postgres. Let's edit our resolvers to use the entities:

[{]: <helper> (diffStep 1.6 files="schema" module="server")

#### Step 1.6: Implement resolvers against TypeORM

##### Changed schema&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊  1┊  1┊import { IResolvers as IApolloResolvers } from &#x27;apollo-server-express&#x27;
 ┊  2┊  2┊import { GraphQLDateTime } from &#x27;graphql-iso-date&#x27;
 ┊  4┊  3┊import Chat from &#x27;../entity/chat&#x27;
 ┊  5┊  4┊import Message from &#x27;../entity/message&#x27;
 ┊  7┊  5┊import User from &#x27;../entity/user&#x27;
 ┊  8┊  6┊import { IResolvers } from &#x27;../types&#x27;
 ┊  9┊  7┊
 ┊ 14┊  8┊export default {
 ┊ 15┊  9┊  Date: GraphQLDateTime,
 ┊ 16┊ 10┊  Query: {
 ┊ 17┊ 11┊    // Show all users for the moment.
<b>+┊   ┊ 12┊    users: (root, args, { connection, currentUser }) &#x3D;&gt; {</b>
<b>+┊   ┊ 13┊      return connection.createQueryBuilder(User, &#x27;user&#x27;).where(&#x27;user.id !&#x3D; :id&#x27;, {id: currentUser.id}).getMany();</b>
<b>+┊   ┊ 14┊    },</b>
<b>+┊   ┊ 15┊</b>
<b>+┊   ┊ 16┊    chats: (root, args, { connection, currentUser }) &#x3D;&gt; {</b>
<b>+┊   ┊ 17┊      return connection</b>
<b>+┊   ┊ 18┊        .createQueryBuilder(Chat, &#x27;chat&#x27;)</b>
<b>+┊   ┊ 19┊        .leftJoin(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)</b>
<b>+┊   ┊ 20┊        .where(&#x27;listingMembers.id &#x3D; :id&#x27;, { id: currentUser.id })</b>
<b>+┊   ┊ 21┊        .orderBy(&#x27;chat.createdAt&#x27;, &#x27;DESC&#x27;)</b>
<b>+┊   ┊ 22┊        .getMany();</b>
<b>+┊   ┊ 23┊    },</b>
<b>+┊   ┊ 24┊</b>
<b>+┊   ┊ 25┊    chat: async (root, { chatId }, { connection }) &#x3D;&gt; {</b>
<b>+┊   ┊ 26┊      const chat &#x3D; await connection</b>
<b>+┊   ┊ 27┊        .createQueryBuilder(Chat, &#x27;chat&#x27;)</b>
<b>+┊   ┊ 28┊        .whereInIds(chatId)</b>
<b>+┊   ┊ 29┊        .getOne();</b>
<b>+┊   ┊ 30┊</b>
<b>+┊   ┊ 31┊      return chat || null;</b>
<b>+┊   ┊ 32┊    },</b>
 ┊ 21┊ 33┊  },
<b>+┊   ┊ 34┊</b>
 ┊ 22┊ 35┊  Chat: {
<b>+┊   ┊ 36┊    name: async (chat, args, { connection, currentUser }) &#x3D;&gt; {</b>
<b>+┊   ┊ 37┊      if (chat.name) {</b>
<b>+┊   ┊ 38┊        return chat.name;</b>
<b>+┊   ┊ 39┊      }</b>
<b>+┊   ┊ 40┊</b>
<b>+┊   ┊ 41┊      const user &#x3D; await connection</b>
<b>+┊   ┊ 42┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊ 43┊        .where(&#x27;user.id !&#x3D; :userId&#x27;, { userId: currentUser.id })</b>
<b>+┊   ┊ 44┊        .innerJoin(</b>
<b>+┊   ┊ 45┊          &#x27;user.allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 46┊          &#x27;allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 47┊          &#x27;allTimeMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 48┊          { chatId: chat.id },</b>
<b>+┊   ┊ 49┊        )</b>
<b>+┊   ┊ 50┊        .getOne();</b>
<b>+┊   ┊ 51┊</b>
<b>+┊   ┊ 52┊      return user ? user.name : null</b>
<b>+┊   ┊ 53┊    },</b>
<b>+┊   ┊ 54┊</b>
<b>+┊   ┊ 55┊    picture: async (chat, args, { connection, currentUser }) &#x3D;&gt; {</b>
<b>+┊   ┊ 56┊      if (chat.picture) {</b>
<b>+┊   ┊ 57┊        return chat.picture;</b>
<b>+┊   ┊ 58┊      }</b>
<b>+┊   ┊ 59┊</b>
<b>+┊   ┊ 60┊      const user &#x3D; await connection</b>
<b>+┊   ┊ 61┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊ 62┊        .where(&#x27;user.id !&#x3D; :userId&#x27;, { userId: currentUser.id })</b>
<b>+┊   ┊ 63┊        .innerJoin(</b>
<b>+┊   ┊ 64┊          &#x27;user.allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 65┊          &#x27;allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 66┊          &#x27;allTimeMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 67┊          { chatId: chat.id },</b>
<b>+┊   ┊ 68┊        )</b>
<b>+┊   ┊ 69┊        .getOne();</b>
<b>+┊   ┊ 70┊</b>
<b>+┊   ┊ 71┊      return user ? user.picture : null</b>
<b>+┊   ┊ 72┊    },</b>
<b>+┊   ┊ 73┊</b>
<b>+┊   ┊ 74┊    allTimeMembers: (chat, args, { connection }) &#x3D;&gt; {</b>
<b>+┊   ┊ 75┊      return connection</b>
<b>+┊   ┊ 76┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊ 77┊        .innerJoin(</b>
<b>+┊   ┊ 78┊          &#x27;user.listingMemberChats&#x27;,</b>
<b>+┊   ┊ 79┊          &#x27;listingMemberChats&#x27;,</b>
<b>+┊   ┊ 80┊          &#x27;listingMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 81┊          { chatId: chat.id },</b>
<b>+┊   ┊ 82┊        )</b>
<b>+┊   ┊ 83┊        .getMany()</b>
<b>+┊   ┊ 84┊    },</b>
<b>+┊   ┊ 85┊</b>
<b>+┊   ┊ 86┊    listingMembers: (chat, args, { connection }) &#x3D;&gt; {</b>
<b>+┊   ┊ 87┊      return connection</b>
<b>+┊   ┊ 88┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊ 89┊        .innerJoin(</b>
<b>+┊   ┊ 90┊          &#x27;user.listingMemberChats&#x27;,</b>
<b>+┊   ┊ 91┊          &#x27;listingMemberChats&#x27;,</b>
<b>+┊   ┊ 92┊          &#x27;listingMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 93┊          { chatId: chat.id },</b>
<b>+┊   ┊ 94┊        )</b>
<b>+┊   ┊ 95┊        .getMany();</b>
<b>+┊   ┊ 96┊    },</b>
<b>+┊   ┊ 97┊</b>
<b>+┊   ┊ 98┊    owner: async (chat, args, { connection }) &#x3D;&gt; {</b>
<b>+┊   ┊ 99┊      const owner &#x3D; await connection</b>
<b>+┊   ┊100┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊101┊        .innerJoin(&#x27;user.ownerChats&#x27;, &#x27;ownerChats&#x27;, &#x27;ownerChats.id &#x3D; :chatId&#x27;, {</b>
<b>+┊   ┊102┊          chatId: chat.id,</b>
<b>+┊   ┊103┊        })</b>
<b>+┊   ┊104┊        .getOne();</b>
<b>+┊   ┊105┊</b>
<b>+┊   ┊106┊      return owner || null;</b>
<b>+┊   ┊107┊    },</b>
<b>+┊   ┊108┊</b>
<b>+┊   ┊109┊    messages: async (chat, { amount &#x3D; 0 }, { connection, currentUser }) &#x3D;&gt; {</b>
<b>+┊   ┊110┊      if (chat.messages) {</b>
<b>+┊   ┊111┊        return amount ? chat.messages.slice(-amount) : chat.messages;</b>
<b>+┊   ┊112┊      }</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊      let query &#x3D; connection</b>
<b>+┊   ┊115┊        .createQueryBuilder(Message, &#x27;message&#x27;)</b>
<b>+┊   ┊116┊        .innerJoin(&#x27;message.chat&#x27;, &#x27;chat&#x27;, &#x27;chat.id &#x3D; :chatId&#x27;, { chatId: chat.id })</b>
<b>+┊   ┊117┊        .innerJoin(&#x27;message.holders&#x27;, &#x27;holders&#x27;, &#x27;holders.id &#x3D; :userId&#x27;, {</b>
<b>+┊   ┊118┊          userId: currentUser.id,</b>
<b>+┊   ┊119┊        })</b>
<b>+┊   ┊120┊        .orderBy({ &#x27;message.createdAt&#x27;: { order: &#x27;DESC&#x27;, nulls: &#x27;NULLS LAST&#x27; } });</b>
<b>+┊   ┊121┊</b>
<b>+┊   ┊122┊      if (amount) {</b>
<b>+┊   ┊123┊        query &#x3D; query.take(amount);</b>
<b>+┊   ┊124┊      }</b>
<b>+┊   ┊125┊</b>
<b>+┊   ┊126┊      return (await query.getMany()).reverse();</b>
<b>+┊   ┊127┊    },</b>
<b>+┊   ┊128┊</b>
<b>+┊   ┊129┊    lastMessage: async (chat, args, { connection, currentUser }) &#x3D;&gt; {</b>
<b>+┊   ┊130┊      if (chat.messages) {</b>
<b>+┊   ┊131┊        return chat.messages.length ? chat.messages[chat.messages.length - 1] : null;</b>
<b>+┊   ┊132┊      }</b>
<b>+┊   ┊133┊</b>
<b>+┊   ┊134┊      const messages &#x3D; await connection</b>
<b>+┊   ┊135┊        .createQueryBuilder(Message, &#x27;message&#x27;)</b>
<b>+┊   ┊136┊        .innerJoin(&#x27;message.chat&#x27;, &#x27;chat&#x27;, &#x27;chat.id &#x3D; :chatId&#x27;, { chatId: chat.id })</b>
<b>+┊   ┊137┊        .innerJoin(&#x27;message.holders&#x27;, &#x27;holders&#x27;, &#x27;holders.id &#x3D; :userId&#x27;, {</b>
<b>+┊   ┊138┊          userId: currentUser.id,</b>
<b>+┊   ┊139┊        })</b>
<b>+┊   ┊140┊        .orderBy({ &#x27;message.createdAt&#x27;: { order: &#x27;DESC&#x27;, nulls: &#x27;NULLS LAST&#x27; } })</b>
<b>+┊   ┊141┊        .getMany()</b>
<b>+┊   ┊142┊</b>
<b>+┊   ┊143┊      return messages &amp;&amp; messages.length ? messages[messages.length - 1] : null;</b>
 ┊ 52┊144┊    },
 ┊ 63┊145┊  },
<b>+┊   ┊146┊</b>
 ┊ 64┊147┊  Message: {
<b>+┊   ┊148┊    chat: async (message, args, { connection }) &#x3D;&gt; {</b>
<b>+┊   ┊149┊      const chat &#x3D; await connection</b>
<b>+┊   ┊150┊        .createQueryBuilder(Chat, &#x27;chat&#x27;)</b>
<b>+┊   ┊151┊        .innerJoin(&#x27;chat.messages&#x27;, &#x27;messages&#x27;, &#x27;messages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊152┊          messageId: message.id</b>
<b>+┊   ┊153┊        })</b>
<b>+┊   ┊154┊        .getOne();</b>
<b>+┊   ┊155┊</b>
<b>+┊   ┊156┊      if (!chat) {</b>
<b>+┊   ┊157┊        throw new Error(&#x60;Message must have a chat.&#x60;);</b>
<b>+┊   ┊158┊      }</b>
<b>+┊   ┊159┊</b>
<b>+┊   ┊160┊      return chat;</b>
<b>+┊   ┊161┊    },</b>
<b>+┊   ┊162┊</b>
<b>+┊   ┊163┊    sender: async (message, args, { connection }) &#x3D;&gt; {</b>
<b>+┊   ┊164┊      const sender &#x3D; await connection</b>
<b>+┊   ┊165┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊166┊        .innerJoin(&#x27;user.senderMessages&#x27;, &#x27;senderMessages&#x27;, &#x27;senderMessages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊167┊          messageId: message.id,</b>
<b>+┊   ┊168┊        })</b>
<b>+┊   ┊169┊        .getOne();</b>
<b>+┊   ┊170┊</b>
<b>+┊   ┊171┊      if (!sender) {</b>
<b>+┊   ┊172┊        throw new Error(&#x60;Message must have a sender.&#x60;);</b>
<b>+┊   ┊173┊      }</b>
<b>+┊   ┊174┊</b>
<b>+┊   ┊175┊      return sender;</b>
 ┊ 79┊176┊    },
<b>+┊   ┊177┊</b>
<b>+┊   ┊178┊    holders: async (message, args, { connection }) &#x3D;&gt; {</b>
<b>+┊   ┊179┊      return connection</b>
<b>+┊   ┊180┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊181┊        .innerJoin(&#x27;user.holderMessages&#x27;, &#x27;holderMessages&#x27;, &#x27;holderMessages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊182┊          messageId: message.id,</b>
<b>+┊   ┊183┊        })</b>
<b>+┊   ┊184┊        .getMany();</b>
<b>+┊   ┊185┊    },</b>
<b>+┊   ┊186┊</b>
<b>+┊   ┊187┊    ownership: async (message, args, { connection, currentUser }) &#x3D;&gt; {</b>
<b>+┊   ┊188┊      return !!(await connection</b>
<b>+┊   ┊189┊        .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊   ┊190┊        .whereInIds(currentUser.id)</b>
<b>+┊   ┊191┊        .innerJoin(&#x27;user.senderMessages&#x27;, &#x27;senderMessages&#x27;, &#x27;senderMessages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊192┊          messageId: message.id,</b>
<b>+┊   ┊193┊        })</b>
<b>+┊   ┊194┊        .getCount())</b>
<b>+┊   ┊195┊    }</b>
 ┊ 82┊196┊  },
 ┊ 83┊197┊} as IResolvers as IApolloResolvers
</pre>

[}]: #

Notice that we've used a custom scalar type to represent a `Date` object in our GraphQL schema using a package called [`graphql-iso-date`](https://www.npmjs.com/package/graphql-iso-date). Accordingly, let's install this package:

    $ yarn add graphql-iso-date@3.6.1
    $ yarn add -D @types/graphql-iso-date@3.3.1

And update `codegen.yml` to use it in the generated code file:

[{]: <helper> (diffStep 1.6 files="codegen" module="server")

#### Step 1.6: Implement resolvers against TypeORM

##### Changed codegen.yml
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊13┊13┊        Chat: ./entity/chat#Chat
 ┊14┊14┊        Message: ./entity/message#Message
 ┊15┊15┊        User: ./entity/user#User
<b>+┊  ┊16┊      scalars:</b>
<b>+┊  ┊17┊        Date: Date</b>
</pre>

[}]: #

Instead of fabricating a DB into the memory, we will replace the `db.ts` module with a function that will add sample data, using entities of course. This will be very convenient because this way we can test our app:

[{]: <helper> (diffStep 1.6 files="db" module="server")

#### Step 1.6: Implement resolvers against TypeORM

##### Changed db.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import &#x27;reflect-metadata&#x27;</b>
 ┊  1┊  2┊import moment from &#x27;moment&#x27;
<b>+┊   ┊  3┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊   ┊  4┊import { Chat } from &#x27;./entity/chat&#x27;</b>
<b>+┊   ┊  5┊import { Message } from &#x27;./entity/message&#x27;</b>
<b>+┊   ┊  6┊import { User } from &#x27;./entity/user&#x27;</b>
 ┊  5┊  7┊
<b>+┊   ┊  8┊export enum MessageType {</b>
<b>+┊   ┊  9┊  PICTURE,</b>
<b>+┊   ┊ 10┊  TEXT,</b>
<b>+┊   ┊ 11┊  LOCATION,</b>
<b>+┊   ┊ 12┊}</b>
<b>+┊   ┊ 13┊</b>
<b>+┊   ┊ 14┊export async function addSampleData(connection: Connection) {</b>
<b>+┊   ┊ 15┊  const user1 &#x3D; new User({</b>
 ┊  9┊ 16┊    username: &#x27;ethan&#x27;,
 ┊ 10┊ 17┊    password: &#x27;$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm&#x27;, // 111
 ┊ 11┊ 18┊    name: &#x27;Ethan Gonzalez&#x27;,
 ┊ 12┊ 19┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/1.jpg&#x27;,
<b>+┊   ┊ 20┊  })</b>
<b>+┊   ┊ 21┊  await connection.manager.save(user1)</b>
<b>+┊   ┊ 22┊</b>
<b>+┊   ┊ 23┊  const user2 &#x3D; new User({</b>
 ┊ 16┊ 24┊    username: &#x27;bryan&#x27;,
 ┊ 17┊ 25┊    password: &#x27;$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO&#x27;, // 222
 ┊ 18┊ 26┊    name: &#x27;Bryan Wallace&#x27;,
 ┊ 19┊ 27┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/2.jpg&#x27;,
<b>+┊   ┊ 28┊  })</b>
<b>+┊   ┊ 29┊  await connection.manager.save(user2)</b>
<b>+┊   ┊ 30┊</b>
<b>+┊   ┊ 31┊  const user3 &#x3D; new User({</b>
 ┊ 23┊ 32┊    username: &#x27;avery&#x27;,
 ┊ 24┊ 33┊    password: &#x27;$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.&#x27;, // 333
 ┊ 25┊ 34┊    name: &#x27;Avery Stewart&#x27;,
 ┊ 26┊ 35┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/women/1.jpg&#x27;,
<b>+┊   ┊ 36┊  })</b>
<b>+┊   ┊ 37┊  await connection.manager.save(user3)</b>
<b>+┊   ┊ 38┊</b>
<b>+┊   ┊ 39┊  const user4 &#x3D; new User({</b>
 ┊ 30┊ 40┊    username: &#x27;katie&#x27;,
 ┊ 31┊ 41┊    password: &#x27;$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi&#x27;, // 444
 ┊ 32┊ 42┊    name: &#x27;Katie Peterson&#x27;,
 ┊ 33┊ 43┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/women/2.jpg&#x27;,
<b>+┊   ┊ 44┊  })</b>
<b>+┊   ┊ 45┊  await connection.manager.save(user4)</b>
<b>+┊   ┊ 46┊</b>
<b>+┊   ┊ 47┊  const user5 &#x3D; new User({</b>
 ┊ 37┊ 48┊    username: &#x27;ray&#x27;,
 ┊ 38┊ 49┊    password: &#x27;$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242&#x27;, // 555
 ┊ 39┊ 50┊    name: &#x27;Ray Edwards&#x27;,
 ┊ 40┊ 51┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/3.jpg&#x27;,
<b>+┊   ┊ 52┊  })</b>
<b>+┊   ┊ 53┊  await connection.manager.save(user5)</b>
<b>+┊   ┊ 54┊</b>
<b>+┊   ┊ 55┊  const user6 &#x3D; new User({</b>
 ┊ 44┊ 56┊    username: &#x27;niko&#x27;,
 ┊ 45┊ 57┊    password: &#x27;$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.&#x27;, // 666
 ┊ 46┊ 58┊    name: &#x27;Niccolò Belli&#x27;,
 ┊ 47┊ 59┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/4.jpg&#x27;,
<b>+┊   ┊ 60┊  })</b>
<b>+┊   ┊ 61┊  await connection.manager.save(user6)</b>
<b>+┊   ┊ 62┊</b>
<b>+┊   ┊ 63┊  const user7 &#x3D; new User({</b>
 ┊ 51┊ 64┊    username: &#x27;mario&#x27;,
 ┊ 52┊ 65┊    password: &#x27;$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO&#x27;, // 777
 ┊ 53┊ 66┊    name: &#x27;Mario Rossi&#x27;,
 ┊ 54┊ 67┊    picture: &#x27;https://randomuser.me/api/portraits/thumb/men/5.jpg&#x27;,
<b>+┊   ┊ 68┊  })</b>
<b>+┊   ┊ 69┊  await connection.manager.save(user7)</b>
<b>+┊   ┊ 70┊</b>
<b>+┊   ┊ 71┊  await connection.manager.save(</b>
<b>+┊   ┊ 72┊    new Chat({</b>
<b>+┊   ┊ 73┊      allTimeMembers: [user1, user3],</b>
<b>+┊   ┊ 74┊      listingMembers: [user1, user3],</b>
<b>+┊   ┊ 75┊      messages: [</b>
<b>+┊   ┊ 76┊        new Message({</b>
<b>+┊   ┊ 77┊          sender: user1,</b>
<b>+┊   ┊ 78┊          content: &#x27;You on your way?&#x27;,</b>
<b>+┊   ┊ 79┊          createdAt: moment()</b>
<b>+┊   ┊ 80┊            .subtract(1, &#x27;hours&#x27;)</b>
<b>+┊   ┊ 81┊            .toDate(),</b>
<b>+┊   ┊ 82┊          type: MessageType.TEXT,</b>
<b>+┊   ┊ 83┊          holders: [user1, user3],</b>
<b>+┊   ┊ 84┊        }),</b>
<b>+┊   ┊ 85┊        new Message({</b>
<b>+┊   ┊ 86┊          sender: user3,</b>
<b>+┊   ┊ 87┊          content: &#x27;Yep!&#x27;,</b>
<b>+┊   ┊ 88┊          createdAt: moment()</b>
<b>+┊   ┊ 89┊            .subtract(1, &#x27;hours&#x27;)</b>
<b>+┊   ┊ 90┊            .add(5, &#x27;minutes&#x27;)</b>
<b>+┊   ┊ 91┊            .toDate(),</b>
<b>+┊   ┊ 92┊          type: MessageType.TEXT,</b>
<b>+┊   ┊ 93┊          holders: [user1, user3],</b>
<b>+┊   ┊ 94┊        }),</b>
<b>+┊   ┊ 95┊      ],</b>
<b>+┊   ┊ 96┊    })</b>
<b>+┊   ┊ 97┊  )</b>
<b>+┊   ┊ 98┊</b>
<b>+┊   ┊ 99┊  await connection.manager.save(</b>
<b>+┊   ┊100┊    new Chat({</b>
<b>+┊   ┊101┊      allTimeMembers: [user1, user4],</b>
<b>+┊   ┊102┊      listingMembers: [user1, user4],</b>
<b>+┊   ┊103┊      messages: [</b>
<b>+┊   ┊104┊        new Message({</b>
<b>+┊   ┊105┊          sender: user1,</b>
<b>+┊   ┊106┊          content: &quot;Hey, it&#x27;s me&quot;,</b>
<b>+┊   ┊107┊          createdAt: moment()</b>
<b>+┊   ┊108┊            .subtract(2, &#x27;hours&#x27;)</b>
<b>+┊   ┊109┊            .toDate(),</b>
<b>+┊   ┊110┊          type: MessageType.TEXT,</b>
<b>+┊   ┊111┊          holders: [user1, user4],</b>
<b>+┊   ┊112┊        }),</b>
<b>+┊   ┊113┊      ],</b>
<b>+┊   ┊114┊    })</b>
<b>+┊   ┊115┊  )</b>
<b>+┊   ┊116┊</b>
<b>+┊   ┊117┊  await connection.manager.save(</b>
<b>+┊   ┊118┊    new Chat({</b>
<b>+┊   ┊119┊      allTimeMembers: [user1, user5],</b>
<b>+┊   ┊120┊      listingMembers: [user1, user5],</b>
<b>+┊   ┊121┊      messages: [</b>
<b>+┊   ┊122┊        new Message({</b>
<b>+┊   ┊123┊          sender: user1,</b>
<b>+┊   ┊124┊          content: &#x27;I should buy a boat&#x27;,</b>
<b>+┊   ┊125┊          createdAt: moment()</b>
<b>+┊   ┊126┊            .subtract(1, &#x27;days&#x27;)</b>
<b>+┊   ┊127┊            .toDate(),</b>
<b>+┊   ┊128┊          type: MessageType.TEXT,</b>
<b>+┊   ┊129┊          holders: [user1, user5],</b>
<b>+┊   ┊130┊        }),</b>
<b>+┊   ┊131┊        new Message({</b>
<b>+┊   ┊132┊          sender: user1,</b>
<b>+┊   ┊133┊          content: &#x27;You still there?&#x27;,</b>
<b>+┊   ┊134┊          createdAt: moment()</b>
<b>+┊   ┊135┊            .subtract(1, &#x27;days&#x27;)</b>
<b>+┊   ┊136┊            .add(16, &#x27;hours&#x27;)</b>
<b>+┊   ┊137┊            .toDate(),</b>
<b>+┊   ┊138┊          type: MessageType.TEXT,</b>
<b>+┊   ┊139┊          holders: [user1, user5],</b>
<b>+┊   ┊140┊        }),</b>
<b>+┊   ┊141┊      ],</b>
<b>+┊   ┊142┊    })</b>
<b>+┊   ┊143┊  )</b>
<b>+┊   ┊144┊</b>
<b>+┊   ┊145┊  await connection.manager.save(</b>
<b>+┊   ┊146┊    new Chat({</b>
<b>+┊   ┊147┊      allTimeMembers: [user3, user4],</b>
<b>+┊   ┊148┊      listingMembers: [user3, user4],</b>
<b>+┊   ┊149┊      messages: [</b>
<b>+┊   ┊150┊        new Message({</b>
<b>+┊   ┊151┊          sender: user3,</b>
<b>+┊   ┊152┊          content: &#x27;Look at my mukluks!&#x27;,</b>
<b>+┊   ┊153┊          createdAt: moment()</b>
<b>+┊   ┊154┊            .subtract(4, &#x27;days&#x27;)</b>
<b>+┊   ┊155┊            .toDate(),</b>
<b>+┊   ┊156┊          type: MessageType.TEXT,</b>
<b>+┊   ┊157┊          holders: [user3, user4],</b>
<b>+┊   ┊158┊        }),</b>
<b>+┊   ┊159┊      ],</b>
<b>+┊   ┊160┊    })</b>
<b>+┊   ┊161┊  )</b>
<b>+┊   ┊162┊</b>
<b>+┊   ┊163┊  await connection.manager.save(</b>
<b>+┊   ┊164┊    new Chat({</b>
<b>+┊   ┊165┊      allTimeMembers: [user2, user5],</b>
<b>+┊   ┊166┊      listingMembers: [user2, user5],</b>
<b>+┊   ┊167┊      messages: [</b>
<b>+┊   ┊168┊        new Message({</b>
<b>+┊   ┊169┊          sender: user2,</b>
<b>+┊   ┊170┊          content: &#x27;This is wicked good ice cream.&#x27;,</b>
<b>+┊   ┊171┊          createdAt: moment()</b>
<b>+┊   ┊172┊            .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊173┊            .toDate(),</b>
<b>+┊   ┊174┊          type: MessageType.TEXT,</b>
<b>+┊   ┊175┊          holders: [user2, user5],</b>
<b>+┊   ┊176┊        }),</b>
<b>+┊   ┊177┊        new Message({</b>
<b>+┊   ┊178┊          sender: user5,</b>
<b>+┊   ┊179┊          content: &#x27;Love it!&#x27;,</b>
<b>+┊   ┊180┊          createdAt: moment()</b>
<b>+┊   ┊181┊            .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊182┊            .add(10, &#x27;minutes&#x27;)</b>
<b>+┊   ┊183┊            .toDate(),</b>
<b>+┊   ┊184┊          type: MessageType.TEXT,</b>
<b>+┊   ┊185┊          holders: [user2, user5],</b>
<b>+┊   ┊186┊        }),</b>
<b>+┊   ┊187┊      ],</b>
<b>+┊   ┊188┊    })</b>
<b>+┊   ┊189┊  )</b>
<b>+┊   ┊190┊</b>
<b>+┊   ┊191┊  await connection.manager.save(</b>
<b>+┊   ┊192┊    new Chat({</b>
<b>+┊   ┊193┊      allTimeMembers: [user1, user6],</b>
<b>+┊   ┊194┊      listingMembers: [user1],</b>
<b>+┊   ┊195┊    })</b>
<b>+┊   ┊196┊  )</b>
<b>+┊   ┊197┊</b>
<b>+┊   ┊198┊  await connection.manager.save(</b>
<b>+┊   ┊199┊    new Chat({</b>
<b>+┊   ┊200┊      allTimeMembers: [user2, user1],</b>
<b>+┊   ┊201┊      listingMembers: [user2],</b>
<b>+┊   ┊202┊    })</b>
<b>+┊   ┊203┊  )</b>
 ┊ 57┊204┊
<b>+┊   ┊205┊  await connection.manager.save(</b>
<b>+┊   ┊206┊    new Chat({</b>
<b>+┊   ┊207┊      name: &quot;Ethan&#x27;s group&quot;,</b>
<b>+┊   ┊208┊      picture: &#x27;https://randomuser.me/api/portraits/thumb/lego/1.jpg&#x27;,</b>
<b>+┊   ┊209┊      allTimeMembers: [user1, user3, user4, user6],</b>
<b>+┊   ┊210┊      listingMembers: [user1, user3, user4, user6],</b>
<b>+┊   ┊211┊      owner: user1,</b>
<b>+┊   ┊212┊      messages: [</b>
<b>+┊   ┊213┊        new Message({</b>
<b>+┊   ┊214┊          sender: user1,</b>
<b>+┊   ┊215┊          content: &#x27;I made a group&#x27;,</b>
<b>+┊   ┊216┊          createdAt: moment()</b>
<b>+┊   ┊217┊            .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊218┊            .toDate(),</b>
<b>+┊   ┊219┊          type: MessageType.TEXT,</b>
<b>+┊   ┊220┊          holders: [user1, user3, user4, user6],</b>
<b>+┊   ┊221┊        }),</b>
<b>+┊   ┊222┊        new Message({</b>
<b>+┊   ┊223┊          sender: user1,</b>
<b>+┊   ┊224┊          content: &#x27;Ops, Avery was not supposed to be here&#x27;,</b>
<b>+┊   ┊225┊          createdAt: moment()</b>
<b>+┊   ┊226┊            .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊227┊            .add(2, &#x27;minutes&#x27;)</b>
<b>+┊   ┊228┊            .toDate(),</b>
<b>+┊   ┊229┊          type: MessageType.TEXT,</b>
<b>+┊   ┊230┊          holders: [user1, user4, user6],</b>
<b>+┊   ┊231┊        }),</b>
<b>+┊   ┊232┊        new Message({</b>
<b>+┊   ┊233┊          sender: user4,</b>
<b>+┊   ┊234┊          content: &#x27;Awesome!&#x27;,</b>
<b>+┊   ┊235┊          createdAt: moment()</b>
<b>+┊   ┊236┊            .subtract(2, &#x27;weeks&#x27;)</b>
<b>+┊   ┊237┊            .add(10, &#x27;minutes&#x27;)</b>
<b>+┊   ┊238┊            .toDate(),</b>
<b>+┊   ┊239┊          type: MessageType.TEXT,</b>
<b>+┊   ┊240┊          holders: [user1, user4, user6],</b>
<b>+┊   ┊241┊        }),</b>
<b>+┊   ┊242┊      ],</b>
<b>+┊   ┊243┊    })</b>
<b>+┊   ┊244┊  )</b>
 ┊273┊245┊
<b>+┊   ┊246┊  await connection.manager.save(</b>
<b>+┊   ┊247┊    new Chat({</b>
<b>+┊   ┊248┊      name: &quot;Ray&#x27;s group&quot;,</b>
<b>+┊   ┊249┊      allTimeMembers: [user3, user6],</b>
<b>+┊   ┊250┊      listingMembers: [user3, user6],</b>
<b>+┊   ┊251┊      owner: user6,</b>
<b>+┊   ┊252┊    })</b>
<b>+┊   ┊253┊  )</b>
<b>+┊   ┊254┊}</b>
</pre>

[}]: #

Instead of adding the sample data any time we start the server, we will use an `--add-sample-data` flag which will be provided to the server's process:

[{]: <helper> (diffStep 1.6 files="index.ts" module="server")

#### Step 1.6: Implement resolvers against TypeORM

##### Changed index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import &#x27;reflect-metadata&#x27;</b>
 ┊1┊2┊import { ApolloServer } from &#x27;apollo-server-express&#x27;
 ┊2┊3┊import bodyParser from &#x27;body-parser&#x27;
 ┊3┊4┊import cors from &#x27;cors&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 6┊import gql from &#x27;graphql-tag&#x27;
 ┊ 6┊ 7┊import { createServer } from &#x27;http&#x27;
 ┊ 7┊ 8┊import { createConnection } from &#x27;typeorm&#x27;
<b>+┊  ┊ 9┊import { addSampleData } from &#x27;./db&#x27;</b>
 ┊ 8┊10┊import schema from &#x27;./schema&#x27;
 ┊ 9┊11┊
 ┊10┊12┊const PORT &#x3D; 4000
 ┊11┊13┊
 ┊12┊14┊createConnection().then((connection) &#x3D;&gt; {
<b>+┊  ┊15┊  if (process.argv.includes(&#x27;--add-sample-data&#x27;)) {</b>
<b>+┊  ┊16┊    addSampleData(connection)</b>
<b>+┊  ┊17┊  }</b>
<b>+┊  ┊18┊</b>
 ┊13┊19┊  const app &#x3D; express()
 ┊14┊20┊
 ┊15┊21┊  app.use(cors())
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊23┊
 ┊18┊24┊  const apollo &#x3D; new ApolloServer({
 ┊19┊25┊    schema,
<b>+┊  ┊26┊    context: () &#x3D;&gt; ({</b>
<b>+┊  ┊27┊      connection,</b>
<b>+┊  ┊28┊      currentUser: { id: &#x27;1&#x27; },</b>
<b>+┊  ┊29┊    }),</b>
 ┊21┊30┊  })
 ┊22┊31┊
 ┊23┊32┊  apollo.applyMiddleware({
</pre>

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

#### Step 1.7: Transition to GraphQL Modules

##### Added modules&#x2F;auth&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊  ┊ 3┊import { AuthProvider } from &#x27;./providers/auth.provider&#x27;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊export const AuthModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊ 6┊  name: &#x27;Auth&#x27;,</b>
<b>+┊  ┊ 7┊  providers: ({ config: { connection } }) &#x3D;&gt; [</b>
<b>+┊  ┊ 8┊    { provide: Connection, useValue: connection },</b>
<b>+┊  ┊ 9┊    AuthProvider,</b>
<b>+┊  ┊10┊  ],</b>
<b>+┊  ┊11┊  configRequired: true,</b>
<b>+┊  ┊12┊})</b>
</pre>

##### Added modules&#x2F;auth&#x2F;providers&#x2F;auth.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { OnRequest } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { Injectable } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 3┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊  ┊ 4┊import { User } from &#x27;../../../entity/user&#x27;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊@Injectable()</b>
<b>+┊  ┊ 7┊export class AuthProvider implements OnRequest {</b>
<b>+┊  ┊ 8┊  currentUser: User</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  constructor(</b>
<b>+┊  ┊11┊    private connection: Connection</b>
<b>+┊  ┊12┊  ) {}</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊  async onRequest() {</b>
<b>+┊  ┊15┊    if (this.currentUser) return</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊    const currentUser &#x3D; await this.connection</b>
<b>+┊  ┊19┊      .createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊  ┊20┊      .getOne()</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊    if (currentUser) {</b>
<b>+┊  ┊23┊      console.log(currentUser)</b>
<b>+┊  ┊24┊      this.currentUser &#x3D; currentUser</b>
<b>+┊  ┊25┊    }</b>
<b>+┊  ┊26┊  }</b>
<b>+┊  ┊27┊}</b>
</pre>

##### Added modules&#x2F;chat&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;</b>
<b>+┊  ┊ 4┊import { AuthModule } from &#x27;../auth&#x27;</b>
<b>+┊  ┊ 5┊import { UserModule } from &#x27;../user&#x27;</b>
<b>+┊  ┊ 6┊import { UtilsModule } from &#x27;../utils.module&#x27;</b>
<b>+┊  ┊ 7┊import { ChatProvider } from &#x27;./providers/chat.provider&#x27;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊export const ChatModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊10┊  name: &#x27;Chat&#x27;,</b>
<b>+┊  ┊11┊  imports: [AuthModule, UtilsModule, UserModule],</b>
<b>+┊  ┊12┊  providers: [ChatProvider],</b>
<b>+┊  ┊13┊  defaultProviderScope: ProviderScope.Session,</b>
<b>+┊  ┊14┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊15┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
<b>+┊  ┊16┊})</b>
</pre>

##### Added modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import { Injectable } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊   ┊  2┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊   ┊  3┊import { Chat } from &#x27;../../../entity/chat&#x27;</b>
<b>+┊   ┊  4┊import { User } from &#x27;../../../entity/user&#x27;</b>
<b>+┊   ┊  5┊import { AuthProvider } from &#x27;../../auth/providers/auth.provider&#x27;</b>
<b>+┊   ┊  6┊import { UserProvider } from &#x27;../../user/providers/user.provider&#x27;</b>
<b>+┊   ┊  7┊</b>
<b>+┊   ┊  8┊@Injectable()</b>
<b>+┊   ┊  9┊export class ChatProvider {</b>
<b>+┊   ┊ 10┊  constructor(</b>
<b>+┊   ┊ 11┊    private connection: Connection,</b>
<b>+┊   ┊ 12┊    private userProvider: UserProvider,</b>
<b>+┊   ┊ 13┊    private authProvider: AuthProvider</b>
<b>+┊   ┊ 14┊  ) {}</b>
<b>+┊   ┊ 15┊</b>
<b>+┊   ┊ 16┊  repository &#x3D; this.connection.getRepository(Chat)</b>
<b>+┊   ┊ 17┊  currentUser &#x3D; this.authProvider.currentUser</b>
<b>+┊   ┊ 18┊</b>
<b>+┊   ┊ 19┊  createQueryBuilder() {</b>
<b>+┊   ┊ 20┊    return this.connection.createQueryBuilder(Chat, &#x27;chat&#x27;)</b>
<b>+┊   ┊ 21┊  }</b>
<b>+┊   ┊ 22┊</b>
<b>+┊   ┊ 23┊  async getChats() {</b>
<b>+┊   ┊ 24┊    return this.createQueryBuilder()</b>
<b>+┊   ┊ 25┊      .leftJoin(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)</b>
<b>+┊   ┊ 26┊      .where(&#x27;listingMembers.id &#x3D; :id&#x27;, { id: this.currentUser.id })</b>
<b>+┊   ┊ 27┊      .orderBy(&#x27;chat.createdAt&#x27;, &#x27;DESC&#x27;)</b>
<b>+┊   ┊ 28┊      .getMany()</b>
<b>+┊   ┊ 29┊  }</b>
<b>+┊   ┊ 30┊</b>
<b>+┊   ┊ 31┊  async getChat(chatId: string) {</b>
<b>+┊   ┊ 32┊    const chat &#x3D; await this.createQueryBuilder()</b>
<b>+┊   ┊ 33┊      .whereInIds(chatId)</b>
<b>+┊   ┊ 34┊      .getOne()</b>
<b>+┊   ┊ 35┊</b>
<b>+┊   ┊ 36┊    return chat || null</b>
<b>+┊   ┊ 37┊  }</b>
<b>+┊   ┊ 38┊</b>
<b>+┊   ┊ 39┊  async getChatName(chat: Chat) {</b>
<b>+┊   ┊ 40┊    if (chat.name) {</b>
<b>+┊   ┊ 41┊      return chat.name</b>
<b>+┊   ┊ 42┊    }</b>
<b>+┊   ┊ 43┊</b>
<b>+┊   ┊ 44┊    const user &#x3D; await this.userProvider</b>
<b>+┊   ┊ 45┊      .createQueryBuilder()</b>
<b>+┊   ┊ 46┊      .where(&#x27;user.id !&#x3D; :userId&#x27;, { userId: this.currentUser.id })</b>
<b>+┊   ┊ 47┊      .innerJoin(</b>
<b>+┊   ┊ 48┊        &#x27;user.allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 49┊        &#x27;allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 50┊        &#x27;allTimeMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 51┊        { chatId: chat.id }</b>
<b>+┊   ┊ 52┊      )</b>
<b>+┊   ┊ 53┊      .getOne()</b>
<b>+┊   ┊ 54┊</b>
<b>+┊   ┊ 55┊    return (user &amp;&amp; user.name) || null</b>
<b>+┊   ┊ 56┊  }</b>
<b>+┊   ┊ 57┊</b>
<b>+┊   ┊ 58┊  async getChatPicture(chat: Chat) {</b>
<b>+┊   ┊ 59┊    if (chat.name) {</b>
<b>+┊   ┊ 60┊      return chat.picture</b>
<b>+┊   ┊ 61┊    }</b>
<b>+┊   ┊ 62┊</b>
<b>+┊   ┊ 63┊    const user &#x3D; await this.userProvider</b>
<b>+┊   ┊ 64┊      .createQueryBuilder()</b>
<b>+┊   ┊ 65┊      .where(&#x27;user.id !&#x3D; :userId&#x27;, { userId: this.currentUser.id })</b>
<b>+┊   ┊ 66┊      .innerJoin(</b>
<b>+┊   ┊ 67┊        &#x27;user.allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 68┊        &#x27;allTimeMemberChats&#x27;,</b>
<b>+┊   ┊ 69┊        &#x27;allTimeMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 70┊        { chatId: chat.id }</b>
<b>+┊   ┊ 71┊      )</b>
<b>+┊   ┊ 72┊      .getOne()</b>
<b>+┊   ┊ 73┊</b>
<b>+┊   ┊ 74┊    return user ? user.picture : null</b>
<b>+┊   ┊ 75┊  }</b>
<b>+┊   ┊ 76┊</b>
<b>+┊   ┊ 77┊  getChatAllTimeMembers(chat: Chat) {</b>
<b>+┊   ┊ 78┊    return this.userProvider</b>
<b>+┊   ┊ 79┊      .createQueryBuilder()</b>
<b>+┊   ┊ 80┊      .innerJoin(</b>
<b>+┊   ┊ 81┊        &#x27;user.listingMemberChats&#x27;,</b>
<b>+┊   ┊ 82┊        &#x27;listingMemberChats&#x27;,</b>
<b>+┊   ┊ 83┊        &#x27;listingMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 84┊        { chatId: chat.id }</b>
<b>+┊   ┊ 85┊      )</b>
<b>+┊   ┊ 86┊      .getMany()</b>
<b>+┊   ┊ 87┊  }</b>
<b>+┊   ┊ 88┊</b>
<b>+┊   ┊ 89┊  getChatListingMembers(chat: Chat) {</b>
<b>+┊   ┊ 90┊    return this.userProvider</b>
<b>+┊   ┊ 91┊      .createQueryBuilder()</b>
<b>+┊   ┊ 92┊      .innerJoin(</b>
<b>+┊   ┊ 93┊        &#x27;user.listingMemberChats&#x27;,</b>
<b>+┊   ┊ 94┊        &#x27;listingMemberChats&#x27;,</b>
<b>+┊   ┊ 95┊        &#x27;listingMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 96┊        { chatId: chat.id }</b>
<b>+┊   ┊ 97┊      )</b>
<b>+┊   ┊ 98┊      .getMany()</b>
<b>+┊   ┊ 99┊  }</b>
<b>+┊   ┊100┊</b>
<b>+┊   ┊101┊  async getChatOwner(chat: Chat) {</b>
<b>+┊   ┊102┊    const owner &#x3D; await this.userProvider</b>
<b>+┊   ┊103┊      .createQueryBuilder()</b>
<b>+┊   ┊104┊      .innerJoin(&#x27;user.ownerChats&#x27;, &#x27;ownerChats&#x27;, &#x27;ownerChats.id &#x3D; :chatId&#x27;, {</b>
<b>+┊   ┊105┊        chatId: chat.id,</b>
<b>+┊   ┊106┊      })</b>
<b>+┊   ┊107┊      .getOne()</b>
<b>+┊   ┊108┊</b>
<b>+┊   ┊109┊    return owner || null</b>
<b>+┊   ┊110┊  }</b>
<b>+┊   ┊111┊}</b>
</pre>

##### Added modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { ModuleContext } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { IResolvers } from &#x27;../../../types&#x27;</b>
<b>+┊  ┊ 3┊import { ChatProvider } from &#x27;../providers/chat.provider&#x27;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊export default {</b>
<b>+┊  ┊ 6┊  Query: {</b>
<b>+┊  ┊ 7┊    chats: (obj, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChats(),</b>
<b>+┊  ┊ 8┊    chat: (obj, { chatId }, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChat(chatId),</b>
<b>+┊  ┊ 9┊  },</b>
<b>+┊  ┊10┊  Chat: {</b>
<b>+┊  ┊11┊    name: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatName(chat),</b>
<b>+┊  ┊12┊    picture: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatPicture(chat),</b>
<b>+┊  ┊13┊    allTimeMembers: (chat, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊14┊      injector.get(ChatProvider).getChatAllTimeMembers(chat),</b>
<b>+┊  ┊15┊    listingMembers: (chat, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊16┊      injector.get(ChatProvider).getChatListingMembers(chat),</b>
<b>+┊  ┊17┊    owner: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatOwner(chat),</b>
<b>+┊  ┊18┊  },</b>
<b>+┊  ┊19┊} as IResolvers</b>
</pre>

##### Added modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊type Query {</b>
<b>+┊  ┊ 2┊  chats: [Chat!]!</b>
<b>+┊  ┊ 3┊  chat(chatId: ID!): Chat</b>
<b>+┊  ┊ 4┊}</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊type Chat {</b>
<b>+┊  ┊ 7┊  #May be a chat or a group</b>
<b>+┊  ┊ 8┊  id: ID!</b>
<b>+┊  ┊ 9┊  #Computed for chats</b>
<b>+┊  ┊10┊  name: String</b>
<b>+┊  ┊11┊  #Computed for chats</b>
<b>+┊  ┊12┊  picture: String</b>
<b>+┊  ┊13┊  #All members, current and past ones.</b>
<b>+┊  ┊14┊  allTimeMembers: [User!]!</b>
<b>+┊  ┊15┊  #Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group.</b>
<b>+┊  ┊16┊  listingMembers: [User!]!</b>
<b>+┊  ┊17┊  #If null the group is read-only. Null for chats.</b>
<b>+┊  ┊18┊  owner: User</b>
<b>+┊  ┊19┊}</b>
</pre>

##### Added modules&#x2F;message&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;</b>
<b>+┊  ┊ 4┊import { AuthModule } from &#x27;../auth&#x27;</b>
<b>+┊  ┊ 5┊import { ChatModule } from &#x27;../chat&#x27;</b>
<b>+┊  ┊ 6┊import { UserModule } from &#x27;../user&#x27;</b>
<b>+┊  ┊ 7┊import { UtilsModule } from &#x27;../utils.module&#x27;</b>
<b>+┊  ┊ 8┊import { MessageProvider } from &#x27;./providers/message.provider&#x27;</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊export const MessageModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊11┊  name: &#x27;Message&#x27;,</b>
<b>+┊  ┊12┊  imports: [</b>
<b>+┊  ┊13┊    AuthModule,</b>
<b>+┊  ┊14┊    UtilsModule,</b>
<b>+┊  ┊15┊    UserModule,</b>
<b>+┊  ┊16┊    ChatModule,</b>
<b>+┊  ┊17┊  ],</b>
<b>+┊  ┊18┊  providers: [</b>
<b>+┊  ┊19┊    MessageProvider,</b>
<b>+┊  ┊20┊  ],</b>
<b>+┊  ┊21┊  defaultProviderScope: ProviderScope.Session,</b>
<b>+┊  ┊22┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊23┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
<b>+┊  ┊24┊})</b>
</pre>

##### Added modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import { Injectable } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊   ┊  2┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊   ┊  3┊import { MessageType } from &#x27;../../../db&#x27;</b>
<b>+┊   ┊  4┊import { Chat } from &#x27;../../../entity/chat&#x27;</b>
<b>+┊   ┊  5┊import { Message } from &#x27;../../../entity/message&#x27;</b>
<b>+┊   ┊  6┊import { User } from &#x27;../../../entity/user&#x27;</b>
<b>+┊   ┊  7┊import { AuthProvider } from &#x27;../../auth/providers/auth.provider&#x27;</b>
<b>+┊   ┊  8┊import { ChatProvider } from &#x27;../../chat/providers/chat.provider&#x27;</b>
<b>+┊   ┊  9┊import { UserProvider } from &#x27;../../user/providers/user.provider&#x27;</b>
<b>+┊   ┊ 10┊</b>
<b>+┊   ┊ 11┊@Injectable()</b>
<b>+┊   ┊ 12┊export class MessageProvider {</b>
<b>+┊   ┊ 13┊  constructor(</b>
<b>+┊   ┊ 14┊    private connection: Connection,</b>
<b>+┊   ┊ 15┊    private chatProvider: ChatProvider,</b>
<b>+┊   ┊ 16┊    private authProvider: AuthProvider,</b>
<b>+┊   ┊ 17┊    private userProvider: UserProvider</b>
<b>+┊   ┊ 18┊  ) {}</b>
<b>+┊   ┊ 19┊</b>
<b>+┊   ┊ 20┊  repository &#x3D; this.connection.getRepository(Message)</b>
<b>+┊   ┊ 21┊  currentUser &#x3D; this.authProvider.currentUser</b>
<b>+┊   ┊ 22┊</b>
<b>+┊   ┊ 23┊  createQueryBuilder() {</b>
<b>+┊   ┊ 24┊    return this.connection.createQueryBuilder(Message, &#x27;message&#x27;)</b>
<b>+┊   ┊ 25┊  }</b>
<b>+┊   ┊ 26┊</b>
<b>+┊   ┊ 27┊  async getMessageSender(message: Message) {</b>
<b>+┊   ┊ 28┊    const sender &#x3D; await this.userProvider</b>
<b>+┊   ┊ 29┊      .createQueryBuilder()</b>
<b>+┊   ┊ 30┊      .innerJoin(&#x27;user.senderMessages&#x27;, &#x27;senderMessages&#x27;, &#x27;senderMessages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊ 31┊        messageId: message.id,</b>
<b>+┊   ┊ 32┊      })</b>
<b>+┊   ┊ 33┊      .getOne()</b>
<b>+┊   ┊ 34┊</b>
<b>+┊   ┊ 35┊    if (!sender) {</b>
<b>+┊   ┊ 36┊      throw new Error(&#x60;Message must have a sender.&#x60;)</b>
<b>+┊   ┊ 37┊    }</b>
<b>+┊   ┊ 38┊</b>
<b>+┊   ┊ 39┊    return sender</b>
<b>+┊   ┊ 40┊  }</b>
<b>+┊   ┊ 41┊</b>
<b>+┊   ┊ 42┊  async getMessageOwnership(message: Message) {</b>
<b>+┊   ┊ 43┊    return !!(await this.userProvider</b>
<b>+┊   ┊ 44┊      .createQueryBuilder()</b>
<b>+┊   ┊ 45┊      .whereInIds(this.currentUser.id)</b>
<b>+┊   ┊ 46┊      .innerJoin(&#x27;user.senderMessages&#x27;, &#x27;senderMessages&#x27;, &#x27;senderMessages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊ 47┊        messageId: message.id,</b>
<b>+┊   ┊ 48┊      })</b>
<b>+┊   ┊ 49┊      .getCount())</b>
<b>+┊   ┊ 50┊  }</b>
<b>+┊   ┊ 51┊</b>
<b>+┊   ┊ 52┊  async getMessageHolders(message: Message) {</b>
<b>+┊   ┊ 53┊    return await this.userProvider</b>
<b>+┊   ┊ 54┊      .createQueryBuilder()</b>
<b>+┊   ┊ 55┊      .innerJoin(&#x27;user.holderMessages&#x27;, &#x27;holderMessages&#x27;, &#x27;holderMessages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊ 56┊        messageId: message.id,</b>
<b>+┊   ┊ 57┊      })</b>
<b>+┊   ┊ 58┊      .getMany()</b>
<b>+┊   ┊ 59┊  }</b>
<b>+┊   ┊ 60┊</b>
<b>+┊   ┊ 61┊  async getMessageChat(message: Message) {</b>
<b>+┊   ┊ 62┊    const chat &#x3D; await this.chatProvider</b>
<b>+┊   ┊ 63┊      .createQueryBuilder()</b>
<b>+┊   ┊ 64┊      .innerJoin(&#x27;chat.messages&#x27;, &#x27;messages&#x27;, &#x27;messages.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊ 65┊        messageId: message.id,</b>
<b>+┊   ┊ 66┊      })</b>
<b>+┊   ┊ 67┊      .getOne()</b>
<b>+┊   ┊ 68┊</b>
<b>+┊   ┊ 69┊    if (!chat) {</b>
<b>+┊   ┊ 70┊      throw new Error(&#x60;Message must have a chat.&#x60;)</b>
<b>+┊   ┊ 71┊    }</b>
<b>+┊   ┊ 72┊</b>
<b>+┊   ┊ 73┊    return chat</b>
<b>+┊   ┊ 74┊  }</b>
<b>+┊   ┊ 75┊</b>
<b>+┊   ┊ 76┊  async getChats() {</b>
<b>+┊   ┊ 77┊    const chats &#x3D; await this.chatProvider</b>
<b>+┊   ┊ 78┊      .createQueryBuilder()</b>
<b>+┊   ┊ 79┊      .leftJoin(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)</b>
<b>+┊   ┊ 80┊      .where(&#x27;listingMembers.id &#x3D; :id&#x27;, { id: this.currentUser.id })</b>
<b>+┊   ┊ 81┊      .getMany()</b>
<b>+┊   ┊ 82┊</b>
<b>+┊   ┊ 83┊    for (let chat of chats) {</b>
<b>+┊   ┊ 84┊      chat.messages &#x3D; await this.getChatMessages(chat)</b>
<b>+┊   ┊ 85┊    }</b>
<b>+┊   ┊ 86┊</b>
<b>+┊   ┊ 87┊    return chats.sort((chatA, chatB) &#x3D;&gt; {</b>
<b>+┊   ┊ 88┊      const dateA &#x3D; chatA.messages.length</b>
<b>+┊   ┊ 89┊        ? chatA.messages[chatA.messages.length - 1].createdAt</b>
<b>+┊   ┊ 90┊        : chatA.createdAt</b>
<b>+┊   ┊ 91┊      const dateB &#x3D; chatB.messages.length</b>
<b>+┊   ┊ 92┊        ? chatB.messages[chatB.messages.length - 1].createdAt</b>
<b>+┊   ┊ 93┊        : chatB.createdAt</b>
<b>+┊   ┊ 94┊      return dateB.valueOf() - dateA.valueOf()</b>
<b>+┊   ┊ 95┊    })</b>
<b>+┊   ┊ 96┊  }</b>
<b>+┊   ┊ 97┊</b>
<b>+┊   ┊ 98┊  async getChatMessages(chat: Chat, amount?: number) {</b>
<b>+┊   ┊ 99┊    if (chat.messages) {</b>
<b>+┊   ┊100┊      return amount ? chat.messages.slice(-amount) : chat.messages</b>
<b>+┊   ┊101┊    }</b>
<b>+┊   ┊102┊</b>
<b>+┊   ┊103┊    let query &#x3D; this.createQueryBuilder()</b>
<b>+┊   ┊104┊      .innerJoin(&#x27;message.chat&#x27;, &#x27;chat&#x27;, &#x27;chat.id &#x3D; :chatId&#x27;, { chatId: chat.id })</b>
<b>+┊   ┊105┊      .innerJoin(&#x27;message.holders&#x27;, &#x27;holders&#x27;, &#x27;holders.id &#x3D; :userId&#x27;, {</b>
<b>+┊   ┊106┊        userId: this.currentUser.id,</b>
<b>+┊   ┊107┊      })</b>
<b>+┊   ┊108┊      .orderBy({ &#x27;message.createdAt&#x27;: { order: &#x27;DESC&#x27;, nulls: &#x27;NULLS LAST&#x27; } })</b>
<b>+┊   ┊109┊</b>
<b>+┊   ┊110┊    if (amount) {</b>
<b>+┊   ┊111┊      query &#x3D; query.take(amount)</b>
<b>+┊   ┊112┊    }</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊    return (await query.getMany()).reverse()</b>
<b>+┊   ┊115┊  }</b>
<b>+┊   ┊116┊</b>
<b>+┊   ┊117┊  async getChatLastMessage(chat: Chat) {</b>
<b>+┊   ┊118┊    if (chat.messages) {</b>
<b>+┊   ┊119┊      return chat.messages.length ? chat.messages[chat.messages.length - 1] : null</b>
<b>+┊   ┊120┊    }</b>
<b>+┊   ┊121┊</b>
<b>+┊   ┊122┊    const messages &#x3D; await this.getChatMessages(chat, 1)</b>
<b>+┊   ┊123┊</b>
<b>+┊   ┊124┊    return messages &amp;&amp; messages.length ? messages[0] : null</b>
<b>+┊   ┊125┊  }</b>
<b>+┊   ┊126┊</b>
<b>+┊   ┊127┊  async getChatUpdatedAt(chat: Chat) {</b>
<b>+┊   ┊128┊    if (chat.messages) {</b>
<b>+┊   ┊129┊      return chat.messages.length ? chat.messages[0].createdAt : null</b>
<b>+┊   ┊130┊    }</b>
<b>+┊   ┊131┊</b>
<b>+┊   ┊132┊    const latestMessage &#x3D; await this.createQueryBuilder()</b>
<b>+┊   ┊133┊      .innerJoin(&#x27;message.chat&#x27;, &#x27;chat&#x27;, &#x27;chat.id &#x3D; :chatId&#x27;, { chatId: chat.id })</b>
<b>+┊   ┊134┊      .innerJoin(&#x27;message.holders&#x27;, &#x27;holders&#x27;, &#x27;holders.id &#x3D; :userId&#x27;, {</b>
<b>+┊   ┊135┊        userId: this.currentUser.id,</b>
<b>+┊   ┊136┊      })</b>
<b>+┊   ┊137┊      .orderBy({ &#x27;message.createdAt&#x27;: &#x27;DESC&#x27; })</b>
<b>+┊   ┊138┊      .getOne()</b>
<b>+┊   ┊139┊</b>
<b>+┊   ┊140┊    return latestMessage ? latestMessage.createdAt : null</b>
<b>+┊   ┊141┊  }</b>
<b>+┊   ┊142┊}</b>
</pre>

##### Added modules&#x2F;message&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { ModuleContext } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { Message } from &#x27;../../../entity/message&#x27;</b>
<b>+┊  ┊ 3┊import { IResolvers } from &#x27;../../../types&#x27;</b>
<b>+┊  ┊ 4┊import { MessageProvider } from &#x27;../providers/message.provider&#x27;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊export default {</b>
<b>+┊  ┊ 7┊  Query: {</b>
<b>+┊  ┊ 8┊    // The ordering depends on the messages</b>
<b>+┊  ┊ 9┊    chats: (obj, args, { injector }) &#x3D;&gt; injector.get(MessageProvider).getChats(),</b>
<b>+┊  ┊10┊  },</b>
<b>+┊  ┊11┊  Chat: {</b>
<b>+┊  ┊12┊    messages: async (chat, { amount }, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊13┊      injector.get(MessageProvider).getChatMessages(chat, amount || 0),</b>
<b>+┊  ┊14┊    lastMessage: async (chat, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊15┊      injector.get(MessageProvider).getChatLastMessage(chat),</b>
<b>+┊  ┊16┊    updatedAt: async (chat, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊17┊      injector.get(MessageProvider).getChatUpdatedAt(chat),</b>
<b>+┊  ┊18┊  },</b>
<b>+┊  ┊19┊  Message: {</b>
<b>+┊  ┊20┊    sender: async (message, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊21┊      injector.get(MessageProvider).getMessageSender(message),</b>
<b>+┊  ┊22┊    ownership: async (message, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊23┊      injector.get(MessageProvider).getMessageOwnership(message),</b>
<b>+┊  ┊24┊    holders: async (message, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊25┊      injector.get(MessageProvider).getMessageHolders(message),</b>
<b>+┊  ┊26┊    chat: async (message, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊27┊      injector.get(MessageProvider).getMessageChat(message),</b>
<b>+┊  ┊28┊  },</b>
<b>+┊  ┊29┊} as IResolvers</b>
</pre>

##### Added modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊enum MessageType {</b>
<b>+┊  ┊ 2┊  LOCATION</b>
<b>+┊  ┊ 3┊  TEXT</b>
<b>+┊  ┊ 4┊  PICTURE</b>
<b>+┊  ┊ 5┊}</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊extend type Chat {</b>
<b>+┊  ┊ 8┊  messages(amount: Int): [Message]!</b>
<b>+┊  ┊ 9┊  lastMessage: Message</b>
<b>+┊  ┊10┊  updatedAt: Date!</b>
<b>+┊  ┊11┊}</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊type Message {</b>
<b>+┊  ┊14┊  id: ID!</b>
<b>+┊  ┊15┊  sender: User!</b>
<b>+┊  ┊16┊  chat: Chat!</b>
<b>+┊  ┊17┊  content: String!</b>
<b>+┊  ┊18┊  createdAt: Date!</b>
<b>+┊  ┊19┊  #FIXME: should return MessageType</b>
<b>+┊  ┊20┊  type: Int!</b>
<b>+┊  ┊21┊  #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise</b>
<b>+┊  ┊22┊  holders: [User!]!</b>
<b>+┊  ┊23┊  #Computed property</b>
<b>+┊  ┊24┊  ownership: Boolean!</b>
<b>+┊  ┊25┊}</b>
</pre>

##### Added modules&#x2F;user&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { InjectFunction, ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;</b>
<b>+┊  ┊ 4┊import { AuthModule } from &#x27;../auth&#x27;</b>
<b>+┊  ┊ 5┊import { UserProvider } from &#x27;./providers/user.provider&#x27;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊export const UserModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊ 8┊  name: &#x27;User&#x27;,</b>
<b>+┊  ┊ 9┊  imports: [</b>
<b>+┊  ┊10┊    AuthModule,</b>
<b>+┊  ┊11┊  ],</b>
<b>+┊  ┊12┊  providers: [</b>
<b>+┊  ┊13┊    UserProvider,</b>
<b>+┊  ┊14┊  ],</b>
<b>+┊  ┊15┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊16┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
<b>+┊  ┊17┊  defaultProviderScope: ProviderScope.Session,</b>
<b>+┊  ┊18┊})</b>
</pre>

##### Added modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Injectable, ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 2┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊  ┊ 3┊import { User } from &#x27;../../../entity/user&#x27;</b>
<b>+┊  ┊ 4┊import { AuthProvider } from &#x27;../../auth/providers/auth.provider&#x27;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊@Injectable()</b>
<b>+┊  ┊ 7┊export class UserProvider {</b>
<b>+┊  ┊ 8┊  constructor(private connection: Connection, private authProvider: AuthProvider) {}</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  public repository &#x3D; this.connection.getRepository(User)</b>
<b>+┊  ┊11┊  private currentUser &#x3D; this.authProvider.currentUser</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊  createQueryBuilder() {</b>
<b>+┊  ┊14┊    return this.connection.createQueryBuilder(User, &#x27;user&#x27;)</b>
<b>+┊  ┊15┊  }</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  getUsers() {</b>
<b>+┊  ┊18┊    return this.createQueryBuilder()</b>
<b>+┊  ┊19┊      .where(&#x27;user.id !&#x3D; :id&#x27;, { id: this.currentUser.id })</b>
<b>+┊  ┊20┊      .getMany()</b>
<b>+┊  ┊21┊  }</b>
<b>+┊  ┊22┊}</b>
</pre>

##### Added modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { ModuleContext } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { User } from &#x27;../../../entity/User&#x27;</b>
<b>+┊  ┊ 3┊import { IResolvers } from &#x27;../../../types&#x27;</b>
<b>+┊  ┊ 4┊import { UserProvider } from &#x27;../providers/user.provider&#x27;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊export default {</b>
<b>+┊  ┊ 7┊  Query: {</b>
<b>+┊  ┊ 8┊    users: (obj, args, { injector }) &#x3D;&gt; injector.get(UserProvider).getUsers(),</b>
<b>+┊  ┊ 9┊  },</b>
<b>+┊  ┊10┊} as IResolvers</b>
</pre>

##### Added modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊type Query {</b>
<b>+┊  ┊ 2┊  users: [User!]</b>
<b>+┊  ┊ 3┊}</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊type User {</b>
<b>+┊  ┊ 6┊  id: ID!</b>
<b>+┊  ┊ 7┊  name: String</b>
<b>+┊  ┊ 8┊  picture: String</b>
<b>+┊  ┊ 9┊  phone: String</b>
<b>+┊  ┊10┊}</b>
</pre>

##### Added modules&#x2F;utils.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { GraphQLDateTime } from &#x27;graphql-iso-date&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export const UtilsModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊ 5┊  name: &#x27;Utils&#x27;,</b>
<b>+┊  ┊ 6┊  typeDefs: &#x60;</b>
<b>+┊  ┊ 7┊    scalar Date</b>
<b>+┊  ┊ 8┊  &#x60;,</b>
<b>+┊  ┊ 9┊  resolvers: {</b>
<b>+┊  ┊10┊    Date: GraphQLDateTime,</b>
<b>+┊  ┊11┊  },</b>
<b>+┊  ┊12┊})</b>
</pre>

[}]: #

The implementation of the resolvers is NOT implemented in the resolver functions themselves, but rather in a separate provider. With this working model we can import and use the providers in various modules, not necessarily a specific one. In addition, we can mock the provider handlers, which makes it more testable.

We've also created a module called `auth`, which will be responsible for authentication in the near future. For now we use a constant for `currentUser` so we can implement the handlers as if we already have authentication.

We will use a main GQLModule called `app` to connect all our components and export a unified schema:

[{]: <helper> (diffStep 1.7 files="modules/app" module="server")

#### Step 1.7: Transition to GraphQL Modules

##### Added modules&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊  ┊ 3┊import { Express } from &#x27;express&#x27;</b>
<b>+┊  ┊ 4┊import { AuthModule } from &#x27;./auth&#x27;</b>
<b>+┊  ┊ 5┊import { UserModule } from &#x27;./user&#x27;</b>
<b>+┊  ┊ 6┊import { ChatModule } from &#x27;./chat&#x27;</b>
<b>+┊  ┊ 7┊import { MessageModule } from &#x27;./message&#x27;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊export interface IAppModuleConfig {</b>
<b>+┊  ┊10┊  connection: Connection;</b>
<b>+┊  ┊11┊}</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊export const AppModule &#x3D; new GraphQLModule&lt;IAppModuleConfig&gt;({</b>
<b>+┊  ┊14┊  name: &#x27;App&#x27;,</b>
<b>+┊  ┊15┊  imports: ({ config: { connection } }) &#x3D;&gt; [</b>
<b>+┊  ┊16┊    AuthModule.forRoot({</b>
<b>+┊  ┊17┊      connection,</b>
<b>+┊  ┊18┊    }),</b>
<b>+┊  ┊19┊    UserModule,</b>
<b>+┊  ┊20┊    ChatModule,</b>
<b>+┊  ┊21┊    MessageModule,</b>
<b>+┊  ┊22┊  ],</b>
<b>+┊  ┊23┊  configRequired: true,</b>
<b>+┊  ┊24┊})</b>
</pre>

##### Added modules&#x2F;app.symbols.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊export const APP &#x3D; Symbol.for(&#x27;APP&#x27;)</b>
</pre>

[}]: #

Accordingly, we will update the server to use the schema exported by the module we've just created

[{]: <helper> (diffStep 1.7 files="index, schema" module="server")

#### Step 1.7: Transition to GraphQL Modules

##### Changed index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊import { createServer } from &#x27;http&#x27;
 ┊ 8┊ 8┊import { createConnection } from &#x27;typeorm&#x27;
 ┊ 9┊ 9┊import { addSampleData } from &#x27;./db&#x27;
<b>+┊  ┊10┊import { AppModule } from &#x27;./modules/app.module&#x27;</b>
 ┊11┊11┊
 ┊12┊12┊const PORT &#x3D; 4000
 ┊13┊13┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊21┊  app.use(cors())
 ┊22┊22┊  app.use(bodyParser.json())
 ┊23┊23┊
<b>+┊  ┊24┊  const { schema, context } &#x3D; AppModule.forRoot({ connection })</b>
<b>+┊  ┊25┊</b>
 ┊24┊26┊  const apollo &#x3D; new ApolloServer({
 ┊25┊27┊    schema,
<b>+┊  ┊28┊    context,</b>
 ┊30┊29┊  })
 ┊31┊30┊
 ┊32┊31┊  apollo.applyMiddleware({
</pre>

##### Added modules&#x2F;auth&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊  ┊ 3┊import { AuthProvider } from &#x27;./providers/auth.provider&#x27;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊export const AuthModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊ 6┊  name: &#x27;Auth&#x27;,</b>
<b>+┊  ┊ 7┊  providers: ({ config: { connection } }) &#x3D;&gt; [</b>
<b>+┊  ┊ 8┊    { provide: Connection, useValue: connection },</b>
<b>+┊  ┊ 9┊    AuthProvider,</b>
<b>+┊  ┊10┊  ],</b>
<b>+┊  ┊11┊  configRequired: true,</b>
<b>+┊  ┊12┊})</b>
</pre>

##### Added modules&#x2F;chat&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;</b>
<b>+┊  ┊ 4┊import { AuthModule } from &#x27;../auth&#x27;</b>
<b>+┊  ┊ 5┊import { UserModule } from &#x27;../user&#x27;</b>
<b>+┊  ┊ 6┊import { UtilsModule } from &#x27;../utils.module&#x27;</b>
<b>+┊  ┊ 7┊import { ChatProvider } from &#x27;./providers/chat.provider&#x27;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊export const ChatModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊10┊  name: &#x27;Chat&#x27;,</b>
<b>+┊  ┊11┊  imports: [AuthModule, UtilsModule, UserModule],</b>
<b>+┊  ┊12┊  providers: [ChatProvider],</b>
<b>+┊  ┊13┊  defaultProviderScope: ProviderScope.Session,</b>
<b>+┊  ┊14┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊15┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
<b>+┊  ┊16┊})</b>
</pre>

##### Added modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊type Query {</b>
<b>+┊  ┊ 2┊  chats: [Chat!]!</b>
<b>+┊  ┊ 3┊  chat(chatId: ID!): Chat</b>
<b>+┊  ┊ 4┊}</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊type Chat {</b>
<b>+┊  ┊ 7┊  #May be a chat or a group</b>
<b>+┊  ┊ 8┊  id: ID!</b>
<b>+┊  ┊ 9┊  #Computed for chats</b>
<b>+┊  ┊10┊  name: String</b>
<b>+┊  ┊11┊  #Computed for chats</b>
<b>+┊  ┊12┊  picture: String</b>
<b>+┊  ┊13┊  #All members, current and past ones.</b>
<b>+┊  ┊14┊  allTimeMembers: [User!]!</b>
<b>+┊  ┊15┊  #Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group.</b>
<b>+┊  ┊16┊  listingMembers: [User!]!</b>
<b>+┊  ┊17┊  #If null the group is read-only. Null for chats.</b>
<b>+┊  ┊18┊  owner: User</b>
<b>+┊  ┊19┊}</b>
</pre>

##### Added modules&#x2F;message&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;</b>
<b>+┊  ┊ 4┊import { AuthModule } from &#x27;../auth&#x27;</b>
<b>+┊  ┊ 5┊import { ChatModule } from &#x27;../chat&#x27;</b>
<b>+┊  ┊ 6┊import { UserModule } from &#x27;../user&#x27;</b>
<b>+┊  ┊ 7┊import { UtilsModule } from &#x27;../utils.module&#x27;</b>
<b>+┊  ┊ 8┊import { MessageProvider } from &#x27;./providers/message.provider&#x27;</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊export const MessageModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊11┊  name: &#x27;Message&#x27;,</b>
<b>+┊  ┊12┊  imports: [</b>
<b>+┊  ┊13┊    AuthModule,</b>
<b>+┊  ┊14┊    UtilsModule,</b>
<b>+┊  ┊15┊    UserModule,</b>
<b>+┊  ┊16┊    ChatModule,</b>
<b>+┊  ┊17┊  ],</b>
<b>+┊  ┊18┊  providers: [</b>
<b>+┊  ┊19┊    MessageProvider,</b>
<b>+┊  ┊20┊  ],</b>
<b>+┊  ┊21┊  defaultProviderScope: ProviderScope.Session,</b>
<b>+┊  ┊22┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊23┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
<b>+┊  ┊24┊})</b>
</pre>

##### Added modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊enum MessageType {</b>
<b>+┊  ┊ 2┊  LOCATION</b>
<b>+┊  ┊ 3┊  TEXT</b>
<b>+┊  ┊ 4┊  PICTURE</b>
<b>+┊  ┊ 5┊}</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊extend type Chat {</b>
<b>+┊  ┊ 8┊  messages(amount: Int): [Message]!</b>
<b>+┊  ┊ 9┊  lastMessage: Message</b>
<b>+┊  ┊10┊  updatedAt: Date!</b>
<b>+┊  ┊11┊}</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊type Message {</b>
<b>+┊  ┊14┊  id: ID!</b>
<b>+┊  ┊15┊  sender: User!</b>
<b>+┊  ┊16┊  chat: Chat!</b>
<b>+┊  ┊17┊  content: String!</b>
<b>+┊  ┊18┊  createdAt: Date!</b>
<b>+┊  ┊19┊  #FIXME: should return MessageType</b>
<b>+┊  ┊20┊  type: Int!</b>
<b>+┊  ┊21┊  #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise</b>
<b>+┊  ┊22┊  holders: [User!]!</b>
<b>+┊  ┊23┊  #Computed property</b>
<b>+┊  ┊24┊  ownership: Boolean!</b>
<b>+┊  ┊25┊}</b>
</pre>

##### Added modules&#x2F;user&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;</b>
<b>+┊  ┊ 2┊import { InjectFunction, ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊  ┊ 3┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;</b>
<b>+┊  ┊ 4┊import { AuthModule } from &#x27;../auth&#x27;</b>
<b>+┊  ┊ 5┊import { UserProvider } from &#x27;./providers/user.provider&#x27;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊export const UserModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊ 8┊  name: &#x27;User&#x27;,</b>
<b>+┊  ┊ 9┊  imports: [</b>
<b>+┊  ┊10┊    AuthModule,</b>
<b>+┊  ┊11┊  ],</b>
<b>+┊  ┊12┊  providers: [</b>
<b>+┊  ┊13┊    UserProvider,</b>
<b>+┊  ┊14┊  ],</b>
<b>+┊  ┊15┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊16┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
<b>+┊  ┊17┊  defaultProviderScope: ProviderScope.Session,</b>
<b>+┊  ┊18┊})</b>
</pre>

##### Added modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊type Query {</b>
<b>+┊  ┊ 2┊  users: [User!]</b>
<b>+┊  ┊ 3┊}</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊type User {</b>
<b>+┊  ┊ 6┊  id: ID!</b>
<b>+┊  ┊ 7┊  name: String</b>
<b>+┊  ┊ 8┊  picture: String</b>
<b>+┊  ┊ 9┊  phone: String</b>
<b>+┊  ┊10┊}</b>
</pre>

##### Changed schema&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import &#x27;reflect-metadata&#x27;</b>
<b>+┊ ┊2┊import { AppModule } from &#x27;../modules/app.module&#x27;</b>
 ┊4┊3┊
<b>+┊ ┊4┊export default AppModule.forRoot({} as any).schema</b>
</pre>

##### Changed schema&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import &#x27;reflect-metadata&#x27;</b>
<b>+┊   ┊  2┊import { AppModule } from &#x27;../modules/app.module&#x27;</b>
 ┊  7┊  3┊
<b>+┊   ┊  4┊export default AppModule.forRoot({} as any).resolvers</b>
</pre>

##### Changed schema&#x2F;typeDefs.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import &#x27;reflect-metadata&#x27;</b>
<b>+┊  ┊ 2┊import { AppModule } from &#x27;../modules/app.module&#x27;</b>
 ┊ 3┊ 3┊
<b>+┊  ┊ 4┊export default AppModule.forRoot({} as any).typeDefs</b>
</pre>

[}]: #

Now try to run the app again and see how things work. Of course, there shouldn't be any visual differences, but know that having a DB as an essential step.

    $ yarn start --reset-dummy-data

In the next step we refactor our back-end so it can be more maintainable, and we will setup a basic authentication mechanism. WhatsApp is not WhatsApp without authentication!


[//]: # (foot-start)

[{]: <helper> (navStep)

⟸ <a href="../../../README.md">INTRO</a> <b>║</b> <a href="step2.md">NEXT STEP</a> ⟹

[}]: #
