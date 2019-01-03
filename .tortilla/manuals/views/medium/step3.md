# Step 3: Creating a chat app

[//]: # (head-end)


![chats](https://user-images.githubusercontent.com/7648874/50938806-e038d300-14b4-11e9-8fa6-f759486dcd69.png)

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
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊12┊12┊      mappers:
 ┊13┊13┊        Chat: ./entity/chat#Chat
 ┊14┊14┊        Message: ./entity/message#Message
<b>+┊  ┊15┊        Recipient: ./entity/recipient#Recipient</b>
 ┊15┊16┊        User: ./entity/user#User
 ┊16┊17┊      scalars:
 ┊17┊18┊        Date: Date
</pre>

##### Changed entity&#x2F;message.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊  CreateDateColumn,
 ┊10┊10┊} from &#x27;typeorm&#x27;
 ┊11┊11┊import Chat from &#x27;./chat&#x27;
<b>+┊  ┊12┊import Recipient from &#x27;./recipient&#x27;</b>
 ┊12┊13┊import User from &#x27;./user&#x27;
 ┊13┊14┊import { MessageType } from &#x27;../db&#x27;
 ┊14┊15┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊18┊  content?: string
 ┊18┊19┊  createdAt?: Date
 ┊19┊20┊  type?: MessageType
<b>+┊  ┊21┊  recipients?: Recipient[]</b>
 ┊20┊22┊  holders?: User[]
 ┊21┊23┊  chat?: Chat
 ┊22┊24┊}
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊38┊40┊  @Column()
 ┊39┊41┊  type: number
 ┊40┊42┊
<b>+┊  ┊43┊  @OneToMany(type &#x3D;&gt; Recipient, recipient &#x3D;&gt; recipient.message, { cascade: [&#x27;insert&#x27;, &#x27;update&#x27;], eager: true })</b>
<b>+┊  ┊44┊  recipients: Recipient[]</b>
<b>+┊  ┊45┊</b>
 ┊41┊46┊  @ManyToMany(type &#x3D;&gt; User, user &#x3D;&gt; user.holderMessages, {
 ┊42┊47┊    cascade: [&#x27;insert&#x27;, &#x27;update&#x27;],
 ┊43┊48┊    eager: true,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊53┊58┊    content,
 ┊54┊59┊    createdAt,
 ┊55┊60┊    type,
<b>+┊  ┊61┊    recipients,</b>
 ┊56┊62┊    holders,
 ┊57┊63┊    chat,
 ┊58┊64┊  }: MessageConstructor &#x3D; {}) {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊68┊74┊    if (type) {
 ┊69┊75┊      this.type &#x3D; type
 ┊70┊76┊    }
<b>+┊  ┊77┊    if (recipients) {</b>
<b>+┊  ┊78┊      recipients.forEach(recipient &#x3D;&gt; recipient.message &#x3D; this)</b>
<b>+┊  ┊79┊      this.recipients &#x3D; recipients</b>
<b>+┊  ┊80┊    }</b>
 ┊71┊81┊    if (holders) {
 ┊72┊82┊      this.holders &#x3D; holders
 ┊73┊83┊    }
</pre>

##### Added entity&#x2F;recipient.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Entity, ManyToOne, Column } from &#x27;typeorm&#x27;</b>
<b>+┊  ┊ 2┊import { Message } from &#x27;./message&#x27;</b>
<b>+┊  ┊ 3┊import { User } from &#x27;./user&#x27;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊interface RecipientConstructor {</b>
<b>+┊  ┊ 6┊  user?: User</b>
<b>+┊  ┊ 7┊  message?: Message</b>
<b>+┊  ┊ 8┊  receivedAt?: Date</b>
<b>+┊  ┊ 9┊  readAt?: Date</b>
<b>+┊  ┊10┊}</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊@Entity()</b>
<b>+┊  ┊13┊export class Recipient {</b>
<b>+┊  ┊14┊  @ManyToOne(type &#x3D;&gt; User, user &#x3D;&gt; user.recipients, { primary: true })</b>
<b>+┊  ┊15┊  user: User</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  @ManyToOne(type &#x3D;&gt; Message, message &#x3D;&gt; message.recipients, { primary: true })</b>
<b>+┊  ┊18┊  message: Message</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  @Column({ nullable: true })</b>
<b>+┊  ┊21┊  receivedAt: Date</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊  @Column({ nullable: true })</b>
<b>+┊  ┊24┊  readAt: Date</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊  constructor({ user, message, receivedAt, readAt }: RecipientConstructor &#x3D; {}) {</b>
<b>+┊  ┊27┊    if (user) {</b>
<b>+┊  ┊28┊      this.user &#x3D; user</b>
<b>+┊  ┊29┊    }</b>
<b>+┊  ┊30┊    if (message) {</b>
<b>+┊  ┊31┊      this.message &#x3D; message</b>
<b>+┊  ┊32┊    }</b>
<b>+┊  ┊33┊    if (receivedAt) {</b>
<b>+┊  ┊34┊      this.receivedAt &#x3D; receivedAt</b>
<b>+┊  ┊35┊    }</b>
<b>+┊  ┊36┊    if (readAt) {</b>
<b>+┊  ┊37┊      this.readAt &#x3D; readAt</b>
<b>+┊  ┊38┊    }</b>
<b>+┊  ┊39┊  }</b>
<b>+┊  ┊40┊}</b>
<b>+┊  ┊41┊</b>
<b>+┊  ┊42┊export default Recipient</b>
</pre>

##### Changed entity&#x2F;user.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from &#x27;typeorm&#x27;
 ┊2┊2┊import Chat from &#x27;./chat&#x27;
 ┊3┊3┊import Message from &#x27;./message&#x27;
<b>+┊ ┊4┊import Recipient from &#x27;./recipient&#x27;</b>
 ┊4┊5┊
 ┊5┊6┊interface UserConstructor {
 ┊6┊7┊  username?: string
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊41┊42┊  @OneToMany(type &#x3D;&gt; Message, message &#x3D;&gt; message.sender)
 ┊42┊43┊  senderMessages: Message[]
 ┊43┊44┊
<b>+┊  ┊45┊  @OneToMany(type &#x3D;&gt; Recipient, recipient &#x3D;&gt; recipient.user)</b>
<b>+┊  ┊46┊  recipients: Recipient[]</b>
<b>+┊  ┊47┊</b>
 ┊44┊48┊  constructor({ username, password, name, picture }: UserConstructor &#x3D; {}) {
 ┊45┊49┊    if (username) {
 ┊46┊50┊      this.username &#x3D; username
</pre>

##### Changed modules&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊import { AuthModule } from &#x27;./auth&#x27;
 ┊ 5┊ 5┊import { UserModule } from &#x27;./user&#x27;
 ┊ 6┊ 6┊import { ChatModule } from &#x27;./chat&#x27;
<b>+┊  ┊ 7┊import { RecipientModule } from &#x27;./recipient&#x27;</b>
 ┊ 7┊ 8┊import { MessageModule } from &#x27;./message&#x27;
 ┊ 8┊ 9┊
 ┊ 9┊10┊export interface IAppModuleConfig {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊22┊    UserModule,
 ┊22┊23┊    ChatModule,
 ┊23┊24┊    MessageModule,
<b>+┊  ┊25┊    RecipientModule,</b>
 ┊24┊26┊  ],
 ┊25┊27┊  configRequired: true,
 ┊26┊28┊})
</pre>

##### Added modules&#x2F;recipient&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { GraphQLModule } from &#x27;@graphql-modules/core&#x27;;</b>
<b>+┊  ┊ 2┊import { loadResolversFiles, loadSchemaFiles } from &#x27;@graphql-modules/sonar&#x27;;</b>
<b>+┊  ┊ 3┊import { UserModule } from &#x27;../user&#x27;;</b>
<b>+┊  ┊ 4┊import { MessageModule } from &#x27;../message&#x27;;</b>
<b>+┊  ┊ 5┊import { ChatModule } from &#x27;../chat&#x27;;</b>
<b>+┊  ┊ 6┊import { RecipientProvider } from &#x27;./providers/recipient.provider&#x27;;</b>
<b>+┊  ┊ 7┊import { AuthModule } from &#x27;../auth&#x27;;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊export const RecipientModule &#x3D; new GraphQLModule({</b>
<b>+┊  ┊10┊  name: &#x27;Recipient&#x27;,</b>
<b>+┊  ┊11┊  imports: [</b>
<b>+┊  ┊12┊    AuthModule,</b>
<b>+┊  ┊13┊    UserModule,</b>
<b>+┊  ┊14┊    ChatModule,</b>
<b>+┊  ┊15┊    MessageModule,</b>
<b>+┊  ┊16┊  ],</b>
<b>+┊  ┊17┊  providers: [</b>
<b>+┊  ┊18┊    RecipientProvider,</b>
<b>+┊  ┊19┊  ],</b>
<b>+┊  ┊20┊  typeDefs: loadSchemaFiles(__dirname + &#x27;/schema/&#x27;),</b>
<b>+┊  ┊21┊  resolvers: loadResolversFiles(__dirname + &#x27;/resolvers/&#x27;),</b>
<b>+┊  ┊22┊});</b>
</pre>

##### Added modules&#x2F;recipient&#x2F;providers&#x2F;recipient.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import { Injectable, ProviderScope } from &#x27;@graphql-modules/di&#x27;</b>
<b>+┊   ┊  2┊import { Connection } from &#x27;typeorm&#x27;</b>
<b>+┊   ┊  3┊import { MessageProvider } from &#x27;../../message/providers/message.provider&#x27;</b>
<b>+┊   ┊  4┊import { Chat } from &#x27;../../../entity/chat&#x27;</b>
<b>+┊   ┊  5┊import { Message } from &#x27;../../../entity/message&#x27;</b>
<b>+┊   ┊  6┊import { Recipient } from &#x27;../../../entity/recipient&#x27;</b>
<b>+┊   ┊  7┊import { AuthProvider } from &#x27;../../auth/providers/auth.provider&#x27;</b>
<b>+┊   ┊  8┊</b>
<b>+┊   ┊  9┊@Injectable({</b>
<b>+┊   ┊ 10┊  scope: ProviderScope.Session,</b>
<b>+┊   ┊ 11┊})</b>
<b>+┊   ┊ 12┊export class RecipientProvider {</b>
<b>+┊   ┊ 13┊  constructor(</b>
<b>+┊   ┊ 14┊    private authProvider: AuthProvider,</b>
<b>+┊   ┊ 15┊    private connection: Connection,</b>
<b>+┊   ┊ 16┊    private messageProvider: MessageProvider</b>
<b>+┊   ┊ 17┊  ) {}</b>
<b>+┊   ┊ 18┊</b>
<b>+┊   ┊ 19┊  public repository &#x3D; this.connection.getRepository(Recipient)</b>
<b>+┊   ┊ 20┊  public currentUser &#x3D; this.authProvider.currentUser</b>
<b>+┊   ┊ 21┊</b>
<b>+┊   ┊ 22┊  createQueryBuilder() {</b>
<b>+┊   ┊ 23┊    return this.connection.createQueryBuilder(Recipient, &#x27;recipient&#x27;)</b>
<b>+┊   ┊ 24┊  }</b>
<b>+┊   ┊ 25┊</b>
<b>+┊   ┊ 26┊  getChatUnreadMessagesCount(chat: Chat) {</b>
<b>+┊   ┊ 27┊    return this.messageProvider</b>
<b>+┊   ┊ 28┊      .createQueryBuilder()</b>
<b>+┊   ┊ 29┊      .innerJoin(&#x27;message.chat&#x27;, &#x27;chat&#x27;, &#x27;chat.id &#x3D; :chatId&#x27;, { chatId: chat.id })</b>
<b>+┊   ┊ 30┊      .innerJoin(</b>
<b>+┊   ┊ 31┊        &#x27;message.recipients&#x27;,</b>
<b>+┊   ┊ 32┊        &#x27;recipients&#x27;,</b>
<b>+┊   ┊ 33┊        &#x27;recipients.user.id &#x3D; :userId AND recipients.readAt IS NULL&#x27;,</b>
<b>+┊   ┊ 34┊        {</b>
<b>+┊   ┊ 35┊          userId: this.currentUser.id,</b>
<b>+┊   ┊ 36┊        }</b>
<b>+┊   ┊ 37┊      )</b>
<b>+┊   ┊ 38┊      .getCount()</b>
<b>+┊   ┊ 39┊  }</b>
<b>+┊   ┊ 40┊</b>
<b>+┊   ┊ 41┊  getMessageRecipients(message: Message) {</b>
<b>+┊   ┊ 42┊    return this.createQueryBuilder()</b>
<b>+┊   ┊ 43┊      .innerJoinAndSelect(&#x27;recipient.message&#x27;, &#x27;message&#x27;, &#x27;message.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊ 44┊        messageId: message.id,</b>
<b>+┊   ┊ 45┊      })</b>
<b>+┊   ┊ 46┊      .innerJoinAndSelect(&#x27;recipient.user&#x27;, &#x27;user&#x27;)</b>
<b>+┊   ┊ 47┊      .getMany()</b>
<b>+┊   ┊ 48┊  }</b>
<b>+┊   ┊ 49┊</b>
<b>+┊   ┊ 50┊  async getRecipientChat(recipient: Recipient) {</b>
<b>+┊   ┊ 51┊    if (recipient.message.chat) {</b>
<b>+┊   ┊ 52┊      return recipient.message.chat</b>
<b>+┊   ┊ 53┊    }</b>
<b>+┊   ┊ 54┊</b>
<b>+┊   ┊ 55┊    return this.messageProvider.getMessageChat(recipient.message)</b>
<b>+┊   ┊ 56┊  }</b>
<b>+┊   ┊ 57┊</b>
<b>+┊   ┊ 58┊  async removeChat(chatId: string) {</b>
<b>+┊   ┊ 59┊    const messages &#x3D; await this.messageProvider._removeChatGetMessages(chatId)</b>
<b>+┊   ┊ 60┊</b>
<b>+┊   ┊ 61┊    for (let message of messages) {</b>
<b>+┊   ┊ 62┊      if (message.holders.length &#x3D;&#x3D;&#x3D; 0) {</b>
<b>+┊   ┊ 63┊        const recipients &#x3D; await this.createQueryBuilder()</b>
<b>+┊   ┊ 64┊          .innerJoinAndSelect(&#x27;recipient.message&#x27;, &#x27;message&#x27;, &#x27;message.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊ 65┊            messageId: message.id,</b>
<b>+┊   ┊ 66┊          })</b>
<b>+┊   ┊ 67┊          .innerJoinAndSelect(&#x27;recipient.user&#x27;, &#x27;user&#x27;)</b>
<b>+┊   ┊ 68┊          .getMany()</b>
<b>+┊   ┊ 69┊</b>
<b>+┊   ┊ 70┊        for (let recipient of recipients) {</b>
<b>+┊   ┊ 71┊          await this.repository.remove(recipient)</b>
<b>+┊   ┊ 72┊        }</b>
<b>+┊   ┊ 73┊      }</b>
<b>+┊   ┊ 74┊    }</b>
<b>+┊   ┊ 75┊</b>
<b>+┊   ┊ 76┊    return await this.messageProvider.removeChat(chatId, messages)</b>
<b>+┊   ┊ 77┊  }</b>
<b>+┊   ┊ 78┊</b>
<b>+┊   ┊ 79┊  async addMessage(chatId: string, content: string) {</b>
<b>+┊   ┊ 80┊    const message &#x3D; await this.messageProvider.addMessage(chatId, content)</b>
<b>+┊   ┊ 81┊</b>
<b>+┊   ┊ 82┊    for (let user of message.holders) {</b>
<b>+┊   ┊ 83┊      if (user.id !&#x3D;&#x3D; this.currentUser.id) {</b>
<b>+┊   ┊ 84┊        await this.repository.save(new Recipient({ user, message }))</b>
<b>+┊   ┊ 85┊      }</b>
<b>+┊   ┊ 86┊    }</b>
<b>+┊   ┊ 87┊</b>
<b>+┊   ┊ 88┊    return message</b>
<b>+┊   ┊ 89┊  }</b>
<b>+┊   ┊ 90┊</b>
<b>+┊   ┊ 91┊  async removeMessages(</b>
<b>+┊   ┊ 92┊    chatId: string,</b>
<b>+┊   ┊ 93┊    {</b>
<b>+┊   ┊ 94┊      messageIds,</b>
<b>+┊   ┊ 95┊      all,</b>
<b>+┊   ┊ 96┊    }: {</b>
<b>+┊   ┊ 97┊      messageIds?: string[]</b>
<b>+┊   ┊ 98┊      all?: boolean</b>
<b>+┊   ┊ 99┊    } &#x3D; {}</b>
<b>+┊   ┊100┊  ) {</b>
<b>+┊   ┊101┊    const { deletedIds, removedMessages } &#x3D; await this.messageProvider._removeMessages(chatId, {</b>
<b>+┊   ┊102┊      messageIds,</b>
<b>+┊   ┊103┊      all,</b>
<b>+┊   ┊104┊    })</b>
<b>+┊   ┊105┊</b>
<b>+┊   ┊106┊    for (let message of removedMessages) {</b>
<b>+┊   ┊107┊      const recipients &#x3D; await this.createQueryBuilder()</b>
<b>+┊   ┊108┊        .innerJoinAndSelect(&#x27;recipient.message&#x27;, &#x27;message&#x27;, &#x27;message.id &#x3D; :messageId&#x27;, {</b>
<b>+┊   ┊109┊          messageId: message.id,</b>
<b>+┊   ┊110┊        })</b>
<b>+┊   ┊111┊        .innerJoinAndSelect(&#x27;recipient.user&#x27;, &#x27;user&#x27;)</b>
<b>+┊   ┊112┊        .getMany()</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊      for (let recipient of recipients) {</b>
<b>+┊   ┊115┊        await this.repository.remove(recipient)</b>
<b>+┊   ┊116┊      }</b>
<b>+┊   ┊117┊</b>
<b>+┊   ┊118┊      await this.messageProvider.repository.remove(message)</b>
<b>+┊   ┊119┊    }</b>
<b>+┊   ┊120┊</b>
<b>+┊   ┊121┊    return deletedIds</b>
<b>+┊   ┊122┊  }</b>
<b>+┊   ┊123┊}</b>
</pre>

##### Added modules&#x2F;recipient&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { IResolvers } from &#x27;../../../types&#x27;</b>
<b>+┊  ┊ 2┊import { RecipientProvider } from &#x27;../providers/recipient.provider&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default {</b>
<b>+┊  ┊ 5┊  Mutation: {</b>
<b>+┊  ┊ 6┊    // TODO: implement me</b>
<b>+┊  ┊ 7┊    markAsReceived: async (obj, { chatId }) &#x3D;&gt; false,</b>
<b>+┊  ┊ 8┊    // TODO: implement me</b>
<b>+┊  ┊ 9┊    markAsRead: async (obj, { chatId }) &#x3D;&gt; false,</b>
<b>+┊  ┊10┊    // We may also need to remove the recipients</b>
<b>+┊  ┊11┊    removeChat: async (obj, { chatId }, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊12┊      injector.get(RecipientProvider).removeChat(chatId),</b>
<b>+┊  ┊13┊    // We also need to create the recipients</b>
<b>+┊  ┊14┊    addMessage: async (obj, { chatId, content }, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊15┊      injector.get(RecipientProvider).addMessage(chatId, content),</b>
<b>+┊  ┊16┊    // We may also need to remove the recipients</b>
<b>+┊  ┊17┊    removeMessages: async (obj, { chatId, messageIds, all }, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊18┊      injector.get(RecipientProvider).removeMessages(chatId, {</b>
<b>+┊  ┊19┊        messageIds: messageIds || undefined,</b>
<b>+┊  ┊20┊        all: all || false,</b>
<b>+┊  ┊21┊      }),</b>
<b>+┊  ┊22┊  },</b>
<b>+┊  ┊23┊  Chat: {</b>
<b>+┊  ┊24┊    unreadMessages: async (chat, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊25┊      injector.get(RecipientProvider).getChatUnreadMessagesCount(chat),</b>
<b>+┊  ┊26┊  },</b>
<b>+┊  ┊27┊  Message: {</b>
<b>+┊  ┊28┊    recipients: async (message, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊29┊      injector.get(RecipientProvider).getMessageRecipients(message),</b>
<b>+┊  ┊30┊  },</b>
<b>+┊  ┊31┊  Recipient: {</b>
<b>+┊  ┊32┊    chat: async (recipient, args, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊33┊      injector.get(RecipientProvider).getRecipientChat(recipient),</b>
<b>+┊  ┊34┊  },</b>
<b>+┊  ┊35┊} as IResolvers</b>
</pre>

##### Added modules&#x2F;recipient&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊extend type Chat {</b>
<b>+┊  ┊ 2┊  #Computed property</b>
<b>+┊  ┊ 3┊  unreadMessages: Int!</b>
<b>+┊  ┊ 4┊}</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊extend type Message {</b>
<b>+┊  ┊ 7┊  #Whoever received the message</b>
<b>+┊  ┊ 8┊  recipients: [Recipient!]!</b>
<b>+┊  ┊ 9┊}</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊type Recipient {</b>
<b>+┊  ┊12┊  user: User!</b>
<b>+┊  ┊13┊  message: Message!</b>
<b>+┊  ┊14┊  chat: Chat!</b>
<b>+┊  ┊15┊  receivedAt: Date</b>
<b>+┊  ┊16┊  readAt: Date</b>
<b>+┊  ┊17┊}</b>
<b>+┊  ┊18┊</b>
<b>+┊  ┊19┊type Mutation {</b>
<b>+┊  ┊20┊  markAsReceived(chatId: ID!): Boolean</b>
<b>+┊  ┊21┊  markAsRead(chatId: ID!): Boolean</b>
<b>+┊  ┊22┊}</b>
</pre>

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
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 38┊ 38┊    return chat || null
 ┊ 39┊ 39┊  }
 ┊ 40┊ 40┊
<b>+┊   ┊ 41┊  async addChat(userId: string) {</b>
<b>+┊   ┊ 42┊    const user &#x3D; await this.userProvider</b>
<b>+┊   ┊ 43┊      .createQueryBuilder()</b>
<b>+┊   ┊ 44┊      .whereInIds(userId)</b>
<b>+┊   ┊ 45┊      .getOne();</b>
<b>+┊   ┊ 46┊</b>
<b>+┊   ┊ 47┊    if (!user) {</b>
<b>+┊   ┊ 48┊      throw new Error(&#x60;User ${userId} doesn&#x27;t exist.&#x60;);</b>
<b>+┊   ┊ 49┊    }</b>
<b>+┊   ┊ 50┊</b>
<b>+┊   ┊ 51┊    let chat &#x3D; await this</b>
<b>+┊   ┊ 52┊      .createQueryBuilder()</b>
<b>+┊   ┊ 53┊      .where(&#x27;chat.name IS NULL&#x27;)</b>
<b>+┊   ┊ 54┊      .innerJoin(&#x27;chat.allTimeMembers&#x27;, &#x27;allTimeMembers1&#x27;, &#x27;allTimeMembers1.id &#x3D; :currentUserId&#x27;, {</b>
<b>+┊   ┊ 55┊        currentUserId: this.currentUser.id,</b>
<b>+┊   ┊ 56┊      })</b>
<b>+┊   ┊ 57┊      .innerJoin(&#x27;chat.allTimeMembers&#x27;, &#x27;allTimeMembers2&#x27;, &#x27;allTimeMembers2.id &#x3D; :userId&#x27;, {</b>
<b>+┊   ┊ 58┊        userId: userId,</b>
<b>+┊   ┊ 59┊      })</b>
<b>+┊   ┊ 60┊      .innerJoinAndSelect(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)</b>
<b>+┊   ┊ 61┊      .getOne();</b>
<b>+┊   ┊ 62┊</b>
<b>+┊   ┊ 63┊    if (chat) {</b>
<b>+┊   ┊ 64┊      // Chat already exists. Both users are already in the userIds array</b>
<b>+┊   ┊ 65┊      const listingMembers &#x3D; await this.userProvider</b>
<b>+┊   ┊ 66┊        .createQueryBuilder()</b>
<b>+┊   ┊ 67┊        .innerJoin(</b>
<b>+┊   ┊ 68┊          &#x27;user.listingMemberChats&#x27;,</b>
<b>+┊   ┊ 69┊          &#x27;listingMemberChats&#x27;,</b>
<b>+┊   ┊ 70┊          &#x27;listingMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊ 71┊          { chatId: chat.id },</b>
<b>+┊   ┊ 72┊        )</b>
<b>+┊   ┊ 73┊        .getMany();</b>
<b>+┊   ┊ 74┊</b>
<b>+┊   ┊ 75┊      if (!listingMembers.find(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; this.currentUser.id)) {</b>
<b>+┊   ┊ 76┊        // The chat isn&#x27;t listed for the current user. Add him to the memberIds</b>
<b>+┊   ┊ 77┊        chat.listingMembers.push(this.currentUser);</b>
<b>+┊   ┊ 78┊        chat &#x3D; await this.repository.save(chat);</b>
<b>+┊   ┊ 79┊</b>
<b>+┊   ┊ 80┊        return chat || null;</b>
<b>+┊   ┊ 81┊      } else {</b>
<b>+┊   ┊ 82┊        return chat;</b>
<b>+┊   ┊ 83┊      }</b>
<b>+┊   ┊ 84┊    } else {</b>
<b>+┊   ┊ 85┊      // Create the chat</b>
<b>+┊   ┊ 86┊      chat &#x3D; await this.repository.save(</b>
<b>+┊   ┊ 87┊        new Chat({</b>
<b>+┊   ┊ 88┊          allTimeMembers: [this.currentUser, user],</b>
<b>+┊   ┊ 89┊          // Chat will not be listed to the other user until the first message gets written</b>
<b>+┊   ┊ 90┊          listingMembers: [this.currentUser],</b>
<b>+┊   ┊ 91┊        }),</b>
<b>+┊   ┊ 92┊      );</b>
<b>+┊   ┊ 93┊</b>
<b>+┊   ┊ 94┊      return chat || null;</b>
<b>+┊   ┊ 95┊    }</b>
<b>+┊   ┊ 96┊  }</b>
<b>+┊   ┊ 97┊</b>
 ┊ 41┊ 98┊  async getChatName(chat: Chat) {
 ┊ 42┊ 99┊    if (chat.name) {
 ┊ 43┊100┊      return chat.name
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊159┊216┊
 ┊160┊217┊    return this.currentUser
 ┊161┊218┊  }
<b>+┊   ┊219┊</b>
<b>+┊   ┊220┊  async removeChat(chatId: string) {</b>
<b>+┊   ┊221┊    const chat &#x3D; await this.createQueryBuilder()</b>
<b>+┊   ┊222┊      .whereInIds(Number(chatId))</b>
<b>+┊   ┊223┊      .innerJoinAndSelect(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)</b>
<b>+┊   ┊224┊      .leftJoinAndSelect(&#x27;chat.owner&#x27;, &#x27;owner&#x27;)</b>
<b>+┊   ┊225┊      .getOne();</b>
<b>+┊   ┊226┊</b>
<b>+┊   ┊227┊    if (!chat) {</b>
<b>+┊   ┊228┊      throw new Error(&#x60;The chat ${chatId} doesn&#x27;t exist.&#x60;)</b>
<b>+┊   ┊229┊    }</b>
<b>+┊   ┊230┊</b>
<b>+┊   ┊231┊    if (!chat.name) {</b>
<b>+┊   ┊232┊      // Chat</b>
<b>+┊   ┊233┊      if (!chat.listingMembers.find(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; this.currentUser.id)) {</b>
<b>+┊   ┊234┊        throw new Error(&#x60;The user is not a listing member of the chat ${chatId}.&#x60;)</b>
<b>+┊   ┊235┊      }</b>
<b>+┊   ┊236┊</b>
<b>+┊   ┊237┊      // Remove the current user from who gets the chat listed. The chat will no longer appear in his list</b>
<b>+┊   ┊238┊      chat.listingMembers &#x3D; chat.listingMembers.filter(user &#x3D;&gt; user.id !&#x3D;&#x3D; this.currentUser.id);</b>
<b>+┊   ┊239┊</b>
<b>+┊   ┊240┊      // Check how many members are left</b>
<b>+┊   ┊241┊      if (chat.listingMembers.length &#x3D;&#x3D;&#x3D; 0) {</b>
<b>+┊   ┊242┊        // Delete the chat</b>
<b>+┊   ┊243┊        await this.repository.remove(chat);</b>
<b>+┊   ┊244┊      } else {</b>
<b>+┊   ┊245┊        // Update the chat</b>
<b>+┊   ┊246┊        await this.repository.save(chat);</b>
<b>+┊   ┊247┊      }</b>
<b>+┊   ┊248┊</b>
<b>+┊   ┊249┊      return chatId;</b>
<b>+┊   ┊250┊    } else {</b>
<b>+┊   ┊251┊      // Group</b>
<b>+┊   ┊252┊</b>
<b>+┊   ┊253┊      // Remove the current user from who gets the group listed. The group will no longer appear in his list</b>
<b>+┊   ┊254┊      chat.listingMembers &#x3D; chat.listingMembers.filter(user &#x3D;&gt; user.id !&#x3D;&#x3D; this.currentUser.id);</b>
<b>+┊   ┊255┊</b>
<b>+┊   ┊256┊      // Check how many members (including previous ones who can still access old messages) are left</b>
<b>+┊   ┊257┊      if (chat.listingMembers.length &#x3D;&#x3D;&#x3D; 0) {</b>
<b>+┊   ┊258┊        // Remove the group</b>
<b>+┊   ┊259┊        await this.repository.remove(chat);</b>
<b>+┊   ┊260┊      } else {</b>
<b>+┊   ┊261┊        // TODO: Implement for group</b>
<b>+┊   ┊262┊        chat.owner &#x3D; chat.listingMembers[0]</b>
<b>+┊   ┊263┊</b>
<b>+┊   ┊264┊        await this.repository.save(chat);</b>
<b>+┊   ┊265┊      }</b>
<b>+┊   ┊266┊</b>
<b>+┊   ┊267┊      return chatId;</b>
<b>+┊   ┊268┊    }</b>
<b>+┊   ┊269┊  }</b>
 ┊162┊270┊}
</pre>

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊14┊      name: name || &#x27;&#x27;,
 ┊15┊15┊      picture: picture || &#x27;&#x27;,
 ┊16┊16┊    }),
<b>+┊  ┊17┊    addChat: (obj, { userId }, { injector }) &#x3D;&gt; injector.get(ChatProvider).addChat(userId),</b>
<b>+┊  ┊18┊    removeChat: (obj, { chatId }, { injector }) &#x3D;&gt; injector.get(ChatProvider).removeChat(chatId),</b>
 ┊17┊19┊  },
 ┊18┊20┊  Subscription: {
 ┊19┊21┊    chatUpdated: {
</pre>

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊21┊  #If null the group is read-only. Null for chats.
 ┊22┊22┊  owner: User
 ┊23┊23┊}
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊type Mutation {</b>
<b>+┊  ┊26┊  addChat(userId: ID!): Chat</b>
<b>+┊  ┊27┊  removeChat(chatId: ID!): ID</b>
<b>+┊  ┊28┊}</b>
</pre>

##### Changed modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Injectable } from &#x27;@graphql-modules/di&#x27;
<b>+┊ ┊2┊import { PubSub } from &#x27;apollo-server-express&#x27;</b>
 ┊2┊3┊import { Connection } from &#x27;typeorm&#x27;
 ┊3┊4┊import { MessageType } from &#x27;../../../db&#x27;
 ┊4┊5┊import { Chat } from &#x27;../../../entity/chat&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊11┊12┊@Injectable()
 ┊12┊13┊export class MessageProvider {
 ┊13┊14┊  constructor(
<b>+┊  ┊15┊    private pubsub: PubSub,</b>
 ┊14┊16┊    private connection: Connection,
 ┊15┊17┊    private chatProvider: ChatProvider,
 ┊16┊18┊    private authProvider: AuthProvider,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 24┊ 26┊    return this.connection.createQueryBuilder(Message, &#x27;message&#x27;)
 ┊ 25┊ 27┊  }
 ┊ 26┊ 28┊
<b>+┊   ┊ 29┊  async addMessage(chatId: string, content: string) {</b>
<b>+┊   ┊ 30┊    if (content &#x3D;&#x3D;&#x3D; null || content &#x3D;&#x3D;&#x3D; &#x27;&#x27;) {</b>
<b>+┊   ┊ 31┊      throw new Error(&#x60;Cannot add empty or null messages.&#x60;);</b>
<b>+┊   ┊ 32┊    }</b>
<b>+┊   ┊ 33┊</b>
<b>+┊   ┊ 34┊    let chat &#x3D; await this.chatProvider</b>
<b>+┊   ┊ 35┊      .createQueryBuilder()</b>
<b>+┊   ┊ 36┊      .whereInIds(chatId)</b>
<b>+┊   ┊ 37┊      .innerJoinAndSelect(&#x27;chat.allTimeMembers&#x27;, &#x27;allTimeMembers&#x27;)</b>
<b>+┊   ┊ 38┊      .innerJoinAndSelect(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)</b>
<b>+┊   ┊ 39┊      .getOne();</b>
<b>+┊   ┊ 40┊</b>
<b>+┊   ┊ 41┊    if (!chat) {</b>
<b>+┊   ┊ 42┊      throw new Error(&#x60;Cannot find chat ${chatId}.&#x60;);</b>
<b>+┊   ┊ 43┊    }</b>
<b>+┊   ┊ 44┊</b>
<b>+┊   ┊ 45┊    let holders: User[];</b>
<b>+┊   ┊ 46┊</b>
<b>+┊   ┊ 47┊    if (!chat.name) {</b>
<b>+┊   ┊ 48┊      // Chat</b>
<b>+┊   ┊ 49┊      if (!chat.listingMembers.map(user &#x3D;&gt; user.id).includes(this.currentUser.id)) {</b>
<b>+┊   ┊ 50┊        throw new Error(&#x60;The chat ${chatId} must be listed for the current user in order to add a message.&#x60;);</b>
<b>+┊   ┊ 51┊      }</b>
<b>+┊   ┊ 52┊</b>
<b>+┊   ┊ 53┊      // Receiver&#x27;s user</b>
<b>+┊   ┊ 54┊      const user &#x3D; chat.allTimeMembers.find(user &#x3D;&gt; user.id !&#x3D;&#x3D; this.currentUser.id);</b>
<b>+┊   ┊ 55┊</b>
<b>+┊   ┊ 56┊      if (!user) {</b>
<b>+┊   ┊ 57┊        throw new Error(&#x60;Cannot find receiver&#x27;s user.&#x60;);</b>
<b>+┊   ┊ 58┊      }</b>
<b>+┊   ┊ 59┊</b>
<b>+┊   ┊ 60┊      if (!chat.listingMembers.find(listingMember &#x3D;&gt; listingMember.id &#x3D;&#x3D;&#x3D; user.id)) {</b>
<b>+┊   ┊ 61┊        // Chat is not listed for the receiver user. Add him to the listingIds</b>
<b>+┊   ┊ 62┊        chat.listingMembers.push(user);</b>
<b>+┊   ┊ 63┊</b>
<b>+┊   ┊ 64┊        await this.chatProvider.repository.save(chat);</b>
<b>+┊   ┊ 65┊      }</b>
<b>+┊   ┊ 66┊</b>
<b>+┊   ┊ 67┊      holders &#x3D; chat.listingMembers;</b>
<b>+┊   ┊ 68┊    } else {</b>
<b>+┊   ┊ 69┊      // TODO: Implement for groups</b>
<b>+┊   ┊ 70┊      holders &#x3D; chat.listingMembers</b>
<b>+┊   ┊ 71┊    }</b>
<b>+┊   ┊ 72┊</b>
<b>+┊   ┊ 73┊    const message &#x3D; await this.repository.save(new Message({</b>
<b>+┊   ┊ 74┊      chat,</b>
<b>+┊   ┊ 75┊      sender: this.currentUser,</b>
<b>+┊   ┊ 76┊      content,</b>
<b>+┊   ┊ 77┊      type: MessageType.TEXT,</b>
<b>+┊   ┊ 78┊      holders,</b>
<b>+┊   ┊ 79┊    }));</b>
<b>+┊   ┊ 80┊</b>
<b>+┊   ┊ 81┊    this.pubsub.publish(&#x27;messageAdded&#x27;, {</b>
<b>+┊   ┊ 82┊      messageAdded: message,</b>
<b>+┊   ┊ 83┊    });</b>
<b>+┊   ┊ 84┊</b>
<b>+┊   ┊ 85┊    return message || null;</b>
<b>+┊   ┊ 86┊  }</b>
<b>+┊   ┊ 87┊</b>
<b>+┊   ┊ 88┊  async _removeMessages(</b>
<b>+┊   ┊ 89┊</b>
<b>+┊   ┊ 90┊    chatId: string,</b>
<b>+┊   ┊ 91┊    {</b>
<b>+┊   ┊ 92┊      messageIds,</b>
<b>+┊   ┊ 93┊      all,</b>
<b>+┊   ┊ 94┊    }: {</b>
<b>+┊   ┊ 95┊      messageIds?: string[]</b>
<b>+┊   ┊ 96┊      all?: boolean</b>
<b>+┊   ┊ 97┊    } &#x3D; {},</b>
<b>+┊   ┊ 98┊  ) {</b>
<b>+┊   ┊ 99┊    const chat &#x3D; await this.chatProvider</b>
<b>+┊   ┊100┊      .createQueryBuilder()</b>
<b>+┊   ┊101┊      .whereInIds(chatId)</b>
<b>+┊   ┊102┊      .innerJoinAndSelect(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)</b>
<b>+┊   ┊103┊      .innerJoinAndSelect(&#x27;chat.messages&#x27;, &#x27;messages&#x27;)</b>
<b>+┊   ┊104┊      .innerJoinAndSelect(&#x27;messages.holders&#x27;, &#x27;holders&#x27;)</b>
<b>+┊   ┊105┊      .getOne();</b>
<b>+┊   ┊106┊</b>
<b>+┊   ┊107┊    if (!chat) {</b>
<b>+┊   ┊108┊      throw new Error(&#x60;Cannot find chat ${chatId}.&#x60;);</b>
<b>+┊   ┊109┊    }</b>
<b>+┊   ┊110┊</b>
<b>+┊   ┊111┊    if (!chat.listingMembers.find(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; this.currentUser.id)) {</b>
<b>+┊   ┊112┊      throw new Error(&#x60;The chat/group ${chatId} is not listed for the current user so there is nothing to delete.&#x60;);</b>
<b>+┊   ┊113┊    }</b>
<b>+┊   ┊114┊</b>
<b>+┊   ┊115┊    if (all &amp;&amp; messageIds) {</b>
<b>+┊   ┊116┊      throw new Error(&#x60;Cannot specify both &#x27;all&#x27; and &#x27;messageIds&#x27;.&#x60;)</b>
<b>+┊   ┊117┊    }</b>
<b>+┊   ┊118┊</b>
<b>+┊   ┊119┊    if (!all &amp;&amp; !(messageIds &amp;&amp; messageIds.length)) {</b>
<b>+┊   ┊120┊      throw new Error(&#x60;&#x27;all&#x27; and &#x27;messageIds&#x27; cannot be both null&#x60;)</b>
<b>+┊   ┊121┊    }</b>
<b>+┊   ┊122┊</b>
<b>+┊   ┊123┊    let deletedIds: string[] &#x3D; [];</b>
<b>+┊   ┊124┊    let removedMessages: Message[] &#x3D; [];</b>
<b>+┊   ┊125┊    // Instead of chaining map and filter we can loop once using reduce</b>
<b>+┊   ┊126┊    chat.messages &#x3D; await chat.messages.reduce&lt;Promise&lt;Message[]&gt;&gt;(async (filtered$, message) &#x3D;&gt; {</b>
<b>+┊   ┊127┊      const filtered &#x3D; await filtered$;</b>
<b>+┊   ┊128┊</b>
<b>+┊   ┊129┊      if (all || messageIds!.includes(message.id)) {</b>
<b>+┊   ┊130┊        deletedIds.push(message.id);</b>
<b>+┊   ┊131┊        // Remove the current user from the message holders</b>
<b>+┊   ┊132┊        message.holders &#x3D; message.holders.filter(user &#x3D;&gt; user.id !&#x3D;&#x3D; this.currentUser.id);</b>
<b>+┊   ┊133┊</b>
<b>+┊   ┊134┊      }</b>
<b>+┊   ┊135┊</b>
<b>+┊   ┊136┊      if (message.holders.length !&#x3D;&#x3D; 0) {</b>
<b>+┊   ┊137┊        // Remove the current user from the message holders</b>
<b>+┊   ┊138┊        await this.repository.save(message);</b>
<b>+┊   ┊139┊        filtered.push(message);</b>
<b>+┊   ┊140┊      } else {</b>
<b>+┊   ┊141┊        // Message is flagged for removal</b>
<b>+┊   ┊142┊        removedMessages.push(message);</b>
<b>+┊   ┊143┊      }</b>
<b>+┊   ┊144┊</b>
<b>+┊   ┊145┊      return filtered;</b>
<b>+┊   ┊146┊    }, Promise.resolve([]));</b>
<b>+┊   ┊147┊</b>
<b>+┊   ┊148┊    return { deletedIds, removedMessages };</b>
<b>+┊   ┊149┊  }</b>
<b>+┊   ┊150┊</b>
<b>+┊   ┊151┊  async removeMessages(</b>
<b>+┊   ┊152┊</b>
<b>+┊   ┊153┊    chatId: string,</b>
<b>+┊   ┊154┊    {</b>
<b>+┊   ┊155┊      messageIds,</b>
<b>+┊   ┊156┊      all,</b>
<b>+┊   ┊157┊    }: {</b>
<b>+┊   ┊158┊      messageIds?: string[]</b>
<b>+┊   ┊159┊      all?: boolean</b>
<b>+┊   ┊160┊    } &#x3D; {},</b>
<b>+┊   ┊161┊  ) {</b>
<b>+┊   ┊162┊    const { deletedIds, removedMessages } &#x3D; await this._removeMessages(chatId, { messageIds, all });</b>
<b>+┊   ┊163┊</b>
<b>+┊   ┊164┊    for (let message of removedMessages) {</b>
<b>+┊   ┊165┊      await this.repository.remove(message);</b>
<b>+┊   ┊166┊    }</b>
<b>+┊   ┊167┊</b>
<b>+┊   ┊168┊    return deletedIds;</b>
<b>+┊   ┊169┊  }</b>
<b>+┊   ┊170┊</b>
<b>+┊   ┊171┊  async _removeChatGetMessages(chatId: string) {</b>
<b>+┊   ┊172┊    let messages &#x3D; await this.createQueryBuilder()</b>
<b>+┊   ┊173┊      .innerJoin(&#x27;message.chat&#x27;, &#x27;chat&#x27;, &#x27;chat.id &#x3D; :chatId&#x27;, { chatId })</b>
<b>+┊   ┊174┊      .leftJoinAndSelect(&#x27;message.holders&#x27;, &#x27;holders&#x27;)</b>
<b>+┊   ┊175┊      .getMany();</b>
<b>+┊   ┊176┊</b>
<b>+┊   ┊177┊    messages &#x3D; messages.map(message &#x3D;&gt; ({</b>
<b>+┊   ┊178┊      ...message,</b>
<b>+┊   ┊179┊      holders: message.holders.filter(user &#x3D;&gt; user.id !&#x3D;&#x3D; this.currentUser.id),</b>
<b>+┊   ┊180┊    }));</b>
<b>+┊   ┊181┊</b>
<b>+┊   ┊182┊    return messages;</b>
<b>+┊   ┊183┊  }</b>
<b>+┊   ┊184┊</b>
<b>+┊   ┊185┊  async removeChat(chatId: string, messages?: Message[]) {</b>
<b>+┊   ┊186┊    if (!messages) {</b>
<b>+┊   ┊187┊      messages &#x3D; await this._removeChatGetMessages(chatId);</b>
<b>+┊   ┊188┊    }</b>
<b>+┊   ┊189┊</b>
<b>+┊   ┊190┊    for (let message of messages) {</b>
<b>+┊   ┊191┊      message.holders &#x3D; message.holders.filter(user &#x3D;&gt; user.id !&#x3D;&#x3D; this.currentUser.id);</b>
<b>+┊   ┊192┊</b>
<b>+┊   ┊193┊      if (message.holders.length !&#x3D;&#x3D; 0) {</b>
<b>+┊   ┊194┊        // Remove the current user from the message holders</b>
<b>+┊   ┊195┊        await this.repository.save(message);</b>
<b>+┊   ┊196┊      } else {</b>
<b>+┊   ┊197┊        // Simply remove the message</b>
<b>+┊   ┊198┊        await this.repository.remove(message);</b>
<b>+┊   ┊199┊      }</b>
<b>+┊   ┊200┊    }</b>
<b>+┊   ┊201┊</b>
<b>+┊   ┊202┊    return await this.chatProvider.removeChat(chatId);</b>
<b>+┊   ┊203┊  }</b>
<b>+┊   ┊204┊</b>
 ┊ 27┊205┊  async getMessageSender(message: Message) {
 ┊ 28┊206┊    const sender &#x3D; await this.userProvider
 ┊ 29┊207┊      .createQueryBuilder()
</pre>

##### Changed modules&#x2F;message&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 8┊ 8┊    // The ordering depends on the messages
 ┊ 9┊ 9┊    chats: (obj, args, { injector }) &#x3D;&gt; injector.get(MessageProvider).getChats(),
 ┊10┊10┊  },
<b>+┊  ┊11┊  Mutation: {</b>
<b>+┊  ┊12┊    addMessage: async (obj, { chatId, content }, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊13┊      injector.get(MessageProvider).addMessage(chatId, content),</b>
<b>+┊  ┊14┊    removeMessages: async (obj, { chatId, messageIds, all }, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊15┊      injector.get(MessageProvider).removeMessages(chatId, {</b>
<b>+┊  ┊16┊        messageIds: messageIds || undefined,</b>
<b>+┊  ┊17┊        all: all || false,</b>
<b>+┊  ┊18┊      }),</b>
<b>+┊  ┊19┊    // We may need to also remove the messages</b>
<b>+┊  ┊20┊    removeChat: async (obj, { chatId }, { injector }) &#x3D;&gt; injector.get(MessageProvider).removeChat(chatId),</b>
<b>+┊  ┊21┊  },</b>
 ┊11┊22┊  Chat: {
 ┊12┊23┊    messages: async (chat, { amount }, { injector }) &#x3D;&gt;
 ┊13┊24┊      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
</pre>

##### Changed modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊23┊23┊  #Computed property
 ┊24┊24┊  ownership: Boolean!
 ┊25┊25┊}
<b>+┊  ┊26┊</b>
<b>+┊  ┊27┊type Mutation {</b>
<b>+┊  ┊28┊  addMessage(chatId: ID!, content: String!): Message</b>
<b>+┊  ┊29┊  removeMessages(chatId: ID!, messageIds: [ID!], all: Boolean): [ID]!</b>
<b>+┊  ┊30┊}</b>
</pre>

[}]: #

Remember that every change that happens in the back-end should trigger a subscription that will notify all the use regards that change. For the current flow, we should have the following subscriptions:

- `messageAdded` subscription
- `userAdded` subscription
- `userUpdated` subscription - Since we will be able to create a new chat by picking from a users list, this list needs to be synced with the most recent changes.

Let's implement these subscriptions:

[{]: <helper> (diffStep 3.3 module="server")

#### Step 3.3: Add necessary subscriptions

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊18┊    removeChat: (obj, { chatId }, { injector }) &#x3D;&gt; injector.get(ChatProvider).removeChat(chatId),
 ┊19┊19┊  },
 ┊20┊20┊  Subscription: {
<b>+┊  ┊21┊    chatAdded: {</b>
<b>+┊  ┊22┊      subscribe: withFilter((root, args, { injector }: ModuleContext) &#x3D;&gt; injector.get(PubSub).asyncIterator(&#x27;chatAdded&#x27;),</b>
<b>+┊  ┊23┊        (data: { chatAdded: Chat, creatorId: string }, variables, { injector }: ModuleContext) &#x3D;&gt;</b>
<b>+┊  ┊24┊          data &amp;&amp; injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatAdded, data.creatorId)</b>
<b>+┊  ┊25┊      ),</b>
<b>+┊  ┊26┊    },</b>
 ┊21┊27┊    chatUpdated: {
 ┊22┊28┊      subscribe: withFilter((root, args, { injector }: ModuleContext) &#x3D;&gt; injector.get(PubSub).asyncIterator(&#x27;chatUpdated&#x27;),
 ┊23┊29┊        (data: { chatUpdated: Chat, updaterId: string }, variables, { injector }: ModuleContext) &#x3D;&gt;
</pre>

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊}
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊type Subscription {
<b>+┊  ┊ 7┊  chatAdded: Chat</b>
 ┊ 7┊ 8┊  chatUpdated: Chat
 ┊ 8┊ 9┊}
 ┊ 9┊10┊
</pre>

##### Changed modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊62┊62┊        chat.listingMembers.push(user);
 ┊63┊63┊
 ┊64┊64┊        await this.chatProvider.repository.save(chat);
<b>+┊  ┊65┊</b>
<b>+┊  ┊66┊        this.pubsub.publish(&#x27;chatAdded&#x27;, {</b>
<b>+┊  ┊67┊          creatorId: this.currentUser.id,</b>
<b>+┊  ┊68┊          chatAdded: chat,</b>
<b>+┊  ┊69┊        });</b>
 ┊65┊70┊      }
 ┊66┊71┊
 ┊67┊72┊      holders &#x3D; chat.listingMembers;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊317┊322┊
 ┊318┊323┊    return latestMessage ? latestMessage.createdAt : null
 ┊319┊324┊  }
<b>+┊   ┊325┊</b>
<b>+┊   ┊326┊  async filterMessageAdded(messageAdded: Message) {</b>
<b>+┊   ┊327┊    const relevantUsers &#x3D; (await this.userProvider</b>
<b>+┊   ┊328┊      .createQueryBuilder()</b>
<b>+┊   ┊329┊      .innerJoin(</b>
<b>+┊   ┊330┊        &#x27;user.listingMemberChats&#x27;,</b>
<b>+┊   ┊331┊        &#x27;listingMemberChats&#x27;,</b>
<b>+┊   ┊332┊        &#x27;listingMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊333┊        { chatId: messageAdded.chat.id }</b>
<b>+┊   ┊334┊      )</b>
<b>+┊   ┊335┊      .getMany()).filter(user &#x3D;&gt; user.id !&#x3D; messageAdded.sender.id)</b>
<b>+┊   ┊336┊</b>
<b>+┊   ┊337┊    return relevantUsers.some(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; this.currentUser.id)</b>
<b>+┊   ┊338┊  }</b>
 ┊320┊339┊}
</pre>

##### Changed modules&#x2F;message&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { ModuleContext } from &#x27;@graphql-modules/core&#x27;
<b>+┊ ┊2┊import { PubSub, withFilter } from &#x27;apollo-server-express&#x27;</b>
 ┊2┊3┊import { Message } from &#x27;../../../entity/message&#x27;
 ┊3┊4┊import { IResolvers } from &#x27;../../../types&#x27;
 ┊4┊5┊import { MessageProvider } from &#x27;../providers/message.provider&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊19┊20┊    // We may need to also remove the messages
 ┊20┊21┊    removeChat: async (obj, { chatId }, { injector }) &#x3D;&gt; injector.get(MessageProvider).removeChat(chatId),
 ┊21┊22┊  },
<b>+┊  ┊23┊  Subscription: {</b>
<b>+┊  ┊24┊    messageAdded: {</b>
<b>+┊  ┊25┊      subscribe: withFilter((root, args, { injector }: ModuleContext) &#x3D;&gt; injector.get(PubSub).asyncIterator(&#x27;messageAdded&#x27;),</b>
<b>+┊  ┊26┊        (data: { messageAdded: Message }, variables, { injector }: ModuleContext) &#x3D;&gt; data &amp;&amp; injector.get(MessageProvider).filterMessageAdded(data.messageAdded)</b>
<b>+┊  ┊27┊      ),</b>
<b>+┊  ┊28┊    },</b>
<b>+┊  ┊29┊  },</b>
 ┊22┊30┊  Chat: {
 ┊23┊31┊    messages: async (chat, { amount }, { injector }) &#x3D;&gt;
 ┊24┊32┊      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
</pre>

##### Changed modules&#x2F;message&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊type Subscription {</b>
<b>+┊ ┊2┊  messageAdded: Message</b>
<b>+┊ ┊3┊}</b>
<b>+┊ ┊4┊</b>
 ┊1┊5┊enum MessageType {
 ┊2┊6┊  LOCATION
 ┊3┊7┊  TEXT
</pre>

##### Changed modules&#x2F;user&#x2F;providers&#x2F;user.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Injectable, ProviderScope } from &#x27;@graphql-modules/di&#x27;
<b>+┊ ┊2┊import { PubSub } from &#x27;apollo-server-express&#x27;</b>
 ┊2┊3┊import cloudinary from &#x27;cloudinary&#x27;
 ┊3┊4┊import { Connection } from &#x27;typeorm&#x27;
 ┊4┊5┊import { User } from &#x27;../../../entity/user&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 7┊
 ┊ 7┊ 8┊@Injectable()
 ┊ 8┊ 9┊export class UserProvider {
<b>+┊  ┊10┊  constructor(</b>
<b>+┊  ┊11┊    private pubsub: PubSub,</b>
<b>+┊  ┊12┊    private connection: Connection,</b>
<b>+┊  ┊13┊    private authProvider: AuthProvider,</b>
<b>+┊  ┊14┊  ) {}</b>
 ┊10┊15┊
 ┊11┊16┊  public repository &#x3D; this.connection.getRepository(User)
 ┊12┊17┊  private currentUser &#x3D; this.authProvider.currentUser
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊41┊46┊
 ┊42┊47┊    await this.repository.save(this.currentUser);
 ┊43┊48┊
<b>+┊  ┊49┊    this.pubsub.publish(&#x27;userUpdated&#x27;, {</b>
<b>+┊  ┊50┊      userUpdated: this.currentUser,</b>
<b>+┊  ┊51┊    });</b>
<b>+┊  ┊52┊</b>
 ┊44┊53┊    return this.currentUser;
 ┊45┊54┊  }
 ┊46┊55┊
<b>+┊  ┊56┊  filterUserAddedOrUpdated(userAddedOrUpdated: User) {</b>
<b>+┊  ┊57┊    return userAddedOrUpdated.id !&#x3D;&#x3D; this.currentUser.id;</b>
<b>+┊  ┊58┊  }</b>
<b>+┊  ┊59┊</b>
 ┊47┊60┊  uploadProfilePic(filePath: string) {
 ┊48┊61┊    return new Promise((resolve, reject) &#x3D;&gt; {
 ┊49┊62┊      cloudinary.v2.uploader.upload(filePath, (error, result) &#x3D;&gt; {
</pre>

##### Changed modules&#x2F;user&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { ModuleContext } from &#x27;@graphql-modules/core&#x27;
<b>+┊ ┊2┊import { PubSub, withFilter } from &#x27;apollo-server-express&#x27;</b>
 ┊2┊3┊import { User } from &#x27;../../../entity/User&#x27;
 ┊3┊4┊import { IResolvers } from &#x27;../../../types&#x27;
 ┊4┊5┊import { UserProvider } from &#x27;../providers/user.provider&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊15┊      picture: picture || &#x27;&#x27;,
 ┊15┊16┊    }),
 ┊16┊17┊  },
<b>+┊  ┊18┊  Subscription: {</b>
<b>+┊  ┊19┊    userAdded: {</b>
<b>+┊  ┊20┊      subscribe: withFilter(</b>
<b>+┊  ┊21┊        (root, args, { injector }: ModuleContext) &#x3D;&gt; injector.get(PubSub).asyncIterator(&#x27;userAdded&#x27;),</b>
<b>+┊  ┊22┊        (data: { userAdded: User }, variables, { injector }: ModuleContext) &#x3D;&gt; data &amp;&amp; injector.get(UserProvider).filterUserAddedOrUpdated(data.userAdded),</b>
<b>+┊  ┊23┊      ),</b>
<b>+┊  ┊24┊    },</b>
<b>+┊  ┊25┊    userUpdated: {</b>
<b>+┊  ┊26┊      subscribe: withFilter(</b>
<b>+┊  ┊27┊        (root, args, { injector }: ModuleContext) &#x3D;&gt; injector.get(PubSub).asyncIterator(&#x27;userAdded&#x27;),</b>
<b>+┊  ┊28┊        (data: { userUpdated: User }, variables, { injector }: ModuleContext) &#x3D;&gt; data &amp;&amp; injector.get(UserProvider).filterUserAddedOrUpdated(data.userUpdated)</b>
<b>+┊  ┊29┊      ),</b>
<b>+┊  ┊30┊    },</b>
<b>+┊  ┊31┊  },</b>
 ┊17┊32┊} as IResolvers
</pre>

##### Changed modules&#x2F;user&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊  updateUser(name: String, picture: String): User!
 ┊ 8┊ 8┊}
 ┊ 9┊ 9┊
<b>+┊  ┊10┊type Subscription {</b>
<b>+┊  ┊11┊  userAdded: User</b>
<b>+┊  ┊12┊  userUpdated: User</b>
<b>+┊  ┊13┊}</b>
<b>+┊  ┊14┊</b>
 ┊10┊15┊type User {
 ┊11┊16┊  id: ID!
 ┊12┊17┊  name: String
</pre>

[}]: #

Now that we have that ready, we will get back to the client and implement the necessary components. We will start with the chat room screen. The layout consists of the following component:

- A navbar - Includes the name and a picture of the person we're chatting with, a "back" button to navigate back to the main screen, and a pop-over menu where we can remove the chat from.
- A messages list - The list of messages that were sent and received in the chat. This will be a scrollable view where message bubbles are colored differently based on who they belong to. Just like WhatsApp!
- A message box - The input that will be used to write the new message. This will include a "send" button right next to it.

Let's implement the components

[{]: <helper> (diffStep 3.1 files="src/components/ChatRoomScreen" module="client")

#### Step 3.1: Add chat room screen

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;ChatNavbar.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊   ┊  2┊import List from &#x27;@material-ui/core/List&#x27;</b>
<b>+┊   ┊  3┊import ListItem from &#x27;@material-ui/core/ListItem&#x27;</b>
<b>+┊   ┊  4┊import Popover from &#x27;@material-ui/core/Popover&#x27;</b>
<b>+┊   ┊  5┊import ArrowBackIcon from &#x27;@material-ui/icons/ArrowBack&#x27;</b>
<b>+┊   ┊  6┊import DeleteIcon from &#x27;@material-ui/icons/Delete&#x27;</b>
<b>+┊   ┊  7┊import MoreIcon from &#x27;@material-ui/icons/MoreVert&#x27;</b>
<b>+┊   ┊  8┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  9┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊ 10┊import { History } from &#x27;history&#x27;</b>
<b>+┊   ┊ 11┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊ 12┊import { useState } from &#x27;react&#x27;</b>
<b>+┊   ┊ 13┊import { useQuery, useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊ 14┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊ 15┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 16┊import * as queries from &#x27;../../graphql/queries&#x27;</b>
<b>+┊   ┊ 17┊import { ChatNavbarMutation, ChatNavbarQuery, Chats } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 18┊</b>
<b>+┊   ┊ 19┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 20┊  padding: 0;</b>
<b>+┊   ┊ 21┊  display: flex;</b>
<b>+┊   ┊ 22┊  flex-direction: row;</b>
<b>+┊   ┊ 23┊</b>
<b>+┊   ┊ 24┊  margin-left: -20px;</b>
<b>+┊   ┊ 25┊  .ChatNavbar-title {</b>
<b>+┊   ┊ 26┊    line-height: 56px;</b>
<b>+┊   ┊ 27┊  }</b>
<b>+┊   ┊ 28┊</b>
<b>+┊   ┊ 29┊  .ChatNavbar-back-button {</b>
<b>+┊   ┊ 30┊    color: var(--primary-text);</b>
<b>+┊   ┊ 31┊  }</b>
<b>+┊   ┊ 32┊</b>
<b>+┊   ┊ 33┊  .ChatNavbar-picture {</b>
<b>+┊   ┊ 34┊    height: 40px;</b>
<b>+┊   ┊ 35┊    width: 40px;</b>
<b>+┊   ┊ 36┊    margin-top: 3px;</b>
<b>+┊   ┊ 37┊    margin-left: -22px;</b>
<b>+┊   ┊ 38┊    object-fit: cover;</b>
<b>+┊   ┊ 39┊    padding: 5px;</b>
<b>+┊   ┊ 40┊    border-radius: 50%;</b>
<b>+┊   ┊ 41┊  }</b>
<b>+┊   ┊ 42┊</b>
<b>+┊   ┊ 43┊  .ChatNavbar-rest {</b>
<b>+┊   ┊ 44┊    flex: 1;</b>
<b>+┊   ┊ 45┊    justify-content: flex-end;</b>
<b>+┊   ┊ 46┊  }</b>
<b>+┊   ┊ 47┊</b>
<b>+┊   ┊ 48┊  .ChatNavbar-options-btn {</b>
<b>+┊   ┊ 49┊    float: right;</b>
<b>+┊   ┊ 50┊    height: 100%;</b>
<b>+┊   ┊ 51┊    font-size: 1.2em;</b>
<b>+┊   ┊ 52┊    margin-right: -15px;</b>
<b>+┊   ┊ 53┊    color: var(--primary-text);</b>
<b>+┊   ┊ 54┊  }</b>
<b>+┊   ┊ 55┊</b>
<b>+┊   ┊ 56┊  .ChatNavbar-options-item svg {</b>
<b>+┊   ┊ 57┊    margin-right: 10px;</b>
<b>+┊   ┊ 58┊    padding-left: 15px;</b>
<b>+┊   ┊ 59┊  }</b>
<b>+┊   ┊ 60┊&#x60;</b>
<b>+┊   ┊ 61┊</b>
<b>+┊   ┊ 62┊const query &#x3D; gql&#x60;</b>
<b>+┊   ┊ 63┊  query ChatNavbarQuery($chatId: ID!) {</b>
<b>+┊   ┊ 64┊    chat(chatId: $chatId) {</b>
<b>+┊   ┊ 65┊      ...Chat</b>
<b>+┊   ┊ 66┊    }</b>
<b>+┊   ┊ 67┊  }</b>
<b>+┊   ┊ 68┊  ${fragments.chat}</b>
<b>+┊   ┊ 69┊&#x60;</b>
<b>+┊   ┊ 70┊</b>
<b>+┊   ┊ 71┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 72┊  mutation ChatNavbarMutation($chatId: ID!) {</b>
<b>+┊   ┊ 73┊    removeChat(chatId: $chatId)</b>
<b>+┊   ┊ 74┊  }</b>
<b>+┊   ┊ 75┊&#x60;</b>
<b>+┊   ┊ 76┊</b>
<b>+┊   ┊ 77┊interface ChatNavbarProps {</b>
<b>+┊   ┊ 78┊  chatId: string</b>
<b>+┊   ┊ 79┊  history: History</b>
<b>+┊   ┊ 80┊}</b>
<b>+┊   ┊ 81┊</b>
<b>+┊   ┊ 82┊export default ({ chatId, history }: ChatNavbarProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 83┊  const {</b>
<b>+┊   ┊ 84┊    data: { chat },</b>
<b>+┊   ┊ 85┊  } &#x3D; useQuery&lt;ChatNavbarQuery.Query, ChatNavbarQuery.Variables&gt;(query, {</b>
<b>+┊   ┊ 86┊    variables: { chatId },</b>
<b>+┊   ┊ 87┊  })</b>
<b>+┊   ┊ 88┊  const removeChat &#x3D; useMutation&lt;ChatNavbarMutation.Mutation, ChatNavbarMutation.Variables&gt;(</b>
<b>+┊   ┊ 89┊    mutation,</b>
<b>+┊   ┊ 90┊    {</b>
<b>+┊   ┊ 91┊      variables: { chatId },</b>
<b>+┊   ┊ 92┊      update: (client, { data: { removeChat } }) &#x3D;&gt; {</b>
<b>+┊   ┊ 93┊        client.writeFragment({</b>
<b>+┊   ┊ 94┊          id: defaultDataIdFromObject({</b>
<b>+┊   ┊ 95┊            __typename: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 96┊            id: removeChat,</b>
<b>+┊   ┊ 97┊          }),</b>
<b>+┊   ┊ 98┊          fragment: fragments.chat,</b>
<b>+┊   ┊ 99┊          fragmentName: &#x27;Chat&#x27;,</b>
<b>+┊   ┊100┊          data: null,</b>
<b>+┊   ┊101┊        })</b>
<b>+┊   ┊102┊</b>
<b>+┊   ┊103┊        let chats</b>
<b>+┊   ┊104┊        try {</b>
<b>+┊   ┊105┊          chats &#x3D; client.readQuery&lt;Chats.Query&gt;({</b>
<b>+┊   ┊106┊            query: queries.chats,</b>
<b>+┊   ┊107┊          }).chats</b>
<b>+┊   ┊108┊        } catch (e) {}</b>
<b>+┊   ┊109┊</b>
<b>+┊   ┊110┊        if (chats &amp;&amp; chats.some(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; removeChat)) {</b>
<b>+┊   ┊111┊          const index &#x3D; chats.findIndex(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; removeChat)</b>
<b>+┊   ┊112┊          chats.splice(index, 1)</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊          client.writeQuery({</b>
<b>+┊   ┊115┊            query: queries.chats,</b>
<b>+┊   ┊116┊            data: { chats },</b>
<b>+┊   ┊117┊          })</b>
<b>+┊   ┊118┊        }</b>
<b>+┊   ┊119┊      },</b>
<b>+┊   ┊120┊    },</b>
<b>+┊   ┊121┊  )</b>
<b>+┊   ┊122┊  const [popped, setPopped] &#x3D; useState(false)</b>
<b>+┊   ┊123┊</b>
<b>+┊   ┊124┊  const navToChats &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊125┊    history.push(&#x27;/chats&#x27;)</b>
<b>+┊   ┊126┊  }</b>
<b>+┊   ┊127┊</b>
<b>+┊   ┊128┊  const handleRemoveChat &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊129┊    setPopped(false)</b>
<b>+┊   ┊130┊    removeChat().then(navToChats)</b>
<b>+┊   ┊131┊  }</b>
<b>+┊   ┊132┊</b>
<b>+┊   ┊133┊  return (</b>
<b>+┊   ┊134┊    &lt;Style className&#x3D;{name}&gt;</b>
<b>+┊   ┊135┊      &lt;Button className&#x3D;&quot;ChatNavbar-back-button&quot; onClick&#x3D;{navToChats}&gt;</b>
<b>+┊   ┊136┊        &lt;ArrowBackIcon /&gt;</b>
<b>+┊   ┊137┊      &lt;/Button&gt;</b>
<b>+┊   ┊138┊      &lt;img</b>
<b>+┊   ┊139┊        className&#x3D;&quot;ChatNavbar-picture&quot;</b>
<b>+┊   ┊140┊        src&#x3D;{chat.picture || &#x27;/assets/default-profile-pic.jpg&#x27;}</b>
<b>+┊   ┊141┊      /&gt;</b>
<b>+┊   ┊142┊      &lt;div className&#x3D;&quot;ChatNavbar-title&quot;&gt;{chat.name}&lt;/div&gt;</b>
<b>+┊   ┊143┊      &lt;div className&#x3D;&quot;ChatNavbar-rest&quot;&gt;</b>
<b>+┊   ┊144┊        &lt;Button className&#x3D;&quot;ChatNavbar-options-btn&quot; onClick&#x3D;{setPopped.bind(null, true)}&gt;</b>
<b>+┊   ┊145┊          &lt;MoreIcon /&gt;</b>
<b>+┊   ┊146┊        &lt;/Button&gt;</b>
<b>+┊   ┊147┊      &lt;/div&gt;</b>
<b>+┊   ┊148┊      &lt;Popover</b>
<b>+┊   ┊149┊        open&#x3D;{popped}</b>
<b>+┊   ┊150┊        onClose&#x3D;{setPopped.bind(null, false)}</b>
<b>+┊   ┊151┊        anchorOrigin&#x3D;{{</b>
<b>+┊   ┊152┊          vertical: &#x27;top&#x27;,</b>
<b>+┊   ┊153┊          horizontal: &#x27;right&#x27;,</b>
<b>+┊   ┊154┊        }}</b>
<b>+┊   ┊155┊        transformOrigin&#x3D;{{</b>
<b>+┊   ┊156┊          vertical: &#x27;top&#x27;,</b>
<b>+┊   ┊157┊          horizontal: &#x27;right&#x27;,</b>
<b>+┊   ┊158┊        }}</b>
<b>+┊   ┊159┊      &gt;</b>
<b>+┊   ┊160┊        &lt;Style style&#x3D;{{ marginLeft: &#x27;-15px&#x27; }}&gt;</b>
<b>+┊   ┊161┊          &lt;List&gt;</b>
<b>+┊   ┊162┊            &lt;ListItem className&#x3D;&quot;ChatNavbar-options-item&quot; button onClick&#x3D;{handleRemoveChat}&gt;</b>
<b>+┊   ┊163┊              &lt;DeleteIcon /&gt;</b>
<b>+┊   ┊164┊              Delete</b>
<b>+┊   ┊165┊            &lt;/ListItem&gt;</b>
<b>+┊   ┊166┊          &lt;/List&gt;</b>
<b>+┊   ┊167┊        &lt;/Style&gt;</b>
<b>+┊   ┊168┊      &lt;/Popover&gt;</b>
<b>+┊   ┊169┊    &lt;/Style&gt;</b>
<b>+┊   ┊170┊  )</b>
<b>+┊   ┊171┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;MessageBox.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊   ┊  2┊import SendIcon from &#x27;@material-ui/icons/Send&#x27;</b>
<b>+┊   ┊  3┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  4┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  5┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  6┊import { useState } from &#x27;react&#x27;</b>
<b>+┊   ┊  7┊import { useQuery, useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  8┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  9┊import { time as uniqid } from &#x27;uniqid&#x27;</b>
<b>+┊   ┊ 10┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 11┊import { MessageBoxMutation, FullChat, Message } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 12┊import { useMe } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊ 13┊</b>
<b>+┊   ┊ 14┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 15┊  display: flex;</b>
<b>+┊   ┊ 16┊  height: 50px;</b>
<b>+┊   ┊ 17┊  padding: 5px;</b>
<b>+┊   ┊ 18┊  width: calc(100% - 10px);</b>
<b>+┊   ┊ 19┊</b>
<b>+┊   ┊ 20┊  .MessageBox-input {</b>
<b>+┊   ┊ 21┊    width: calc(100% - 50px);</b>
<b>+┊   ┊ 22┊    border: none;</b>
<b>+┊   ┊ 23┊    border-radius: 999px;</b>
<b>+┊   ┊ 24┊    padding: 10px;</b>
<b>+┊   ┊ 25┊    padding-left: 20px;</b>
<b>+┊   ┊ 26┊    padding-right: 20px;</b>
<b>+┊   ┊ 27┊    font-size: 15px;</b>
<b>+┊   ┊ 28┊    outline: none;</b>
<b>+┊   ┊ 29┊    box-shadow: 0 1px silver;</b>
<b>+┊   ┊ 30┊    font-size: 18px;</b>
<b>+┊   ┊ 31┊    line-height: 45px;</b>
<b>+┊   ┊ 32┊  }</b>
<b>+┊   ┊ 33┊</b>
<b>+┊   ┊ 34┊  .MessageBox-button {</b>
<b>+┊   ┊ 35┊    min-width: 50px;</b>
<b>+┊   ┊ 36┊    width: 50px;</b>
<b>+┊   ┊ 37┊    border-radius: 999px;</b>
<b>+┊   ┊ 38┊    background-color: var(--primary-bg);</b>
<b>+┊   ┊ 39┊    margin: 0 5px;</b>
<b>+┊   ┊ 40┊    margin-right: 0;</b>
<b>+┊   ┊ 41┊    color: white;</b>
<b>+┊   ┊ 42┊    padding-left: 20px;</b>
<b>+┊   ┊ 43┊    svg {</b>
<b>+┊   ┊ 44┊      margin-left: -3px;</b>
<b>+┊   ┊ 45┊    }</b>
<b>+┊   ┊ 46┊  }</b>
<b>+┊   ┊ 47┊&#x60;</b>
<b>+┊   ┊ 48┊</b>
<b>+┊   ┊ 49┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 50┊  mutation MessageBoxMutation($chatId: ID!, $content: String!) {</b>
<b>+┊   ┊ 51┊    addMessage(chatId: $chatId, content: $content) {</b>
<b>+┊   ┊ 52┊      ...Message</b>
<b>+┊   ┊ 53┊    }</b>
<b>+┊   ┊ 54┊  }</b>
<b>+┊   ┊ 55┊  ${fragments.message}</b>
<b>+┊   ┊ 56┊&#x60;</b>
<b>+┊   ┊ 57┊</b>
<b>+┊   ┊ 58┊interface MessageBoxProps {</b>
<b>+┊   ┊ 59┊  chatId: string</b>
<b>+┊   ┊ 60┊}</b>
<b>+┊   ┊ 61┊</b>
<b>+┊   ┊ 62┊export default ({ chatId }: MessageBoxProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 63┊  const [message, setMessage] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊ 64┊  const me &#x3D; useMe()</b>
<b>+┊   ┊ 65┊</b>
<b>+┊   ┊ 66┊  const addMessage &#x3D; useMutation&lt;MessageBoxMutation.Mutation, MessageBoxMutation.Variables&gt;(</b>
<b>+┊   ┊ 67┊    mutation,</b>
<b>+┊   ┊ 68┊    {</b>
<b>+┊   ┊ 69┊      variables: {</b>
<b>+┊   ┊ 70┊        chatId,</b>
<b>+┊   ┊ 71┊        content: message,</b>
<b>+┊   ┊ 72┊      },</b>
<b>+┊   ┊ 73┊      optimisticResponse: {</b>
<b>+┊   ┊ 74┊        __typename: &#x27;Mutation&#x27;,</b>
<b>+┊   ┊ 75┊        addMessage: {</b>
<b>+┊   ┊ 76┊          id: uniqid(),</b>
<b>+┊   ┊ 77┊          __typename: &#x27;Message&#x27;,</b>
<b>+┊   ┊ 78┊          chat: {</b>
<b>+┊   ┊ 79┊            id: chatId,</b>
<b>+┊   ┊ 80┊            __typename: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 81┊          },</b>
<b>+┊   ┊ 82┊          sender: {</b>
<b>+┊   ┊ 83┊            id: me.id,</b>
<b>+┊   ┊ 84┊            __typename: &#x27;User&#x27;,</b>
<b>+┊   ┊ 85┊            name: me.name,</b>
<b>+┊   ┊ 86┊          },</b>
<b>+┊   ┊ 87┊          content: message,</b>
<b>+┊   ┊ 88┊          createdAt: new Date(),</b>
<b>+┊   ┊ 89┊          type: 0,</b>
<b>+┊   ┊ 90┊          recipients: [],</b>
<b>+┊   ┊ 91┊          ownership: true,</b>
<b>+┊   ┊ 92┊        },</b>
<b>+┊   ┊ 93┊      },</b>
<b>+┊   ┊ 94┊      update: (client, { data: { addMessage } }) &#x3D;&gt; {</b>
<b>+┊   ┊ 95┊        client.writeFragment({</b>
<b>+┊   ┊ 96┊          id: defaultDataIdFromObject(addMessage),</b>
<b>+┊   ┊ 97┊          fragment: fragments.message,</b>
<b>+┊   ┊ 98┊          data: addMessage,</b>
<b>+┊   ┊ 99┊        })</b>
<b>+┊   ┊100┊</b>
<b>+┊   ┊101┊        let fullChat</b>
<b>+┊   ┊102┊        try {</b>
<b>+┊   ┊103┊          fullChat &#x3D; client.readFragment&lt;FullChat.Fragment&gt;({</b>
<b>+┊   ┊104┊            id: defaultDataIdFromObject(addMessage.chat),</b>
<b>+┊   ┊105┊            fragment: fragments.fullChat,</b>
<b>+┊   ┊106┊            fragmentName: &#x27;FullChat&#x27;,</b>
<b>+┊   ┊107┊          })</b>
<b>+┊   ┊108┊        } catch (e) {}</b>
<b>+┊   ┊109┊</b>
<b>+┊   ┊110┊        if (fullChat &amp;&amp; !fullChat.messages.some(message &#x3D;&gt; message.id &#x3D;&#x3D;&#x3D; addMessage.id)) {</b>
<b>+┊   ┊111┊          fullChat.messages.push(addMessage)</b>
<b>+┊   ┊112┊          fullChat.lastMessage &#x3D; addMessage</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊          client.writeFragment({</b>
<b>+┊   ┊115┊            id: defaultDataIdFromObject(addMessage.chat),</b>
<b>+┊   ┊116┊            fragment: fragments.fullChat,</b>
<b>+┊   ┊117┊            fragmentName: &#x27;FullChat&#x27;,</b>
<b>+┊   ┊118┊            data: fullChat,</b>
<b>+┊   ┊119┊          })</b>
<b>+┊   ┊120┊        }</b>
<b>+┊   ┊121┊      },</b>
<b>+┊   ┊122┊    },</b>
<b>+┊   ┊123┊  )</b>
<b>+┊   ┊124┊</b>
<b>+┊   ┊125┊  const onKeyPress &#x3D; e &#x3D;&gt; {</b>
<b>+┊   ┊126┊    if (e.charCode &#x3D;&#x3D;&#x3D; 13) {</b>
<b>+┊   ┊127┊      submitMessage()</b>
<b>+┊   ┊128┊    }</b>
<b>+┊   ┊129┊  }</b>
<b>+┊   ┊130┊</b>
<b>+┊   ┊131┊  const onChange &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊132┊    setMessage(target.value)</b>
<b>+┊   ┊133┊  }</b>
<b>+┊   ┊134┊</b>
<b>+┊   ┊135┊  const submitMessage &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊136┊    if (!message) return</b>
<b>+┊   ┊137┊</b>
<b>+┊   ┊138┊    addMessage()</b>
<b>+┊   ┊139┊    setMessage(&#x27;&#x27;)</b>
<b>+┊   ┊140┊  }</b>
<b>+┊   ┊141┊</b>
<b>+┊   ┊142┊  return (</b>
<b>+┊   ┊143┊    &lt;Style className&#x3D;&quot;MessageBox&quot;&gt;</b>
<b>+┊   ┊144┊      &lt;input</b>
<b>+┊   ┊145┊        className&#x3D;&quot;MessageBox-input&quot;</b>
<b>+┊   ┊146┊        type&#x3D;&quot;text&quot;</b>
<b>+┊   ┊147┊        placeholder&#x3D;&quot;Type a message&quot;</b>
<b>+┊   ┊148┊        value&#x3D;{message}</b>
<b>+┊   ┊149┊        onKeyPress&#x3D;{onKeyPress}</b>
<b>+┊   ┊150┊        onChange&#x3D;{onChange}</b>
<b>+┊   ┊151┊      /&gt;</b>
<b>+┊   ┊152┊      &lt;Button</b>
<b>+┊   ┊153┊        variant&#x3D;&quot;contained&quot;</b>
<b>+┊   ┊154┊        color&#x3D;&quot;primary&quot;</b>
<b>+┊   ┊155┊        className&#x3D;&quot;MessageBox-button&quot;</b>
<b>+┊   ┊156┊        onClick&#x3D;{submitMessage}</b>
<b>+┊   ┊157┊      &gt;</b>
<b>+┊   ┊158┊        &lt;SendIcon /&gt;</b>
<b>+┊   ┊159┊      &lt;/Button&gt;</b>
<b>+┊   ┊160┊    &lt;/Style&gt;</b>
<b>+┊   ┊161┊  )</b>
<b>+┊   ┊162┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;MessagesList.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  2┊import * as moment from &#x27;moment&#x27;</b>
<b>+┊   ┊  3┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  4┊import { useRef, useEffect } from &#x27;react&#x27;</b>
<b>+┊   ┊  5┊import { useQuery, useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  6┊import * as ReactDOM from &#x27;react-dom&#x27;</b>
<b>+┊   ┊  7┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  8┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊  9┊import { MessagesListQuery } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 10┊</b>
<b>+┊   ┊ 11┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 12┊  display: block;</b>
<b>+┊   ┊ 13┊  height: calc(100% - 60px);</b>
<b>+┊   ┊ 14┊  width: calc(100% - 30px);</b>
<b>+┊   ┊ 15┊  overflow-y: overlay;</b>
<b>+┊   ┊ 16┊  padding: 0 15px;</b>
<b>+┊   ┊ 17┊</b>
<b>+┊   ┊ 18┊  .MessagesList-message {</b>
<b>+┊   ┊ 19┊    display: inline-block;</b>
<b>+┊   ┊ 20┊    position: relative;</b>
<b>+┊   ┊ 21┊    max-width: 100%;</b>
<b>+┊   ┊ 22┊    border-radius: 7px;</b>
<b>+┊   ┊ 23┊    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);</b>
<b>+┊   ┊ 24┊    margin-top: 10px;</b>
<b>+┊   ┊ 25┊    margin-bottom: 10px;</b>
<b>+┊   ┊ 26┊    clear: both;</b>
<b>+┊   ┊ 27┊</b>
<b>+┊   ┊ 28┊    &amp;::after {</b>
<b>+┊   ┊ 29┊      content: &#x27;&#x27;;</b>
<b>+┊   ┊ 30┊      display: table;</b>
<b>+┊   ┊ 31┊      clear: both;</b>
<b>+┊   ┊ 32┊    }</b>
<b>+┊   ┊ 33┊  }</b>
<b>+┊   ┊ 34┊</b>
<b>+┊   ┊ 35┊  .MessagesList-message-mine {</b>
<b>+┊   ┊ 36┊    float: right;</b>
<b>+┊   ┊ 37┊    background-color: #dcf8c6;</b>
<b>+┊   ┊ 38┊</b>
<b>+┊   ┊ 39┊    &amp;::before {</b>
<b>+┊   ┊ 40┊      right: -11px;</b>
<b>+┊   ┊ 41┊      background-image: url(/assets/message-mine.png);</b>
<b>+┊   ┊ 42┊    }</b>
<b>+┊   ┊ 43┊  }</b>
<b>+┊   ┊ 44┊</b>
<b>+┊   ┊ 45┊  .MessagesList-message-others {</b>
<b>+┊   ┊ 46┊    float: left;</b>
<b>+┊   ┊ 47┊    background-color: #fff;</b>
<b>+┊   ┊ 48┊</b>
<b>+┊   ┊ 49┊    &amp;::before {</b>
<b>+┊   ┊ 50┊      left: -11px;</b>
<b>+┊   ┊ 51┊      background-image: url(/assets/message-other.png);</b>
<b>+┊   ┊ 52┊    }</b>
<b>+┊   ┊ 53┊  }</b>
<b>+┊   ┊ 54┊</b>
<b>+┊   ┊ 55┊  .MessagesList-message-others::before,</b>
<b>+┊   ┊ 56┊  .MessagesList-message-mine::before {</b>
<b>+┊   ┊ 57┊    content: &#x27;&#x27;;</b>
<b>+┊   ┊ 58┊    position: absolute;</b>
<b>+┊   ┊ 59┊    bottom: 3px;</b>
<b>+┊   ┊ 60┊    width: 12px;</b>
<b>+┊   ┊ 61┊    height: 19px;</b>
<b>+┊   ┊ 62┊    background-position: 50% 50%;</b>
<b>+┊   ┊ 63┊    background-repeat: no-repeat;</b>
<b>+┊   ┊ 64┊    background-size: contain;</b>
<b>+┊   ┊ 65┊  }</b>
<b>+┊   ┊ 66┊</b>
<b>+┊   ┊ 67┊  .MessagesList-message-sender {</b>
<b>+┊   ┊ 68┊    font-weight: bold;</b>
<b>+┊   ┊ 69┊    margin-left: 5px;</b>
<b>+┊   ┊ 70┊    margin-top: 5px;</b>
<b>+┊   ┊ 71┊  }</b>
<b>+┊   ┊ 72┊</b>
<b>+┊   ┊ 73┊  .MessagesList-message-contents {</b>
<b>+┊   ┊ 74┊    padding: 5px 7px;</b>
<b>+┊   ┊ 75┊    word-wrap: break-word;</b>
<b>+┊   ┊ 76┊</b>
<b>+┊   ┊ 77┊    &amp;::after {</b>
<b>+┊   ┊ 78┊      content: &#x27; \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0&#x27;;</b>
<b>+┊   ┊ 79┊      display: inline;</b>
<b>+┊   ┊ 80┊    }</b>
<b>+┊   ┊ 81┊  }</b>
<b>+┊   ┊ 82┊</b>
<b>+┊   ┊ 83┊  .MessagesList-message-timestamp {</b>
<b>+┊   ┊ 84┊    position: absolute;</b>
<b>+┊   ┊ 85┊    bottom: 2px;</b>
<b>+┊   ┊ 86┊    right: 7px;</b>
<b>+┊   ┊ 87┊    color: gray;</b>
<b>+┊   ┊ 88┊    font-size: 12px;</b>
<b>+┊   ┊ 89┊  }</b>
<b>+┊   ┊ 90┊&#x60;</b>
<b>+┊   ┊ 91┊</b>
<b>+┊   ┊ 92┊const query &#x3D; gql&#x60;</b>
<b>+┊   ┊ 93┊  query MessagesListQuery($chatId: ID!) {</b>
<b>+┊   ┊ 94┊    chat(chatId: $chatId) {</b>
<b>+┊   ┊ 95┊      ...FullChat</b>
<b>+┊   ┊ 96┊    }</b>
<b>+┊   ┊ 97┊  }</b>
<b>+┊   ┊ 98┊  ${fragments.fullChat}</b>
<b>+┊   ┊ 99┊&#x60;</b>
<b>+┊   ┊100┊</b>
<b>+┊   ┊101┊interface MessagesListProps {</b>
<b>+┊   ┊102┊  chatId: string</b>
<b>+┊   ┊103┊}</b>
<b>+┊   ┊104┊</b>
<b>+┊   ┊105┊export default ({ chatId }: MessagesListProps) &#x3D;&gt; {</b>
<b>+┊   ┊106┊  const {</b>
<b>+┊   ┊107┊    data: {</b>
<b>+┊   ┊108┊      chat: { messages },</b>
<b>+┊   ┊109┊    },</b>
<b>+┊   ┊110┊  } &#x3D; useQuery&lt;MessagesListQuery.Query, MessagesListQuery.Variables&gt;(query, {</b>
<b>+┊   ┊111┊    variables: { chatId },</b>
<b>+┊   ┊112┊  })</b>
<b>+┊   ┊113┊  const selfRef &#x3D; useRef(null)</b>
<b>+┊   ┊114┊</b>
<b>+┊   ┊115┊  const resetScrollTop &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊116┊    if (!selfRef.current) return</b>
<b>+┊   ┊117┊</b>
<b>+┊   ┊118┊    const selfDOMNode &#x3D; ReactDOM.findDOMNode(selfRef.current) as HTMLElement</b>
<b>+┊   ┊119┊    selfDOMNode.scrollTop &#x3D; Number.MAX_SAFE_INTEGER</b>
<b>+┊   ┊120┊  }</b>
<b>+┊   ┊121┊</b>
<b>+┊   ┊122┊  useEffect(resetScrollTop, [selfRef.current])</b>
<b>+┊   ┊123┊  useEffect(resetScrollTop, [messages.length])</b>
<b>+┊   ┊124┊</b>
<b>+┊   ┊125┊  return (</b>
<b>+┊   ┊126┊    &lt;Style className&#x3D;{name} ref&#x3D;{selfRef}&gt;</b>
<b>+┊   ┊127┊      {messages &amp;&amp;</b>
<b>+┊   ┊128┊        messages.map(message &#x3D;&gt; (</b>
<b>+┊   ┊129┊          &lt;div</b>
<b>+┊   ┊130┊            key&#x3D;{message.id}</b>
<b>+┊   ┊131┊            className&#x3D;{&#x60;MessagesList-message ${</b>
<b>+┊   ┊132┊              message.ownership ? &#x27;MessagesList-message-mine&#x27; : &#x27;MessagesList-message-others&#x27;</b>
<b>+┊   ┊133┊            }&#x60;}</b>
<b>+┊   ┊134┊          &gt;</b>
<b>+┊   ┊135┊            &lt;div className&#x3D;&quot;MessagesList-message-contents&quot;&gt;{message.content}&lt;/div&gt;</b>
<b>+┊   ┊136┊            &lt;span className&#x3D;&quot;MessagesList-message-timestamp&quot;&gt;</b>
<b>+┊   ┊137┊              {moment(message.createdAt).format(&#x27;HH:mm&#x27;)}</b>
<b>+┊   ┊138┊            &lt;/span&gt;</b>
<b>+┊   ┊139┊          &lt;/div&gt;</b>
<b>+┊   ┊140┊        ))}</b>
<b>+┊   ┊141┊    &lt;/Style&gt;</b>
<b>+┊   ┊142┊  )</b>
<b>+┊   ┊143┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;ChatRoomScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 2┊import { Suspense } from &#x27;react&#x27;</b>
<b>+┊  ┊ 3┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊  ┊ 4┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 5┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊  ┊ 6┊import ChatNavbar from &#x27;./ChatNavbar&#x27;</b>
<b>+┊  ┊ 7┊import MessageBox from &#x27;./MessageBox&#x27;</b>
<b>+┊  ┊ 8┊import MessagesList from &#x27;./MessagesList&#x27;</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊  ┊11┊  .ChatScreen-body {</b>
<b>+┊  ┊12┊    position: relative;</b>
<b>+┊  ┊13┊    background: url(/assets/chat-background.jpg);</b>
<b>+┊  ┊14┊    width: 100%;</b>
<b>+┊  ┊15┊    height: calc(100% - 56px);</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊    .MessagesList {</b>
<b>+┊  ┊18┊      position: absolute;</b>
<b>+┊  ┊19┊      height: calc(100% - 60px);</b>
<b>+┊  ┊20┊      top: 0;</b>
<b>+┊  ┊21┊    }</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊    .MessageBox {</b>
<b>+┊  ┊24┊      position: absolute;</b>
<b>+┊  ┊25┊      bottom: 0;</b>
<b>+┊  ┊26┊      left: 0;</b>
<b>+┊  ┊27┊    }</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊    .AddChatButton {</b>
<b>+┊  ┊30┊      right: 0;</b>
<b>+┊  ┊31┊      bottom: 0;</b>
<b>+┊  ┊32┊    }</b>
<b>+┊  ┊33┊  }</b>
<b>+┊  ┊34┊&#x60;</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊export default ({ match, history }: RouteComponentProps) &#x3D;&gt; {</b>
<b>+┊  ┊37┊  const chatId &#x3D; match.params.chatId</b>
<b>+┊  ┊38┊</b>
<b>+┊  ┊39┊  return (</b>
<b>+┊  ┊40┊    &lt;Style className&#x3D;&quot;ChatScreen Screen&quot;&gt;</b>
<b>+┊  ┊41┊      &lt;Navbar&gt;</b>
<b>+┊  ┊42┊        &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊  ┊43┊          &lt;ChatNavbar chatId&#x3D;{chatId} history&#x3D;{history} /&gt;</b>
<b>+┊  ┊44┊        &lt;/Suspense&gt;</b>
<b>+┊  ┊45┊      &lt;/Navbar&gt;</b>
<b>+┊  ┊46┊      &lt;div className&#x3D;&quot;ChatScreen-body&quot;&gt;</b>
<b>+┊  ┊47┊        &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊  ┊48┊          &lt;MessagesList chatId&#x3D;{chatId} /&gt;</b>
<b>+┊  ┊49┊        &lt;/Suspense&gt;</b>
<b>+┊  ┊50┊        &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊  ┊51┊          &lt;MessageBox chatId&#x3D;{chatId} /&gt;</b>
<b>+┊  ┊52┊        &lt;/Suspense&gt;</b>
<b>+┊  ┊53┊      &lt;/div&gt;</b>
<b>+┊  ┊54┊    &lt;/Style&gt;</b>
<b>+┊  ┊55┊  )</b>
<b>+┊  ┊56┊}</b>
</pre>

[}]: #

We're introduced to new 2 packages in the implementation above:

- [`uniqid`](https://www.npmjs.com/package/uniqid) - Used to generate a unique ID in our optimistic response.
- [`styled-components`](https://www.npmjs.com/package/styled-components) - Used to create encapsulated style for React components.

Let's install them then:

    $ yarn add uniqid@5.0.3 styled-components@4.1.3

You'll notice that there's a new fragment called `fullChat`. The full chat includes the base chat details, plus a list of messages that we're gonna view in the chat room screen. Let's define the fragment then:

[{]: <helper> (diffStep 3.1 files="src/graphql/fragments" module="client")

#### Step 3.1: Add chat room screen

##### Added src&#x2F;graphql&#x2F;fragments&#x2F;fullChat.fragment.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import chat from &#x27;./chat.fragment&#x27;</b>
<b>+┊  ┊ 3┊import message from &#x27;./message.fragment&#x27;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊export default gql &#x60;</b>
<b>+┊  ┊ 6┊  fragment FullChat on Chat {</b>
<b>+┊  ┊ 7┊    ...Chat</b>
<b>+┊  ┊ 8┊    messages {</b>
<b>+┊  ┊ 9┊      ...Message</b>
<b>+┊  ┊10┊    }</b>
<b>+┊  ┊11┊  }</b>
<b>+┊  ┊12┊  ${chat}</b>
<b>+┊  ┊13┊  ${message}</b>
<b>+┊  ┊14┊&#x60;</b>
</pre>

##### Changed src&#x2F;graphql&#x2F;fragments&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export { default as chat } from &#x27;./chat.fragment&#x27;
<b>+┊ ┊2┊export { default as fullChat } from &#x27;./fullChat.fragment&#x27;</b>
 ┊2┊3┊export { default as message } from &#x27;./message.fragment&#x27;
 ┊3┊4┊export { default as user } from &#x27;./user.fragment&#x27;
</pre>

[}]: #

At this point the chat room should be functional. Let's add a dedicated route for it and make it navigatable by clicking on a chat item from the chats list screen:

[{]: <helper> (diffStep 3.1 files="src/App, src/components/ChatsListScreen" module="client")

#### Step 3.1: Add chat room screen

##### Changed src&#x2F;App.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import * as React from &#x27;react&#x27;
 ┊2┊2┊import { BrowserRouter, Route, Redirect } from &#x27;react-router-dom&#x27;
<b>+┊ ┊3┊import ChatRoomScreen from &#x27;./components/ChatRoomScreen&#x27;</b>
 ┊3┊4┊import AnimatedSwitch from &#x27;./components/AnimatedSwitch&#x27;
 ┊4┊5┊import AuthScreen from &#x27;./components/AuthScreen&#x27;
 ┊5┊6┊import ChatsListScreen from &#x27;./components/ChatsListScreen&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊16┊17┊      &lt;Route exact path&#x3D;&quot;/sign-(in|up)&quot; component&#x3D;{AuthScreen} /&gt;
 ┊17┊18┊      &lt;Route exact path&#x3D;&quot;/chats&quot; component&#x3D;{withAuth(ChatsListScreen)} /&gt;
 ┊18┊19┊      &lt;Route exact path&#x3D;&quot;/settings&quot; component&#x3D;{withAuth(SettingsScreen)} /&gt;
<b>+┊  ┊20┊      &lt;Route exact path&#x3D;&quot;/chats/:chatId&quot; component&#x3D;{withAuth(ChatRoomScreen)} /&gt;</b>
 ┊19┊21┊      &lt;Route component&#x3D;{RedirectToChats} /&gt;
 ┊20┊22┊    &lt;/AnimatedSwitch&gt;
 ┊21┊23┊  &lt;/BrowserRouter&gt;
</pre>

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsList.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import List from &#x27;@material-ui/core/List&#x27;
 ┊2┊2┊import ListItem from &#x27;@material-ui/core/ListItem&#x27;
 ┊3┊3┊import gql from &#x27;graphql-tag&#x27;
<b>+┊ ┊4┊import { History } from &#x27;history&#x27;</b>
 ┊4┊5┊import * as moment from &#x27;moment&#x27;
 ┊5┊6┊import * as React from &#x27;react&#x27;
 ┊6┊7┊import { useQuery } from &#x27;react-apollo-hooks&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊71┊72┊  ${fragments.chat}
 ┊72┊73┊&#x60;
 ┊73┊74┊
<b>+┊  ┊75┊interface ChatsListProps {</b>
<b>+┊  ┊76┊  history: History</b>
<b>+┊  ┊77┊}</b>
<b>+┊  ┊78┊</b>
<b>+┊  ┊79┊export default ({ history }: ChatsListProps) &#x3D;&gt; {</b>
 ┊75┊80┊  const {
 ┊76┊81┊    data: { chats },
 ┊77┊82┊  } &#x3D; useQuery&lt;ChatsListQuery.Query&gt;(query)
 ┊78┊83┊
<b>+┊  ┊84┊  const navToChat &#x3D; chatId &#x3D;&gt; {</b>
<b>+┊  ┊85┊    history.push(&#x60;chats/${chatId}&#x60;)</b>
<b>+┊  ┊86┊  }</b>
<b>+┊  ┊87┊</b>
 ┊79┊88┊  return (
 ┊80┊89┊    &lt;Style className&#x3D;&quot;ChatsList&quot;&gt;
 ┊81┊90┊      &lt;List className&#x3D;&quot;ChatsList-chats-list&quot;&gt;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊84┊93┊            key&#x3D;{chat.id}
 ┊85┊94┊            className&#x3D;&quot;ChatsList-chat-item&quot;
 ┊86┊95┊            button
<b>+┊  ┊96┊            onClick&#x3D;{navToChat.bind(null, chat.id)}</b>
 ┊87┊97┊          &gt;
 ┊88┊98┊            &lt;img
 ┊89┊99┊              className&#x3D;&quot;ChatsList-profile-pic&quot;
</pre>

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊11┊11┊      &lt;ChatsNavbar history&#x3D;{history} /&gt;
 ┊12┊12┊    &lt;/Navbar&gt;
 ┊13┊13┊    &lt;Suspense fallback&#x3D;{null}&gt;
<b>+┊  ┊14┊      &lt;ChatsList history&#x3D;{history} /&gt;</b>
 ┊15┊15┊    &lt;/Suspense&gt;
 ┊16┊16┊  &lt;/div&gt;
 ┊17┊17┊)
</pre>

[}]: #

Like we said in the previous step, everything in our application is connected and so whenever there's a mutation or a change in data we should update the cache. Let's define the right subscriptions and update our `cache.service`:

[{]: <helper> (diffStep 3.1 files="src/graphql/subscriptions, src/services/cache" module="client")

#### Step 3.1: Add chat room screen

##### Changed src&#x2F;graphql&#x2F;subscriptions&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export { default as chatUpdated } from &#x27;./chatUpdated.subscription&#x27;
<b>+┊ ┊2┊export { default as messageAdded } from &#x27;./messageAdded.subscription&#x27;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;messageAdded.subscription.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../fragments&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  subscription MessageAdded {</b>
<b>+┊  ┊ 6┊    messageAdded {</b>
<b>+┊  ┊ 7┊      ...Message</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊  ${fragments.message}</b>
<b>+┊  ┊11┊&#x60;</b>
</pre>

##### Changed src&#x2F;services&#x2F;cache.service.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;
 ┊2┊2┊import * as fragments from &#x27;../graphql/fragments&#x27;
 ┊3┊3┊import * as subscriptions from &#x27;../graphql/subscriptions&#x27;
<b>+┊ ┊4┊import * as queries from &#x27;../graphql/queries&#x27;</b>
<b>+┊ ┊5┊import { ChatUpdated, MessageAdded, Message, Chats, FullChat } from &#x27;../graphql/types&#x27;</b>
 ┊5┊6┊import { useSubscription } from &#x27;../polyfills/react-apollo-hooks&#x27;
 ┊6┊7┊
 ┊7┊8┊export const useSubscriptions &#x3D; () &#x3D;&gt; {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊16┊      })
 ┊16┊17┊    },
 ┊17┊18┊  })
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  useSubscription&lt;MessageAdded.Subscription&gt;(subscriptions.messageAdded, {</b>
<b>+┊  ┊21┊    onSubscriptionData: ({ client, subscriptionData: { messageAdded } }) &#x3D;&gt; {</b>
<b>+┊  ┊22┊      client.writeFragment&lt;Message.Fragment&gt;({</b>
<b>+┊  ┊23┊        id: defaultDataIdFromObject(messageAdded),</b>
<b>+┊  ┊24┊        fragment: fragments.message,</b>
<b>+┊  ┊25┊        data: messageAdded,</b>
<b>+┊  ┊26┊      })</b>
<b>+┊  ┊27┊</b>
<b>+┊  ┊28┊      let fullChat</b>
<b>+┊  ┊29┊      try {</b>
<b>+┊  ┊30┊        fullChat &#x3D; client.readFragment&lt;FullChat.Fragment&gt;({</b>
<b>+┊  ┊31┊          id: defaultDataIdFromObject(messageAdded.chat),</b>
<b>+┊  ┊32┊          fragment: fragments.fullChat,</b>
<b>+┊  ┊33┊          fragmentName: &#x27;FullChat&#x27;,</b>
<b>+┊  ┊34┊        })</b>
<b>+┊  ┊35┊      } catch (e) {}</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊      if (fullChat &amp;&amp; !fullChat.messages.some(message &#x3D;&gt; message.id &#x3D;&#x3D;&#x3D; messageAdded.id)) {</b>
<b>+┊  ┊38┊        fullChat.messages.push(messageAdded)</b>
<b>+┊  ┊39┊        fullChat.lastMessage &#x3D; messageAdded</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊        client.writeFragment({</b>
<b>+┊  ┊42┊          id: defaultDataIdFromObject(fullChat),</b>
<b>+┊  ┊43┊          fragment: fragments.fullChat,</b>
<b>+┊  ┊44┊          fragmentName: &#x27;FullChat&#x27;,</b>
<b>+┊  ┊45┊          data: fullChat,</b>
<b>+┊  ┊46┊        })</b>
<b>+┊  ┊47┊      }</b>
<b>+┊  ┊48┊</b>
<b>+┊  ┊49┊      let chats</b>
<b>+┊  ┊50┊      try {</b>
<b>+┊  ┊51┊        chats &#x3D; client.readQuery&lt;Chats.Query&gt;({</b>
<b>+┊  ┊52┊          query: queries.chats,</b>
<b>+┊  ┊53┊        }).chats</b>
<b>+┊  ┊54┊      } catch (e) {}</b>
<b>+┊  ┊55┊</b>
<b>+┊  ┊56┊      if (chats) {</b>
<b>+┊  ┊57┊        const index &#x3D; chats.findIndex(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; messageAdded.chat.id)</b>
<b>+┊  ┊58┊        const chat &#x3D; chats[index]</b>
<b>+┊  ┊59┊        chats.splice(index, 1)</b>
<b>+┊  ┊60┊        chats.unshift(chat)</b>
<b>+┊  ┊61┊</b>
<b>+┊  ┊62┊        client.writeQuery({</b>
<b>+┊  ┊63┊          query: queries.chats,</b>
<b>+┊  ┊64┊          data: { chats },</b>
<b>+┊  ┊65┊        })</b>
<b>+┊  ┊66┊      }</b>
<b>+┊  ┊67┊    },</b>
<b>+┊  ┊68┊  })</b>
 ┊18┊69┊}
</pre>

[}]: #

We've already implemented all the necessary subscription handlers in the server in the beginning of this step, so things should work smoothly.

Now we're gonna implement a users list component where we will be able to pick users and chat with them. The users list component is gonna be global to the rest of the components because we will be using it in other screens in the upcoming steps.

[{]: <helper> (diffStep 3.2 files="src/components/UsersList" module="client")

#### Step 3.2: Add new chat screen

##### Added src&#x2F;components&#x2F;UsersList.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import List from &#x27;@material-ui/core/List&#x27;</b>
<b>+┊   ┊  2┊import ListItem from &#x27;@material-ui/core/ListItem&#x27;</b>
<b>+┊   ┊  3┊import CheckCircle from &#x27;@material-ui/icons/CheckCircle&#x27;</b>
<b>+┊   ┊  4┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  5┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  6┊import { useState } from &#x27;react&#x27;</b>
<b>+┊   ┊  7┊import { useQuery } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  8┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  9┊import * as fragments from &#x27;../graphql/fragments&#x27;</b>
<b>+┊   ┊ 10┊import { UsersListQuery, User } from &#x27;../graphql/types&#x27;</b>
<b>+┊   ┊ 11┊</b>
<b>+┊   ┊ 12┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 13┊  .UsersList-users-list {</b>
<b>+┊   ┊ 14┊    padding: 0;</b>
<b>+┊   ┊ 15┊  }</b>
<b>+┊   ┊ 16┊</b>
<b>+┊   ┊ 17┊  .UsersList-user-item {</b>
<b>+┊   ┊ 18┊    position: relative;</b>
<b>+┊   ┊ 19┊    padding: 7.5px 15px;</b>
<b>+┊   ┊ 20┊    display: flex;</b>
<b>+┊   ┊ 21┊    ${props &#x3D;&gt; props.selectable &amp;&amp; &#x27;cursor: pointer;&#x27;}</b>
<b>+┊   ┊ 22┊  }</b>
<b>+┊   ┊ 23┊</b>
<b>+┊   ┊ 24┊  .UsersList-profile-pic {</b>
<b>+┊   ┊ 25┊    height: 50px;</b>
<b>+┊   ┊ 26┊    width: 50px;</b>
<b>+┊   ┊ 27┊    object-fit: cover;</b>
<b>+┊   ┊ 28┊    border-radius: 50%;</b>
<b>+┊   ┊ 29┊  }</b>
<b>+┊   ┊ 30┊</b>
<b>+┊   ┊ 31┊  .UsersList-name {</b>
<b>+┊   ┊ 32┊    padding-left: 15px;</b>
<b>+┊   ┊ 33┊    font-weight: bold;</b>
<b>+┊   ┊ 34┊  }</b>
<b>+┊   ┊ 35┊</b>
<b>+┊   ┊ 36┊  .UsersList-checkmark {</b>
<b>+┊   ┊ 37┊    position: absolute;</b>
<b>+┊   ┊ 38┊    left: 50px;</b>
<b>+┊   ┊ 39┊    top: 35px;</b>
<b>+┊   ┊ 40┊    color: var(--secondary-bg);</b>
<b>+┊   ┊ 41┊    background-color: white;</b>
<b>+┊   ┊ 42┊    border-radius: 50%;</b>
<b>+┊   ┊ 43┊  }</b>
<b>+┊   ┊ 44┊&#x60;</b>
<b>+┊   ┊ 45┊</b>
<b>+┊   ┊ 46┊const query &#x3D; gql&#x60;</b>
<b>+┊   ┊ 47┊  query UsersListQuery {</b>
<b>+┊   ┊ 48┊    users {</b>
<b>+┊   ┊ 49┊      ...User</b>
<b>+┊   ┊ 50┊    }</b>
<b>+┊   ┊ 51┊  }</b>
<b>+┊   ┊ 52┊  ${fragments.user}</b>
<b>+┊   ┊ 53┊&#x60;</b>
<b>+┊   ┊ 54┊</b>
<b>+┊   ┊ 55┊interface UsersListProps {</b>
<b>+┊   ┊ 56┊  selectable?: boolean</b>
<b>+┊   ┊ 57┊  onSelectionChange?: (users: User.Fragment[]) &#x3D;&gt; void</b>
<b>+┊   ┊ 58┊  onUserPick?: (user: User.Fragment) &#x3D;&gt; void</b>
<b>+┊   ┊ 59┊}</b>
<b>+┊   ┊ 60┊</b>
<b>+┊   ┊ 61┊export default (props: UsersListProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 62┊  const { selectable, onSelectionChange, onUserPick } &#x3D; {</b>
<b>+┊   ┊ 63┊    selectable: false,</b>
<b>+┊   ┊ 64┊    onSelectionChange: () &#x3D;&gt; {},</b>
<b>+┊   ┊ 65┊    onUserPick: () &#x3D;&gt; {},</b>
<b>+┊   ┊ 66┊    ...props,</b>
<b>+┊   ┊ 67┊  }</b>
<b>+┊   ┊ 68┊</b>
<b>+┊   ┊ 69┊  const [selectedUsers, setSelectedUsers] &#x3D; useState([])</b>
<b>+┊   ┊ 70┊  const {</b>
<b>+┊   ┊ 71┊    data: { users },</b>
<b>+┊   ┊ 72┊  } &#x3D; useQuery&lt;UsersListQuery.Query&gt;(query)</b>
<b>+┊   ┊ 73┊</b>
<b>+┊   ┊ 74┊  const onListItemClick &#x3D; user &#x3D;&gt; {</b>
<b>+┊   ┊ 75┊    if (!selectable) {</b>
<b>+┊   ┊ 76┊      return onUserPick(user)</b>
<b>+┊   ┊ 77┊    }</b>
<b>+┊   ┊ 78┊</b>
<b>+┊   ┊ 79┊    if (selectedUsers.includes(user)) {</b>
<b>+┊   ┊ 80┊      const index &#x3D; selectedUsers.indexOf(user)</b>
<b>+┊   ┊ 81┊      selectedUsers.splice(index, 1)</b>
<b>+┊   ┊ 82┊    } else {</b>
<b>+┊   ┊ 83┊      selectedUsers.push(user)</b>
<b>+┊   ┊ 84┊    }</b>
<b>+┊   ┊ 85┊</b>
<b>+┊   ┊ 86┊    setSelectedUsers(selectedUsers)</b>
<b>+┊   ┊ 87┊    onSelectionChange(selectedUsers)</b>
<b>+┊   ┊ 88┊  }</b>
<b>+┊   ┊ 89┊</b>
<b>+┊   ┊ 90┊  return (</b>
<b>+┊   ┊ 91┊    &lt;Style className&#x3D;&quot;UsersList&quot; selectable&#x3D;{selectable}&gt;</b>
<b>+┊   ┊ 92┊      &lt;List className&#x3D;&quot;UsersList-users-list&quot;&gt;</b>
<b>+┊   ┊ 93┊        {users.map(user &#x3D;&gt; (</b>
<b>+┊   ┊ 94┊          &lt;ListItem</b>
<b>+┊   ┊ 95┊            className&#x3D;&quot;UsersList-user-item&quot;</b>
<b>+┊   ┊ 96┊            key&#x3D;{user.id}</b>
<b>+┊   ┊ 97┊            button</b>
<b>+┊   ┊ 98┊            onClick&#x3D;{onListItemClick.bind(null, user)}</b>
<b>+┊   ┊ 99┊          &gt;</b>
<b>+┊   ┊100┊            &lt;img</b>
<b>+┊   ┊101┊              className&#x3D;&quot;UsersList-profile-pic&quot;</b>
<b>+┊   ┊102┊              src&#x3D;{user.picture || &#x27;/assets/default-profile-pic.jpg&#x27;}</b>
<b>+┊   ┊103┊            /&gt;</b>
<b>+┊   ┊104┊            &lt;div className&#x3D;&quot;UsersList-name&quot;&gt;{user.name}&lt;/div&gt;</b>
<b>+┊   ┊105┊</b>
<b>+┊   ┊106┊            {selectedUsers.includes(user) &amp;&amp; &lt;CheckCircle className&#x3D;&quot;UsersList-checkmark&quot; /&gt;}</b>
<b>+┊   ┊107┊          &lt;/ListItem&gt;</b>
<b>+┊   ┊108┊        ))}</b>
<b>+┊   ┊109┊      &lt;/List&gt;</b>
<b>+┊   ┊110┊    &lt;/Style&gt;</b>
<b>+┊   ┊111┊  )</b>
<b>+┊   ┊112┊}</b>
</pre>

[}]: #

Now let's implement the new chat screen:

[{]: <helper> (diffStep 3.2 files="src/components/NewChatScreen" module="client")

#### Step 3.2: Add new chat screen

##### Added src&#x2F;components&#x2F;NewChatScreen&#x2F;NewChatNavbar.tsx
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
<b>+┊  ┊13┊  .NewChatNavbar-title {</b>
<b>+┊  ┊14┊    line-height: 56px;</b>
<b>+┊  ┊15┊  }</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  .NewChatNavbar-back-button {</b>
<b>+┊  ┊18┊    color: var(--primary-text);</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊&#x60;</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊interface NewChatNavbarProps {</b>
<b>+┊  ┊23┊  history: History</b>
<b>+┊  ┊24┊}</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊export default ({ history }: NewChatNavbarProps) &#x3D;&gt; {</b>
<b>+┊  ┊27┊  const navToChats &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊28┊    history.push(&#x27;/chats&#x27;)</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  return (</b>
<b>+┊  ┊32┊    &lt;Style className&#x3D;&quot;NewChatNavbar&quot;&gt;</b>
<b>+┊  ┊33┊      &lt;Button className&#x3D;&quot;NewChatNavbar-back-button&quot; onClick&#x3D;{navToChats}&gt;</b>
<b>+┊  ┊34┊        &lt;ArrowBackIcon /&gt;</b>
<b>+┊  ┊35┊      &lt;/Button&gt;</b>
<b>+┊  ┊36┊      &lt;div className&#x3D;&quot;NewChatNavbar-title&quot;&gt;New Chat&lt;/div&gt;</b>
<b>+┊  ┊37┊    &lt;/Style&gt;</b>
<b>+┊  ┊38┊  )</b>
<b>+┊  ┊39┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;NewChatScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  2┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  3┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  4┊import { Suspense } from &#x27;react&#x27;</b>
<b>+┊   ┊  5┊import { useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  6┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊  7┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  8┊import { time as uniqid } from &#x27;uniqid&#x27;</b>
<b>+┊   ┊  9┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 10┊import * as queries from &#x27;../../graphql/queries&#x27;</b>
<b>+┊   ┊ 11┊import { Chats } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 12┊import { NewChatScreenMutation } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 13┊import { useMe } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊ 14┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊   ┊ 15┊import UsersList from &#x27;../UsersList&#x27;</b>
<b>+┊   ┊ 16┊import NewChatNavbar from &#x27;./NewChatNavbar&#x27;</b>
<b>+┊   ┊ 17┊</b>
<b>+┊   ┊ 18┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 19┊  .UsersList {</b>
<b>+┊   ┊ 20┊    height: calc(100% - 56px);</b>
<b>+┊   ┊ 21┊  }</b>
<b>+┊   ┊ 22┊</b>
<b>+┊   ┊ 23┊  .NewChatScreen-users-list {</b>
<b>+┊   ┊ 24┊    height: calc(100% - 56px);</b>
<b>+┊   ┊ 25┊    overflow-y: overlay;</b>
<b>+┊   ┊ 26┊  }</b>
<b>+┊   ┊ 27┊&#x60;</b>
<b>+┊   ┊ 28┊</b>
<b>+┊   ┊ 29┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 30┊  mutation NewChatScreenMutation($userId: ID!) {</b>
<b>+┊   ┊ 31┊    addChat(userId: $userId) {</b>
<b>+┊   ┊ 32┊      ...Chat</b>
<b>+┊   ┊ 33┊    }</b>
<b>+┊   ┊ 34┊  }</b>
<b>+┊   ┊ 35┊  ${fragments.chat}</b>
<b>+┊   ┊ 36┊&#x60;</b>
<b>+┊   ┊ 37┊</b>
<b>+┊   ┊ 38┊export default ({ history }: RouteComponentProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 39┊  const me &#x3D; useMe()</b>
<b>+┊   ┊ 40┊</b>
<b>+┊   ┊ 41┊  const addChat &#x3D; useMutation&lt;NewChatScreenMutation.Mutation, NewChatScreenMutation.Variables&gt;(</b>
<b>+┊   ┊ 42┊    mutation,</b>
<b>+┊   ┊ 43┊    {</b>
<b>+┊   ┊ 44┊      update: (client, { data: { addChat } }) &#x3D;&gt; {</b>
<b>+┊   ┊ 45┊        client.writeFragment({</b>
<b>+┊   ┊ 46┊          id: defaultDataIdFromObject(addChat),</b>
<b>+┊   ┊ 47┊          fragment: fragments.chat,</b>
<b>+┊   ┊ 48┊          fragmentName: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 49┊          data: addChat,</b>
<b>+┊   ┊ 50┊        })</b>
<b>+┊   ┊ 51┊</b>
<b>+┊   ┊ 52┊        let chats</b>
<b>+┊   ┊ 53┊        try {</b>
<b>+┊   ┊ 54┊          chats &#x3D; client.readQuery&lt;Chats.Query&gt;({</b>
<b>+┊   ┊ 55┊            query: queries.chats,</b>
<b>+┊   ┊ 56┊          }).chats</b>
<b>+┊   ┊ 57┊        } catch (e) {}</b>
<b>+┊   ┊ 58┊</b>
<b>+┊   ┊ 59┊        if (chats &amp;&amp; !chats.some(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; addChat.id)) {</b>
<b>+┊   ┊ 60┊          chats.unshift(addChat)</b>
<b>+┊   ┊ 61┊</b>
<b>+┊   ┊ 62┊          client.writeQuery({</b>
<b>+┊   ┊ 63┊            query: queries.chats,</b>
<b>+┊   ┊ 64┊            data: { chats },</b>
<b>+┊   ┊ 65┊          })</b>
<b>+┊   ┊ 66┊        }</b>
<b>+┊   ┊ 67┊      },</b>
<b>+┊   ┊ 68┊    },</b>
<b>+┊   ┊ 69┊  )</b>
<b>+┊   ┊ 70┊</b>
<b>+┊   ┊ 71┊  const onUserPick &#x3D; user &#x3D;&gt; {</b>
<b>+┊   ┊ 72┊    addChat({</b>
<b>+┊   ┊ 73┊      optimisticResponse: {</b>
<b>+┊   ┊ 74┊        __typename: &#x27;Mutation&#x27;,</b>
<b>+┊   ┊ 75┊        addChat: {</b>
<b>+┊   ┊ 76┊          __typename: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 77┊          id: uniqid(),</b>
<b>+┊   ┊ 78┊          name: user.name,</b>
<b>+┊   ┊ 79┊          picture: user.picture,</b>
<b>+┊   ┊ 80┊          allTimeMembers: [],</b>
<b>+┊   ┊ 81┊          owner: me,</b>
<b>+┊   ┊ 82┊          isGroup: false,</b>
<b>+┊   ┊ 83┊          lastMessage: null,</b>
<b>+┊   ┊ 84┊        },</b>
<b>+┊   ┊ 85┊      },</b>
<b>+┊   ┊ 86┊      variables: {</b>
<b>+┊   ┊ 87┊        userId: user.id,</b>
<b>+┊   ┊ 88┊      },</b>
<b>+┊   ┊ 89┊    }).then(({ data: { addChat } }) &#x3D;&gt; {</b>
<b>+┊   ┊ 90┊      history.push(&#x60;/chats/${addChat.id}&#x60;)</b>
<b>+┊   ┊ 91┊    })</b>
<b>+┊   ┊ 92┊  }</b>
<b>+┊   ┊ 93┊</b>
<b>+┊   ┊ 94┊  return (</b>
<b>+┊   ┊ 95┊    &lt;Style className&#x3D;&quot;NewChatScreen Screen&quot;&gt;</b>
<b>+┊   ┊ 96┊      &lt;Navbar&gt;</b>
<b>+┊   ┊ 97┊        &lt;NewChatNavbar history&#x3D;{history} /&gt;</b>
<b>+┊   ┊ 98┊      &lt;/Navbar&gt;</b>
<b>+┊   ┊ 99┊      &lt;div className&#x3D;&quot;NewChatScreen-users-list&quot;&gt;</b>
<b>+┊   ┊100┊        &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊   ┊101┊          &lt;UsersList onUserPick&#x3D;{onUserPick} /&gt;</b>
<b>+┊   ┊102┊        &lt;/Suspense&gt;</b>
<b>+┊   ┊103┊      &lt;/div&gt;</b>
<b>+┊   ┊104┊    &lt;/Style&gt;</b>
<b>+┊   ┊105┊  )</b>
<b>+┊   ┊106┊}</b>
</pre>

[}]: #

And implement a dedicated route for it:

[{]: <helper> (diffStep 3.2 files="src/App" module="client")

#### Step 3.2: Add new chat screen

##### Changed src&#x2F;App.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import * as React from &#x27;react&#x27;
 ┊2┊2┊import { BrowserRouter, Route, Redirect } from &#x27;react-router-dom&#x27;
 ┊3┊3┊import ChatRoomScreen from &#x27;./components/ChatRoomScreen&#x27;
<b>+┊ ┊4┊import NewChatScreen from &#x27;./components/NewChatScreen&#x27;</b>
 ┊4┊5┊import AnimatedSwitch from &#x27;./components/AnimatedSwitch&#x27;
 ┊5┊6┊import AuthScreen from &#x27;./components/AuthScreen&#x27;
 ┊6┊7┊import ChatsListScreen from &#x27;./components/ChatsListScreen&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊19┊      &lt;Route exact path&#x3D;&quot;/chats&quot; component&#x3D;{withAuth(ChatsListScreen)} /&gt;
 ┊19┊20┊      &lt;Route exact path&#x3D;&quot;/settings&quot; component&#x3D;{withAuth(SettingsScreen)} /&gt;
 ┊20┊21┊      &lt;Route exact path&#x3D;&quot;/chats/:chatId&quot; component&#x3D;{withAuth(ChatRoomScreen)} /&gt;
<b>+┊  ┊22┊      &lt;Route exact path&#x3D;&quot;/new-chat&quot; component&#x3D;{withAuth(NewChatScreen)} /&gt;</b>
 ┊21┊23┊      &lt;Route component&#x3D;{RedirectToChats} /&gt;
 ┊22┊24┊    &lt;/AnimatedSwitch&gt;
 ┊23┊25┊  &lt;/BrowserRouter&gt;
</pre>

[}]: #

We will also add a button which will redirect us right to the new chat screen:

[{]: <helper> (diffStep 3.2 files="src/components/ChatsListScreen" module="client")

#### Step 3.2: Add new chat screen

##### Added src&#x2F;components&#x2F;ChatsListScreen&#x2F;AddChatButton.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊  ┊ 2┊import ChatIcon from &#x27;@material-ui/icons/Chat&#x27;</b>
<b>+┊  ┊ 3┊import { History } from &#x27;history&#x27;</b>
<b>+┊  ┊ 4┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 5┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊  ┊ 8┊  position: fixed;</b>
<b>+┊  ┊ 9┊  right: 10px;</b>
<b>+┊  ┊10┊  bottom: 10px;</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊  button {</b>
<b>+┊  ┊13┊    min-width: 50px;</b>
<b>+┊  ┊14┊    width: 50px;</b>
<b>+┊  ┊15┊    height: 50px;</b>
<b>+┊  ┊16┊    border-radius: 999px;</b>
<b>+┊  ┊17┊    background-color: var(--secondary-bg);</b>
<b>+┊  ┊18┊    color: white;</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊&#x60;</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊interface AddChatButtonProps {</b>
<b>+┊  ┊23┊  history: History</b>
<b>+┊  ┊24┊}</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊export default ({ history }: AddChatButtonProps) &#x3D;&gt; {</b>
<b>+┊  ┊27┊  const onClick &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊28┊    history.push(&#x27;/new-chat&#x27;)</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  return (</b>
<b>+┊  ┊32┊    &lt;Style className&#x3D;&quot;AddChatButton&quot;&gt;</b>
<b>+┊  ┊33┊      &lt;Button variant&#x3D;&quot;contained&quot; color&#x3D;&quot;secondary&quot; onClick&#x3D;{onClick}&gt;</b>
<b>+┊  ┊34┊        &lt;ChatIcon /&gt;</b>
<b>+┊  ┊35┊      &lt;/Button&gt;</b>
<b>+┊  ┊36┊    &lt;/Style&gt;</b>
<b>+┊  ┊37┊  )</b>
<b>+┊  ┊38┊}</b>
</pre>

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊2┊2┊import { Suspense } from &#x27;react&#x27;
 ┊3┊3┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;
 ┊4┊4┊import Navbar from &#x27;../Navbar&#x27;
<b>+┊ ┊5┊import AddChatButton from &#x27;./AddChatButton&#x27;</b>
 ┊5┊6┊import ChatsList from &#x27;./ChatsList&#x27;
 ┊6┊7┊import ChatsNavbar from &#x27;./ChatsNavbar&#x27;
 ┊7┊8┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊13┊14┊    &lt;Suspense fallback&#x3D;{null}&gt;
 ┊14┊15┊      &lt;ChatsList history&#x3D;{history} /&gt;
 ┊15┊16┊    &lt;/Suspense&gt;
<b>+┊  ┊17┊    &lt;AddChatButton history&#x3D;{history} /&gt;</b>
 ┊16┊18┊  &lt;/div&gt;
 ┊17┊19┊)
</pre>

[}]: #

Again, we will need to define the right subscriptions and update the cache accordingly:

[{]: <helper> (diffStep 3.2 files="src/graphql/queries, src/graphql/subscriptions, src/services/cache" module="client")

#### Step 3.2: Add new chat screen

##### Changed src&#x2F;graphql&#x2F;queries&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export { default as chats } from &#x27;./chats.query&#x27;
<b>+┊ ┊2┊export { default as users } from &#x27;./users.query&#x27;</b>
 ┊2┊3┊export { default as me } from &#x27;./me.query&#x27;
</pre>

##### Added src&#x2F;graphql&#x2F;queries&#x2F;users.query.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../fragments&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  query Users {</b>
<b>+┊  ┊ 6┊    users {</b>
<b>+┊  ┊ 7┊      ...User</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊  ${fragments.user}</b>
<b>+┊  ┊11┊&#x60;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;chatAdded.subscription.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../fragments&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  subscription ChatAdded {</b>
<b>+┊  ┊ 6┊    chatAdded {</b>
<b>+┊  ┊ 7┊      ...Chat</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊  ${fragments.chat}</b>
<b>+┊  ┊11┊&#x60;</b>
</pre>

##### Changed src&#x2F;graphql&#x2F;subscriptions&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export { default as chatUpdated } from &#x27;./chatUpdated.subscription&#x27;
 ┊2┊2┊export { default as messageAdded } from &#x27;./messageAdded.subscription&#x27;
<b>+┊ ┊3┊export { default as chatAdded } from &#x27;./chatAdded.subscription&#x27;</b>
<b>+┊ ┊4┊export { default as userAdded } from &#x27;./userAdded.subscription&#x27;</b>
<b>+┊ ┊5┊export { default as userUpdated } from &#x27;./userUpdated.subscription&#x27;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;userAdded.subscription.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../fragments&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  subscription UserAdded {</b>
<b>+┊  ┊ 6┊    userAdded {</b>
<b>+┊  ┊ 7┊      ...User</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊  ${fragments.user}</b>
<b>+┊  ┊11┊&#x60;</b>
</pre>

##### Added src&#x2F;graphql&#x2F;subscriptions&#x2F;userUpdated.subscription.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊  ┊ 2┊import * as fragments from &#x27;../fragments&#x27;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊export default gql &#x60;</b>
<b>+┊  ┊ 5┊  subscription UserUpdated {</b>
<b>+┊  ┊ 6┊    userUpdated {</b>
<b>+┊  ┊ 7┊      ...User</b>
<b>+┊  ┊ 8┊    }</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊  ${fragments.user}</b>
<b>+┊  ┊11┊&#x60;</b>
</pre>

##### Changed src&#x2F;services&#x2F;cache.service.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 2┊ 2┊import * as fragments from &#x27;../graphql/fragments&#x27;
 ┊ 3┊ 3┊import * as subscriptions from &#x27;../graphql/subscriptions&#x27;
 ┊ 4┊ 4┊import * as queries from &#x27;../graphql/queries&#x27;
<b>+┊  ┊ 5┊import {</b>
<b>+┊  ┊ 6┊  ChatUpdated,</b>
<b>+┊  ┊ 7┊  MessageAdded,</b>
<b>+┊  ┊ 8┊  Message,</b>
<b>+┊  ┊ 9┊  Chats,</b>
<b>+┊  ┊10┊  FullChat,</b>
<b>+┊  ┊11┊  User,</b>
<b>+┊  ┊12┊  Users,</b>
<b>+┊  ┊13┊  UserAdded,</b>
<b>+┊  ┊14┊  UserUpdated,</b>
<b>+┊  ┊15┊  ChatAdded,</b>
<b>+┊  ┊16┊} from &#x27;../graphql/types&#x27;</b>
 ┊ 6┊17┊import { useSubscription } from &#x27;../polyfills/react-apollo-hooks&#x27;
 ┊ 7┊18┊
 ┊ 8┊19┊export const useSubscriptions &#x3D; () &#x3D;&gt; {
<b>+┊  ┊20┊  useSubscription&lt;ChatAdded.Subscription&gt;(subscriptions.chatAdded, {</b>
<b>+┊  ┊21┊    onSubscriptionData: ({ client, subscriptionData: { chatAdded } }) &#x3D;&gt; {</b>
<b>+┊  ┊22┊      client.writeFragment({</b>
<b>+┊  ┊23┊        id: defaultDataIdFromObject(chatAdded),</b>
<b>+┊  ┊24┊        fragment: fragments.chat,</b>
<b>+┊  ┊25┊        fragmentName: &#x27;Chat&#x27;,</b>
<b>+┊  ┊26┊        data: chatAdded,</b>
<b>+┊  ┊27┊      })</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊      let chats</b>
<b>+┊  ┊30┊      try {</b>
<b>+┊  ┊31┊        chats &#x3D; client.readQuery&lt;Chats.Query&gt;({</b>
<b>+┊  ┊32┊          query: queries.chats,</b>
<b>+┊  ┊33┊        }).chats</b>
<b>+┊  ┊34┊      } catch (e) {}</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊      if (chats &amp;&amp; !chats.some(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; chatAdded.id)) {</b>
<b>+┊  ┊37┊        chats.unshift(chatAdded)</b>
<b>+┊  ┊38┊</b>
<b>+┊  ┊39┊        client.writeQuery({</b>
<b>+┊  ┊40┊          query: queries.chats,</b>
<b>+┊  ┊41┊          data: { chats },</b>
<b>+┊  ┊42┊        })</b>
<b>+┊  ┊43┊      }</b>
<b>+┊  ┊44┊    },</b>
<b>+┊  ┊45┊  })</b>
<b>+┊  ┊46┊</b>
 ┊ 9┊47┊  useSubscription&lt;ChatUpdated.Subscription&gt;(subscriptions.chatUpdated, {
 ┊10┊48┊    onSubscriptionData: ({ client, subscriptionData: { chatUpdated } }) &#x3D;&gt; {
 ┊11┊49┊      client.writeFragment({
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 66┊104┊      }
 ┊ 67┊105┊    },
 ┊ 68┊106┊  })
<b>+┊   ┊107┊</b>
<b>+┊   ┊108┊  useSubscription&lt;UserAdded.Subscription&gt;(subscriptions.userAdded, {</b>
<b>+┊   ┊109┊    onSubscriptionData: ({ client, subscriptionData: { userAdded } }) &#x3D;&gt; {</b>
<b>+┊   ┊110┊      client.writeFragment({</b>
<b>+┊   ┊111┊        id: defaultDataIdFromObject(userAdded),</b>
<b>+┊   ┊112┊        fragment: fragments.user,</b>
<b>+┊   ┊113┊        data: userAdded,</b>
<b>+┊   ┊114┊      })</b>
<b>+┊   ┊115┊</b>
<b>+┊   ┊116┊      let users</b>
<b>+┊   ┊117┊      try {</b>
<b>+┊   ┊118┊        users &#x3D; client.readQuery&lt;Users.Query&gt;({</b>
<b>+┊   ┊119┊          query: queries.users,</b>
<b>+┊   ┊120┊        }).users</b>
<b>+┊   ┊121┊      } catch (e) {}</b>
<b>+┊   ┊122┊</b>
<b>+┊   ┊123┊      if (users &amp;&amp; !users.some(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; userAdded.id)) {</b>
<b>+┊   ┊124┊        users.push(userAdded)</b>
<b>+┊   ┊125┊</b>
<b>+┊   ┊126┊        client.writeQuery({</b>
<b>+┊   ┊127┊          query: queries.users,</b>
<b>+┊   ┊128┊          data: { users },</b>
<b>+┊   ┊129┊        })</b>
<b>+┊   ┊130┊      }</b>
<b>+┊   ┊131┊    },</b>
<b>+┊   ┊132┊  })</b>
<b>+┊   ┊133┊</b>
<b>+┊   ┊134┊  useSubscription&lt;UserUpdated.Subscription&gt;(subscriptions.userUpdated, {</b>
<b>+┊   ┊135┊    onSubscriptionData: ({ client, subscriptionData: { userUpdated } }) &#x3D;&gt; {</b>
<b>+┊   ┊136┊      client.writeFragment({</b>
<b>+┊   ┊137┊        id: defaultDataIdFromObject(userUpdated),</b>
<b>+┊   ┊138┊        fragment: fragments.user,</b>
<b>+┊   ┊139┊        data: userUpdated,</b>
<b>+┊   ┊140┊      })</b>
<b>+┊   ┊141┊    },</b>
<b>+┊   ┊142┊  })</b>
 ┊ 69┊143┊}
</pre>

[}]: #

Now we have a real, functional chat app! Where we have a complete flow of:

- Signing in/up.
- Editing profile.
- Creating and removing chats.
- Sending messages.

In the next step we will to something slightly more complex and extend the current functionality by adding a group chatting feature where we will be able to communicate with multiple users in a single chat room.


[//]: # (foot-start)

[{]: <helper> (navStep)

⟸ <a href="step2.md">PREVIOUS STEP</a> <b>║</b> <a href="step4.md">NEXT STEP</a> ⟹

[}]: #
