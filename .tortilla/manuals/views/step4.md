# Step 4: Bonus! Group chatting

[//]: # (head-end)


Group messaging can be quite tricky and so I would like to explain the hierarchy between the entities. `Chat` will have the following fields:

- `Chat.actualGroupMembers` - The current users who are currently participating in the group. Once a message was sent by someone in the group, all the members under `actualGroupMembers` will be notified with the target message.

- `Chat.listingMembers` - The current users which have the chat listed in their view. Any user who will be kicked out of the group will not only be absent from `Chat.actualGroupMembers`, but it will also be spliced from `Chat.listingMembers`, as its existence in the chat is correlated to what it can currently view.

- `Chat.admins` - The users who currently control the group; they will have permissions to add and remove users from the group, and change its name and picture.

Together we can have a complete flow where users can chat with each-other in a group. In this step we will add a group-details screen, where we will be able to see the participants of the group, and we will use the existing users list component to select users that we would like to participate in our group chat. The back-end should include a new mutation called `addGroup()` that will help use create chat group.

So before we proceed to the front-end, let's take care of the back-end. We will add the missing fields to the Chat entity, and make the necessary adjustments in existing resolvers:

[{]: <helper> (diffStep 4.1 module="server")

#### Step 4.1: Add group-related fields to Chat type

##### Changed entity&#x2F;chat.ts
```diff
@@ -16,6 +16,8 @@
 ┊16┊16┊  picture?: string
 ┊17┊17┊  allTimeMembers?: User[]
 ┊18┊18┊  listingMembers?: User[]
+┊  ┊19┊  actualGroupMembers?: User[]
+┊  ┊20┊  admins?: User[]
 ┊19┊21┊  owner?: User
 ┊20┊22┊  messages?: Message[]
 ┊21┊23┊}
```
```diff
@@ -48,6 +50,14 @@
 ┊48┊50┊  @JoinTable()
 ┊49┊51┊  listingMembers: User[]
 ┊50┊52┊
+┊  ┊53┊  @ManyToMany(type => User, user => user.actualGroupMemberChats, { cascade: ["insert", "update"], eager: false })
+┊  ┊54┊  @JoinTable()
+┊  ┊55┊  actualGroupMembers?: User[]
+┊  ┊56┊
+┊  ┊57┊  @ManyToMany(type => User, user => user.adminChats, { cascade: ["insert", "update"], eager: false })
+┊  ┊58┊  @JoinTable()
+┊  ┊59┊  admins?: User[]
+┊  ┊60┊
 ┊51┊61┊  @ManyToOne(type => User, user => user.ownerChats, { cascade: ['insert', 'update'], eager: false })
 ┊52┊62┊  owner?: User | null
 ┊53┊63┊
```
```diff
@@ -62,6 +72,8 @@
 ┊62┊72┊    picture,
 ┊63┊73┊    allTimeMembers,
 ┊64┊74┊    listingMembers,
+┊  ┊75┊    actualGroupMembers,
+┊  ┊76┊    admins,
 ┊65┊77┊    owner,
 ┊66┊78┊    messages,
 ┊67┊79┊  }: ChatConstructor = {}) {
```
```diff
@@ -74,6 +86,12 @@
 ┊74┊86┊    if (allTimeMembers) {
 ┊75┊87┊      this.allTimeMembers = allTimeMembers
 ┊76┊88┊    }
+┊  ┊89┊    if (actualGroupMembers) {
+┊  ┊90┊      this.actualGroupMembers = actualGroupMembers
+┊  ┊91┊    }
+┊  ┊92┊    if (admins) {
+┊  ┊93┊      this.admins = admins
+┊  ┊94┊    }
 ┊77┊95┊    if (listingMembers) {
 ┊78┊96┊      this.listingMembers = listingMembers
 ┊79┊97┊    }
```

##### Changed entity&#x2F;user.ts
```diff
@@ -33,6 +33,12 @@
 ┊33┊33┊  @ManyToMany(type => Chat, chat => chat.listingMembers)
 ┊34┊34┊  listingMemberChats: Chat[]
 ┊35┊35┊
+┊  ┊36┊  @ManyToMany(type => Chat, chat => chat.actualGroupMembers)
+┊  ┊37┊  actualGroupMemberChats: Chat[]
+┊  ┊38┊
+┊  ┊39┊  @ManyToMany(type => Chat, chat => chat.admins)
+┊  ┊40┊  adminChats: Chat[]
+┊  ┊41┊
 ┊36┊42┊  @ManyToMany(type => Message, message => message.holders)
 ┊37┊43┊  holderMessages: Message[]
 ┊38┊44┊
```

##### Changed modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
```diff
@@ -157,6 +157,27 @@
 ┊157┊157┊      .getMany()
 ┊158┊158┊  }
 ┊159┊159┊
+┊   ┊160┊  getChatActualGroupMembers(chat: Chat) {
+┊   ┊161┊    return this.userProvider
+┊   ┊162┊      .createQueryBuilder()
+┊   ┊163┊      .innerJoin(
+┊   ┊164┊        'user.actualGroupMemberChats',
+┊   ┊165┊        'actualGroupMemberChats',
+┊   ┊166┊        'actualGroupMemberChats.id = :chatId',
+┊   ┊167┊        { chatId: chat.id },
+┊   ┊168┊      )
+┊   ┊169┊      .getMany();
+┊   ┊170┊  }
+┊   ┊171┊
+┊   ┊172┊  getChatAdmins(chat: Chat) {
+┊   ┊173┊    return this.userProvider
+┊   ┊174┊      .createQueryBuilder()
+┊   ┊175┊      .innerJoin('user.adminChats', 'adminChats', 'adminChats.id = :chatId', {
+┊   ┊176┊        chatId: chat.id,
+┊   ┊177┊      })
+┊   ┊178┊      .getMany();
+┊   ┊179┊  }
+┊   ┊180┊
 ┊160┊181┊  async getChatOwner(chat: Chat) {
 ┊161┊182┊    const owner = await this.userProvider
 ┊162┊183┊      .createQueryBuilder()
```
```diff
@@ -168,6 +189,10 @@
 ┊168┊189┊    return owner || null
 ┊169┊190┊  }
 ┊170┊191┊
+┊   ┊192┊  async isChatGroup(chat: Chat) {
+┊   ┊193┊    return !!chat.name;
+┊   ┊194┊  }
+┊   ┊195┊
 ┊171┊196┊  async filterChatAddedOrUpdated(chatAddedOrUpdated: Chat, creatorOrUpdaterId: string) {
 ┊172┊197┊    return (
 ┊173┊198┊      creatorOrUpdaterId !== this.currentUser.id &&
```
```diff
@@ -221,6 +246,8 @@
 ┊221┊246┊    const chat = await this.createQueryBuilder()
 ┊222┊247┊      .whereInIds(Number(chatId))
 ┊223┊248┊      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
+┊   ┊249┊      .leftJoinAndSelect('chat.actualGroupMembers', 'actualGroupMembers')
+┊   ┊250┊      .leftJoinAndSelect('chat.admins', 'admins')
 ┊224┊251┊      .leftJoinAndSelect('chat.owner', 'owner')
 ┊225┊252┊      .getOne();
 ┊226┊253┊
```
```diff
@@ -242,7 +269,18 @@
 ┊242┊269┊        // Delete the chat
 ┊243┊270┊        await this.repository.remove(chat);
 ┊244┊271┊      } else {
-┊245┊   ┊        // Update the chat
+┊   ┊272┊        // Update the group
+┊   ┊273┊
+┊   ┊274┊        // Remove the current user from the chat members. He is no longer a member of the group
+┊   ┊275┊        chat.actualGroupMembers = chat.actualGroupMembers && chat.actualGroupMembers.filter(user =>
+┊   ┊276┊          user.id !== this.currentUser.id
+┊   ┊277┊        );
+┊   ┊278┊        // Remove the current user from the chat admins
+┊   ┊279┊        chat.admins = chat.admins && chat.admins.filter(user => user.id !== this.currentUser.id);
+┊   ┊280┊        // If there are no more admins left the group goes read only
+┊   ┊281┊        // A null owner means the group is read-only
+┊   ┊282┊        chat.owner = chat.admins && chat.admins[0] || null;
+┊   ┊283┊
 ┊246┊284┊        await this.repository.save(chat);
 ┊247┊285┊      }
 ┊248┊286┊
```

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -38,6 +38,9 @@
 ┊38┊38┊      injector.get(ChatProvider).getChatAllTimeMembers(chat),
 ┊39┊39┊    listingMembers: (chat, args, { injector }) =>
 ┊40┊40┊      injector.get(ChatProvider).getChatListingMembers(chat),
+┊  ┊41┊    actualGroupMembers: (chat, args, { injector }) => injector.get(ChatProvider).getChatActualGroupMembers(chat),
+┊  ┊42┊    admins: (chat, args, { injector }) => injector.get(ChatProvider).getChatAdmins(chat),
 ┊41┊43┊    owner: (chat, args, { injector }) => injector.get(ChatProvider).getChatOwner(chat),
+┊  ┊44┊    isGroup: (chat, args, { injector }) => injector.get(ChatProvider).isChatGroup(chat),
 ┊42┊45┊  },
 ┊43┊46┊} as IResolvers
```

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -19,8 +19,14 @@
 ┊19┊19┊  allTimeMembers: [User!]!
 ┊20┊20┊  #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
 ┊21┊21┊  listingMembers: [User!]!
+┊  ┊22┊  #Actual members of the group. Null for chats. For groups they are the only ones who can send messages. They aren't the only ones who get the group listed.
+┊  ┊23┊  actualGroupMembers: [User!]
+┊  ┊24┊  #Null for chats
+┊  ┊25┊  admins: [User!]
 ┊22┊26┊  #If null the group is read-only. Null for chats.
 ┊23┊27┊  owner: User
+┊  ┊28┊  #Computed property
+┊  ┊29┊  isGroup: Boolean!
 ┊24┊30┊}
 ┊25┊31┊
 ┊26┊32┊type Mutation {
```

##### Changed modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
```diff
@@ -36,6 +36,7 @@
 ┊36┊36┊      .whereInIds(chatId)
 ┊37┊37┊      .innerJoinAndSelect('chat.allTimeMembers', 'allTimeMembers')
 ┊38┊38┊      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
+┊  ┊39┊      .leftJoinAndSelect('chat.actualGroupMembers', 'actualGroupMembers')
 ┊39┊40┊      .getOne();
 ┊40┊41┊
 ┊41┊42┊    if (!chat) {
```
```diff
@@ -71,8 +72,12 @@
 ┊71┊72┊
 ┊72┊73┊      holders = chat.listingMembers;
 ┊73┊74┊    } else {
-┊74┊  ┊      // TODO: Implement for groups
-┊75┊  ┊      holders = chat.listingMembers
+┊  ┊75┊      // Group
+┊  ┊76┊      if (!chat.actualGroupMembers || !chat.actualGroupMembers.find(user => user.id === this.currentUser.id)) {
+┊  ┊77┊        throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
+┊  ┊78┊      }
+┊  ┊79┊
+┊  ┊80┊      holders = chat.actualGroupMembers;
 ┊76┊81┊    }
 ┊77┊82┊
 ┊78┊83┊    const message = await this.repository.save(new Message({
```
```diff
@@ -324,15 +329,31 @@
 ┊324┊329┊  }
 ┊325┊330┊
 ┊326┊331┊  async filterMessageAdded(messageAdded: Message) {
-┊327┊   ┊    const relevantUsers = (await this.userProvider
-┊328┊   ┊      .createQueryBuilder()
-┊329┊   ┊      .innerJoin(
-┊330┊   ┊        'user.listingMemberChats',
-┊331┊   ┊        'listingMemberChats',
-┊332┊   ┊        'listingMemberChats.id = :chatId',
-┊333┊   ┊        { chatId: messageAdded.chat.id }
-┊334┊   ┊      )
-┊335┊   ┊      .getMany()).filter(user => user.id != messageAdded.sender.id)
+┊   ┊332┊    let relevantUsers: User[]
+┊   ┊333┊
+┊   ┊334┊    if (!messageAdded.chat.name) {
+┊   ┊335┊      // Chat
+┊   ┊336┊      relevantUsers = (await this.userProvider
+┊   ┊337┊        .createQueryBuilder()
+┊   ┊338┊        .innerJoin(
+┊   ┊339┊          'user.listingMemberChats',
+┊   ┊340┊          'listingMemberChats',
+┊   ┊341┊          'listingMemberChats.id = :chatId',
+┊   ┊342┊          { chatId: messageAdded.chat.id }
+┊   ┊343┊        )
+┊   ┊344┊        .getMany()).filter(user => user.id != messageAdded.sender.id)
+┊   ┊345┊    } else {
+┊   ┊346┊      // Group
+┊   ┊347┊      relevantUsers = (await this.userProvider
+┊   ┊348┊        .createQueryBuilder()
+┊   ┊349┊        .innerJoin(
+┊   ┊350┊          'user.actualGroupMemberChats',
+┊   ┊351┊          'actualGroupMemberChats',
+┊   ┊352┊          'actualGroupMemberChats.id = :chatId',
+┊   ┊353┊          { chatId: messageAdded.chat.id }
+┊   ┊354┊        )
+┊   ┊355┊        .getMany()).filter(user => user.id != messageAdded.sender.id)
+┊   ┊356┊    }
 ┊336┊357┊
 ┊337┊358┊    return relevantUsers.some(user => user.id === this.currentUser.id)
 ┊338┊359┊  }
```

[}]: #

Now we will add 2 new mutations:

- `addGroup` mutation - Responsible for creating chat groups.
- `updateChat` mutation - Unlike a single chat which is synced with a user's info, a group chat will be independent, therefore we will need a method that could updated its fields.

Let's implement those:

[{]: <helper> (diffStep 4.2 module="server")

#### Step 4.2: Add group related mutations

##### Changed modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
```diff
@@ -305,4 +305,83 @@
 ┊305┊305┊      return chatId;
 ┊306┊306┊    }
 ┊307┊307┊  }
+┊   ┊308┊
+┊   ┊309┊  async addGroup(
+┊   ┊310┊    userIds: string[],
+┊   ┊311┊    {
+┊   ┊312┊      groupName,
+┊   ┊313┊      groupPicture,
+┊   ┊314┊    }: {
+┊   ┊315┊      groupName?: string
+┊   ┊316┊      groupPicture?: string
+┊   ┊317┊    } = {},
+┊   ┊318┊  ) {
+┊   ┊319┊    let users: User[] = [];
+┊   ┊320┊    for (let userId of userIds) {
+┊   ┊321┊      const user = await this.userProvider
+┊   ┊322┊        .createQueryBuilder()
+┊   ┊323┊        .whereInIds(userId)
+┊   ┊324┊        .getOne();
+┊   ┊325┊
+┊   ┊326┊      if (!user) {
+┊   ┊327┊        throw new Error(`User ${userId} doesn't exist.`);
+┊   ┊328┊      }
+┊   ┊329┊
+┊   ┊330┊      users.push(user);
+┊   ┊331┊    }
+┊   ┊332┊
+┊   ┊333┊    const chat = await this.repository.save(
+┊   ┊334┊      new Chat({
+┊   ┊335┊        name: groupName,
+┊   ┊336┊        admins: [this.currentUser],
+┊   ┊337┊        picture: groupPicture || undefined,
+┊   ┊338┊        owner: this.currentUser,
+┊   ┊339┊        allTimeMembers: [...users, this.currentUser],
+┊   ┊340┊        listingMembers: [...users, this.currentUser],
+┊   ┊341┊        actualGroupMembers: [...users, this.currentUser],
+┊   ┊342┊      }),
+┊   ┊343┊    );
+┊   ┊344┊
+┊   ┊345┊    this.pubsub.publish('chatAdded', {
+┊   ┊346┊      creatorId: this.currentUser.id,
+┊   ┊347┊      chatAdded: chat,
+┊   ┊348┊    });
+┊   ┊349┊
+┊   ┊350┊    return chat || null;
+┊   ┊351┊  }
+┊   ┊352┊
+┊   ┊353┊  async updateGroup(
+┊   ┊354┊    chatId: string,
+┊   ┊355┊    {
+┊   ┊356┊      groupName,
+┊   ┊357┊      groupPicture,
+┊   ┊358┊    }: {
+┊   ┊359┊      groupName?: string
+┊   ┊360┊      groupPicture?: string
+┊   ┊361┊    } = {},
+┊   ┊362┊  ) {
+┊   ┊363┊    const chat = await this.createQueryBuilder()
+┊   ┊364┊      .whereInIds(chatId)
+┊   ┊365┊      .getOne();
+┊   ┊366┊
+┊   ┊367┊    if (!chat) return null;
+┊   ┊368┊    if (!chat.name) return chat;
+┊   ┊369┊
+┊   ┊370┊    groupName = groupName || chat.name;
+┊   ┊371┊    groupPicture = groupPicture || chat.picture;
+┊   ┊372┊    Object.assign(chat, {
+┊   ┊373┊      name: groupName,
+┊   ┊374┊      picture: groupPicture,
+┊   ┊375┊    });
+┊   ┊376┊
+┊   ┊377┊    // Update the chat
+┊   ┊378┊    await this.repository.save(chat);
+┊   ┊379┊
+┊   ┊380┊    this.pubsub.publish('chatUpdated', {
+┊   ┊381┊      updaterId: this.currentUser.id,
+┊   ┊382┊      chatUpdated: chat,
+┊   ┊383┊    });
+┊   ┊384┊
+┊   ┊385┊    return chat || null;
+┊   ┊386┊  }
 ┊308┊387┊}
```

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
```diff
@@ -16,6 +16,15 @@
 ┊16┊16┊    }),
 ┊17┊17┊    addChat: (obj, { userId }, { injector }) => injector.get(ChatProvider).addChat(userId),
 ┊18┊18┊    removeChat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).removeChat(chatId),
+┊  ┊19┊    addGroup: (obj, { userIds, groupName, groupPicture }, { injector }) =>
+┊  ┊20┊      injector.get(ChatProvider).addGroup(userIds, {
+┊  ┊21┊        groupName: groupName || '',
+┊  ┊22┊        groupPicture: groupPicture || '',
+┊  ┊23┊      }),
+┊  ┊24┊    updateGroup: (obj, { chatId, groupName, groupPicture }, { injector }) => injector.get(ChatProvider).updateGroup(chatId, {
+┊  ┊25┊      groupName: groupName || '',
+┊  ┊26┊      groupPicture: groupPicture || '',
+┊  ┊27┊    }),
 ┊19┊28┊  },
 ┊20┊29┊  Subscription: {
 ┊21┊30┊    chatAdded: {
```

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
```diff
@@ -32,4 +32,10 @@
 ┊32┊32┊type Mutation {
 ┊33┊33┊  addChat(userId: ID!): Chat
 ┊34┊34┊  removeChat(chatId: ID!): ID
+┊  ┊35┊  addAdmins(groupId: ID!, userIds: [ID!]!): [ID]!
+┊  ┊36┊  removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]!
+┊  ┊37┊  addMembers(groupId: ID!, userIds: [ID!]!): [ID]!
+┊  ┊38┊  removeMembers(groupId: ID!, userIds: [ID!]!): [ID]!
+┊  ┊39┊  addGroup(userIds: [ID!]!, groupName: String!, groupPicture: String): Chat
+┊  ┊40┊  updateGroup(chatId: ID!, groupName: String, groupPicture: String): Chat
 ┊35┊41┊}
```

[}]: #

Now that the back-end is set, we will need to update the chat fragment in the client to contain the new field `isGroup`:

[{]: <helper> (diffStep 4.1 module="client")

#### [Step 4.1: Update chat fragment](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/f33f04b)

##### Changed src&#x2F;graphql&#x2F;fragments&#x2F;chat.fragment.ts
```diff
@@ -17,6 +17,7 @@
 ┊17┊17┊    lastMessage {
 ┊18┊18┊      ...Message
 ┊19┊19┊    }
+┊  ┊20┊    isGroup
 ┊20┊21┊  }
 ┊21┊22┊  ${message}
 ┊22┊23┊`
```

[}]: #

Now we will create the new-group screen. Like the new-chat screen, it will have an almost identical layout, only the behavior is gonna be slightly different. In the new screen we will be able to select multiple users before we proceed, then, we should be able to view the group details and edit them before we create the group. Let's implement the new-group screen:

[{]: <helper> (diffStep 4.2 files="src/components/NewGroupScreen" module="client")

#### [Step 4.2: Add new group screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/90f5f5b)

##### Added src&#x2F;components&#x2F;NewGroupScreen&#x2F;CreateGroupButton.tsx
```diff
@@ -0,0 +1,42 @@
+┊  ┊ 1┊import Button from '@material-ui/core/Button'
+┊  ┊ 2┊import AddIcon from '@material-ui/icons/Add'
+┊  ┊ 3┊import { History } from 'history'
+┊  ┊ 4┊import * as React from 'react'
+┊  ┊ 5┊import styled from 'styled-components'
+┊  ┊ 6┊import { User } from '../../graphql/types'
+┊  ┊ 7┊
+┊  ┊ 8┊const Style = styled.div`
+┊  ┊ 9┊  position: fixed;
+┊  ┊10┊  right: 10px;
+┊  ┊11┊  bottom: 10px;
+┊  ┊12┊
+┊  ┊13┊  button {
+┊  ┊14┊    min-width: 50px;
+┊  ┊15┊    width: 50px;
+┊  ┊16┊    height: 50px;
+┊  ┊17┊    border-radius: 999px;
+┊  ┊18┊    background-color: var(--secondary-bg);
+┊  ┊19┊    color: white;
+┊  ┊20┊  }
+┊  ┊21┊`
+┊  ┊22┊
+┊  ┊23┊interface CreateGroupButtonProps {
+┊  ┊24┊  history: History
+┊  ┊25┊  users: User.Fragment[]
+┊  ┊26┊}
+┊  ┊27┊
+┊  ┊28┊export default ({ history, users }: CreateGroupButtonProps) => {
+┊  ┊29┊  const onClick = () => {
+┊  ┊30┊    history.push('/new-chat/group/details', {
+┊  ┊31┊      users,
+┊  ┊32┊    })
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  return (
+┊  ┊36┊    <Style className="CreateGroupButton">
+┊  ┊37┊      <Button variant="contained" color="secondary" onClick={onClick}>
+┊  ┊38┊        <AddIcon />
+┊  ┊39┊      </Button>
+┊  ┊40┊    </Style>
+┊  ┊41┊  )
+┊  ┊42┊}
```

##### Added src&#x2F;components&#x2F;NewGroupScreen&#x2F;NewGroupNavbar.tsx
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
+┊  ┊13┊  .NewGroupNavbar-title {
+┊  ┊14┊    line-height: 56px;
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  .NewGroupNavbar-back-button {
+┊  ┊18┊    color: var(--primary-text);
+┊  ┊19┊  }
+┊  ┊20┊`
+┊  ┊21┊
+┊  ┊22┊interface NewGroupNavbarProps {
+┊  ┊23┊  history: History
+┊  ┊24┊}
+┊  ┊25┊
+┊  ┊26┊export default ({ history }: NewGroupNavbarProps) => {
+┊  ┊27┊  const navToChats = () => {
+┊  ┊28┊    history.push('/new-chat')
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  return (
+┊  ┊32┊    <Style className="NewGroupNavbar">
+┊  ┊33┊      <Button className="NewGroupNavbar-back-button" onClick={navToChats}>
+┊  ┊34┊        <ArrowBackIcon />
+┊  ┊35┊      </Button>
+┊  ┊36┊      <div className="NewGroupNavbar-title">New Chat Group</div>
+┊  ┊37┊    </Style>
+┊  ┊38┊  )
+┊  ┊39┊}
```

##### Added src&#x2F;components&#x2F;NewGroupScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,32 @@
+┊  ┊ 1┊import * as React from 'react'
+┊  ┊ 2┊import { useState, Suspense } from 'react'
+┊  ┊ 3┊import { RouteComponentProps } from 'react-router-dom'
+┊  ┊ 4┊import styled from 'styled-components'
+┊  ┊ 5┊import Navbar from '../Navbar'
+┊  ┊ 6┊import UsersList from '../UsersList'
+┊  ┊ 7┊import CreateGroupButton from './CreateGroupButton'
+┊  ┊ 8┊import NewGroupNavbar from './NewGroupNavbar'
+┊  ┊ 9┊
+┊  ┊10┊const Style = styled.div`
+┊  ┊11┊  .UsersList {
+┊  ┊12┊    height: calc(100% - 56px);
+┊  ┊13┊    overflow-y: overlay;
+┊  ┊14┊  }
+┊  ┊15┊`
+┊  ┊16┊
+┊  ┊17┊export default ({ history }: RouteComponentProps) => {
+┊  ┊18┊  const [selectedUsers, setSelectedUsers] = useState([])
+┊  ┊19┊
+┊  ┊20┊  return (
+┊  ┊21┊    <Style className="NewGroupScreen Screen">
+┊  ┊22┊      <Navbar>
+┊  ┊23┊        <NewGroupNavbar history={history} />
+┊  ┊24┊      </Navbar>
+┊  ┊25┊      <Suspense fallback={null}>
+┊  ┊26┊        <UsersList selectable onSelectionChange={setSelectedUsers} />
+┊  ┊27┊      </Suspense>
+┊  ┊28┊
+┊  ┊29┊      {!!selectedUsers.length && <CreateGroupButton history={history} users={selectedUsers} />}
+┊  ┊30┊    </Style>
+┊  ┊31┊  )
+┊  ┊32┊}
```

[}]: #

Now we will add a dedicated route, and we will also create a "New Group" button which will be presented in the new chat screen. This way we can create a new group from the new chat screen if we want to, by simply clicking on that button and moving on to the new group screen.

[{]: <helper> (diffStep 4.2 files="src/App, src/components/NewChatScreen" module="client")

#### [Step 4.2: Add new group screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/90f5f5b)

##### Changed src&#x2F;App.tsx
```diff
@@ -6,6 +6,7 @@
 ┊ 6┊ 6┊import AuthScreen from './components/AuthScreen'
 ┊ 7┊ 7┊import ChatsListScreen from './components/ChatsListScreen'
 ┊ 8┊ 8┊import SettingsScreen from './components/SettingsScreen'
+┊  ┊ 9┊import NewGroupScreen from './components/NewGroupScreen'
 ┊ 9┊10┊import { withAuth } from './services/auth.service'
 ┊10┊11┊
 ┊11┊12┊const RedirectToChats = () => (
```
```diff
@@ -20,6 +21,7 @@
 ┊20┊21┊      <Route exact path="/settings" component={withAuth(SettingsScreen)} />
 ┊21┊22┊      <Route exact path="/chats/:chatId" component={withAuth(ChatRoomScreen)} />
 ┊22┊23┊      <Route exact path="/new-chat" component={withAuth(NewChatScreen)} />
+┊  ┊24┊      <Route exact path="/new-chat/group" component={withAuth(NewGroupScreen)} />
 ┊23┊25┊      <Route component={RedirectToChats} />
 ┊24┊26┊    </AnimatedSwitch>
 ┊25┊27┊  </BrowserRouter>
```

##### Added src&#x2F;components&#x2F;NewChatScreen&#x2F;NewGroupButton.tsx
```diff
@@ -0,0 +1,59 @@
+┊  ┊ 1┊import Button from '@material-ui/core/Button'
+┊  ┊ 2┊import GroupAddIcon from '@material-ui/icons/GroupAdd'
+┊  ┊ 3┊import { History } from 'history'
+┊  ┊ 4┊import * as React from 'react'
+┊  ┊ 5┊import styled from 'styled-components'
+┊  ┊ 6┊
+┊  ┊ 7┊const Style = styled.div`
+┊  ┊ 8┊  display: flex;
+┊  ┊ 9┊
+┊  ┊10┊  button {
+┊  ┊11┊    border-radius: 0;
+┊  ┊12┊    text-transform: none;
+┊  ┊13┊    font-size: inherit;
+┊  ┊14┊    width: 100%;
+┊  ┊15┊    justify-content: flex-start;
+┊  ┊16┊    padding-left: 15px;
+┊  ┊17┊    padding-right: 15px;
+┊  ┊18┊
+┊  ┊19┊    svg {
+┊  ┊20┊      font-size: 30px;
+┊  ┊21┊      margin-top: 10px;
+┊  ┊22┊    }
+┊  ┊23┊  }
+┊  ┊24┊
+┊  ┊25┊  .NewGroupButton-icon {
+┊  ┊26┊    height: 50px;
+┊  ┊27┊    width: 50px;
+┊  ┊28┊    object-fit: cover;
+┊  ┊29┊    border-radius: 50%;
+┊  ┊30┊    color: white;
+┊  ┊31┊    background-color: var(--secondary-bg);
+┊  ┊32┊  }
+┊  ┊33┊
+┊  ┊34┊  .NewGroupButton-title {
+┊  ┊35┊    padding-left: 15px;
+┊  ┊36┊    font-weight: bold;
+┊  ┊37┊  }
+┊  ┊38┊`
+┊  ┊39┊
+┊  ┊40┊interface NewGroupButtonProps {
+┊  ┊41┊  history: History
+┊  ┊42┊}
+┊  ┊43┊
+┊  ┊44┊export default ({ history }: NewGroupButtonProps) => {
+┊  ┊45┊  const navToGroup = () => {
+┊  ┊46┊    history.push('/new-chat/group')
+┊  ┊47┊  }
+┊  ┊48┊
+┊  ┊49┊  return (
+┊  ┊50┊    <Style>
+┊  ┊51┊      <Button onClick={navToGroup}>
+┊  ┊52┊        <div className="NewGroupButton-icon">
+┊  ┊53┊          <GroupAddIcon />
+┊  ┊54┊        </div>
+┊  ┊55┊        <div className="NewGroupButton-title">New Group</div>
+┊  ┊56┊      </Button>
+┊  ┊57┊    </Style>
+┊  ┊58┊  )
+┊  ┊59┊}
```

##### Changed src&#x2F;components&#x2F;NewChatScreen&#x2F;index.tsx
```diff
@@ -14,6 +14,7 @@
 ┊14┊14┊import Navbar from '../Navbar'
 ┊15┊15┊import UsersList from '../UsersList'
 ┊16┊16┊import NewChatNavbar from './NewChatNavbar'
+┊  ┊17┊import NewGroupButton from './NewGroupButton'
 ┊17┊18┊
 ┊18┊19┊const Style = styled.div`
 ┊19┊20┊  .UsersList {
```
```diff
@@ -97,6 +98,7 @@
 ┊ 97┊ 98┊        <NewChatNavbar history={history} />
 ┊ 98┊ 99┊      </Navbar>
 ┊ 99┊100┊      <div className="NewChatScreen-users-list">
+┊   ┊101┊        <NewGroupButton history={history} />
 ┊100┊102┊        <Suspense fallback={null}>
 ┊101┊103┊          <UsersList onUserPick={onUserPick} />
 ┊102┊104┊        </Suspense>
```

[}]: #

Up-next would be the group details screen. The layout consists of:

- A navbar with a back button.
- Picture and name inputs.
- A horizontal list of all the participants.
- A "complete" button that will send a mutation request to the server.

Once a name has been typed, the "complete" button should pop-up. Let's implement the screen then:

[{]: <helper> (diffStep 4.3 files="src/components/GroupDetailsScreen" module="client")

#### [Step 4.3: Add group details screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/b9b7c3f)

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;CompleteGroupButton.tsx
```diff
@@ -0,0 +1,114 @@
+┊   ┊  1┊import Button from '@material-ui/core/Button'
+┊   ┊  2┊import ArrowRightIcon from '@material-ui/icons/ArrowRightAlt'
+┊   ┊  3┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  4┊import gql from 'graphql-tag'
+┊   ┊  5┊import { History } from 'history'
+┊   ┊  6┊import * as React from 'react'
+┊   ┊  7┊import { useMutation } from 'react-apollo-hooks'
+┊   ┊  8┊import styled from 'styled-components'
+┊   ┊  9┊import { time as uniqid } from 'uniqid'
+┊   ┊ 10┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 11┊import * as queries from '../../graphql/queries'
+┊   ┊ 12┊import { Chats, User, CompleteGroupButtonMutation } from '../../graphql/types'
+┊   ┊ 13┊import { useMe } from '../../services/auth.service'
+┊   ┊ 14┊
+┊   ┊ 15┊const Style = styled.div`
+┊   ┊ 16┊  position: fixed;
+┊   ┊ 17┊  right: 10px;
+┊   ┊ 18┊  bottom: 10px;
+┊   ┊ 19┊
+┊   ┊ 20┊  button {
+┊   ┊ 21┊    min-width: 50px;
+┊   ┊ 22┊    width: 50px;
+┊   ┊ 23┊    height: 50px;
+┊   ┊ 24┊    border-radius: 999px;
+┊   ┊ 25┊    background-color: var(--secondary-bg);
+┊   ┊ 26┊    color: white;
+┊   ┊ 27┊  }
+┊   ┊ 28┊`
+┊   ┊ 29┊
+┊   ┊ 30┊const mutation = gql`
+┊   ┊ 31┊  mutation CompleteGroupButtonMutation(
+┊   ┊ 32┊    $userIds: [ID!]!
+┊   ┊ 33┊    $groupName: String!
+┊   ┊ 34┊    $groupPicture: String
+┊   ┊ 35┊  ) {
+┊   ┊ 36┊    addGroup(userIds: $userIds, groupName: $groupName, groupPicture: $groupPicture) {
+┊   ┊ 37┊      ...Chat
+┊   ┊ 38┊    }
+┊   ┊ 39┊  }
+┊   ┊ 40┊  ${fragments.chat}
+┊   ┊ 41┊`
+┊   ┊ 42┊
+┊   ┊ 43┊interface CompleteGroupButtonProps {
+┊   ┊ 44┊  history: History
+┊   ┊ 45┊  users: User.Fragment[]
+┊   ┊ 46┊  groupName: string
+┊   ┊ 47┊  groupPicture: string
+┊   ┊ 48┊}
+┊   ┊ 49┊
+┊   ┊ 50┊export default ({ history, users, groupName, groupPicture }: CompleteGroupButtonProps) => {
+┊   ┊ 51┊  const me = useMe()
+┊   ┊ 52┊
+┊   ┊ 53┊  const addGroup = useMutation<
+┊   ┊ 54┊    CompleteGroupButtonMutation.Mutation,
+┊   ┊ 55┊    CompleteGroupButtonMutation.Variables
+┊   ┊ 56┊  >(mutation, {
+┊   ┊ 57┊    optimisticResponse: {
+┊   ┊ 58┊      __typename: 'Mutation',
+┊   ┊ 59┊      addGroup: {
+┊   ┊ 60┊        __typename: 'Chat',
+┊   ┊ 61┊        id: uniqid(),
+┊   ┊ 62┊        name: groupName,
+┊   ┊ 63┊        picture: groupPicture,
+┊   ┊ 64┊        allTimeMembers: users,
+┊   ┊ 65┊        owner: me,
+┊   ┊ 66┊        isGroup: true,
+┊   ┊ 67┊        lastMessage: null,
+┊   ┊ 68┊      },
+┊   ┊ 69┊    },
+┊   ┊ 70┊    variables: {
+┊   ┊ 71┊      userIds: users.map(user => user.id),
+┊   ┊ 72┊      groupName,
+┊   ┊ 73┊      groupPicture,
+┊   ┊ 74┊    },
+┊   ┊ 75┊    update: (client, { data: { addGroup } }) => {
+┊   ┊ 76┊      client.writeFragment({
+┊   ┊ 77┊        id: defaultDataIdFromObject(addGroup),
+┊   ┊ 78┊        fragment: fragments.chat,
+┊   ┊ 79┊        fragmentName: 'Chat',
+┊   ┊ 80┊        data: addGroup,
+┊   ┊ 81┊      })
+┊   ┊ 82┊
+┊   ┊ 83┊      let chats
+┊   ┊ 84┊      try {
+┊   ┊ 85┊        chats = client.readQuery<Chats.Query>({
+┊   ┊ 86┊          query: queries.chats,
+┊   ┊ 87┊        }).chats
+┊   ┊ 88┊      } catch (e) {}
+┊   ┊ 89┊
+┊   ┊ 90┊      if (chats && !chats.some(chat => chat.id === addGroup.id)) {
+┊   ┊ 91┊        chats.unshift(addGroup)
+┊   ┊ 92┊
+┊   ┊ 93┊        client.writeQuery({
+┊   ┊ 94┊          query: queries.chats,
+┊   ┊ 95┊          data: { chats },
+┊   ┊ 96┊        })
+┊   ┊ 97┊      }
+┊   ┊ 98┊    },
+┊   ┊ 99┊  })
+┊   ┊100┊
+┊   ┊101┊  const onClick = () => {
+┊   ┊102┊    addGroup().then(({ data: { addGroup } }) => {
+┊   ┊103┊      history.push(`/chats/${addGroup.id}`)
+┊   ┊104┊    })
+┊   ┊105┊  }
+┊   ┊106┊
+┊   ┊107┊  return (
+┊   ┊108┊    <Style className="CompleteGroupButton">
+┊   ┊109┊      <Button variant="contained" color="secondary" onClick={onClick}>
+┊   ┊110┊        <ArrowRightIcon />
+┊   ┊111┊      </Button>
+┊   ┊112┊    </Style>
+┊   ┊113┊  )
+┊   ┊114┊}
```

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;GroupDetailsNavbar.tsx
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
+┊  ┊13┊  .GroupDetailsNavbar-title {
+┊  ┊14┊    line-height: 56px;
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  .GroupDetailsNavbar-back-button {
+┊  ┊18┊    color: var(--primary-text);
+┊  ┊19┊  }
+┊  ┊20┊`
+┊  ┊21┊
+┊  ┊22┊interface GroupDetailsNavbarProps {
+┊  ┊23┊  history: History
+┊  ┊24┊}
+┊  ┊25┊
+┊  ┊26┊export default ({ history }: GroupDetailsNavbarProps) => {
+┊  ┊27┊  const navToNewGroup = () => {
+┊  ┊28┊    history.push('/new-chat/group')
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  return (
+┊  ┊32┊    <Style className="GroupDetailsNavbar">
+┊  ┊33┊      <Button className="GroupDetailsNavbar-back-button" onClick={navToNewGroup}>
+┊  ┊34┊        <ArrowBackIcon />
+┊  ┊35┊      </Button>
+┊  ┊36┊      <div className="GroupDetailsNavbar-title">Group Details</div>
+┊  ┊37┊    </Style>
+┊  ┊38┊  )
+┊  ┊39┊}
```

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,163 @@
+┊   ┊  1┊import TextField from '@material-ui/core/TextField'
+┊   ┊  2┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  3┊import gql from 'graphql-tag'
+┊   ┊  4┊import * as React from 'react'
+┊   ┊  5┊import { useState, useEffect } from 'react'
+┊   ┊  6┊import { MutationHookOptions } from 'react-apollo-hooks'
+┊   ┊  7┊import { useQuery, useMutation } from 'react-apollo-hooks'
+┊   ┊  8┊import { Redirect } from 'react-router-dom'
+┊   ┊  9┊import { RouteComponentProps } from 'react-router-dom'
+┊   ┊ 10┊import styled from 'styled-components'
+┊   ┊ 11┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 12┊import { GroupDetailsScreenQuery, GroupDetailsScreenMutation, User } from '../../graphql/types'
+┊   ┊ 13┊import { useMe } from '../../services/auth.service'
+┊   ┊ 14┊import { pickPicture, uploadProfilePicture } from '../../services/picture.service'
+┊   ┊ 15┊import Navbar from '../Navbar'
+┊   ┊ 16┊import CompleteGroupButton from './CompleteGroupButton'
+┊   ┊ 17┊import GroupDetailsNavbar from './GroupDetailsNavbar'
+┊   ┊ 18┊
+┊   ┊ 19┊const Style = styled.div`
+┊   ┊ 20┊  .GroupDetailsScreen-group-name {
+┊   ┊ 21┊    width: calc(100% - 30px);
+┊   ┊ 22┊    margin: 15px;
+┊   ┊ 23┊  }
+┊   ┊ 24┊
+┊   ┊ 25┊  .GroupDetailsScreen-participants-title {
+┊   ┊ 26┊    margin-top: 10px;
+┊   ┊ 27┊    margin-left: 15px;
+┊   ┊ 28┊  }
+┊   ┊ 29┊
+┊   ┊ 30┊  .GroupDetailsScreen-participants-list {
+┊   ┊ 31┊    display: flex;
+┊   ┊ 32┊    overflow: overlay;
+┊   ┊ 33┊    padding: 0;
+┊   ┊ 34┊  }
+┊   ┊ 35┊
+┊   ┊ 36┊  .GroupDetailsScreen-participant-item {
+┊   ┊ 37┊    padding: 10px;
+┊   ┊ 38┊    flex-flow: row wrap;
+┊   ┊ 39┊    text-align: center;
+┊   ┊ 40┊  }
+┊   ┊ 41┊
+┊   ┊ 42┊  .GroupDetailsScreen-participant-picture {
+┊   ┊ 43┊    flex: 0 1 50px;
+┊   ┊ 44┊    height: 50px;
+┊   ┊ 45┊    width: 50px;
+┊   ┊ 46┊    object-fit: cover;
+┊   ┊ 47┊    border-radius: 50%;
+┊   ┊ 48┊    display: block;
+┊   ┊ 49┊    margin-left: auto;
+┊   ┊ 50┊    margin-right: auto;
+┊   ┊ 51┊  }
+┊   ┊ 52┊
+┊   ┊ 53┊  .GroupDetailsScreen-group-info {
+┊   ┊ 54┊    display: flex;
+┊   ┊ 55┊    flex-direction: row;
+┊   ┊ 56┊    align-items: center;
+┊   ┊ 57┊  }
+┊   ┊ 58┊
+┊   ┊ 59┊  .GroupDetailsScreen-participant-name {
+┊   ┊ 60┊    line-height: 10px;
+┊   ┊ 61┊    font-size: 14px;
+┊   ┊ 62┊  }
+┊   ┊ 63┊
+┊   ┊ 64┊  .GroupDetailsScreen-group-picture {
+┊   ┊ 65┊    width: 50px;
+┊   ┊ 66┊    flex-basis: 50px;
+┊   ┊ 67┊    border-radius: 50%;
+┊   ┊ 68┊    margin-left: 15px;
+┊   ┊ 69┊    object-fit: cover;
+┊   ┊ 70┊    cursor: pointer;
+┊   ┊ 71┊  }
+┊   ┊ 72┊`
+┊   ┊ 73┊
+┊   ┊ 74┊const query = gql`
+┊   ┊ 75┊  query GroupDetailsScreenQuery($chatId: ID!) {
+┊   ┊ 76┊    chat(chatId: $chatId) {
+┊   ┊ 77┊      ...Chat
+┊   ┊ 78┊    }
+┊   ┊ 79┊  }
+┊   ┊ 80┊  ${fragments.chat}
+┊   ┊ 81┊`
+┊   ┊ 82┊
+┊   ┊ 83┊const mutation = gql`
+┊   ┊ 84┊  mutation GroupDetailsScreenMutation($chatId: ID!, $name: String, $picture: String) {
+┊   ┊ 85┊    updateGroup(chatId: $chatId, groupName: $name, groupPicture: $picture) {
+┊   ┊ 86┊      ...Chat
+┊   ┊ 87┊    }
+┊   ┊ 88┊  }
+┊   ┊ 89┊  ${fragments.chat}
+┊   ┊ 90┊`
+┊   ┊ 91┊
+┊   ┊ 92┊export default ({ location, history }: RouteComponentProps) => {
+┊   ┊ 93┊  const users = location.state.users
+┊   ┊ 94┊
+┊   ┊ 95┊  // Users are missing from state
+┊   ┊ 96┊  if (!(users instanceof Array)) {
+┊   ┊ 97┊    return <Redirect to="/chats" />
+┊   ┊ 98┊  }
+┊   ┊ 99┊
+┊   ┊100┊  const me = useMe()
+┊   ┊101┊  const [chatName, setChatName] = useState('')
+┊   ┊102┊  const [chatPicture, setChatPicture] = useState('')
+┊   ┊103┊  const participants = [me].concat(users)
+┊   ┊104┊
+┊   ┊105┊  const updateChatName = ({ target }) => {
+┊   ┊106┊    setChatName(target.value)
+┊   ┊107┊  }
+┊   ┊108┊
+┊   ┊109┊  const updateChatPicture = async () => {
+┊   ┊110┊    const file = await pickPicture()
+┊   ┊111┊
+┊   ┊112┊    if (!file) return
+┊   ┊113┊
+┊   ┊114┊    const { url } = await uploadProfilePicture(file)
+┊   ┊115┊
+┊   ┊116┊    setChatPicture(url)
+┊   ┊117┊  }
+┊   ┊118┊
+┊   ┊119┊  return (
+┊   ┊120┊    <Style className="GroupDetailsScreen Screen">
+┊   ┊121┊      <Navbar>
+┊   ┊122┊        <GroupDetailsNavbar history={history} />
+┊   ┊123┊      </Navbar>
+┊   ┊124┊      <div className="GroupDetailsScreen-group-info">
+┊   ┊125┊        <img
+┊   ┊126┊          className="GroupDetailsScreen-group-picture"
+┊   ┊127┊          src={chatPicture || '/assets/default-group-pic.jpg'}
+┊   ┊128┊          onClick={updateChatPicture}
+┊   ┊129┊        />
+┊   ┊130┊        <TextField
+┊   ┊131┊          label="Group name"
+┊   ┊132┊          placeholder="Enter group name"
+┊   ┊133┊          className="GroupDetailsScreen-group-name"
+┊   ┊134┊          value={chatName}
+┊   ┊135┊          onChange={updateChatName}
+┊   ┊136┊          autoFocus={true}
+┊   ┊137┊        />
+┊   ┊138┊      </div>
+┊   ┊139┊      <div className="GroupDetailsScreen-participants-title">
+┊   ┊140┊        Participants: {participants.length}
+┊   ┊141┊      </div>
+┊   ┊142┊      <ul className="GroupDetailsScreen-participants-list">
+┊   ┊143┊        {participants.map(participant => (
+┊   ┊144┊          <div key={participant.id} className="GroupDetailsScreen-participant-item">
+┊   ┊145┊            <img
+┊   ┊146┊              src={participant.picture || '/assets/default-profile-pic.jpg'}
+┊   ┊147┊              className="GroupDetailsScreen-participant-picture"
+┊   ┊148┊            />
+┊   ┊149┊            <span className="GroupDetailsScreen-participant-name">{participant.name}</span>
+┊   ┊150┊          </div>
+┊   ┊151┊        ))}
+┊   ┊152┊      </ul>
+┊   ┊153┊      {chatName && (
+┊   ┊154┊        <CompleteGroupButton
+┊   ┊155┊          history={history}
+┊   ┊156┊          groupName={chatName}
+┊   ┊157┊          groupPicture={chatPicture}
+┊   ┊158┊          users={users}
+┊   ┊159┊        />
+┊   ┊160┊      )}
+┊   ┊161┊    </Style>
+┊   ┊162┊  )
+┊   ┊163┊}
```

[}]: #

This will require us to download a new asset to the `public/assets` directory which represents the default picture for a group. Please save it as `default-group-pic.jpg`:

![default-group-pic.jpg](https://user-images.githubusercontent.com/7648874/51983284-3b1d8300-24d3-11e9-9f8b-afe36a3b9df1.jpg)

Let's add a route for the screen we've just created:

[{]: <helper> (diffStep 4.3 files="src/App" module="client")

#### [Step 4.3: Add group details screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/b9b7c3f)

##### Changed src&#x2F;App.tsx
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊import AnimatedSwitch from './components/AnimatedSwitch'
 ┊ 6┊ 6┊import AuthScreen from './components/AuthScreen'
 ┊ 7┊ 7┊import ChatsListScreen from './components/ChatsListScreen'
+┊  ┊ 8┊import GroupDetailsScreen from './components/GroupDetailsScreen'
 ┊ 8┊ 9┊import SettingsScreen from './components/SettingsScreen'
 ┊ 9┊10┊import NewGroupScreen from './components/NewGroupScreen'
 ┊10┊11┊import { withAuth } from './services/auth.service'
```
```diff
@@ -22,6 +23,7 @@
 ┊22┊23┊      <Route exact path="/chats/:chatId" component={withAuth(ChatRoomScreen)} />
 ┊23┊24┊      <Route exact path="/new-chat" component={withAuth(NewChatScreen)} />
 ┊24┊25┊      <Route exact path="/new-chat/group" component={withAuth(NewGroupScreen)} />
+┊  ┊26┊      <Route exact path="/new-chat/group/details" component={withAuth(GroupDetailsScreen)} />
 ┊25┊27┊      <Route component={RedirectToChats} />
 ┊26┊28┊    </AnimatedSwitch>
 ┊27┊29┊  </BrowserRouter>
```

[}]: #

There's one last thing missing in the flow and that would be migrating existing components to work well with the new feature of group chats.

Starting with the chats list component, we would like to display the default profile picture for group chats:

[{]: <helper> (diffStep 4.4 files="src/components/ChatsListScreen" module="client")

#### [Step 4.4: Apply group logic to existing components](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/109773f)

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsList.tsx
```diff
@@ -97,7 +97,12 @@
 ┊ 97┊ 97┊          >
 ┊ 98┊ 98┊            <img
 ┊ 99┊ 99┊              className="ChatsList-profile-pic"
-┊100┊   ┊              src={chat.picture || '/assets/default-profile-pic.jpg'}
+┊   ┊100┊              src={
+┊   ┊101┊                chat.picture ||
+┊   ┊102┊                (chat.isGroup
+┊   ┊103┊                  ? '/assets/default-group-pic.jpg'
+┊   ┊104┊                  : '/assets/default-profile-pic.jpg')
+┊   ┊105┊              }
 ┊101┊106┊            />
 ┊102┊107┊            <div className="ChatsList-info">
 ┊103┊108┊              <div className="ChatsList-name">{chat.name}</div>
```

[}]: #

In the messages list component, we would like to display the name of the owner of the message, so we would know exactly who sent it in case we're in a group chat:

[{]: <helper> (diffStep 4.4 files="src/components/ChatRoomScreen/MessagesList" module="client")

#### [Step 4.4: Apply group logic to existing components](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/109773f)

##### Changed src&#x2F;components&#x2F;ChatRoomScreen&#x2F;MessagesList.tsx
```diff
@@ -105,7 +105,7 @@
 ┊105┊105┊export default ({ chatId }: MessagesListProps) => {
 ┊106┊106┊  const {
 ┊107┊107┊    data: {
-┊108┊   ┊      chat: { messages },
+┊   ┊108┊      chat: { messages, isGroup },
 ┊109┊109┊    },
 ┊110┊110┊  } = useQuery<MessagesListQuery.Query, MessagesListQuery.Variables>(query, {
 ┊111┊111┊    variables: { chatId },
```
```diff
@@ -133,6 +133,9 @@
 ┊133┊133┊              message.ownership ? 'MessagesList-message-mine' : 'MessagesList-message-others'
 ┊134┊134┊            }`}
 ┊135┊135┊          >
+┊   ┊136┊            {isGroup && !message.ownership && (
+┊   ┊137┊              <div className="MessagesList-message-sender">{message.sender.name}</div>
+┊   ┊138┊            )}
 ┊136┊139┊            <div className="MessagesList-message-contents">{message.content}</div>
 ┊137┊140┊            <span className="MessagesList-message-timestamp">
 ┊138┊141┊              {moment(message.createdAt).format('HH:mm')}
```

[}]: #

And now what we're gonna do is basically use the group details screen to show the details of the group that we're currently at. If we're an admin of the group, we would be able to edit its details, and if not, we will only be able to view its details without changing any of it. The view and some of the logic are the same whether it's a new group or an existing one, but there are slight differences. To deal with the differences, we will use "if" statements before we use the hooks, but **beware whenever you do that!** If you'll use an expression that is likely to change during the component's lifespan, you should NOT use a hook inside the "if" statement's block, because the React engine relies on the hooks to be called in a similar order.

[{]: <helper> (diffStep 4.3 files="src/components/ChatRoomScreen/ChatNavBar, src/components/GroupDetailsScreen" module="client")

#### [Step 4.3: Add group details screen](https://github.com/Urigo/WhatsApp-Clone-Client-React/commit/b9b7c3f)

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;CompleteGroupButton.tsx
```diff
@@ -0,0 +1,114 @@
+┊   ┊  1┊import Button from '@material-ui/core/Button'
+┊   ┊  2┊import ArrowRightIcon from '@material-ui/icons/ArrowRightAlt'
+┊   ┊  3┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  4┊import gql from 'graphql-tag'
+┊   ┊  5┊import { History } from 'history'
+┊   ┊  6┊import * as React from 'react'
+┊   ┊  7┊import { useMutation } from 'react-apollo-hooks'
+┊   ┊  8┊import styled from 'styled-components'
+┊   ┊  9┊import { time as uniqid } from 'uniqid'
+┊   ┊ 10┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 11┊import * as queries from '../../graphql/queries'
+┊   ┊ 12┊import { Chats, User, CompleteGroupButtonMutation } from '../../graphql/types'
+┊   ┊ 13┊import { useMe } from '../../services/auth.service'
+┊   ┊ 14┊
+┊   ┊ 15┊const Style = styled.div`
+┊   ┊ 16┊  position: fixed;
+┊   ┊ 17┊  right: 10px;
+┊   ┊ 18┊  bottom: 10px;
+┊   ┊ 19┊
+┊   ┊ 20┊  button {
+┊   ┊ 21┊    min-width: 50px;
+┊   ┊ 22┊    width: 50px;
+┊   ┊ 23┊    height: 50px;
+┊   ┊ 24┊    border-radius: 999px;
+┊   ┊ 25┊    background-color: var(--secondary-bg);
+┊   ┊ 26┊    color: white;
+┊   ┊ 27┊  }
+┊   ┊ 28┊`
+┊   ┊ 29┊
+┊   ┊ 30┊const mutation = gql`
+┊   ┊ 31┊  mutation CompleteGroupButtonMutation(
+┊   ┊ 32┊    $userIds: [ID!]!
+┊   ┊ 33┊    $groupName: String!
+┊   ┊ 34┊    $groupPicture: String
+┊   ┊ 35┊  ) {
+┊   ┊ 36┊    addGroup(userIds: $userIds, groupName: $groupName, groupPicture: $groupPicture) {
+┊   ┊ 37┊      ...Chat
+┊   ┊ 38┊    }
+┊   ┊ 39┊  }
+┊   ┊ 40┊  ${fragments.chat}
+┊   ┊ 41┊`
+┊   ┊ 42┊
+┊   ┊ 43┊interface CompleteGroupButtonProps {
+┊   ┊ 44┊  history: History
+┊   ┊ 45┊  users: User.Fragment[]
+┊   ┊ 46┊  groupName: string
+┊   ┊ 47┊  groupPicture: string
+┊   ┊ 48┊}
+┊   ┊ 49┊
+┊   ┊ 50┊export default ({ history, users, groupName, groupPicture }: CompleteGroupButtonProps) => {
+┊   ┊ 51┊  const me = useMe()
+┊   ┊ 52┊
+┊   ┊ 53┊  const addGroup = useMutation<
+┊   ┊ 54┊    CompleteGroupButtonMutation.Mutation,
+┊   ┊ 55┊    CompleteGroupButtonMutation.Variables
+┊   ┊ 56┊  >(mutation, {
+┊   ┊ 57┊    optimisticResponse: {
+┊   ┊ 58┊      __typename: 'Mutation',
+┊   ┊ 59┊      addGroup: {
+┊   ┊ 60┊        __typename: 'Chat',
+┊   ┊ 61┊        id: uniqid(),
+┊   ┊ 62┊        name: groupName,
+┊   ┊ 63┊        picture: groupPicture,
+┊   ┊ 64┊        allTimeMembers: users,
+┊   ┊ 65┊        owner: me,
+┊   ┊ 66┊        isGroup: true,
+┊   ┊ 67┊        lastMessage: null,
+┊   ┊ 68┊      },
+┊   ┊ 69┊    },
+┊   ┊ 70┊    variables: {
+┊   ┊ 71┊      userIds: users.map(user => user.id),
+┊   ┊ 72┊      groupName,
+┊   ┊ 73┊      groupPicture,
+┊   ┊ 74┊    },
+┊   ┊ 75┊    update: (client, { data: { addGroup } }) => {
+┊   ┊ 76┊      client.writeFragment({
+┊   ┊ 77┊        id: defaultDataIdFromObject(addGroup),
+┊   ┊ 78┊        fragment: fragments.chat,
+┊   ┊ 79┊        fragmentName: 'Chat',
+┊   ┊ 80┊        data: addGroup,
+┊   ┊ 81┊      })
+┊   ┊ 82┊
+┊   ┊ 83┊      let chats
+┊   ┊ 84┊      try {
+┊   ┊ 85┊        chats = client.readQuery<Chats.Query>({
+┊   ┊ 86┊          query: queries.chats,
+┊   ┊ 87┊        }).chats
+┊   ┊ 88┊      } catch (e) {}
+┊   ┊ 89┊
+┊   ┊ 90┊      if (chats && !chats.some(chat => chat.id === addGroup.id)) {
+┊   ┊ 91┊        chats.unshift(addGroup)
+┊   ┊ 92┊
+┊   ┊ 93┊        client.writeQuery({
+┊   ┊ 94┊          query: queries.chats,
+┊   ┊ 95┊          data: { chats },
+┊   ┊ 96┊        })
+┊   ┊ 97┊      }
+┊   ┊ 98┊    },
+┊   ┊ 99┊  })
+┊   ┊100┊
+┊   ┊101┊  const onClick = () => {
+┊   ┊102┊    addGroup().then(({ data: { addGroup } }) => {
+┊   ┊103┊      history.push(`/chats/${addGroup.id}`)
+┊   ┊104┊    })
+┊   ┊105┊  }
+┊   ┊106┊
+┊   ┊107┊  return (
+┊   ┊108┊    <Style className="CompleteGroupButton">
+┊   ┊109┊      <Button variant="contained" color="secondary" onClick={onClick}>
+┊   ┊110┊        <ArrowRightIcon />
+┊   ┊111┊      </Button>
+┊   ┊112┊    </Style>
+┊   ┊113┊  )
+┊   ┊114┊}
```

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;GroupDetailsNavbar.tsx
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
+┊  ┊13┊  .GroupDetailsNavbar-title {
+┊  ┊14┊    line-height: 56px;
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  .GroupDetailsNavbar-back-button {
+┊  ┊18┊    color: var(--primary-text);
+┊  ┊19┊  }
+┊  ┊20┊`
+┊  ┊21┊
+┊  ┊22┊interface GroupDetailsNavbarProps {
+┊  ┊23┊  history: History
+┊  ┊24┊}
+┊  ┊25┊
+┊  ┊26┊export default ({ history }: GroupDetailsNavbarProps) => {
+┊  ┊27┊  const navToNewGroup = () => {
+┊  ┊28┊    history.push('/new-chat/group')
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  return (
+┊  ┊32┊    <Style className="GroupDetailsNavbar">
+┊  ┊33┊      <Button className="GroupDetailsNavbar-back-button" onClick={navToNewGroup}>
+┊  ┊34┊        <ArrowBackIcon />
+┊  ┊35┊      </Button>
+┊  ┊36┊      <div className="GroupDetailsNavbar-title">Group Details</div>
+┊  ┊37┊    </Style>
+┊  ┊38┊  )
+┊  ┊39┊}
```

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;index.tsx
```diff
@@ -0,0 +1,163 @@
+┊   ┊  1┊import TextField from '@material-ui/core/TextField'
+┊   ┊  2┊import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
+┊   ┊  3┊import gql from 'graphql-tag'
+┊   ┊  4┊import * as React from 'react'
+┊   ┊  5┊import { useState, useEffect } from 'react'
+┊   ┊  6┊import { MutationHookOptions } from 'react-apollo-hooks'
+┊   ┊  7┊import { useQuery, useMutation } from 'react-apollo-hooks'
+┊   ┊  8┊import { Redirect } from 'react-router-dom'
+┊   ┊  9┊import { RouteComponentProps } from 'react-router-dom'
+┊   ┊ 10┊import styled from 'styled-components'
+┊   ┊ 11┊import * as fragments from '../../graphql/fragments'
+┊   ┊ 12┊import { GroupDetailsScreenQuery, GroupDetailsScreenMutation, User } from '../../graphql/types'
+┊   ┊ 13┊import { useMe } from '../../services/auth.service'
+┊   ┊ 14┊import { pickPicture, uploadProfilePicture } from '../../services/picture.service'
+┊   ┊ 15┊import Navbar from '../Navbar'
+┊   ┊ 16┊import CompleteGroupButton from './CompleteGroupButton'
+┊   ┊ 17┊import GroupDetailsNavbar from './GroupDetailsNavbar'
+┊   ┊ 18┊
+┊   ┊ 19┊const Style = styled.div`
+┊   ┊ 20┊  .GroupDetailsScreen-group-name {
+┊   ┊ 21┊    width: calc(100% - 30px);
+┊   ┊ 22┊    margin: 15px;
+┊   ┊ 23┊  }
+┊   ┊ 24┊
+┊   ┊ 25┊  .GroupDetailsScreen-participants-title {
+┊   ┊ 26┊    margin-top: 10px;
+┊   ┊ 27┊    margin-left: 15px;
+┊   ┊ 28┊  }
+┊   ┊ 29┊
+┊   ┊ 30┊  .GroupDetailsScreen-participants-list {
+┊   ┊ 31┊    display: flex;
+┊   ┊ 32┊    overflow: overlay;
+┊   ┊ 33┊    padding: 0;
+┊   ┊ 34┊  }
+┊   ┊ 35┊
+┊   ┊ 36┊  .GroupDetailsScreen-participant-item {
+┊   ┊ 37┊    padding: 10px;
+┊   ┊ 38┊    flex-flow: row wrap;
+┊   ┊ 39┊    text-align: center;
+┊   ┊ 40┊  }
+┊   ┊ 41┊
+┊   ┊ 42┊  .GroupDetailsScreen-participant-picture {
+┊   ┊ 43┊    flex: 0 1 50px;
+┊   ┊ 44┊    height: 50px;
+┊   ┊ 45┊    width: 50px;
+┊   ┊ 46┊    object-fit: cover;
+┊   ┊ 47┊    border-radius: 50%;
+┊   ┊ 48┊    display: block;
+┊   ┊ 49┊    margin-left: auto;
+┊   ┊ 50┊    margin-right: auto;
+┊   ┊ 51┊  }
+┊   ┊ 52┊
+┊   ┊ 53┊  .GroupDetailsScreen-group-info {
+┊   ┊ 54┊    display: flex;
+┊   ┊ 55┊    flex-direction: row;
+┊   ┊ 56┊    align-items: center;
+┊   ┊ 57┊  }
+┊   ┊ 58┊
+┊   ┊ 59┊  .GroupDetailsScreen-participant-name {
+┊   ┊ 60┊    line-height: 10px;
+┊   ┊ 61┊    font-size: 14px;
+┊   ┊ 62┊  }
+┊   ┊ 63┊
+┊   ┊ 64┊  .GroupDetailsScreen-group-picture {
+┊   ┊ 65┊    width: 50px;
+┊   ┊ 66┊    flex-basis: 50px;
+┊   ┊ 67┊    border-radius: 50%;
+┊   ┊ 68┊    margin-left: 15px;
+┊   ┊ 69┊    object-fit: cover;
+┊   ┊ 70┊    cursor: pointer;
+┊   ┊ 71┊  }
+┊   ┊ 72┊`
+┊   ┊ 73┊
+┊   ┊ 74┊const query = gql`
+┊   ┊ 75┊  query GroupDetailsScreenQuery($chatId: ID!) {
+┊   ┊ 76┊    chat(chatId: $chatId) {
+┊   ┊ 77┊      ...Chat
+┊   ┊ 78┊    }
+┊   ┊ 79┊  }
+┊   ┊ 80┊  ${fragments.chat}
+┊   ┊ 81┊`
+┊   ┊ 82┊
+┊   ┊ 83┊const mutation = gql`
+┊   ┊ 84┊  mutation GroupDetailsScreenMutation($chatId: ID!, $name: String, $picture: String) {
+┊   ┊ 85┊    updateGroup(chatId: $chatId, groupName: $name, groupPicture: $picture) {
+┊   ┊ 86┊      ...Chat
+┊   ┊ 87┊    }
+┊   ┊ 88┊  }
+┊   ┊ 89┊  ${fragments.chat}
+┊   ┊ 90┊`
+┊   ┊ 91┊
+┊   ┊ 92┊export default ({ location, history }: RouteComponentProps) => {
+┊   ┊ 93┊  const users = location.state.users
+┊   ┊ 94┊
+┊   ┊ 95┊  // Users are missing from state
+┊   ┊ 96┊  if (!(users instanceof Array)) {
+┊   ┊ 97┊    return <Redirect to="/chats" />
+┊   ┊ 98┊  }
+┊   ┊ 99┊
+┊   ┊100┊  const me = useMe()
+┊   ┊101┊  const [chatName, setChatName] = useState('')
+┊   ┊102┊  const [chatPicture, setChatPicture] = useState('')
+┊   ┊103┊  const participants = [me].concat(users)
+┊   ┊104┊
+┊   ┊105┊  const updateChatName = ({ target }) => {
+┊   ┊106┊    setChatName(target.value)
+┊   ┊107┊  }
+┊   ┊108┊
+┊   ┊109┊  const updateChatPicture = async () => {
+┊   ┊110┊    const file = await pickPicture()
+┊   ┊111┊
+┊   ┊112┊    if (!file) return
+┊   ┊113┊
+┊   ┊114┊    const { url } = await uploadProfilePicture(file)
+┊   ┊115┊
+┊   ┊116┊    setChatPicture(url)
+┊   ┊117┊  }
+┊   ┊118┊
+┊   ┊119┊  return (
+┊   ┊120┊    <Style className="GroupDetailsScreen Screen">
+┊   ┊121┊      <Navbar>
+┊   ┊122┊        <GroupDetailsNavbar history={history} />
+┊   ┊123┊      </Navbar>
+┊   ┊124┊      <div className="GroupDetailsScreen-group-info">
+┊   ┊125┊        <img
+┊   ┊126┊          className="GroupDetailsScreen-group-picture"
+┊   ┊127┊          src={chatPicture || '/assets/default-group-pic.jpg'}
+┊   ┊128┊          onClick={updateChatPicture}
+┊   ┊129┊        />
+┊   ┊130┊        <TextField
+┊   ┊131┊          label="Group name"
+┊   ┊132┊          placeholder="Enter group name"
+┊   ┊133┊          className="GroupDetailsScreen-group-name"
+┊   ┊134┊          value={chatName}
+┊   ┊135┊          onChange={updateChatName}
+┊   ┊136┊          autoFocus={true}
+┊   ┊137┊        />
+┊   ┊138┊      </div>
+┊   ┊139┊      <div className="GroupDetailsScreen-participants-title">
+┊   ┊140┊        Participants: {participants.length}
+┊   ┊141┊      </div>
+┊   ┊142┊      <ul className="GroupDetailsScreen-participants-list">
+┊   ┊143┊        {participants.map(participant => (
+┊   ┊144┊          <div key={participant.id} className="GroupDetailsScreen-participant-item">
+┊   ┊145┊            <img
+┊   ┊146┊              src={participant.picture || '/assets/default-profile-pic.jpg'}
+┊   ┊147┊              className="GroupDetailsScreen-participant-picture"
+┊   ┊148┊            />
+┊   ┊149┊            <span className="GroupDetailsScreen-participant-name">{participant.name}</span>
+┊   ┊150┊          </div>
+┊   ┊151┊        ))}
+┊   ┊152┊      </ul>
+┊   ┊153┊      {chatName && (
+┊   ┊154┊        <CompleteGroupButton
+┊   ┊155┊          history={history}
+┊   ┊156┊          groupName={chatName}
+┊   ┊157┊          groupPicture={chatPicture}
+┊   ┊158┊          users={users}
+┊   ┊159┊        />
+┊   ┊160┊      )}
+┊   ┊161┊    </Style>
+┊   ┊162┊  )
+┊   ┊163┊}
```

[}]: #

That's it! Now we should be able to create group chats and message multiple people at once.


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](https://github.com/Urigo/WhatsApp-Clone-Tutorial/tree/master@next/.tortilla/manuals/views/step3.md) |
|:----------------------|

[}]: #
