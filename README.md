# WhatsApp Clone Tutorial

[//]: # (head-end)


<p align="center"><img src="https://cdn-images-1.medium.com/max/1600/1*cSBu9zeo8fSnf1Cc-UeR_g.jpeg" width="640"></p>

You might have seen it around already - an open-source WhatsApp Clone tutorial; a project which was originally started in 2015 by [Uri Goldshtein](https://github.com/urigo) based on Angular-Meteor and Ionic, and have been throughout different incarnations ever since.

This time around, I'm happy to announce that a new version of the WhatsApp Clone is coming, and it's based on React 16.7 (Hooks & Suspense), Styled-Components, Material-UI, TypeScript, GraphQL-Subscriptions/Codegen/Modules, PostgreSQL and TypeORM.

The step-by-step implementations of the server and client can be found here:

- Server - [urigo/whatsapp-clone-server](https://github.com/urigo/whatsapp-clone-server)

- Client - [urigo/whatsapp-clone-client](https://github.com/urigo/whatsapp-clone-client-react)

<p align="center"><img src="https://cdn-images-1.medium.com/max/1040/1*fFUJd7moWtjvMZ5dE-A80g.gif" alt="whatsapp" width="240"></p>

### Why is it so good?

This app was built with all the latest and hottest technologies out there. The purpose is simple - it should be a guideline for building a proper app, thus we thought very carefully regards the design patterns and architecture used in it, plus, we made sure to cover all communication methods with the GraphQL-back-end in different variations (query, mutation, subscription). This way whenever you're looking to start a new app, maintain an existing one or upgrade your dev-stack, the WhatsApp-clone can be a great source to start with! It's full stack and has a complete flow.

### Why did we choose this dev-stack?

React, GraphQL, PostgreSQL and TypeScript for obvious reasons - they are backed by a strong ecosystem. These technologies can be used in endless variations, and there's no one way which is the most right of doing so, but we chose a way that makes the most sense for us and that we truly believe in when it comes to building apps. We've connected all 4 with TypeORM, GraphQL-Codegen, GraphQL-Modules for the following reasons:

- The GraphQL back-end was implemented with GraphQL-Modules where logic was splitted into modules based on entity types. GraphQL-Modules is an amazing library which provides you with the ability to manage and maintain your GraphQL schema correctly. Not once nor twice I have seen people who struggle with that and get tangled upon their own creation, and with GraphQL-Modules where you have a very defined structure, this problem can be easily solved.

- Every GraphQL/TypeScript definition were automatically generated with GraphQL-Codegen using a single command call. There's no need to maintain the same thing twice if it already exists in one way or another. This way you don't have to write TypeScript type definitions for your GraphQL documents (queries, mutations and subscriptions), GraphQL resolvers and GraphQL types.

- The new version of React 16.7 was used with Hooks and Suspense and 100% of the project is made out of function components. The front-end communicates with the back-end using only hooks and there was no use in GraphQL-React components, which makes async tasks look a lot more readable with no extra indentations.

- We used TypeORM to correctly split the logic of the entities in the database and define the relationships between them. Without a tool such as TypeORM, communication against the DB tends to get messy and confusion since there's no single module per entity which holds all its related logic.

### What to expect?

- Basic authentication.

- Image uploading with [Cloudinary](https://cloudinary.com/).

- Live updates with GraphQL subscriptions.

- 100% function components with React Hooks.

- GraphQL communication with [react-apollo-hooks](https://github.com/trojanowski/react-apollo-hooks).

This app be extremely useful for those who have little to no background in one of the technologies in our dev-stack.


[//]: # (foot-start)

[{]: <helper> (navStep)

| [Begin Tutorial >](.tortilla/manuals/views/step1.md) |
|----------------------:|

[}]: #
