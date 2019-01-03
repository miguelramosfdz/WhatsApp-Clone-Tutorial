# Step 3: Creating a chat app

[//]: # (head-end)


![chats](https://user-images.githubusercontent.com/7648874/52663040-aa1dc180-2f40-11e9-9ae4-bda648916bc4.png)

In this step we will be implementing a basic chat app. We will be able to:

- Create chats.
- Remove chats.
- Send messages.

The flow is gonna go like this:

- A chat can be created by picking a user from the users list.
- When clicking on a chat, we will be promoted to a chat room.
- The chat room will have a pop-over menu where we will be able to remove the chat.

We will start by adding a new entity called `Recipient`. The `Recipient` entity is the bridge between the `User` and the `Message` and it will tell us when the message was received and when it was read. Note that a message holds multiple recipients - this way we can extend its functionality to support group messaging where each message can have more than 2 recipients. Accordingly, we will have to make few adjustments to the existing entities:

[{]: <helper> (diffStep 3.1 module="server")

#### Step 3.1: Edit entities to serve chat app

##### Changed codegen.yml
```diff
@@ -12,6 +12,7 @@
 ┊12┊12┊      mappers:
 ┊13┊13┊        Chat: ./entity/chat#Chat
 ┊14┊14┊        Message: ./entity/message#Message
+┊  ┊15┊        Recipient: ./entity/recipient#Recipient
 ┊15┊16┊        User: ./entity/user#User
 ┊16┊17┊      scalars:
 ┊17┊18┊        Date: Date
```

##### Changed entity&#x2F;message.ts
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊  CreateDateColumn,
 ┊10┊10┊} from 'typeorm'
 ┊11┊11┊import Chat from './chat'
+┊  ┊12┊import Recipient from './recipient'
 ┊12┊13┊import User from './user'
 ┊13┊14┊import { MessageType } from '../db'
 ┊14┊15┊
```
```diff
@@ -17,6 +18,7 @@
 ┊17┊18┊  content?: string
 ┊18┊19┊  createdAt?: Date
 ┊19┊20┊  type?: MessageType
+┊  ┊21┊  recipients?: Recipient[]
 ┊20┊22┊  holders?: User[]
 ┊21┊23┊  chat?: Chat
 ┊22┊24┊}
```
```diff
@@ -38,6 +40,9 @@
 ┊38┊40┊  @Column()
 ┊39┊41┊  type: number
 ┊40┊42┊
+┊  ┊43┊  @OneToMany(type => Recipient, recipient => recipient.message, { cascade: ['insert', 'update'], eager: true })
+┊  ┊44┊  recipients: Recipient[]
+┊  ┊45┊
 ┊41┊46┊  @ManyToMany(type => User, user => user.holderMessages, {
 ┊42┊47┊    cascade: ['insert', 'update'],
 ┊43┊48┊    eager: true,
```
```diff
@@ -53,6 +58,7 @@
 ┊53┊58┊    content,
 ┊54┊59┊    createdAt,
 ┊55┊60┊    type,
+┊  ┊61┊    recipients,
 ┊56┊62┊    holders,
 ┊57┊63┊    chat,
 ┊58┊64┊  }: MessageConstructor = {}) {
```
```diff
@@ -68,6 +74,10 @@
 ┊68┊74┊    if (type) {
 ┊69┊75┊      this.type = type
 ┊70┊76┊    }
+┊  ┊77┊    if (recipients) {
+┊  ┊78┊      recipients.forEach(recipient => recipient.message = this)
+┊  ┊79┊      this.recipients = recipients
+┊  ┊80┊    }
 ┊71┊81┊    if (holders) {
 ┊72┊82┊      this.holders = holders
 ┊73┊83┊    }
```

##### Added entity&#x2F;recipient.ts
```diff
@@ -0,0 +1,42 @@
+┊  ┊ 1┊import { Entity, ManyToOne, Column } from 'typeorm'
+┊  ┊ 2┊import { Message } from './message'
+┊  ┊ 3┊import { User } from './user'
+┊  ┊ 4┊
+┊  ┊ 5┊interface RecipientConstructor {
+┊  ┊ 6┊  user?: User
+┊  ┊ 7┊  message?: Message
+┊  ┊ 8┊  receivedAt?: Date
+┊  ┊ 9┊  readAt?: Date
+┊  ┊10┊}
+┊  ┊11┊
+┊  ┊12┊@Entity()
+┊  ┊13┊export class Recipient {
+┊  ┊14┊  @ManyToOne(type => User, user => user.recipients, { primary: true })
+┊  ┊15┊  user: User
+┊  ┊16┊
+┊  ┊17┊  @ManyToOne(type => Message, message => message.recipients, { primary: true })
+┊  ┊18┊  message: Message
+┊  ┊19┊
+┊  ┊20┊  @Column({ nullable: true })
+┊  ┊21┊  receivedAt: Date
+┊  ┊22┊
+┊  ┊23┊  @Column({ nullable: true })
+┊  ┊24┊  readAt: Date
+┊  ┊25┊
+┊  ┊26┊  constructor({ user, message, receivedAt, readAt }: RecipientConstructor = {}) {
+┊  ┊27┊    if (user) {
+┊  ┊28┊      this.user = user
+┊  ┊29┊    }
+┊  ┊30┊    if (message) {
+┊  ┊31┊      this.message = message
+┊  ┊32┊    }
+┊  ┊33┊    if (receivedAt) {
+┊  ┊34┊      this.receivedAt = receivedAt
+┊  ┊35┊    }
+┊  ┊36┊    if (readAt) {
+┊  ┊37┊      this.readAt = readAt
+┊  ┊38┊    }
+┊  ┊39┊  }
+┊  ┊40┊}
+┊  ┊41┊
+┊  ┊42┊export default Recipient
```

##### Changed entity&#x2F;user.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm'
 ┊2┊2┊import Chat from './chat'
 ┊3┊3┊import Message from './message'
+┊ ┊4┊import Recipient from './recipient'
 ┊4┊5┊
 ┊5┊6┊interface UserConstructor {
 ┊6┊7┊  username?: string
```
```diff
@@ -41,6 +42,9 @@
 ┊41┊42┊  @OneToMany(type => Message, message => message.sender)
 ┊42┊43┊  senderMessages: Message[]
 ┊43┊44┊
+┊  ┊45┊  @OneToMany(type => Recipient, recipient => recipient.user)
+┊  ┊46┊  recipients: Recipient[]
+┊  ┊47┊
 ┊44┊48┊  constructor({ username, password, name, picture }: UserConstructor = {}) {
 ┊45┊49┊    if (username) {
 ┊46┊50┊      this.username = username
```

##### Changed modules&#x2F;app.module.ts
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊import { AuthModule } from './auth'
 ┊ 5┊ 5┊import { UserModule } from './user'
 ┊ 6┊ 6┊import { ChatModule } from './chat'
+┊  ┊ 7┊import { RecipientModule } from './recipient'
 ┊ 7┊ 8┊import { MessageModule } from './message'
 ┊ 8┊ 9┊
 ┊ 9┊10┊export interface IAppModuleConfig {
```
```diff
@@ -21,6 +22,7 @@
 ┊21┊22┊    UserModule,
 ┊22┊23┊    ChatModule,
 ┊23┊24┊    MessageModule,
+┊  ┊25┊    RecipientModule,
 ┊24┊26┊  ],
 ┊25┊27┊  configRequired: true,
 ┊26┊28┊})
```

##### Added modules&#x2F;recipient&#x2F;index.ts
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊import { GraphQLModule } from '@graphql-modules/core';
+┊  ┊ 2┊import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
+┊  ┊ 3┊import { UserModule } from '../user';
+┊  ┊ 4┊import { MessageModule } from '../message';
+┊  ┊ 5┊import { ChatModule } from '../chat';
+┊  ┊ 6┊import { RecipientProvider } from './providers/recipient.provider';
+┊  ┊ 7┊import { AuthModule } from '../auth';
+┊  ┊ 8┊
+┊  ┊ 9┊export const RecipientModule = new GraphQLModule({
+┊  ┊10┊  name: 'Recipient',
+┊  ┊11┊  imports: [
+┊  ┊12┊    AuthModule,
+┊  ┊13┊    UserModule,
+┊  ┊14┊    ChatModule,
+┊  ┊15┊    MessageModule,
+┊  ┊16┊  ],
+┊  ┊17┊  providers: [
+┊  ┊18┊    RecipientProvider,
+┊  ┊19┊  ],
+┊  ┊20┊  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
+┊  ┊21┊  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
+┊  ┊22┊});
```

##### Added modules&#x2F;recipient&#x2F;providers&#x2F;recipient.provider.ts
```diff
@@ -0,0 +1,123 @@
+┊   ┊  1┊import { Injectable, ProviderScope } from '@graphql-modules/di'
+┊   ┊  2┊import { Connection } from 'typeorm'
+┊   ┊  3┊import { MessageProvider } from '../../message/providers/message.provider'
+┊   ┊  4┊import { Chat } from '../../../entity/chat'
+┊   ┊  5┊import { Message } from '../../../entity/message'
+┊   ┊  6┊import { Recipient } from '../../../entity/recipient'
+┊   ┊  7┊import { AuthProvider } from '../../auth/providers/auth.provider'
+┊   ┊  8┊
+┊   ┊  9┊@Injectable({
+┊   ┊ 10┊  scope: ProviderScope.Session,
+┊   ┊ 11┊})
+┊   ┊ 12┊export class RecipientProvider {
+┊   ┊ 13┊  constructor(
+┊   ┊ 14┊    private authProvider: AuthProvider,
+┊   ┊ 15┊    private connection: Connection,
+┊   ┊ 16┊    private messageProvider: MessageProvider
+┊   ┊ 17┊  ) {}
+┊   ┊ 18┊
+┊   ┊ 19┊  public repository = this.connection.getRepository(Recipient)
+┊   ┊ 20┊  public currentUser = this.authProvider.currentUser
+┊   ┊ 21┊
+┊   ┊ 22┊  createQueryBuilder() {
+┊   ┊ 23┊    return this.connection.createQueryBuilder(Recipient, 'recipient')
+┊   ┊ 24┊  }
+┊   ┊ 25┊
+┊   ┊ 26┊  getChatUnreadMessagesCount(chat: Chat) {
+┊   ┊ 27┊    return this.messageProvider
+┊   ┊ 28┊      .createQueryBuilder()
+┊   ┊ 29┊      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
+┊   ┊ 30┊      .innerJoin(
+┊   ┊ 31┊        'message.recipients',
+┊   ┊ 32┊        'recipients',
+┊   ┊ 33┊        'recipients.user.id = :userId AND recipients.readAt IS NULL',
+┊   ┊ 34┊        {
+┊   ┊ 35┊          userId: this.currentUser.id,
+┊   ┊ 36┊        }
+┊   ┊ 37┊      )
+┊   ┊ 38┊      .getCount()
+┊   ┊ 39┊  }
+┊   ┊ 40┊
+┊   ┊ 41┊  getMessageRecipients(message: Message) {
+┊   ┊ 42┊    return this.createQueryBuilder()
+┊   ┊ 43┊      .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {
+┊   ┊ 44┊        messageId: message.id,
+┊   ┊ 45┊      })
+┊   ┊ 46┊      .innerJoinAndSelect('recipient.user', 'user')
+┊   ┊ 47┊      .getMany()
+┊   ┊ 48┊  }
+┊   ┊ 49┊
+┊   ┊ 50┊  async getRecipientChat(recipient: Recipient) {
+┊   ┊ 51┊    if (recipient.message.chat) {
+┊   ┊ 52┊      return recipient.message.chat
+┊   ┊ 53┊    }
+┊   ┊ 54┊
+┊   ┊ 55┊    return this.messageProvider.getMessageChat(recipient.message)
+┊   ┊ 56┊  }
+┊   ┊ 57┊
+┊   ┊ 58┊  async removeChat(chatId: string) {
+┊   ┊ 59┊    const messages = await this.messageProvider._removeChatGetMessages(chatId)
+┊   ┊ 60┊
+┊   ┊ 61┊    for (let message of messages) {
+┊   ┊ 62┊      if (message.holders.length === 0) {
+┊   ┊ 63┊        const recipients = await this.createQueryBuilder()
+┊   ┊ 64┊          .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {
+┊   ┊ 65┊            messageId: message.id,
+┊   ┊ 66┊          })
+┊   ┊ 67┊          .innerJoinAndSelect('recipient.user', 'user')
+┊   ┊ 68┊          .getMany()
+┊   ┊ 69┊
+┊   ┊ 70┊        for (let recipient of recipients) {
+┊   ┊ 71┊          await this.repository.remove(recipient)
+┊   ┊ 72┊        }
+┊   ┊ 73┊      }
+┊   ┊ 74┊    }
+┊   ┊ 75┊
+┊   ┊ 76┊    return await this.messageProvider.removeChat(chatId, messages)
+┊   ┊ 77┊  }
+┊   ┊ 78┊
+┊   ┊ 79┊  async addMessage(chatId: string, content: string) {
+┊   ┊ 80┊    const message = await this.messageProvider.addMessage(chatId, content)
+┊   ┊ 81┊
+┊   ┊ 82┊    for (let user of message.holders) {
+┊   ┊ 83┊      if (user.id !== this.currentUser.id) {
+┊   ┊ 84┊        await this.repository.save(new Recipient({ user, message }))
+┊   ┊ 85┊      }
+┊   ┊ 86┊    }
+┊   ┊ 87┊
+┊   ┊ 88┊    return message
+┊   ┊ 89┊  }
+┊   ┊ 90┊
+┊   ┊ 91┊  async removeMessages(
+┊   ┊ 92┊    chatId: string,
+┊   ┊ 93┊    {
+┊   ┊ 94┊      messageIds,
+┊   ┊ 95┊      all,
+┊   ┊ 96┊    }: {
+┊   ┊ 97┊      messageIds?: string[]
+┊   ┊ 98┊      all?: boolean
+┊   ┊ 99┊    } = {}
+┊   ┊100┊  ) {
+┊   ┊101┊    const { deletedIds, removedMessages } = await this.messageProvider._removeMessages(chatId, {
+┊   ┊102┊      messageIds,
+┊   ┊103┊      all,
+┊   ┊104┊    })
+┊   ┊105┊
+┊   ┊106┊    for (let message of removedMessages) {
+┊   ┊107┊      const recipients = await this.createQueryBuilder()
+┊   ┊108┊        .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {
+┊   ┊109┊          messageId: message.id,
+┊   ┊110┊        })
+┊   ┊111┊        .innerJoinAndSelect('recipient.user', 'user')
+┊   ┊112┊        .getMany()
+┊   ┊113┊
+┊   ┊114┊      for (let recipient of recipients) {
+┊   ┊115┊        await this.repository.remove(recipient)
+┊   ┊116┊      }
+┊   ┊117┊
+┊   ┊118┊      await this.messageProvider.repository.remove(message)
+┊   ┊119┊    }
+┊   ┊120┊
+┊   ┊121┊    return deletedIds
+┊   ┊122┊  }
+┊   ┊123┊}
```

##### Added modules&#x2F;recipient&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -0,0 +1,35 @@
+┊  ┊ 1┊import { IResolvers } from '../../../types'
+┊  ┊ 2┊import { RecipientProvider } from '../providers/recipient.provider'
+┊  ┊ 3┊
+┊  ┊ 4┊export default {
+┊  ┊ 5┊  Mutation: {
+┊  ┊ 6┊    // TODO: implement me
+┊  ┊ 7┊    markAsReceived: async (obj, { chatId }) => false,
+┊  ┊ 8┊    // TODO: implement me
+┊  ┊ 9┊    markAsRead: async (obj, { chatId }) => false,
+┊  ┊10┊    // We may also need to remove the recipients
+┊  ┊11┊    removeChat: async (obj, { chatId }, { injector }) =>
+┊  ┊12┊      injector.get(RecipientProvider).removeChat(chatId),
+┊  ┊13┊    // We also need to create the recipients
+┊  ┊14┊    addMessage: async (obj, { chatId, content }, { injector }) =>
+┊  ┊15┊      injector.get(RecipientProvider).addMessage(chatId, content),
+┊  ┊16┊    // We may also need to remove the recipients
+┊  ┊17┊    removeMessages: async (obj, { chatId, messageIds, all }, { injector }) =>
+┊  ┊18┊      injector.get(RecipientProvider).removeMessages(chatId, {
+┊  ┊19┊        messageIds: messageIds || undefined,
+┊  ┊20┊        all: all || false,
+┊  ┊21┊      }),
+┊  ┊22┊  },
+┊  ┊23┊  Chat: {
+┊  ┊24┊    unreadMessages: async (chat, args, { injector }) =>
+┊  ┊25┊      injector.get(RecipientProvider).getChatUnreadMessagesCount(chat),
+┊  ┊26┊  },
+┊  ┊27┊  Message: {
+┊  ┊28┊    recipients: async (message, args, { injector }) =>
+┊  ┊29┊      injector.get(RecipientProvider).getMessageRecipients(message),
+┊  ┊30┊  },
+┊  ┊31┊  Recipient: {
+┊  ┊32┊    chat: async (recipient, args, { injector }) =>
+┊  ┊33┊      injector.get(RecipientProvider).getRecipientChat(recipient),
+┊  ┊34┊  },
+┊  ┊35┊} as IResolvers
```

##### Added modules&#x2F;recipient&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊extend type Chat {
+┊  ┊ 2┊  #Computed property
+┊  ┊ 3┊  unreadMessages: Int!
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊extend type Message {
+┊  ┊ 7┊  #Whoever received the message
+┊  ┊ 8┊  recipients: [Recipient!]!
+┊  ┊ 9┊}
+┊  ┊10┊
+┊  ┊11┊type Recipient {
+┊  ┊12┊  user: User!
+┊  ┊13┊  message: Message!
+┊  ┊14┊  chat: Chat!
+┊  ┊15┊  receivedAt: Date
+┊  ┊16┊  readAt: Date
+┊  ┊17┊}
+┊  ┊18┊
+┊  ┊19┊type Mutation {
+┊  ┊20┊  markAsReceived(chatId: ID!): Boolean
+┊  ┊21┊  markAsRead(chatId: ID!): Boolean
+┊  ┊22┊}
```

[}]: #

The flow will require us to implement the following GraphQL operations:

- `users` query - Will be used to create a chat by picking a user from the users list.
- `addMessage` mutation
- `addChat` mutation
- `removeChat` mutation

Accordingly we will define the operations in our schema and implement their resolvers:

[{]: <helper> (diffStep 3.2 module="server")

#### Step 3.2: Implement mutations for chat app

##### Changed modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
```diff
@@ -38,6 +38,63 @@
 ┊ 38┊ 38┊    return chat || null
 ┊ 39┊ 39┊  }
 ┊ 40┊ 40┊
+┊   ┊ 41┊  async addChat(userId: string) {
+┊   ┊ 42┊    const user = await this.userProvider
+┊   ┊ 43┊      .createQueryBuilder()
+┊   ┊ 44┊      .whereInIds(userId)
+┊   ┊ 45┊      .getOne();
+┊   ┊ 46┊
+┊   ┊ 47┊    if (!user) {
+┊   ┊ 48┊      throw new Error(`User ${userId} doesn't exist.`);
+┊   ┊ 49┊    }
+┊   ┊ 50┊
+┊   ┊ 51┊    let chat = await this
+┊   ┊ 52┊      .createQueryBuilder()
+┊   ┊ 53┊      .where('chat.name IS NULL')
+┊   ┊ 54┊      .innerJoin('chat.allTimeMembers', 'allTimeMembers1', 'allTimeMembers1.id = :currentUserId', {
+┊   ┊ 55┊        currentUserId: this.currentUser.id,
+┊   ┊ 56┊      })
+┊   ┊ 57┊      .innerJoin('chat.allTimeMembers', 'allTimeMembers2', 'allTimeMembers2.id = :userId', {
+┊   ┊ 58┊        userId: userId,
+┊   ┊ 59┊      })
+┊   ┊ 60┊      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
+┊   ┊ 61┊      .getOne();
+┊   ┊ 62┊
+┊   ┊ 63┊    if (chat) {
+┊   ┊ 64┊      // Chat already exists. Both users are already in the userIds array
+┊   ┊ 65┊      const listingMembers = await this.userProvider
+┊   ┊ 66┊        .createQueryBuilder()
+┊   ┊ 67┊        .innerJoin(
+┊   ┊ 68┊          'user.listingMemberChats',
+┊   ┊ 69┊          'listingMemberChats',
+┊   ┊ 70┊          'listingMemberChats.id = :chatId',
+┊   ┊ 71┊          { chatId: chat.id },
+┊   ┊ 72┊        )
+┊   ┊ 73┊        .getMany();
+┊   ┊ 74┊
+┊   ┊ 75┊      if (!listingMembers.find(user => user.id === this.currentUser.id)) {
+┊   ┊ 76┊        // The chat isn't listed for the current user. Add him to the memberIds
+┊   ┊ 77┊        chat.listingMembers.push(this.currentUser);
+┊   ┊ 78┊        chat = await this.repository.save(chat);
+┊   ┊ 79┊
+┊   ┊ 80┊        return chat || null;
+┊   ┊ 81┊      } else {
+┊   ┊ 82┊        return chat;
+┊   ┊ 83┊      }
+┊   ┊ 84┊    } else {
+┊   ┊ 85┊      // Create the chat
+┊   ┊ 86┊      chat = await this.repository.save(
+┊   ┊ 87┊        new Chat({
+┊   ┊ 88┊          allTimeMembers: [this.currentUser, user],
+┊   ┊ 89┊          // Chat will not be listed to the other user until the first message gets written
+┊   ┊ 90┊          listingMembers: [this.currentUser],
+┊   ┊ 91┊        }),
+┊   ┊ 92┊      );
+┊   ┊ 93┊
+┊   ┊ 94┊      return chat || null;
+┊   ┊ 95┊    }
+┊   ┊ 96┊  }
+┊   ┊ 97┊
 ┊ 41┊ 98┊  async getChatName(chat: Chat) {
 ┊ 42┊ 99┊    if (chat.name) {
 ┊ 43┊100┊      return chat.name
```
```diff
@@ -159,4 +216,55 @@
 ┊159┊216┊
 ┊160┊217┊    return this.currentUser
 ┊161┊218┊  }
+┊   ┊219┊
+┊   ┊220┊  async removeChat(chatId: string) {
+┊   ┊221┊    const chat = await this.createQueryBuilder()
+┊   ┊222┊      .whereInIds(Number(chatId))
+┊   ┊223┊      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
+┊   ┊224┊      .leftJoinAndSelect('chat.owner', 'owner')
+┊   ┊225┊      .getOne();
+┊   ┊226┊
+┊   ┊227┊    if (!chat) {
+┊   ┊228┊      throw new Error(`The chat ${chatId} doesn't exist.`)
+┊   ┊229┊    }
+┊   ┊230┊
+┊   ┊231┊    if (!chat.name) {
+┊   ┊232┊      // Chat
+┊   ┊233┊      if (!chat.listingMembers.find(user => user.id === this.currentUser.id)) {
+┊   ┊234┊        throw new Error(`The user is not a listing member of the chat ${chatId}.`)
+┊   ┊235┊      }
+┊   ┊236┊
+┊   ┊237┊      // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
+┊   ┊238┊      chat.listingMembers = chat.listingMembers.filter(user => user.id !== this.currentUser.id);
+┊   ┊239┊
+┊   ┊240┊      // Check how many members are left
+┊   ┊241┊      if (chat.listingMembers.length === 0) {
+┊   ┊242┊        // Delete the chat
+┊   ┊243┊        await this.repository.remove(chat);
+┊   ┊244┊      } else {
+┊   ┊245┊        // Update the chat
+┊   ┊246┊        await this.repository.save(chat);
+┊   ┊247┊      }
+┊   ┊248┊
+┊   ┊249┊      return chatId;
+┊   ┊250┊    } else {
+┊   ┊251┊      // Group
+┊   ┊252┊
+┊   ┊253┊      // Remove the current user from who gets the group listed. The group will no longer appear in his list
+┊   ┊254┊      chat.listingMembers = chat.listingMembers.filter(user => user.id !== this.currentUser.id);
+┊   ┊255┊
+┊   ┊256┊      // Check how many members (including previous ones who can still access old messages) are left
+┊   ┊257┊      if (chat.listingMembers.length === 0) {
+┊   ┊258┊        // Remove the group
+┊   ┊259┊        await this.repository.remove(chat);
+┊   ┊260┊      } else {
+┊   ┊261┊        // TODO: Implement for group
+┊   ┊262┊        chat.owner = chat.listingMembers[0]
+┊   ┊263┊
+┊   ┊264┊        await this.repository.save(chat);
+┊   ┊265┊      }
+┊   ┊266┊
+┊   ┊267┊      return chatId;
+┊   ┊268┊    }
+┊   ┊269┊  }
 ┊162┊270┊}
```

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -14,6 +14,8 @@
 ┊14┊14┊      name: name || '',
 ┊15┊15┊      picture: picture || '',
 ┊16┊16┊    }),
+┊  ┊17┊    addChat: (obj, { userId }, { injector }) => injector.get(ChatProvider).addChat(userId),
+┊  ┊18┊    removeChat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).removeChat(chatId),
 ┊17┊19┊  },
 ┊18┊20┊  Subscription: {
 ┊19┊21┊    chatUpdated: {
```

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -21,3 +21,8 @@
 ┊21┊21┊  #If null the group is read-only. Null for chats.
 ┊22┊22┊  owner: User
 ┊23┊23┊}
+┊  ┊24┊
+┊  ┊25┊type Mutation {
+┊  ┊26┊  addChat(userId: ID!): Chat
+┊  ┊27┊  removeChat(chatId: ID!): ID
+┊  ┊28┊}
```

##### Changed modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { Injectable } from '@graphql-modules/di'
+┊ ┊2┊import { PubSub } from 'apollo-server-express'
 ┊2┊3┊import { Connection } from 'typeorm'
 ┊3┊4┊import { MessageType } from '../../../db'
 ┊4┊5┊import { Chat } from '../../../entity/chat'
```
```diff
@@ -11,6 +12,7 @@
 ┊11┊12┊@Injectable()
 ┊12┊13┊export class MessageProvider {
 ┊13┊14┊  constructor(
+┊  ┊15┊    private pubsub: PubSub,
 ┊14┊16┊    private connection: Connection,
 ┊15┊17┊    private chatProvider: ChatProvider,
 ┊16┊18┊    private authProvider: AuthProvider,
```
```diff
@@ -24,6 +26,182 @@
 ┊ 24┊ 26┊    return this.connection.createQueryBuilder(Message, 'message')
 ┊ 25┊ 27┊  }
 ┊ 26┊ 28┊
+┊   ┊ 29┊  async addMessage(chatId: string, content: string) {
+┊   ┊ 30┊    if (content === null || content === '') {
+┊   ┊ 31┊      throw new Error(`Cannot add empty or null messages.`);
+┊   ┊ 32┊    }
+┊   ┊ 33┊
+┊   ┊ 34┊    let chat = await this.chatProvider
+┊   ┊ 35┊      .createQueryBuilder()
+┊   ┊ 36┊      .whereInIds(chatId)
+┊   ┊ 37┊      .innerJoinAndSelect('chat.allTimeMembers', 'allTimeMembers')
+┊   ┊ 38┊      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
+┊   ┊ 39┊      .getOne();
+┊   ┊ 40┊
+┊   ┊ 41┊    if (!chat) {
+┊   ┊ 42┊      throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊ 43┊    }
+┊   ┊ 44┊
+┊   ┊ 45┊    let holders: User[];
+┊   ┊ 46┊
+┊   ┊ 47┊    if (!chat.name) {
+┊   ┊ 48┊      // Chat
+┊   ┊ 49┊      if (!chat.listingMembers.map(user => user.id).includes(this.currentUser.id)) {
+┊   ┊ 50┊        throw new Error(`The chat ${chatId} must be listed for the current user in order to add a message.`);
+┊   ┊ 51┊      }
+┊   ┊ 52┊
+┊   ┊ 53┊      // Receiver's user
+┊   ┊ 54┊      const user = chat.allTimeMembers.find(user => user.id !== this.currentUser.id);
+┊   ┊ 55┊
+┊   ┊ 56┊      if (!user) {
+┊   ┊ 57┊        throw new Error(`Cannot find receiver's user.`);
+┊   ┊ 58┊      }
+┊   ┊ 59┊
+┊   ┊ 60┊      if (!chat.listingMembers.find(listingMember => listingMember.id === user.id)) {
+┊   ┊ 61┊        // Chat is not listed for the receiver user. Add him to the listingIds
+┊   ┊ 62┊        chat.listingMembers.push(user);
+┊   ┊ 63┊
+┊   ┊ 64┊        await this.chatProvider.repository.save(chat);
+┊   ┊ 65┊      }
+┊   ┊ 66┊
+┊   ┊ 67┊      holders = chat.listingMembers;
+┊   ┊ 68┊    } else {
+┊   ┊ 69┊      // TODO: Implement for groups
+┊   ┊ 70┊      holders = chat.listingMembers
+┊   ┊ 71┊    }
+┊   ┊ 72┊
+┊   ┊ 73┊    const message = await this.repository.save(new Message({
+┊   ┊ 74┊      chat,
+┊   ┊ 75┊      sender: this.currentUser,
+┊   ┊ 76┊      content,
+┊   ┊ 77┊      type: MessageType.TEXT,
+┊   ┊ 78┊      holders,
+┊   ┊ 79┊    }));
+┊   ┊ 80┊
+┊   ┊ 81┊    this.pubsub.publish('messageAdded', {
+┊   ┊ 82┊      messageAdded: message,
+┊   ┊ 83┊    });
+┊   ┊ 84┊
+┊   ┊ 85┊    return message || null;
+┊   ┊ 86┊  }
+┊   ┊ 87┊
+┊   ┊ 88┊  async _removeMessages(
+┊   ┊ 89┊
+┊   ┊ 90┊    chatId: string,
+┊   ┊ 91┊    {
+┊   ┊ 92┊      messageIds,
+┊   ┊ 93┊      all,
+┊   ┊ 94┊    }: {
+┊   ┊ 95┊      messageIds?: string[]
+┊   ┊ 96┊      all?: boolean
+┊   ┊ 97┊    } = {},
+┊   ┊ 98┊  ) {
+┊   ┊ 99┊    const chat = await this.chatProvider
+┊   ┊100┊      .createQueryBuilder()
+┊   ┊101┊      .whereInIds(chatId)
+┊   ┊102┊      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
+┊   ┊103┊      .innerJoinAndSelect('chat.messages', 'messages')
+┊   ┊104┊      .innerJoinAndSelect('messages.holders', 'holders')
+┊   ┊105┊      .getOne();
+┊   ┊106┊
+┊   ┊107┊    if (!chat) {
+┊   ┊108┊      throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊109┊    }
+┊   ┊110┊
+┊   ┊111┊    if (!chat.listingMembers.find(user => user.id === this.currentUser.id)) {
+┊   ┊112┊      throw new Error(`The chat/group ${chatId} is not listed for the current user so there is nothing to delete.`);
+┊   ┊113┊    }
+┊   ┊114┊
+┊   ┊115┊    if (all && messageIds) {
+┊   ┊116┊      throw new Error(`Cannot specify both 'all' and 'messageIds'.`)
+┊   ┊117┊    }
+┊   ┊118┊
+┊   ┊119┊    if (!all && !(messageIds && messageIds.length)) {
+┊   ┊120┊      throw new Error(`'all' and 'messageIds' cannot be both null`)
+┊   ┊121┊    }
+┊   ┊122┊
+┊   ┊123┊    let deletedIds: string[] = [];
+┊   ┊124┊    let removedMessages: Message[] = [];
+┊   ┊125┊    // Instead of chaining map and filter we can loop once using reduce
+┊   ┊126┊    chat.messages = await chat.messages.reduce<Promise<Message[]>>(async (filtered$, message) => {
+┊   ┊127┊      const filtered = await filtered$;
+┊   ┊128┊
+┊   ┊129┊      if (all || messageIds!.includes(message.id)) {
+┊   ┊130┊        deletedIds.push(message.id);
+┊   ┊131┊        // Remove the current user from the message holders
+┊   ┊132┊        message.holders = message.holders.filter(user => user.id !== this.currentUser.id);
+┊   ┊133┊
+┊   ┊134┊      }
+┊   ┊135┊
+┊   ┊136┊      if (message.holders.length !== 0) {
+┊   ┊137┊        // Remove the current user from the message holders
+┊   ┊138┊        await this.repository.save(message);
+┊   ┊139┊        filtered.push(message);
+┊   ┊140┊      } else {
+┊   ┊141┊        // Message is flagged for removal
+┊   ┊142┊        removedMessages.push(message);
+┊   ┊143┊      }
+┊   ┊144┊
+┊   ┊145┊      return filtered;
+┊   ┊146┊    }, Promise.resolve([]));
+┊   ┊147┊
+┊   ┊148┊    return { deletedIds, removedMessages };
+┊   ┊149┊  }
+┊   ┊150┊
+┊   ┊151┊  async removeMessages(
+┊   ┊152┊
+┊   ┊153┊    chatId: string,
+┊   ┊154┊    {
+┊   ┊155┊      messageIds,
+┊   ┊156┊      all,
+┊   ┊157┊    }: {
+┊   ┊158┊      messageIds?: string[]
+┊   ┊159┊      all?: boolean
+┊   ┊160┊    } = {},
+┊   ┊161┊  ) {
+┊   ┊162┊    const { deletedIds, removedMessages } = await this._removeMessages(chatId, { messageIds, all });
+┊   ┊163┊
+┊   ┊164┊    for (let message of removedMessages) {
+┊   ┊165┊      await this.repository.remove(message);
+┊   ┊166┊    }
+┊   ┊167┊
+┊   ┊168┊    return deletedIds;
+┊   ┊169┊  }
+┊   ┊170┊
+┊   ┊171┊  async _removeChatGetMessages(chatId: string) {
+┊   ┊172┊    let messages = await this.createQueryBuilder()
+┊   ┊173┊      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId })
+┊   ┊174┊      .leftJoinAndSelect('message.holders', 'holders')
+┊   ┊175┊      .getMany();
+┊   ┊176┊
+┊   ┊177┊    messages = messages.map(message => ({
+┊   ┊178┊      ...message,
+┊   ┊179┊      holders: message.holders.filter(user => user.id !== this.currentUser.id),
+┊   ┊180┊    }));
+┊   ┊181┊
+┊   ┊182┊    return messages;
+┊   ┊183┊  }
+┊   ┊184┊
+┊   ┊185┊  async removeChat(chatId: string, messages?: Message[]) {
+┊   ┊186┊    if (!messages) {
+┊   ┊187┊      messages = await this._removeChatGetMessages(chatId);
+┊   ┊188┊    }
+┊   ┊189┊
+┊   ┊190┊    for (let message of messages) {
+┊   ┊191┊      message.holders = message.holders.filter(user => user.id !== this.currentUser.id);
+┊   ┊192┊
+┊   ┊193┊      if (message.holders.length !== 0) {
+┊   ┊194┊        // Remove the current user from the message holders
+┊   ┊195┊        await this.repository.save(message);
+┊   ┊196┊      } else {
+┊   ┊197┊        // Simply remove the message
+┊   ┊198┊        await this.repository.remove(message);
+┊   ┊199┊      }
+┊   ┊200┊    }
+┊   ┊201┊
+┊   ┊202┊    return await this.chatProvider.removeChat(chatId);
+┊   ┊203┊  }
+┊   ┊204┊
 ┊ 27┊205┊  async getMessageSender(message: Message) {
 ┊ 28┊206┊    const sender = await this.userProvider
 ┊ 29┊207┊      .createQueryBuilder()
```

##### Changed modules&#x2F;message&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -8,6 +8,17 @@
 ┊ 8┊ 8┊    // The ordering depends on the messages
 ┊ 9┊ 9┊    chats: (obj, args, { injector }) => injector.get(MessageProvider).getChats(),
 ┊10┊10┊  },
+┊  ┊11┊  Mutation: {
+┊  ┊12┊    addMessage: async (obj, { chatId, content }, { injector }) =>
+┊  ┊13┊      injector.get(MessageProvider).addMessage(chatId, content),
+┊  ┊14┊    removeMessages: async (obj, { chatId, messageIds, all }, { injector }) =>
+┊  ┊15┊      injector.get(MessageProvider).removeMessages(chatId, {
+┊  ┊16┊        messageIds: messageIds || undefined,
+┊  ┊17┊        all: all || false,
+┊  ┊18┊      }),
+┊  ┊19┊    // We may need to also remove the messages
+┊  ┊20┊    removeChat: async (obj, { chatId }, { injector }) => injector.get(MessageProvider).removeChat(chatId),
+┊  ┊21┊  },
 ┊11┊22┊  Chat: {
 ┊12┊23┊    messages: async (chat, { amount }, { injector }) =>
 ┊13┊24┊      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
```

##### Changed modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -23,3 +23,8 @@
 ┊23┊23┊  #Computed property
 ┊24┊24┊  ownership: Boolean!
 ┊25┊25┊}
+┊  ┊26┊
+┊  ┊27┊type Mutation {
+┊  ┊28┊  addMessage(chatId: ID!, content: String!): Message
+┊  ┊29┊  removeMessages(chatId: ID!, messageIds: [ID!], all: Boolean): [ID]!
+┊  ┊30┊}
```

[}]: #

Remember that every change that happens in the back-end should trigger a subscription that will notify all the use regards that change. For the current flow, we should have the following subscriptions:

- `messageAdded` subscription
- `userAdded` subscription
- `userUpdated` subscription - Since we will be able to create a new chat by picking from a users list, this list needs to be synced with the most recent changes.

Let's implement these subscriptions:

[{]: <helper> (diffStep 3.3 module="server")

#### Step 3.3: Add necessary subscriptions

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -18,6 +18,12 @@
 ┊18┊18┊    removeChat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).removeChat(chatId),
 ┊19┊19┊  },
 ┊20┊20┊  Subscription: {
+┊  ┊21┊    chatAdded: {
+┊  ┊22┊      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('chatAdded'),
+┊  ┊23┊        (data: { chatAdded: Chat, creatorId: string }, variables, { injector }: ModuleContext) =>
+┊  ┊24┊          data && injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatAdded, data.creatorId)
+┊  ┊25┊      ),
+┊  ┊26┊    },
 ┊21┊27┊    chatUpdated: {
 ┊22┊28┊      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('chatUpdated'),
 ┊23┊29┊        (data: { chatUpdated: Chat, updaterId: string }, variables, { injector }: ModuleContext) =>
```

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊}
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊type Subscription {
+┊  ┊ 7┊  chatAdded: Chat
 ┊ 7┊ 8┊  chatUpdated: Chat
 ┊ 8┊ 9┊}
 ┊ 9┊10┊
```

##### Changed modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
```diff
@@ -62,6 +62,11 @@
 ┊62┊62┊        chat.listingMembers.push(user);
 ┊63┊63┊
 ┊64┊64┊        await this.chatProvider.repository.save(chat);
+┊  ┊65┊
+┊  ┊66┊        this.pubsub.publish('chatAdded', {
+┊  ┊67┊          creatorId: this.currentUser.id,
+┊  ┊68┊          chatAdded: chat,
+┊  ┊69┊        });
 ┊65┊70┊      }
 ┊66┊71┊
 ┊67┊72┊      holders = chat.listingMembers;
```
```diff
@@ -317,4 +322,18 @@
 ┊317┊322┊
 ┊318┊323┊    return latestMessage ? latestMessage.createdAt : null
 ┊319┊324┊  }
+┊   ┊325┊
+┊   ┊326┊  async filterMessageAdded(messageAdded: Message) {
+┊   ┊327┊    const relevantUsers = (await this.userProvider
+┊   ┊328┊      .createQueryBuilder()
+┊   ┊329┊      .innerJoin(
+┊   ┊330┊        'user.listingMemberChats',
+┊   ┊331┊        'listingMemberChats',
+┊   ┊332┊        'listingMemberChats.id = :chatId',
+┊   ┊333┊        { chatId: messageAdded.chat.id }
+┊   ┊334┊      )
+┊   ┊335┊      .getMany()).filter(user => user.id != messageAdded.sender.id)
+┊   ┊336┊
+┊   ┊337┊    return relevantUsers.some(user => user.id === this.currentUser.id)
+┊   ┊338┊  }
 ┊320┊339┊}
```

##### Changed modules&#x2F;message&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { ModuleContext } from '@graphql-modules/core'
+┊ ┊2┊import { PubSub, withFilter } from 'apollo-server-express'
 ┊2┊3┊import { Message } from '../../../entity/message'
 ┊3┊4┊import { IResolvers } from '../../../types'
 ┊4┊5┊import { MessageProvider } from '../providers/message.provider'
```
```diff
@@ -19,6 +20,13 @@
 ┊19┊20┊    // We may need to also remove the messages
 ┊20┊21┊    removeChat: async (obj, { chatId }, { injector }) => injector.get(MessageProvider).removeChat(chatId),
 ┊21┊22┊  },
+┊  ┊23┊  Subscription: {
+┊  ┊24┊    messageAdded: {
+┊  ┊25┊      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('messageAdded'),
+┊  ┊26┊        (data: { messageAdded: Message }, variables, { injector }: ModuleContext) => data && injector.get(MessageProvider).filterMessageAdded(data.messageAdded)
+┊  ┊27┊      ),
+┊  ┊28┊    },
+┊  ┊29┊  },
 ┊22┊30┊  Chat: {
 ┊23┊31┊    messages: async (chat, { amount }, { injector }) =>
 ┊24┊32┊      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
```

##### Changed modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -1,3 +1,7 @@
+┊ ┊1┊type Subscription {
+┊ ┊2┊  messageAdded: Message
+┊ ┊3┊}
+┊ ┊4┊
 ┊1┊5┊enum MessageType {
 ┊2┊6┊  LOCATION
 ┊3┊7┊  TEXT
```

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { Injectable, ProviderScope } from '@graphql-modules/di'
+┊ ┊2┊import { PubSub } from 'apollo-server-express'
 ┊2┊3┊import cloudinary from 'cloudinary'
 ┊3┊4┊import { Connection } from 'typeorm'
 ┊4┊5┊import { User } from '../../../entity/user'
```
```diff
@@ -6,7 +7,11 @@
 ┊ 6┊ 7┊
 ┊ 7┊ 8┊@Injectable()
 ┊ 8┊ 9┊export class UserProvider {
-┊ 9┊  ┊  constructor(private connection: Connection, private authProvider: AuthProvider) {}
+┊  ┊10┊  constructor(
+┊  ┊11┊    private pubsub: PubSub,
+┊  ┊12┊    private connection: Connection,
+┊  ┊13┊    private authProvider: AuthProvider,
+┊  ┊14┊  ) {}
 ┊10┊15┊
 ┊11┊16┊  public repository = this.connection.getRepository(User)
 ┊12┊17┊  private currentUser = this.authProvider.currentUser
```
```diff
@@ -41,9 +46,17 @@
 ┊41┊46┊
 ┊42┊47┊    await this.repository.save(this.currentUser);
 ┊43┊48┊
+┊  ┊49┊    this.pubsub.publish('userUpdated', {
+┊  ┊50┊      userUpdated: this.currentUser,
+┊  ┊51┊    });
+┊  ┊52┊
 ┊44┊53┊    return this.currentUser;
 ┊45┊54┊  }
 ┊46┊55┊
+┊  ┊56┊  filterUserAddedOrUpdated(userAddedOrUpdated: User) {
+┊  ┊57┊    return userAddedOrUpdated.id !== this.currentUser.id;
+┊  ┊58┊  }
+┊  ┊59┊
 ┊47┊60┊  uploadProfilePic(filePath: string) {
 ┊48┊61┊    return new Promise((resolve, reject) => {
 ┊49┊62┊      cloudinary.v2.uploader.upload(filePath, (error, result) => {
```

##### Changed modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { ModuleContext } from '@graphql-modules/core'
+┊ ┊2┊import { PubSub, withFilter } from 'apollo-server-express'
 ┊2┊3┊import { User } from '../../../entity/User'
 ┊3┊4┊import { IResolvers } from '../../../types'
 ┊4┊5┊import { UserProvider } from '../providers/user.provider'
```
```diff
@@ -14,4 +15,18 @@
 ┊14┊15┊      picture: picture || '',
 ┊15┊16┊    }),
 ┊16┊17┊  },
+┊  ┊18┊  Subscription: {
+┊  ┊19┊    userAdded: {
+┊  ┊20┊      subscribe: withFilter(
+┊  ┊21┊        (root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('userAdded'),
+┊  ┊22┊        (data: { userAdded: User }, variables, { injector }: ModuleContext) => data && injector.get(UserProvider).filterUserAddedOrUpdated(data.userAdded),
+┊  ┊23┊      ),
+┊  ┊24┊    },
+┊  ┊25┊    userUpdated: {
+┊  ┊26┊      subscribe: withFilter(
+┊  ┊27┊        (root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('userAdded'),
+┊  ┊28┊        (data: { userUpdated: User }, variables, { injector }: ModuleContext) => data && injector.get(UserProvider).filterUserAddedOrUpdated(data.userUpdated)
+┊  ┊29┊      ),
+┊  ┊30┊    },
+┊  ┊31┊  },
 ┊17┊32┊} as IResolvers
```

##### Changed modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -7,6 +7,11 @@
 ┊ 7┊ 7┊  updateUser(name: String, picture: String): User!
 ┊ 8┊ 8┊}
 ┊ 9┊ 9┊
+┊  ┊10┊type Subscription {
+┊  ┊11┊  userAdded: User
+┊  ┊12┊  userUpdated: User
+┊  ┊13┊}
+┊  ┊14┊
 ┊10┊15┊type User {
 ┊11┊16┊  id: ID!
 ┊12┊17┊  name: String
```

[}]: #

Now that we have that ready, we will get back to the client and implement the necessary components. We will start with the chat room screen. The layout consists of the following component:

- A navbar - Includes the name and a picture of the person we're chatting with, a "back" button to navigate back to the main screen, and a pop-over menu where we can remove the chat from.
- A messages list - The list of messages that were sent and received in the chat. This will be a scrollable view where message bubbles are colored differently based on who they belong to. Just like WhatsApp!
- A message box - The input that will be used to write the new message. This will include a "send" button right next to it.

Let's implement the components

[{]: <helper> (diffStep 3.1 files="src/components/ChatRoomScreen" module="client")

#### [Step 3.1: Add chat room screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/b2bc092)

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;ChatNavbar.tsx
```diff
@@ -0,0 +1,172 @@
+┊   ┊  1┊import Button from '@material-ui/core/Button'
+┊   ┊  2┊import List from '@material-ui/core/List'
+┊   ┊  3┊import ListItem from '@material-ui/core/ListItem'
+┊   ┊  4┊import Popover from '@material-ui/core/Popover'
+┊   ┊  5┊import ArrowBackIcon from '@material-ui/icons/ArrowBack'
+┊   ┊  6┊import DeleteIcon from '@material-ui/icons/Delete'
+┊   ┊  7┊import MoreIcon from '@material-ui/icons/MoreVert'
+┊   ┊  8┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  9┊import gql from 'graphql-tag'
+┊   ┊ 10┊import { History } from 'history'
+┊   ┊ 11┊import * as React from 'react'
+┊   ┊ 12┊import { useState } from 'react'
+┊   ┊ 13┊import { useQuery, useMutation } from 'react-apollo-hooks'
+┊   ┊ 14┊import styled from 'styled-components'
+┊   ┊ 15┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 16┊import * as queries from '../../graphql/queries'
+┊   ┊ 17┊import { ChatNavbarMutation, ChatNavbarQuery, Chats } from '../../graphql/types'
+┊   ┊ 18┊
+┊   ┊ 19┊const Style = styled.div`
+┊   ┊ 20┊  padding: 0;
+┊   ┊ 21┊  display: flex;
+┊   ┊ 22┊  flex-direction: row;
+┊   ┊ 23┊
+┊   ┊ 24┊  margin-left: -20px;
+┊   ┊ 25┊  .ChatNavbar-title {
+┊   ┊ 26┊    line-height: 56px;
+┊   ┊ 27┊  }
+┊   ┊ 28┊
+┊   ┊ 29┊  .ChatNavbar-back-button {
+┊   ┊ 30┊    color: var(--primary-text);
+┊   ┊ 31┊  }
+┊   ┊ 32┊
+┊   ┊ 33┊  .ChatNavbar-picture {
+┊   ┊ 34┊    height: 40px;
+┊   ┊ 35┊    width: 40px;
+┊   ┊ 36┊    margin-top: 3px;
+┊   ┊ 37┊    margin-left: -22px;
+┊   ┊ 38┊    object-fit: cover;
+┊   ┊ 39┊    padding: 5px;
+┊   ┊ 40┊    border-radius: 50%;
+┊   ┊ 41┊  }
+┊   ┊ 42┊
+┊   ┊ 43┊  .ChatNavbar-rest {
+┊   ┊ 44┊    flex: 1;
+┊   ┊ 45┊    justify-content: flex-end;
+┊   ┊ 46┊  }
+┊   ┊ 47┊
+┊   ┊ 48┊  .ChatNavbar-options-btn {
+┊   ┊ 49┊    float: right;
+┊   ┊ 50┊    height: 100%;
+┊   ┊ 51┊    font-size: 1.2em;
+┊   ┊ 52┊    margin-right: -15px;
+┊   ┊ 53┊    color: var(--primary-text);
+┊   ┊ 54┊  }
+┊   ┊ 55┊
+┊   ┊ 56┊  .ChatNavbar-options-item svg {
+┊   ┊ 57┊    margin-right: 10px;
+┊   ┊ 58┊    padding-left: 15px;
+┊   ┊ 59┊  }
+┊   ┊ 60┊`
+┊   ┊ 61┊
+┊   ┊ 62┊const query = gql`
+┊   ┊ 63┊  query ChatNavbarQuery($chatId: ID!) {
+┊   ┊ 64┊    chat(chatId: $chatId) {
+┊   ┊ 65┊      ...Chat
+┊   ┊ 66┊    }
+┊   ┊ 67┊  }
+┊   ┊ 68┊  ${fragments.chat}
+┊   ┊ 69┊`
+┊   ┊ 70┊
+┊   ┊ 71┊const mutation = gql`
+┊   ┊ 72┊  mutation ChatNavbarMutation($chatId: ID!) {
+┊   ┊ 73┊    removeChat(chatId: $chatId)
+┊   ┊ 74┊  }
+┊   ┊ 75┊`
+┊   ┊ 76┊
+┊   ┊ 77┊interface ChatNavbarProps {
+┊   ┊ 78┊  chatId: string
+┊   ┊ 79┊  history: History
+┊   ┊ 80┊}
+┊   ┊ 81┊
+┊   ┊ 82┊export default ({ chatId, history }: ChatNavbarProps) => {
+┊   ┊ 83┊  const {
+┊   ┊ 84┊    data: { chat },
+┊   ┊ 85┊  } = useQuery<ChatNavbarQuery.Query, ChatNavbarQuery.Variables>(query, {
+┊   ┊ 86┊    variables: { chatId },
+┊   ┊ 87┊    suspend: true,
+┊   ┊ 88┊  })
+┊   ┊ 89┊  const removeChat = useMutation<ChatNavbarMutation.Mutation, ChatNavbarMutation.Variables>(
+┊   ┊ 90┊    mutation,
+┊   ┊ 91┊    {
+┊   ┊ 92┊      variables: { chatId },
+┊   ┊ 93┊      update: (client, { data: { removeChat } }) => {
+┊   ┊ 94┊        client.writeFragment({
+┊   ┊ 95┊          id: defaultDataIdFromObject({
+┊   ┊ 96┊            __typename: 'Chat',
+┊   ┊ 97┊            id: removeChat,
+┊   ┊ 98┊          }),
+┊   ┊ 99┊          fragment: fragments.chat,
+┊   ┊100┊          fragmentName: 'Chat',
+┊   ┊101┊          data: null,
+┊   ┊102┊        })
+┊   ┊103┊
+┊   ┊104┊        let chats
+┊   ┊105┊        try {
+┊   ┊106┊          chats = client.readQuery<Chats.Query>({
+┊   ┊107┊            query: queries.chats,
+┊   ┊108┊          }).chats
+┊   ┊109┊        } catch (e) {}
+┊   ┊110┊
+┊   ┊111┊        if (chats && chats.some(chat => chat.id === removeChat)) {
+┊   ┊112┊          const index = chats.findIndex(chat => chat.id === removeChat)
+┊   ┊113┊          chats.splice(index, 1)
+┊   ┊114┊
+┊   ┊115┊          client.writeQuery({
+┊   ┊116┊            query: queries.chats,
+┊   ┊117┊            data: { chats },
+┊   ┊118┊          })
+┊   ┊119┊        }
+┊   ┊120┊      },
+┊   ┊121┊    },
+┊   ┊122┊  )
+┊   ┊123┊  const [popped, setPopped] = useState(false)
+┊   ┊124┊
+┊   ┊125┊  const navToChats = () => {
+┊   ┊126┊    history.push('/chats')
+┊   ┊127┊  }
+┊   ┊128┊
+┊   ┊129┊  const handleRemoveChat = () => {
+┊   ┊130┊    setPopped(false)
+┊   ┊131┊    removeChat().then(navToChats)
+┊   ┊132┊  }
+┊   ┊133┊
+┊   ┊134┊  return (
+┊   ┊135┊    <Style className={name}>
+┊   ┊136┊      <Button className="ChatNavbar-back-button" onClick={navToChats}>
+┊   ┊137┊        <ArrowBackIcon />
+┊   ┊138┊      </Button>
+┊   ┊139┊      <img
+┊   ┊140┊        className="ChatNavbar-picture"
+┊   ┊141┊        src={chat.picture || '/assets/default-profile-pic.jpg'}
+┊   ┊142┊      />
+┊   ┊143┊      <div className="ChatNavbar-title">{chat.name}</div>
+┊   ┊144┊      <div className="ChatNavbar-rest">
+┊   ┊145┊        <Button className="ChatNavbar-options-btn" onClick={setPopped.bind(null, true)}>
+┊   ┊146┊          <MoreIcon />
+┊   ┊147┊        </Button>
+┊   ┊148┊      </div>
+┊   ┊149┊      <Popover
+┊   ┊150┊        open={popped}
+┊   ┊151┊        onClose={setPopped.bind(null, false)}
+┊   ┊152┊        anchorOrigin={{
+┊   ┊153┊          vertical: 'top',
+┊   ┊154┊          horizontal: 'right',
+┊   ┊155┊        }}
+┊   ┊156┊        transformOrigin={{
+┊   ┊157┊          vertical: 'top',
+┊   ┊158┊          horizontal: 'right',
+┊   ┊159┊        }}
+┊   ┊160┊      >
+┊   ┊161┊        <Style style={{ marginLeft: '-15px' }}>
+┊   ┊162┊          <List>
+┊   ┊163┊            <ListItem className="ChatNavbar-options-item" button onClick={handleRemoveChat}>
+┊   ┊164┊              <DeleteIcon />
+┊   ┊165┊              Delete
+┊   ┊166┊            </ListItem>
+┊   ┊167┊          </List>
+┊   ┊168┊        </Style>
+┊   ┊169┊      </Popover>
+┊   ┊170┊    </Style>
+┊   ┊171┊  )
+┊   ┊172┊}
```

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;MessageBox.tsx
```diff
@@ -0,0 +1,162 @@
+┊   ┊  1┊import Button from '@material-ui/core/Button'
+┊   ┊  2┊import SendIcon from '@material-ui/icons/Send'
+┊   ┊  3┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  4┊import gql from 'graphql-tag'
+┊   ┊  5┊import * as React from 'react'
+┊   ┊  6┊import { useState } from 'react'
+┊   ┊  7┊import { useMutation } from 'react-apollo-hooks'
+┊   ┊  8┊import styled from 'styled-components'
+┊   ┊  9┊import { time as uniqid } from 'uniqid'
+┊   ┊ 10┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 11┊import { MessageBoxMutation, FullChat, Message } from '../../graphql/types'
+┊   ┊ 12┊import { useMe } from '../../services/auth.service'
+┊   ┊ 13┊
+┊   ┊ 14┊const Style = styled.div`
+┊   ┊ 15┊  display: flex;
+┊   ┊ 16┊  height: 50px;
+┊   ┊ 17┊  padding: 5px;
+┊   ┊ 18┊  width: calc(100% - 10px);
+┊   ┊ 19┊
+┊   ┊ 20┊  .MessageBox-input {
+┊   ┊ 21┊    width: calc(100% - 50px);
+┊   ┊ 22┊    border: none;
+┊   ┊ 23┊    border-radius: 999px;
+┊   ┊ 24┊    padding: 10px;
+┊   ┊ 25┊    padding-left: 20px;
+┊   ┊ 26┊    padding-right: 20px;
+┊   ┊ 27┊    font-size: 15px;
+┊   ┊ 28┊    outline: none;
+┊   ┊ 29┊    box-shadow: 0 1px silver;
+┊   ┊ 30┊    font-size: 18px;
+┊   ┊ 31┊    line-height: 45px;
+┊   ┊ 32┊  }
+┊   ┊ 33┊
+┊   ┊ 34┊  .MessageBox-button {
+┊   ┊ 35┊    min-width: 50px;
+┊   ┊ 36┊    width: 50px;
+┊   ┊ 37┊    border-radius: 999px;
+┊   ┊ 38┊    background-color: var(--primary-bg);
+┊   ┊ 39┊    margin: 0 5px;
+┊   ┊ 40┊    margin-right: 0;
+┊   ┊ 41┊    color: white;
+┊   ┊ 42┊    padding-left: 20px;
+┊   ┊ 43┊    svg {
+┊   ┊ 44┊      margin-left: -3px;
+┊   ┊ 45┊    }
+┊   ┊ 46┊  }
+┊   ┊ 47┊`
+┊   ┊ 48┊
+┊   ┊ 49┊const mutation = gql`
+┊   ┊ 50┊  mutation MessageBoxMutation($chatId: ID!, $content: String!) {
+┊   ┊ 51┊    addMessage(chatId: $chatId, content: $content) {
+┊   ┊ 52┊      ...Message
+┊   ┊ 53┊    }
+┊   ┊ 54┊  }
+┊   ┊ 55┊  ${fragments.message}
+┊   ┊ 56┊`
+┊   ┊ 57┊
+┊   ┊ 58┊interface MessageBoxProps {
+┊   ┊ 59┊  chatId: string
+┊   ┊ 60┊}
+┊   ┊ 61┊
+┊   ┊ 62┊export default ({ chatId }: MessageBoxProps) => {
+┊   ┊ 63┊  const [message, setMessage] = useState('')
+┊   ┊ 64┊  const me = useMe()
+┊   ┊ 65┊
+┊   ┊ 66┊  const addMessage = useMutation<MessageBoxMutation.Mutation, MessageBoxMutation.Variables>(
+┊   ┊ 67┊    mutation,
+┊   ┊ 68┊    {
+┊   ┊ 69┊      variables: {
+┊   ┊ 70┊        chatId,
+┊   ┊ 71┊        content: message,
+┊   ┊ 72┊      },
+┊   ┊ 73┊      optimisticResponse: {
+┊   ┊ 74┊        __typename: 'Mutation',
+┊   ┊ 75┊        addMessage: {
+┊   ┊ 76┊          id: uniqid(),
+┊   ┊ 77┊          __typename: 'Message',
+┊   ┊ 78┊          chat: {
+┊   ┊ 79┊            id: chatId,
+┊   ┊ 80┊            __typename: 'Chat',
+┊   ┊ 81┊          },
+┊   ┊ 82┊          sender: {
+┊   ┊ 83┊            id: me.id,
+┊   ┊ 84┊            __typename: 'User',
+┊   ┊ 85┊            name: me.name,
+┊   ┊ 86┊          },
+┊   ┊ 87┊          content: message,
+┊   ┊ 88┊          createdAt: new Date(),
+┊   ┊ 89┊          type: 0,
+┊   ┊ 90┊          recipients: [],
+┊   ┊ 91┊          ownership: true,
+┊   ┊ 92┊        },
+┊   ┊ 93┊      },
+┊   ┊ 94┊      update: (client, { data: { addMessage } }) => {
+┊   ┊ 95┊        client.writeFragment({
+┊   ┊ 96┊          id: defaultDataIdFromObject(addMessage),
+┊   ┊ 97┊          fragment: fragments.message,
+┊   ┊ 98┊          data: addMessage,
+┊   ┊ 99┊        })
+┊   ┊100┊
+┊   ┊101┊        let fullChat
+┊   ┊102┊        try {
+┊   ┊103┊          fullChat = client.readFragment<FullChat.Fragment>({
+┊   ┊104┊            id: defaultDataIdFromObject(addMessage.chat),
+┊   ┊105┊            fragment: fragments.fullChat,
+┊   ┊106┊            fragmentName: 'FullChat',
+┊   ┊107┊          })
+┊   ┊108┊        } catch (e) {}
+┊   ┊109┊
+┊   ┊110┊        if (fullChat && !fullChat.messages.some(message => message.id === addMessage.id)) {
+┊   ┊111┊          fullChat.messages.push(addMessage)
+┊   ┊112┊          fullChat.lastMessage = addMessage
+┊   ┊113┊
+┊   ┊114┊          client.writeFragment({
+┊   ┊115┊            id: defaultDataIdFromObject(addMessage.chat),
+┊   ┊116┊            fragment: fragments.fullChat,
+┊   ┊117┊            fragmentName: 'FullChat',
+┊   ┊118┊            data: fullChat,
+┊   ┊119┊          })
+┊   ┊120┊        }
+┊   ┊121┊      },
+┊   ┊122┊    },
+┊   ┊123┊  )
+┊   ┊124┊
+┊   ┊125┊  const onKeyPress = e => {
+┊   ┊126┊    if (e.charCode === 13) {
+┊   ┊127┊      submitMessage()
+┊   ┊128┊    }
+┊   ┊129┊  }
+┊   ┊130┊
+┊   ┊131┊  const onChange = ({ target }) => {
+┊   ┊132┊    setMessage(target.value)
+┊   ┊133┊  }
+┊   ┊134┊
+┊   ┊135┊  const submitMessage = () => {
+┊   ┊136┊    if (!message) return
+┊   ┊137┊
+┊   ┊138┊    addMessage()
+┊   ┊139┊    setMessage('')
+┊   ┊140┊  }
+┊   ┊141┊
+┊   ┊142┊  return (
+┊   ┊143┊    <Style className="MessageBox">
+┊   ┊144┊      <input
+┊   ┊145┊        className="MessageBox-input"
+┊   ┊146┊        type="text"
+┊   ┊147┊        placeholder="Type a message"
+┊   ┊148┊        value={message}
+┊   ┊149┊        onKeyPress={onKeyPress}
+┊   ┊150┊        onChange={onChange}
+┊   ┊151┊      />
+┊   ┊152┊      <Button
+┊   ┊153┊        variant="contained"
+┊   ┊154┊        color="primary"
+┊   ┊155┊        className="MessageBox-button"
+┊   ┊156┊        onClick={submitMessage}
+┊   ┊157┊      >
+┊   ┊158┊        <SendIcon />
+┊   ┊159┊      </Button>
+┊   ┊160┊    </Style>
+┊   ┊161┊  )
+┊   ┊162┊}
```

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;MessagesList.tsx
```diff
@@ -0,0 +1,144 @@
+┊   ┊  1┊import gql from 'graphql-tag'
+┊   ┊  2┊import * as moment from 'moment'
+┊   ┊  3┊import * as React from 'react'
+┊   ┊  4┊import { useRef, useEffect } from 'react'
+┊   ┊  5┊import { useQuery, useMutation } from 'react-apollo-hooks'
+┊   ┊  6┊import * as ReactDOM from 'react-dom'
+┊   ┊  7┊import styled from 'styled-components'
+┊   ┊  8┊import * as fragments from '../../graphql/fragments'
+┊   ┊  9┊import { MessagesListQuery } from '../../graphql/types'
+┊   ┊ 10┊
+┊   ┊ 11┊const Style = styled.div`
+┊   ┊ 12┊  display: block;
+┊   ┊ 13┊  height: calc(100% - 60px);
+┊   ┊ 14┊  width: calc(100% - 30px);
+┊   ┊ 15┊  overflow-y: overlay;
+┊   ┊ 16┊  padding: 0 15px;
+┊   ┊ 17┊
+┊   ┊ 18┊  .MessagesList-message {
+┊   ┊ 19┊    display: inline-block;
+┊   ┊ 20┊    position: relative;
+┊   ┊ 21┊    max-width: 100%;
+┊   ┊ 22┊    border-radius: 7px;
+┊   ┊ 23┊    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
+┊   ┊ 24┊    margin-top: 10px;
+┊   ┊ 25┊    margin-bottom: 10px;
+┊   ┊ 26┊    clear: both;
+┊   ┊ 27┊
+┊   ┊ 28┊    &::after {
+┊   ┊ 29┊      content: '';
+┊   ┊ 30┊      display: table;
+┊   ┊ 31┊      clear: both;
+┊   ┊ 32┊    }
+┊   ┊ 33┊  }
+┊   ┊ 34┊
+┊   ┊ 35┊  .MessagesList-message-mine {
+┊   ┊ 36┊    float: right;
+┊   ┊ 37┊    background-color: #dcf8c6;
+┊   ┊ 38┊
+┊   ┊ 39┊    &::before {
+┊   ┊ 40┊      right: -11px;
+┊   ┊ 41┊      background-image: url(/assets/message-mine.png);
+┊   ┊ 42┊    }
+┊   ┊ 43┊  }
+┊   ┊ 44┊
+┊   ┊ 45┊  .MessagesList-message-others {
+┊   ┊ 46┊    float: left;
+┊   ┊ 47┊    background-color: #fff;
+┊   ┊ 48┊
+┊   ┊ 49┊    &::before {
+┊   ┊ 50┊      left: -11px;
+┊   ┊ 51┊      background-image: url(/assets/message-other.png);
+┊   ┊ 52┊    }
+┊   ┊ 53┊  }
+┊   ┊ 54┊
+┊   ┊ 55┊  .MessagesList-message-others::before,
+┊   ┊ 56┊  .MessagesList-message-mine::before {
+┊   ┊ 57┊    content: '';
+┊   ┊ 58┊    position: absolute;
+┊   ┊ 59┊    bottom: 3px;
+┊   ┊ 60┊    width: 12px;
+┊   ┊ 61┊    height: 19px;
+┊   ┊ 62┊    background-position: 50% 50%;
+┊   ┊ 63┊    background-repeat: no-repeat;
+┊   ┊ 64┊    background-size: contain;
+┊   ┊ 65┊  }
+┊   ┊ 66┊
+┊   ┊ 67┊  .MessagesList-message-sender {
+┊   ┊ 68┊    font-weight: bold;
+┊   ┊ 69┊    margin-left: 5px;
+┊   ┊ 70┊    margin-top: 5px;
+┊   ┊ 71┊  }
+┊   ┊ 72┊
+┊   ┊ 73┊  .MessagesList-message-contents {
+┊   ┊ 74┊    padding: 5px 7px;
+┊   ┊ 75┊    word-wrap: break-word;
+┊   ┊ 76┊
+┊   ┊ 77┊    &::after {
+┊   ┊ 78┊      content: ' \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0';
+┊   ┊ 79┊      display: inline;
+┊   ┊ 80┊    }
+┊   ┊ 81┊  }
+┊   ┊ 82┊
+┊   ┊ 83┊  .MessagesList-message-timestamp {
+┊   ┊ 84┊    position: absolute;
+┊   ┊ 85┊    bottom: 2px;
+┊   ┊ 86┊    right: 7px;
+┊   ┊ 87┊    color: gray;
+┊   ┊ 88┊    font-size: 12px;
+┊   ┊ 89┊  }
+┊   ┊ 90┊`
+┊   ┊ 91┊
+┊   ┊ 92┊const query = gql`
+┊   ┊ 93┊  query MessagesListQuery($chatId: ID!) {
+┊   ┊ 94┊    chat(chatId: $chatId) {
+┊   ┊ 95┊      ...FullChat
+┊   ┊ 96┊    }
+┊   ┊ 97┊  }
+┊   ┊ 98┊  ${fragments.fullChat}
+┊   ┊ 99┊`
+┊   ┊100┊
+┊   ┊101┊interface MessagesListProps {
+┊   ┊102┊  chatId: string
+┊   ┊103┊}
+┊   ┊104┊
+┊   ┊105┊export default ({ chatId }: MessagesListProps) => {
+┊   ┊106┊  const {
+┊   ┊107┊    data: {
+┊   ┊108┊      chat: { messages },
+┊   ┊109┊    },
+┊   ┊110┊  } = useQuery<MessagesListQuery.Query, MessagesListQuery.Variables>(query, {
+┊   ┊111┊    variables: { chatId },
+┊   ┊112┊    suspend: true,
+┊   ┊113┊  })
+┊   ┊114┊  const selfRef = useRef(null)
+┊   ┊115┊
+┊   ┊116┊  const resetScrollTop = () => {
+┊   ┊117┊    if (!selfRef.current) return
+┊   ┊118┊
+┊   ┊119┊    const selfDOMNode = ReactDOM.findDOMNode(selfRef.current) as HTMLElement
+┊   ┊120┊    selfDOMNode.scrollTop = Number.MAX_SAFE_INTEGER
+┊   ┊121┊  }
+┊   ┊122┊
+┊   ┊123┊  useEffect(resetScrollTop, [selfRef.current])
+┊   ┊124┊  useEffect(resetScrollTop, [messages.length])
+┊   ┊125┊
+┊   ┊126┊  return (
+┊   ┊127┊    <Style className={name} ref={selfRef}>
+┊   ┊128┊      {messages &&
+┊   ┊129┊        messages.map(message => (
+┊   ┊130┊          <div
+┊   ┊131┊            key={message.id}
+┊   ┊132┊            className={`MessagesList-message ${
+┊   ┊133┊              message.ownership ? 'MessagesList-message-mine' : 'MessagesList-message-others'
+┊   ┊134┊            }`}
+┊   ┊135┊          >
+┊   ┊136┊            <div className="MessagesList-message-contents">{message.content}</div>
+┊   ┊137┊            <span className="MessagesList-message-timestamp">
+┊   ┊138┊              {moment(message.createdAt).format('HH:mm')}
+┊   ┊139┊            </span>
+┊   ┊140┊          </div>
+┊   ┊141┊        ))}
+┊   ┊142┊    </Style>
+┊   ┊143┊  )
+┊   ┊144┊}
```

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,56 @@
+┊  ┊ 1┊import * as React from 'react'
+┊  ┊ 2┊import { Suspense } from 'react'
+┊  ┊ 3┊import { RouteComponentProps } from 'react-router-dom'
+┊  ┊ 4┊import styled from 'styled-components'
+┊  ┊ 5┊import Navbar from '../Navbar'
+┊  ┊ 6┊import ChatNavbar from './ChatNavbar'
+┊  ┊ 7┊import MessageBox from './MessageBox'
+┊  ┊ 8┊import MessagesList from './MessagesList'
+┊  ┊ 9┊
+┊  ┊10┊const Style = styled.div`
+┊  ┊11┊  .ChatScreen-body {
+┊  ┊12┊    position: relative;
+┊  ┊13┊    background: url(/assets/chat-background.jpg);
+┊  ┊14┊    width: 100%;
+┊  ┊15┊    height: calc(100% - 56px);
+┊  ┊16┊
+┊  ┊17┊    .MessagesList {
+┊  ┊18┊      position: absolute;
+┊  ┊19┊      height: calc(100% - 60px);
+┊  ┊20┊      top: 0;
+┊  ┊21┊    }
+┊  ┊22┊
+┊  ┊23┊    .MessageBox {
+┊  ┊24┊      position: absolute;
+┊  ┊25┊      bottom: 0;
+┊  ┊26┊      left: 0;
+┊  ┊27┊    }
+┊  ┊28┊
+┊  ┊29┊    .AddChatButton {
+┊  ┊30┊      right: 0;
+┊  ┊31┊      bottom: 0;
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊`
+┊  ┊35┊
+┊  ┊36┊export default ({ match, history }: RouteComponentProps) => {
+┊  ┊37┊  const chatId = match.params.chatId
+┊  ┊38┊
+┊  ┊39┊  return (
+┊  ┊40┊    <Style className="ChatScreen Screen">
+┊  ┊41┊      <Navbar>
+┊  ┊42┊        <Suspense fallback={null}>
+┊  ┊43┊          <ChatNavbar chatId={chatId} history={history} />
+┊  ┊44┊        </Suspense>
+┊  ┊45┊      </Navbar>
+┊  ┊46┊      <div className="ChatScreen-body">
+┊  ┊47┊        <Suspense fallback={null}>
+┊  ┊48┊          <MessagesList chatId={chatId} />
+┊  ┊49┊        </Suspense>
+┊  ┊50┊        <Suspense fallback={null}>
+┊  ┊51┊          <MessageBox chatId={chatId} />
+┊  ┊52┊        </Suspense>
+┊  ┊53┊      </div>
+┊  ┊54┊    </Style>
+┊  ┊55┊  )
+┊  ┊56┊}
```

[}]: #

We're introduced to new 2 packages in the implementation above:

- [`uniqid`](https://www.npmjs.com/package/uniqid) - Used to generate a unique ID in our optimistic response.
- [`styled-components`](https://www.npmjs.com/package/styled-components) - Used to create encapsulated style for React components.

Let's install them then:

    $ yarn add uniqid@5.0.3 styled-components@4.1.3

You'll notice that there's a new fragment called `fullChat`. The full chat includes the base chat details, plus a list of messages that we're gonna view in the chat room screen. Let's define the fragment then:

[{]: <helper> (diffStep 3.1 files="src/graphql/fragments" module="client")

#### [Step 3.1: Add chat room screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/b2bc092)

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;fullChat.fragment.ts
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import chat from './chat.fragment'
+┊  ┊ 3┊import message from './message.fragment'
+┊  ┊ 4┊
+┊  ┊ 5┊export default gql `
+┊  ┊ 6┊  fragment FullChat on Chat {
+┊  ┊ 7┊    ...Chat
+┊  ┊ 8┊    messages {
+┊  ┊ 9┊      ...Message
+┊  ┊10┊    }
+┊  ┊11┊  }
+┊  ┊12┊  ${chat}
+┊  ┊13┊  ${message}
+┊  ┊14┊`
```

##### Changed src&#x2F;graphql&#x2F;fragments&#x2F;index.ts
```diff
@@ -1,3 +1,4 @@
 ┊1┊1┊export { default as chat } from './chat.fragment'
+┊ ┊2┊export { default as fullChat } from './fullChat.fragment'
 ┊2┊3┊export { default as message } from './message.fragment'
 ┊3┊4┊export { default as user } from './user.fragment'
```

[}]: #

At this point the chat room should be functional. Let's add a dedicated route for it and make it navigatable by clicking on a chat item from the chats list screen:

[{]: <helper> (diffStep 3.1 files="src/App, src/components/ChatsListScreen" module="client")

#### [Step 3.1: Add chat room screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/b2bc092)

##### Changed src&#x2F;App.tsx
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊import * as React from 'react'
 ┊2┊2┊import { BrowserRouter, Route, Redirect } from 'react-router-dom'
+┊ ┊3┊import ChatRoomScreen from './components/ChatRoomScreen'
 ┊3┊4┊import AnimatedSwitch from './components/AnimatedSwitch'
 ┊4┊5┊import AuthScreen from './components/AuthScreen'
 ┊5┊6┊import ChatsListScreen from './components/ChatsListScreen'
```
```diff
@@ -16,6 +17,7 @@
 ┊16┊17┊      <Route exact path="/sign-(in|up)" component={AuthScreen} />
 ┊17┊18┊      <Route exact path="/chats" component={withAuth(ChatsListScreen)} />
 ┊18┊19┊      <Route exact path="/settings" component={withAuth(SettingsScreen)} />
+┊  ┊20┊      <Route exact path="/chats/:chatId" component={withAuth(ChatRoomScreen)} />
 ┊19┊21┊      <Route component={RedirectToChats} />
 ┊20┊22┊    </AnimatedSwitch>
 ┊21┊23┊  </BrowserRouter>
```

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsList.tsx
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import List from '@material-ui/core/List'
 ┊2┊2┊import ListItem from '@material-ui/core/ListItem'
 ┊3┊3┊import gql from 'graphql-tag'
+┊ ┊4┊import { History } from 'history'
 ┊4┊5┊import * as moment from 'moment'
 ┊5┊6┊import * as React from 'react'
 ┊6┊7┊import { useQuery } from 'react-apollo-hooks'
```
```diff
@@ -71,11 +72,19 @@
 ┊71┊72┊  ${fragments.chat}
 ┊72┊73┊`
 ┊73┊74┊
-┊74┊  ┊export default () => {
+┊  ┊75┊interface ChatsListProps {
+┊  ┊76┊  history: History
+┊  ┊77┊}
+┊  ┊78┊
+┊  ┊79┊export default ({ history }: ChatsListProps) => {
 ┊75┊80┊  const {
 ┊76┊81┊    data: { chats },
 ┊77┊82┊  } = useQuery<ChatsListQuery.Query>(query, { suspend: true })
 ┊78┊83┊
+┊  ┊84┊  const navToChat = chatId => {
+┊  ┊85┊    history.push(`chats/${chatId}`)
+┊  ┊86┊  }
+┊  ┊87┊
 ┊79┊88┊  return (
 ┊80┊89┊    <Style className="ChatsList">
 ┊81┊90┊      <List className="ChatsList-chats-list">
```
```diff
@@ -84,6 +93,7 @@
 ┊84┊93┊            key={chat.id}
 ┊85┊94┊            className="ChatsList-chat-item"
 ┊86┊95┊            button
+┊  ┊96┊            onClick={navToChat.bind(null, chat.id)}
 ┊87┊97┊          >
 ┊88┊98┊            <img
 ┊89┊99┊              className="ChatsList-profile-pic"
```

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
```diff
@@ -11,7 +11,7 @@
 ┊11┊11┊      <ChatsNavbar history={history} />
 ┊12┊12┊    </Navbar>
 ┊13┊13┊    <Suspense fallback={null}>
-┊14┊  ┊      <ChatsList />
+┊  ┊14┊      <ChatsList history={history} />
 ┊15┊15┊    </Suspense>
 ┊16┊16┊  </div>
 ┊17┊17┊)
```

[}]: #

Like we said in the previous step, everything in our application is connected and so whenever there's a mutation or a change in data we should update the cache. Let's define the right subscriptions and update our `cache.service`:

[{]: <helper> (diffStep 3.1 files="src/graphql/subscriptions, src/services/cache" module="client")

#### [Step 3.1: Add chat room screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/b2bc092)

##### Changed src&#x2F;graphql&#x2F;subscriptions&#x2F;index.ts
```diff
@@ -1 +1,2 @@
 ┊1┊1┊export { default as chatUpdated } from './chatUpdated.subscription'
+┊ ┊2┊export { default as messageAdded } from './messageAdded.subscription'
```

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;messageAdded.subscription.ts
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import * as fragments from '../fragments'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  subscription MessageAdded {
+┊  ┊ 6┊    messageAdded {
+┊  ┊ 7┊      ...Message
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊  ${fragments.message}
+┊  ┊11┊`
```

##### Changed src&#x2F;services&#x2F;cache.service.tsx
```diff
@@ -1,7 +1,8 @@
 ┊1┊1┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
 ┊2┊2┊import * as fragments from '../graphql/fragments'
 ┊3┊3┊import * as subscriptions from '../graphql/subscriptions'
-┊4┊ ┊import { ChatUpdated } from '../graphql/types'
+┊ ┊4┊import * as queries from '../graphql/queries'
+┊ ┊5┊import { ChatUpdated, MessageAdded, Message, Chats, FullChat } from '../graphql/types'
 ┊5┊6┊import { useSubscription } from '../polyfills/react-apollo-hooks'
 ┊6┊7┊
 ┊7┊8┊export const useSubscriptions = () => {
```
```diff
@@ -15,4 +16,55 @@
 ┊15┊16┊      })
 ┊16┊17┊    },
 ┊17┊18┊  })
+┊  ┊19┊
+┊  ┊20┊  useSubscription<MessageAdded.Subscription>(subscriptions.messageAdded, {
+┊  ┊21┊    onSubscriptionData: ({ client, subscriptionData: { messageAdded } }) => {
+┊  ┊22┊      client.writeFragment<Message.Fragment>({
+┊  ┊23┊        id: defaultDataIdFromObject(messageAdded),
+┊  ┊24┊        fragment: fragments.message,
+┊  ┊25┊        data: messageAdded,
+┊  ┊26┊      })
+┊  ┊27┊
+┊  ┊28┊      let fullChat
+┊  ┊29┊      try {
+┊  ┊30┊        fullChat = client.readFragment<FullChat.Fragment>({
+┊  ┊31┊          id: defaultDataIdFromObject(messageAdded.chat),
+┊  ┊32┊          fragment: fragments.fullChat,
+┊  ┊33┊          fragmentName: 'FullChat',
+┊  ┊34┊        })
+┊  ┊35┊      } catch (e) {}
+┊  ┊36┊
+┊  ┊37┊      if (fullChat && !fullChat.messages.some(message => message.id === messageAdded.id)) {
+┊  ┊38┊        fullChat.messages.push(messageAdded)
+┊  ┊39┊        fullChat.lastMessage = messageAdded
+┊  ┊40┊
+┊  ┊41┊        client.writeFragment({
+┊  ┊42┊          id: defaultDataIdFromObject(fullChat),
+┊  ┊43┊          fragment: fragments.fullChat,
+┊  ┊44┊          fragmentName: 'FullChat',
+┊  ┊45┊          data: fullChat,
+┊  ┊46┊        })
+┊  ┊47┊      }
+┊  ┊48┊
+┊  ┊49┊      let chats
+┊  ┊50┊      try {
+┊  ┊51┊        chats = client.readQuery<Chats.Query>({
+┊  ┊52┊          query: queries.chats,
+┊  ┊53┊        }).chats
+┊  ┊54┊      } catch (e) {}
+┊  ┊55┊
+┊  ┊56┊      if (chats) {
+┊  ┊57┊        const index = chats.findIndex(chat => chat.id === messageAdded.chat.id)
+┊  ┊58┊        const chat = chats[index]
+┊  ┊59┊        chat.lastMessage = messageAdded
+┊  ┊60┊        chats.splice(index, 1)
+┊  ┊61┊        chats.unshift(chat)
+┊  ┊62┊
+┊  ┊63┊        client.writeQuery({
+┊  ┊64┊          query: queries.chats,
+┊  ┊65┊          data: { chats },
+┊  ┊66┊        })
+┊  ┊67┊      }
+┊  ┊68┊    },
+┊  ┊69┊  })
 ┊18┊70┊}
```

[}]: #

We've already implemented all the necessary subscription handlers in the server in the beginning of this step, so things should work smoothly.

Now we're gonna implement a users list component where we will be able to pick users and chat with them. The users list component is gonna be global to the rest of the components because we will be using it in other screens in the upcoming steps.

[{]: <helper> (diffStep 3.2 files="src/components/UsersList" module="client")

#### [Step 3.2: Add new chat screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/d0e8364)

##### Added src&#x2F;components&#x2F;UsersList.tsx
```diff
@@ -0,0 +1,112 @@
+┊   ┊  1┊import List from '@material-ui/core/List'
+┊   ┊  2┊import ListItem from '@material-ui/core/ListItem'
+┊   ┊  3┊import CheckCircle from '@material-ui/icons/CheckCircle'
+┊   ┊  4┊import gql from 'graphql-tag'
+┊   ┊  5┊import * as React from 'react'
+┊   ┊  6┊import { useState } from 'react'
+┊   ┊  7┊import { useQuery } from 'react-apollo-hooks'
+┊   ┊  8┊import styled from 'styled-components'
+┊   ┊  9┊import * as fragments from '../graphql/fragments'
+┊   ┊ 10┊import { UsersListQuery, User } from '../graphql/types'
+┊   ┊ 11┊
+┊   ┊ 12┊const Style = styled.div`
+┊   ┊ 13┊  .UsersList-users-list {
+┊   ┊ 14┊    padding: 0;
+┊   ┊ 15┊  }
+┊   ┊ 16┊
+┊   ┊ 17┊  .UsersList-user-item {
+┊   ┊ 18┊    position: relative;
+┊   ┊ 19┊    padding: 7.5px 15px;
+┊   ┊ 20┊    display: flex;
+┊   ┊ 21┊    ${props => props.selectable && 'cursor: pointer;'}
+┊   ┊ 22┊  }
+┊   ┊ 23┊
+┊   ┊ 24┊  .UsersList-profile-pic {
+┊   ┊ 25┊    height: 50px;
+┊   ┊ 26┊    width: 50px;
+┊   ┊ 27┊    object-fit: cover;
+┊   ┊ 28┊    border-radius: 50%;
+┊   ┊ 29┊  }
+┊   ┊ 30┊
+┊   ┊ 31┊  .UsersList-name {
+┊   ┊ 32┊    padding-left: 15px;
+┊   ┊ 33┊    font-weight: bold;
+┊   ┊ 34┊  }
+┊   ┊ 35┊
+┊   ┊ 36┊  .UsersList-checkmark {
+┊   ┊ 37┊    position: absolute;
+┊   ┊ 38┊    left: 50px;
+┊   ┊ 39┊    top: 35px;
+┊   ┊ 40┊    color: var(--secondary-bg);
+┊   ┊ 41┊    background-color: white;
+┊   ┊ 42┊    border-radius: 50%;
+┊   ┊ 43┊  }
+┊   ┊ 44┊`
+┊   ┊ 45┊
+┊   ┊ 46┊const query = gql`
+┊   ┊ 47┊  query UsersListQuery {
+┊   ┊ 48┊    users {
+┊   ┊ 49┊      ...User
+┊   ┊ 50┊    }
+┊   ┊ 51┊  }
+┊   ┊ 52┊  ${fragments.user}
+┊   ┊ 53┊`
+┊   ┊ 54┊
+┊   ┊ 55┊interface UsersListProps {
+┊   ┊ 56┊  selectable?: boolean
+┊   ┊ 57┊  onSelectionChange?: (users: User.Fragment[]) => void
+┊   ┊ 58┊  onUserPick?: (user: User.Fragment) => void
+┊   ┊ 59┊}
+┊   ┊ 60┊
+┊   ┊ 61┊export default (props: UsersListProps) => {
+┊   ┊ 62┊  const { selectable, onSelectionChange, onUserPick } = {
+┊   ┊ 63┊    selectable: false,
+┊   ┊ 64┊    onSelectionChange: () => {},
+┊   ┊ 65┊    onUserPick: () => {},
+┊   ┊ 66┊    ...props,
+┊   ┊ 67┊  }
+┊   ┊ 68┊
+┊   ┊ 69┊  const [selectedUsers, setSelectedUsers] = useState([])
+┊   ┊ 70┊  const {
+┊   ┊ 71┊    data: { users },
+┊   ┊ 72┊  } = useQuery<UsersListQuery.Query>(query, { suspend: true })
+┊   ┊ 73┊
+┊   ┊ 74┊  const onListItemClick = user => {
+┊   ┊ 75┊    if (!selectable) {
+┊   ┊ 76┊      return onUserPick(user)
+┊   ┊ 77┊    }
+┊   ┊ 78┊
+┊   ┊ 79┊    if (selectedUsers.includes(user)) {
+┊   ┊ 80┊      const index = selectedUsers.indexOf(user)
+┊   ┊ 81┊      selectedUsers.splice(index, 1)
+┊   ┊ 82┊    } else {
+┊   ┊ 83┊      selectedUsers.push(user)
+┊   ┊ 84┊    }
+┊   ┊ 85┊
+┊   ┊ 86┊    setSelectedUsers(selectedUsers)
+┊   ┊ 87┊    onSelectionChange(selectedUsers)
+┊   ┊ 88┊  }
+┊   ┊ 89┊
+┊   ┊ 90┊  return (
+┊   ┊ 91┊    <Style className="UsersList" selectable={selectable}>
+┊   ┊ 92┊      <List className="UsersList-users-list">
+┊   ┊ 93┊        {users.map(user => (
+┊   ┊ 94┊          <ListItem
+┊   ┊ 95┊            className="UsersList-user-item"
+┊   ┊ 96┊            key={user.id}
+┊   ┊ 97┊            button
+┊   ┊ 98┊            onClick={onListItemClick.bind(null, user)}
+┊   ┊ 99┊          >
+┊   ┊100┊            <img
+┊   ┊101┊              className="UsersList-profile-pic"
+┊   ┊102┊              src={user.picture || '/assets/default-profile-pic.jpg'}
+┊   ┊103┊            />
+┊   ┊104┊            <div className="UsersList-name">{user.name}</div>
+┊   ┊105┊
+┊   ┊106┊            {selectedUsers.includes(user) && <CheckCircle className="UsersList-checkmark" />}
+┊   ┊107┊          </ListItem>
+┊   ┊108┊        ))}
+┊   ┊109┊      </List>
+┊   ┊110┊    </Style>
+┊   ┊111┊  )
+┊   ┊112┊}
```

[}]: #

Now let's implement the new chat screen:

[{]: <helper> (diffStep 3.2 files="src/components/NewChatScreen" module="client")

#### [Step 3.2: Add new chat screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/d0e8364)

##### Added src&#x2F;components&#x2F;NewChatScreen&#x2F;NewChatNavbar.tsx
```diff
@@ -0,0 +1,39 @@
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
+┊  ┊13┊  .NewChatNavbar-title {
+┊  ┊14┊    line-height: 56px;
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  .NewChatNavbar-back-button {
+┊  ┊18┊    color: var(--primary-text);
+┊  ┊19┊  }
+┊  ┊20┊`
+┊  ┊21┊
+┊  ┊22┊interface NewChatNavbarProps {
+┊  ┊23┊  history: History
+┊  ┊24┊}
+┊  ┊25┊
+┊  ┊26┊export default ({ history }: NewChatNavbarProps) => {
+┊  ┊27┊  const navToChats = () => {
+┊  ┊28┊    history.push('/chats')
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  return (
+┊  ┊32┊    <Style className="NewChatNavbar">
+┊  ┊33┊      <Button className="NewChatNavbar-back-button" onClick={navToChats}>
+┊  ┊34┊        <ArrowBackIcon />
+┊  ┊35┊      </Button>
+┊  ┊36┊      <div className="NewChatNavbar-title">New Chat</div>
+┊  ┊37┊    </Style>
+┊  ┊38┊  )
+┊  ┊39┊}
```

##### Added src&#x2F;components&#x2F;NewChatScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,106 @@
+┊   ┊  1┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  2┊import gql from 'graphql-tag'
+┊   ┊  3┊import * as React from 'react'
+┊   ┊  4┊import { Suspense } from 'react'
+┊   ┊  5┊import { useMutation } from 'react-apollo-hooks'
+┊   ┊  6┊import { RouteComponentProps } from 'react-router-dom'
+┊   ┊  7┊import styled from 'styled-components'
+┊   ┊  8┊import { time as uniqid } from 'uniqid'
+┊   ┊  9┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 10┊import * as queries from '../../graphql/queries'
+┊   ┊ 11┊import { Chats } from '../../graphql/types'
+┊   ┊ 12┊import { NewChatScreenMutation } from '../../graphql/types'
+┊   ┊ 13┊import { useMe } from '../../services/auth.service'
+┊   ┊ 14┊import Navbar from '../Navbar'
+┊   ┊ 15┊import UsersList from '../UsersList'
+┊   ┊ 16┊import NewChatNavbar from './NewChatNavbar'
+┊   ┊ 17┊
+┊   ┊ 18┊const Style = styled.div`
+┊   ┊ 19┊  .UsersList {
+┊   ┊ 20┊    height: calc(100% - 56px);
+┊   ┊ 21┊  }
+┊   ┊ 22┊
+┊   ┊ 23┊  .NewChatScreen-users-list {
+┊   ┊ 24┊    height: calc(100% - 56px);
+┊   ┊ 25┊    overflow-y: overlay;
+┊   ┊ 26┊  }
+┊   ┊ 27┊`
+┊   ┊ 28┊
+┊   ┊ 29┊const mutation = gql`
+┊   ┊ 30┊  mutation NewChatScreenMutation($userId: ID!) {
+┊   ┊ 31┊    addChat(userId: $userId) {
+┊   ┊ 32┊      ...Chat
+┊   ┊ 33┊    }
+┊   ┊ 34┊  }
+┊   ┊ 35┊  ${fragments.chat}
+┊   ┊ 36┊`
+┊   ┊ 37┊
+┊   ┊ 38┊export default ({ history }: RouteComponentProps) => {
+┊   ┊ 39┊  const me = useMe()
+┊   ┊ 40┊
+┊   ┊ 41┊  const addChat = useMutation<NewChatScreenMutation.Mutation, NewChatScreenMutation.Variables>(
+┊   ┊ 42┊    mutation,
+┊   ┊ 43┊    {
+┊   ┊ 44┊      update: (client, { data: { addChat } }) => {
+┊   ┊ 45┊        client.writeFragment({
+┊   ┊ 46┊          id: defaultDataIdFromObject(addChat),
+┊   ┊ 47┊          fragment: fragments.chat,
+┊   ┊ 48┊          fragmentName: 'Chat',
+┊   ┊ 49┊          data: addChat,
+┊   ┊ 50┊        })
+┊   ┊ 51┊
+┊   ┊ 52┊        let chats
+┊   ┊ 53┊        try {
+┊   ┊ 54┊          chats = client.readQuery<Chats.Query>({
+┊   ┊ 55┊            query: queries.chats,
+┊   ┊ 56┊          }).chats
+┊   ┊ 57┊        } catch (e) {}
+┊   ┊ 58┊
+┊   ┊ 59┊        if (chats && !chats.some(chat => chat.id === addChat.id)) {
+┊   ┊ 60┊          chats.unshift(addChat)
+┊   ┊ 61┊
+┊   ┊ 62┊          client.writeQuery({
+┊   ┊ 63┊            query: queries.chats,
+┊   ┊ 64┊            data: { chats },
+┊   ┊ 65┊          })
+┊   ┊ 66┊        }
+┊   ┊ 67┊      },
+┊   ┊ 68┊    },
+┊   ┊ 69┊  )
+┊   ┊ 70┊
+┊   ┊ 71┊  const onUserPick = user => {
+┊   ┊ 72┊    addChat({
+┊   ┊ 73┊      optimisticResponse: {
+┊   ┊ 74┊        __typename: 'Mutation',
+┊   ┊ 75┊        addChat: {
+┊   ┊ 76┊          __typename: 'Chat',
+┊   ┊ 77┊          id: uniqid(),
+┊   ┊ 78┊          name: user.name,
+┊   ┊ 79┊          picture: user.picture,
+┊   ┊ 80┊          allTimeMembers: [],
+┊   ┊ 81┊          owner: me,
+┊   ┊ 82┊          isGroup: false,
+┊   ┊ 83┊          lastMessage: null,
+┊   ┊ 84┊        },
+┊   ┊ 85┊      },
+┊   ┊ 86┊      variables: {
+┊   ┊ 87┊        userId: user.id,
+┊   ┊ 88┊      },
+┊   ┊ 89┊    }).then(({ data: { addChat } }) => {
+┊   ┊ 90┊      history.push(`/chats/${addChat.id}`)
+┊   ┊ 91┊    })
+┊   ┊ 92┊  }
+┊   ┊ 93┊
+┊   ┊ 94┊  return (
+┊   ┊ 95┊    <Style className="NewChatScreen Screen">
+┊   ┊ 96┊      <Navbar>
+┊   ┊ 97┊        <NewChatNavbar history={history} />
+┊   ┊ 98┊      </Navbar>
+┊   ┊ 99┊      <div className="NewChatScreen-users-list">
+┊   ┊100┊        <Suspense fallback={null}>
+┊   ┊101┊          <UsersList onUserPick={onUserPick} />
+┊   ┊102┊        </Suspense>
+┊   ┊103┊      </div>
+┊   ┊104┊    </Style>
+┊   ┊105┊  )
+┊   ┊106┊}
```

[}]: #

And implement a dedicated route for it:

[{]: <helper> (diffStep 3.2 files="src/App" module="client")

#### [Step 3.2: Add new chat screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/d0e8364)

##### Changed src&#x2F;App.tsx
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import * as React from 'react'
 ┊2┊2┊import { BrowserRouter, Route, Redirect } from 'react-router-dom'
 ┊3┊3┊import ChatRoomScreen from './components/ChatRoomScreen'
+┊ ┊4┊import NewChatScreen from './components/NewChatScreen'
 ┊4┊5┊import AnimatedSwitch from './components/AnimatedSwitch'
 ┊5┊6┊import AuthScreen from './components/AuthScreen'
 ┊6┊7┊import ChatsListScreen from './components/ChatsListScreen'
```
```diff
@@ -18,6 +19,7 @@
 ┊18┊19┊      <Route exact path="/chats" component={withAuth(ChatsListScreen)} />
 ┊19┊20┊      <Route exact path="/settings" component={withAuth(SettingsScreen)} />
 ┊20┊21┊      <Route exact path="/chats/:chatId" component={withAuth(ChatRoomScreen)} />
+┊  ┊22┊      <Route exact path="/new-chat" component={withAuth(NewChatScreen)} />
 ┊21┊23┊      <Route component={RedirectToChats} />
 ┊22┊24┊    </AnimatedSwitch>
 ┊23┊25┊  </BrowserRouter>
```

[}]: #

We will also add a button which will redirect us right to the new chat screen:

[{]: <helper> (diffStep 3.2 files="src/components/ChatsListScreen" module="client")

#### [Step 3.2: Add new chat screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/d0e8364)

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;AddChatButton.tsx
```diff
@@ -0,0 +1,38 @@
+┊  ┊ 1┊import Button from '@material-ui/core/Button'
+┊  ┊ 2┊import ChatIcon from '@material-ui/icons/Chat'
+┊  ┊ 3┊import { History } from 'history'
+┊  ┊ 4┊import * as React from 'react'
+┊  ┊ 5┊import styled from 'styled-components'
+┊  ┊ 6┊
+┊  ┊ 7┊const Style = styled.div`
+┊  ┊ 8┊  position: fixed;
+┊  ┊ 9┊  right: 10px;
+┊  ┊10┊  bottom: 10px;
+┊  ┊11┊
+┊  ┊12┊  button {
+┊  ┊13┊    min-width: 50px;
+┊  ┊14┊    width: 50px;
+┊  ┊15┊    height: 50px;
+┊  ┊16┊    border-radius: 999px;
+┊  ┊17┊    background-color: var(--secondary-bg);
+┊  ┊18┊    color: white;
+┊  ┊19┊  }
+┊  ┊20┊`
+┊  ┊21┊
+┊  ┊22┊interface AddChatButtonProps {
+┊  ┊23┊  history: History
+┊  ┊24┊}
+┊  ┊25┊
+┊  ┊26┊export default ({ history }: AddChatButtonProps) => {
+┊  ┊27┊  const onClick = () => {
+┊  ┊28┊    history.push('/new-chat')
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  return (
+┊  ┊32┊    <Style className="AddChatButton">
+┊  ┊33┊      <Button variant="contained" color="secondary" onClick={onClick}>
+┊  ┊34┊        <ChatIcon />
+┊  ┊35┊      </Button>
+┊  ┊36┊    </Style>
+┊  ┊37┊  )
+┊  ┊38┊}
```

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { Suspense } from 'react'
 ┊3┊3┊import { RouteComponentProps } from 'react-router-dom'
 ┊4┊4┊import Navbar from '../Navbar'
+┊ ┊5┊import AddChatButton from './AddChatButton'
 ┊5┊6┊import ChatsList from './ChatsList'
 ┊6┊7┊import ChatsNavbar from './ChatsNavbar'
 ┊7┊8┊
```
```diff
@@ -13,5 +14,6 @@
 ┊13┊14┊    <Suspense fallback={null}>
 ┊14┊15┊      <ChatsList history={history} />
 ┊15┊16┊    </Suspense>
+┊  ┊17┊    <AddChatButton history={history} />
 ┊16┊18┊  </div>
 ┊17┊19┊)
```

[}]: #

Again, we will need to define the right subscriptions and update the cache accordingly:

[{]: <helper> (diffStep 3.2 files="src/graphql/queries, src/graphql/subscriptions, src/services/cache" module="client")

#### [Step 3.2: Add new chat screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/d0e8364)

##### Changed src&#x2F;graphql&#x2F;queries&#x2F;index.ts
```diff
@@ -1,2 +1,3 @@
 ┊1┊1┊export { default as chats } from './chats.query'
+┊ ┊2┊export { default as users } from './users.query'
 ┊2┊3┊export { default as me } from './me.query'
```

##### Added src&#x2F;graphql&#x2F;queries&#x2F;users.query.ts
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import * as fragments from '../fragments'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  query Users {
+┊  ┊ 6┊    users {
+┊  ┊ 7┊      ...User
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊  ${fragments.user}
+┊  ┊11┊`
```

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;chatAdded.subscription.ts
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import * as fragments from '../fragments'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  subscription ChatAdded {
+┊  ┊ 6┊    chatAdded {
+┊  ┊ 7┊      ...Chat
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊  ${fragments.chat}
+┊  ┊11┊`
```

##### Changed src&#x2F;graphql&#x2F;subscriptions&#x2F;index.ts
```diff
@@ -1,2 +1,5 @@
 ┊1┊1┊export { default as chatUpdated } from './chatUpdated.subscription'
 ┊2┊2┊export { default as messageAdded } from './messageAdded.subscription'
+┊ ┊3┊export { default as chatAdded } from './chatAdded.subscription'
+┊ ┊4┊export { default as userAdded } from './userAdded.subscription'
+┊ ┊5┊export { default as userUpdated } from './userUpdated.subscription'
```

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;userAdded.subscription.ts
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import * as fragments from '../fragments'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  subscription UserAdded {
+┊  ┊ 6┊    userAdded {
+┊  ┊ 7┊      ...User
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊  ${fragments.user}
+┊  ┊11┊`
```

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;userUpdated.subscription.ts
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊import gql from 'graphql-tag'
+┊  ┊ 2┊import * as fragments from '../fragments'
+┊  ┊ 3┊
+┊  ┊ 4┊export default gql `
+┊  ┊ 5┊  subscription UserUpdated {
+┊  ┊ 6┊    userUpdated {
+┊  ┊ 7┊      ...User
+┊  ┊ 8┊    }
+┊  ┊ 9┊  }
+┊  ┊10┊  ${fragments.user}
+┊  ┊11┊`
```

##### Changed src&#x2F;services&#x2F;cache.service.tsx
```diff
@@ -2,10 +2,48 @@
 ┊ 2┊ 2┊import * as fragments from '../graphql/fragments'
 ┊ 3┊ 3┊import * as subscriptions from '../graphql/subscriptions'
 ┊ 4┊ 4┊import * as queries from '../graphql/queries'
-┊ 5┊  ┊import { ChatUpdated, MessageAdded, Message, Chats, FullChat } from '../graphql/types'
+┊  ┊ 5┊import {
+┊  ┊ 6┊  ChatUpdated,
+┊  ┊ 7┊  MessageAdded,
+┊  ┊ 8┊  Message,
+┊  ┊ 9┊  Chats,
+┊  ┊10┊  FullChat,
+┊  ┊11┊  User,
+┊  ┊12┊  Users,
+┊  ┊13┊  UserAdded,
+┊  ┊14┊  UserUpdated,
+┊  ┊15┊  ChatAdded,
+┊  ┊16┊} from '../graphql/types'
 ┊ 6┊17┊import { useSubscription } from '../polyfills/react-apollo-hooks'
 ┊ 7┊18┊
 ┊ 8┊19┊export const useSubscriptions = () => {
+┊  ┊20┊  useSubscription<ChatAdded.Subscription>(subscriptions.chatAdded, {
+┊  ┊21┊    onSubscriptionData: ({ client, subscriptionData: { chatAdded } }) => {
+┊  ┊22┊      client.writeFragment({
+┊  ┊23┊        id: defaultDataIdFromObject(chatAdded),
+┊  ┊24┊        fragment: fragments.chat,
+┊  ┊25┊        fragmentName: 'Chat',
+┊  ┊26┊        data: chatAdded,
+┊  ┊27┊      })
+┊  ┊28┊
+┊  ┊29┊      let chats
+┊  ┊30┊      try {
+┊  ┊31┊        chats = client.readQuery<Chats.Query>({
+┊  ┊32┊          query: queries.chats,
+┊  ┊33┊        }).chats
+┊  ┊34┊      } catch (e) {}
+┊  ┊35┊
+┊  ┊36┊      if (chats && !chats.some(chat => chat.id === chatAdded.id)) {
+┊  ┊37┊        chats.unshift(chatAdded)
+┊  ┊38┊
+┊  ┊39┊        client.writeQuery({
+┊  ┊40┊          query: queries.chats,
+┊  ┊41┊          data: { chats },
+┊  ┊42┊        })
+┊  ┊43┊      }
+┊  ┊44┊    },
+┊  ┊45┊  })
+┊  ┊46┊
 ┊ 9┊47┊  useSubscription<ChatUpdated.Subscription>(subscriptions.chatUpdated, {
 ┊10┊48┊    onSubscriptionData: ({ client, subscriptionData: { chatUpdated } }) => {
 ┊11┊49┊      client.writeFragment({
```
```diff
@@ -67,4 +105,40 @@
 ┊ 67┊105┊      }
 ┊ 68┊106┊    },
 ┊ 69┊107┊  })
+┊   ┊108┊
+┊   ┊109┊  useSubscription<UserAdded.Subscription>(subscriptions.userAdded, {
+┊   ┊110┊    onSubscriptionData: ({ client, subscriptionData: { userAdded } }) => {
+┊   ┊111┊      client.writeFragment({
+┊   ┊112┊        id: defaultDataIdFromObject(userAdded),
+┊   ┊113┊        fragment: fragments.user,
+┊   ┊114┊        data: userAdded,
+┊   ┊115┊      })
+┊   ┊116┊
+┊   ┊117┊      let users
+┊   ┊118┊      try {
+┊   ┊119┊        users = client.readQuery<Users.Query>({
+┊   ┊120┊          query: queries.users,
+┊   ┊121┊        }).users
+┊   ┊122┊      } catch (e) {}
+┊   ┊123┊
+┊   ┊124┊      if (users && !users.some(user => user.id === userAdded.id)) {
+┊   ┊125┊        users.push(userAdded)
+┊   ┊126┊
+┊   ┊127┊        client.writeQuery({
+┊   ┊128┊          query: queries.users,
+┊   ┊129┊          data: { users },
+┊   ┊130┊        })
+┊   ┊131┊      }
+┊   ┊132┊    },
+┊   ┊133┊  })
+┊   ┊134┊
+┊   ┊135┊  useSubscription<UserUpdated.Subscription>(subscriptions.userUpdated, {
+┊   ┊136┊    onSubscriptionData: ({ client, subscriptionData: { userUpdated } }) => {
+┊   ┊137┊      client.writeFragment({
+┊   ┊138┊        id: defaultDataIdFromObject(userUpdated),
+┊   ┊139┊        fragment: fragments.user,
+┊   ┊140┊        data: userUpdated,
+┊   ┊141┊      })
+┊   ┊142┊    },
+┊   ┊143┊  })
 ┊ 70┊144┊}
```

[}]: #

Now we have a real, functional chat app! Where we have a complete flow of:

- Signing in/up.
- Editing profile.
- Creating and removing chats.
- Sending messages.

In the next step we will to something slightly more complex and extend the current functionality by adding a group chatting feature where we will be able to communicate with multiple users in a single chat room.


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/master@next/.tortilla/manuals/views/step2.md) | [Next Step >](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/master@next/.tortilla/manuals/views/step4.md) |
|:--------------------------------|--------------------------------:|

[}]: #
