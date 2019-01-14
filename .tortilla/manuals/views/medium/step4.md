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
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊16┊16┊  picture?: string
 ┊17┊17┊  allTimeMembers?: User[]
 ┊18┊18┊  listingMembers?: User[]
<b>+┊  ┊19┊  actualGroupMembers?: User[]</b>
<b>+┊  ┊20┊  admins?: User[]</b>
 ┊19┊21┊  owner?: User
 ┊20┊22┊  messages?: Message[]
 ┊21┊23┊}
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊48┊50┊  @JoinTable()
 ┊49┊51┊  listingMembers: User[]
 ┊50┊52┊
<b>+┊  ┊53┊  @ManyToMany(type &#x3D;&gt; User, user &#x3D;&gt; user.actualGroupMemberChats, { cascade: [&quot;insert&quot;, &quot;update&quot;], eager: false })</b>
<b>+┊  ┊54┊  @JoinTable()</b>
<b>+┊  ┊55┊  actualGroupMembers?: User[]</b>
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊  @ManyToMany(type &#x3D;&gt; User, user &#x3D;&gt; user.adminChats, { cascade: [&quot;insert&quot;, &quot;update&quot;], eager: false })</b>
<b>+┊  ┊58┊  @JoinTable()</b>
<b>+┊  ┊59┊  admins?: User[]</b>
<b>+┊  ┊60┊</b>
 ┊51┊61┊  @ManyToOne(type &#x3D;&gt; User, user &#x3D;&gt; user.ownerChats, { cascade: [&#x27;insert&#x27;, &#x27;update&#x27;], eager: false })
 ┊52┊62┊  owner?: User | null
 ┊53┊63┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊62┊72┊    picture,
 ┊63┊73┊    allTimeMembers,
 ┊64┊74┊    listingMembers,
<b>+┊  ┊75┊    actualGroupMembers,</b>
<b>+┊  ┊76┊    admins,</b>
 ┊65┊77┊    owner,
 ┊66┊78┊    messages,
 ┊67┊79┊  }: ChatConstructor &#x3D; {}) {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊74┊86┊    if (allTimeMembers) {
 ┊75┊87┊      this.allTimeMembers &#x3D; allTimeMembers
 ┊76┊88┊    }
<b>+┊  ┊89┊    if (actualGroupMembers) {</b>
<b>+┊  ┊90┊      this.actualGroupMembers &#x3D; actualGroupMembers</b>
<b>+┊  ┊91┊    }</b>
<b>+┊  ┊92┊    if (admins) {</b>
<b>+┊  ┊93┊      this.admins &#x3D; admins</b>
<b>+┊  ┊94┊    }</b>
 ┊77┊95┊    if (listingMembers) {
 ┊78┊96┊      this.listingMembers &#x3D; listingMembers
 ┊79┊97┊    }
</pre>

##### Changed entity&#x2F;user.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊33┊33┊  @ManyToMany(type &#x3D;&gt; Chat, chat &#x3D;&gt; chat.listingMembers)
 ┊34┊34┊  listingMemberChats: Chat[]
 ┊35┊35┊
<b>+┊  ┊36┊  @ManyToMany(type &#x3D;&gt; Chat, chat &#x3D;&gt; chat.actualGroupMembers)</b>
<b>+┊  ┊37┊  actualGroupMemberChats: Chat[]</b>
<b>+┊  ┊38┊</b>
<b>+┊  ┊39┊  @ManyToMany(type &#x3D;&gt; Chat, chat &#x3D;&gt; chat.admins)</b>
<b>+┊  ┊40┊  adminChats: Chat[]</b>
<b>+┊  ┊41┊</b>
 ┊36┊42┊  @ManyToMany(type &#x3D;&gt; Message, message &#x3D;&gt; message.holders)
 ┊37┊43┊  holderMessages: Message[]
 ┊38┊44┊
</pre>

##### Changed modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊157┊157┊      .getMany()
 ┊158┊158┊  }
 ┊159┊159┊
<b>+┊   ┊160┊  getChatActualGroupMembers(chat: Chat) {</b>
<b>+┊   ┊161┊    return this.userProvider</b>
<b>+┊   ┊162┊      .createQueryBuilder()</b>
<b>+┊   ┊163┊      .innerJoin(</b>
<b>+┊   ┊164┊        &#x27;user.actualGroupMemberChats&#x27;,</b>
<b>+┊   ┊165┊        &#x27;actualGroupMemberChats&#x27;,</b>
<b>+┊   ┊166┊        &#x27;actualGroupMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊167┊        { chatId: chat.id },</b>
<b>+┊   ┊168┊      )</b>
<b>+┊   ┊169┊      .getMany();</b>
<b>+┊   ┊170┊  }</b>
<b>+┊   ┊171┊</b>
<b>+┊   ┊172┊  getChatAdmins(chat: Chat) {</b>
<b>+┊   ┊173┊    return this.userProvider</b>
<b>+┊   ┊174┊      .createQueryBuilder()</b>
<b>+┊   ┊175┊      .innerJoin(&#x27;user.adminChats&#x27;, &#x27;adminChats&#x27;, &#x27;adminChats.id &#x3D; :chatId&#x27;, {</b>
<b>+┊   ┊176┊        chatId: chat.id,</b>
<b>+┊   ┊177┊      })</b>
<b>+┊   ┊178┊      .getMany();</b>
<b>+┊   ┊179┊  }</b>
<b>+┊   ┊180┊</b>
 ┊160┊181┊  async getChatOwner(chat: Chat) {
 ┊161┊182┊    const owner &#x3D; await this.userProvider
 ┊162┊183┊      .createQueryBuilder()
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊168┊189┊    return owner || null
 ┊169┊190┊  }
 ┊170┊191┊
<b>+┊   ┊192┊  async isChatGroup(chat: Chat) {</b>
<b>+┊   ┊193┊    return !!chat.name;</b>
<b>+┊   ┊194┊  }</b>
<b>+┊   ┊195┊</b>
 ┊171┊196┊  async filterChatAddedOrUpdated(chatAddedOrUpdated: Chat, creatorOrUpdaterId: string) {
 ┊172┊197┊    return (
 ┊173┊198┊      creatorOrUpdaterId !&#x3D;&#x3D; this.currentUser.id &amp;&amp;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊221┊246┊    const chat &#x3D; await this.createQueryBuilder()
 ┊222┊247┊      .whereInIds(Number(chatId))
 ┊223┊248┊      .innerJoinAndSelect(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)
<b>+┊   ┊249┊      .leftJoinAndSelect(&#x27;chat.actualGroupMembers&#x27;, &#x27;actualGroupMembers&#x27;)</b>
<b>+┊   ┊250┊      .leftJoinAndSelect(&#x27;chat.admins&#x27;, &#x27;admins&#x27;)</b>
 ┊224┊251┊      .leftJoinAndSelect(&#x27;chat.owner&#x27;, &#x27;owner&#x27;)
 ┊225┊252┊      .getOne();
 ┊226┊253┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊242┊269┊        // Delete the chat
 ┊243┊270┊        await this.repository.remove(chat);
 ┊244┊271┊      } else {
<b>+┊   ┊272┊        // Update the group</b>
<b>+┊   ┊273┊</b>
<b>+┊   ┊274┊        // Remove the current user from the chat members. He is no longer a member of the group</b>
<b>+┊   ┊275┊        chat.actualGroupMembers &#x3D; chat.actualGroupMembers &amp;&amp; chat.actualGroupMembers.filter(user &#x3D;&gt;</b>
<b>+┊   ┊276┊          user.id !&#x3D;&#x3D; this.currentUser.id</b>
<b>+┊   ┊277┊        );</b>
<b>+┊   ┊278┊        // Remove the current user from the chat admins</b>
<b>+┊   ┊279┊        chat.admins &#x3D; chat.admins &amp;&amp; chat.admins.filter(user &#x3D;&gt; user.id !&#x3D;&#x3D; this.currentUser.id);</b>
<b>+┊   ┊280┊        // If there are no more admins left the group goes read only</b>
<b>+┊   ┊281┊        // A null owner means the group is read-only</b>
<b>+┊   ┊282┊        chat.owner &#x3D; chat.admins &amp;&amp; chat.admins[0] || null;</b>
<b>+┊   ┊283┊</b>
 ┊246┊284┊        await this.repository.save(chat);
 ┊247┊285┊      }
 ┊248┊286┊
</pre>

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊38┊38┊      injector.get(ChatProvider).getChatAllTimeMembers(chat),
 ┊39┊39┊    listingMembers: (chat, args, { injector }) &#x3D;&gt;
 ┊40┊40┊      injector.get(ChatProvider).getChatListingMembers(chat),
<b>+┊  ┊41┊    actualGroupMembers: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatActualGroupMembers(chat),</b>
<b>+┊  ┊42┊    admins: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatAdmins(chat),</b>
 ┊41┊43┊    owner: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).getChatOwner(chat),
<b>+┊  ┊44┊    isGroup: (chat, args, { injector }) &#x3D;&gt; injector.get(ChatProvider).isChatGroup(chat),</b>
 ┊42┊45┊  },
 ┊43┊46┊} as IResolvers
</pre>

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊19┊19┊  allTimeMembers: [User!]!
 ┊20┊20┊  #Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group.
 ┊21┊21┊  listingMembers: [User!]!
<b>+┊  ┊22┊  #Actual members of the group. Null for chats. For groups they are the only ones who can send messages. They aren&#x27;t the only ones who get the group listed.</b>
<b>+┊  ┊23┊  actualGroupMembers: [User!]</b>
<b>+┊  ┊24┊  #Null for chats</b>
<b>+┊  ┊25┊  admins: [User!]</b>
 ┊22┊26┊  #If null the group is read-only. Null for chats.
 ┊23┊27┊  owner: User
<b>+┊  ┊28┊  #Computed property</b>
<b>+┊  ┊29┊  isGroup: Boolean!</b>
 ┊24┊30┊}
 ┊25┊31┊
 ┊26┊32┊type Mutation {
</pre>

##### Changed modules&#x2F;message&#x2F;providers&#x2F;message.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊36┊36┊      .whereInIds(chatId)
 ┊37┊37┊      .innerJoinAndSelect(&#x27;chat.allTimeMembers&#x27;, &#x27;allTimeMembers&#x27;)
 ┊38┊38┊      .innerJoinAndSelect(&#x27;chat.listingMembers&#x27;, &#x27;listingMembers&#x27;)
<b>+┊  ┊39┊      .leftJoinAndSelect(&#x27;chat.actualGroupMembers&#x27;, &#x27;actualGroupMembers&#x27;)</b>
 ┊39┊40┊      .getOne();
 ┊40┊41┊
 ┊41┊42┊    if (!chat) {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊71┊72┊
 ┊72┊73┊      holders &#x3D; chat.listingMembers;
 ┊73┊74┊    } else {
<b>+┊  ┊75┊      // Group</b>
<b>+┊  ┊76┊      if (!chat.actualGroupMembers || !chat.actualGroupMembers.find(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; this.currentUser.id)) {</b>
<b>+┊  ┊77┊        throw new Error(&#x60;The user is not a member of the group ${chatId}. Cannot add message.&#x60;);</b>
<b>+┊  ┊78┊      }</b>
<b>+┊  ┊79┊</b>
<b>+┊  ┊80┊      holders &#x3D; chat.actualGroupMembers;</b>
 ┊76┊81┊    }
 ┊77┊82┊
 ┊78┊83┊    const message &#x3D; await this.repository.save(new Message({
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊324┊329┊  }
 ┊325┊330┊
 ┊326┊331┊  async filterMessageAdded(messageAdded: Message) {
<b>+┊   ┊332┊    let relevantUsers: User[]</b>
<b>+┊   ┊333┊</b>
<b>+┊   ┊334┊    if (!messageAdded.chat.name) {</b>
<b>+┊   ┊335┊      // Chat</b>
<b>+┊   ┊336┊      relevantUsers &#x3D; (await this.userProvider</b>
<b>+┊   ┊337┊        .createQueryBuilder()</b>
<b>+┊   ┊338┊        .innerJoin(</b>
<b>+┊   ┊339┊          &#x27;user.listingMemberChats&#x27;,</b>
<b>+┊   ┊340┊          &#x27;listingMemberChats&#x27;,</b>
<b>+┊   ┊341┊          &#x27;listingMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊342┊          { chatId: messageAdded.chat.id }</b>
<b>+┊   ┊343┊        )</b>
<b>+┊   ┊344┊        .getMany()).filter(user &#x3D;&gt; user.id !&#x3D; messageAdded.sender.id)</b>
<b>+┊   ┊345┊    } else {</b>
<b>+┊   ┊346┊      // Group</b>
<b>+┊   ┊347┊      relevantUsers &#x3D; (await this.userProvider</b>
<b>+┊   ┊348┊        .createQueryBuilder()</b>
<b>+┊   ┊349┊        .innerJoin(</b>
<b>+┊   ┊350┊          &#x27;user.actualGroupMemberChats&#x27;,</b>
<b>+┊   ┊351┊          &#x27;actualGroupMemberChats&#x27;,</b>
<b>+┊   ┊352┊          &#x27;actualGroupMemberChats.id &#x3D; :chatId&#x27;,</b>
<b>+┊   ┊353┊          { chatId: messageAdded.chat.id }</b>
<b>+┊   ┊354┊        )</b>
<b>+┊   ┊355┊        .getMany()).filter(user &#x3D;&gt; user.id !&#x3D; messageAdded.sender.id)</b>
<b>+┊   ┊356┊    }</b>
 ┊336┊357┊
 ┊337┊358┊    return relevantUsers.some(user &#x3D;&gt; user.id &#x3D;&#x3D;&#x3D; this.currentUser.id)
 ┊338┊359┊  }
</pre>

[}]: #

Now we will add 2 new mutations:

- `addGroup` mutation - Responsible for creating chat groups.
- `updateChat` mutation - Unlike a single chat which is synced with a user's info, a group chat will be independent, therefore we will need a method that could updated its fields.

Let's implement those:

[{]: <helper> (diffStep 4.2 module="server")

#### Step 4.2: Add group related mutations

##### Changed modules&#x2F;chat&#x2F;providers&#x2F;chat.provider.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊305┊305┊      return chatId;
 ┊306┊306┊    }
 ┊307┊307┊  }
<b>+┊   ┊308┊</b>
<b>+┊   ┊309┊  async addGroup(</b>
<b>+┊   ┊310┊    userIds: string[],</b>
<b>+┊   ┊311┊    {</b>
<b>+┊   ┊312┊      groupName,</b>
<b>+┊   ┊313┊      groupPicture,</b>
<b>+┊   ┊314┊    }: {</b>
<b>+┊   ┊315┊      groupName?: string</b>
<b>+┊   ┊316┊      groupPicture?: string</b>
<b>+┊   ┊317┊    } &#x3D; {},</b>
<b>+┊   ┊318┊  ) {</b>
<b>+┊   ┊319┊    let users: User[] &#x3D; [];</b>
<b>+┊   ┊320┊    for (let userId of userIds) {</b>
<b>+┊   ┊321┊      const user &#x3D; await this.userProvider</b>
<b>+┊   ┊322┊        .createQueryBuilder()</b>
<b>+┊   ┊323┊        .whereInIds(userId)</b>
<b>+┊   ┊324┊        .getOne();</b>
<b>+┊   ┊325┊</b>
<b>+┊   ┊326┊      if (!user) {</b>
<b>+┊   ┊327┊        throw new Error(&#x60;User ${userId} doesn&#x27;t exist.&#x60;);</b>
<b>+┊   ┊328┊      }</b>
<b>+┊   ┊329┊</b>
<b>+┊   ┊330┊      users.push(user);</b>
<b>+┊   ┊331┊    }</b>
<b>+┊   ┊332┊</b>
<b>+┊   ┊333┊    const chat &#x3D; await this.repository.save(</b>
<b>+┊   ┊334┊      new Chat({</b>
<b>+┊   ┊335┊        name: groupName,</b>
<b>+┊   ┊336┊        admins: [this.currentUser],</b>
<b>+┊   ┊337┊        picture: groupPicture || undefined,</b>
<b>+┊   ┊338┊        owner: this.currentUser,</b>
<b>+┊   ┊339┊        allTimeMembers: [...users, this.currentUser],</b>
<b>+┊   ┊340┊        listingMembers: [...users, this.currentUser],</b>
<b>+┊   ┊341┊        actualGroupMembers: [...users, this.currentUser],</b>
<b>+┊   ┊342┊      }),</b>
<b>+┊   ┊343┊    );</b>
<b>+┊   ┊344┊</b>
<b>+┊   ┊345┊    this.pubsub.publish(&#x27;chatAdded&#x27;, {</b>
<b>+┊   ┊346┊      creatorId: this.currentUser.id,</b>
<b>+┊   ┊347┊      chatAdded: chat,</b>
<b>+┊   ┊348┊    });</b>
<b>+┊   ┊349┊</b>
<b>+┊   ┊350┊    return chat || null;</b>
<b>+┊   ┊351┊  }</b>
<b>+┊   ┊352┊</b>
<b>+┊   ┊353┊  async updateChat(</b>
<b>+┊   ┊354┊    chatId: string,</b>
<b>+┊   ┊355┊    {</b>
<b>+┊   ┊356┊      name,</b>
<b>+┊   ┊357┊      picture,</b>
<b>+┊   ┊358┊    }: {</b>
<b>+┊   ┊359┊      name?: string</b>
<b>+┊   ┊360┊      picture?: string</b>
<b>+┊   ┊361┊    } &#x3D; {},</b>
<b>+┊   ┊362┊  ) {</b>
<b>+┊   ┊363┊    const chat &#x3D; await this.createQueryBuilder()</b>
<b>+┊   ┊364┊      .whereInIds(chatId)</b>
<b>+┊   ┊365┊      .getOne();</b>
<b>+┊   ┊366┊</b>
<b>+┊   ┊367┊    if (!chat) return null;</b>
<b>+┊   ┊368┊    if (!chat.name) return chat;</b>
<b>+┊   ┊369┊</b>
<b>+┊   ┊370┊    name &#x3D; name || chat.name;</b>
<b>+┊   ┊371┊    picture &#x3D; picture || chat.picture;</b>
<b>+┊   ┊372┊    Object.assign(chat, { name, picture });</b>
<b>+┊   ┊373┊</b>
<b>+┊   ┊374┊    // Update the chat</b>
<b>+┊   ┊375┊    await this.repository.save(chat);</b>
<b>+┊   ┊376┊</b>
<b>+┊   ┊377┊    this.pubsub.publish(&#x27;chatUpdated&#x27;, {</b>
<b>+┊   ┊378┊      updaterId: this.currentUser.id,</b>
<b>+┊   ┊379┊      chatUpdated: chat,</b>
<b>+┊   ┊380┊    });</b>
<b>+┊   ┊381┊</b>
<b>+┊   ┊382┊    return chat || null;</b>
<b>+┊   ┊383┊  }</b>
 ┊308┊384┊}
</pre>

##### Changed modules&#x2F;chat&#x2F;resolvers&#x2F;resolvers.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊16┊16┊    }),
 ┊17┊17┊    addChat: (obj, { userId }, { injector }) &#x3D;&gt; injector.get(ChatProvider).addChat(userId),
 ┊18┊18┊    removeChat: (obj, { chatId }, { injector }) &#x3D;&gt; injector.get(ChatProvider).removeChat(chatId),
<b>+┊  ┊19┊    addGroup: (obj, { userIds, groupName, groupPicture }, { injector }) &#x3D;&gt;</b>
<b>+┊  ┊20┊      injector.get(ChatProvider).addGroup(userIds, {</b>
<b>+┊  ┊21┊        groupName: groupName || &#x27;&#x27;,</b>
<b>+┊  ┊22┊        groupPicture: groupPicture || &#x27;&#x27;,</b>
<b>+┊  ┊23┊      }),</b>
<b>+┊  ┊24┊    updateChat: (obj, { chatId, name, picture }, { injector }) &#x3D;&gt; injector.get(ChatProvider).updateChat(chatId, {</b>
<b>+┊  ┊25┊      name: name || &#x27;&#x27;,</b>
<b>+┊  ┊26┊      picture: picture || &#x27;&#x27;,</b>
<b>+┊  ┊27┊    }),</b>
 ┊19┊28┊  },
 ┊20┊29┊  Subscription: {
 ┊21┊30┊    chatAdded: {
</pre>

##### Changed modules&#x2F;chat&#x2F;schema&#x2F;typeDefs.graphql
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊32┊32┊type Mutation {
 ┊33┊33┊  addChat(userId: ID!): Chat
 ┊34┊34┊  removeChat(chatId: ID!): ID
<b>+┊  ┊35┊  addAdmins(groupId: ID!, userIds: [ID!]!): [ID]!</b>
<b>+┊  ┊36┊  removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]!</b>
<b>+┊  ┊37┊  addMembers(groupId: ID!, userIds: [ID!]!): [ID]!</b>
<b>+┊  ┊38┊  removeMembers(groupId: ID!, userIds: [ID!]!): [ID]!</b>
<b>+┊  ┊39┊  addGroup(userIds: [ID!]!, groupName: String!, groupPicture: String): Chat</b>
<b>+┊  ┊40┊  updateChat(chatId: ID!, name: String, picture: String): Chat</b>
 ┊35┊41┊}
</pre>

[}]: #

Now that the back-end is set, we will need to update the chat fragment in the client to contain the new field `isGroup`:

[{]: <helper> (diffStep 4.1 module="client")

#### Step 4.1: Update chat fragment

##### Changed src&#x2F;graphql&#x2F;fragments&#x2F;chat.fragment.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊17┊    lastMessage {
 ┊18┊18┊      ...Message
 ┊19┊19┊    }
<b>+┊  ┊20┊    isGroup</b>
 ┊20┊21┊  }
 ┊21┊22┊  ${message}
 ┊22┊23┊&#x60;
</pre>

[}]: #

Now we will create the new-group screen. Like the new-chat screen, it will have an almost identical layout, only the behavior is gonna be slightly different. In the new screen we will be able to select multiple users before we proceed, then, we should be able to view the group details and edit them before we create the group. Let's implement the new-group screen:

[{]: <helper> (diffStep 4.2 files="src/components/NewGroupScreen" module="client")

#### Step 4.2: Add new group screen

##### Added src&#x2F;components&#x2F;NewGroupScreen&#x2F;CreateGroupButton.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊  ┊ 2┊import AddIcon from &#x27;@material-ui/icons/Add&#x27;</b>
<b>+┊  ┊ 3┊import { History } from &#x27;history&#x27;</b>
<b>+┊  ┊ 4┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 5┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 6┊import { User } from &#x27;../../graphql/types&#x27;</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊  ┊ 9┊  position: fixed;</b>
<b>+┊  ┊10┊  right: 10px;</b>
<b>+┊  ┊11┊  bottom: 10px;</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊  button {</b>
<b>+┊  ┊14┊    min-width: 50px;</b>
<b>+┊  ┊15┊    width: 50px;</b>
<b>+┊  ┊16┊    height: 50px;</b>
<b>+┊  ┊17┊    border-radius: 999px;</b>
<b>+┊  ┊18┊    background-color: var(--secondary-bg);</b>
<b>+┊  ┊19┊    color: white;</b>
<b>+┊  ┊20┊  }</b>
<b>+┊  ┊21┊&#x60;</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊interface CreateGroupButtonProps {</b>
<b>+┊  ┊24┊  history: History</b>
<b>+┊  ┊25┊  users: User.Fragment[]</b>
<b>+┊  ┊26┊}</b>
<b>+┊  ┊27┊</b>
<b>+┊  ┊28┊export default ({ history, users }: CreateGroupButtonProps) &#x3D;&gt; {</b>
<b>+┊  ┊29┊  const onClick &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊30┊    history.push(&#x27;/new-chat/group/details&#x27;, {</b>
<b>+┊  ┊31┊      users,</b>
<b>+┊  ┊32┊    })</b>
<b>+┊  ┊33┊  }</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊  return (</b>
<b>+┊  ┊36┊    &lt;Style className&#x3D;&quot;CreateGroupButton&quot;&gt;</b>
<b>+┊  ┊37┊      &lt;Button variant&#x3D;&quot;contained&quot; color&#x3D;&quot;secondary&quot; onClick&#x3D;{onClick}&gt;</b>
<b>+┊  ┊38┊        &lt;AddIcon /&gt;</b>
<b>+┊  ┊39┊      &lt;/Button&gt;</b>
<b>+┊  ┊40┊    &lt;/Style&gt;</b>
<b>+┊  ┊41┊  )</b>
<b>+┊  ┊42┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;NewGroupScreen&#x2F;NewGroupNavbar.tsx
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
<b>+┊  ┊13┊  .NewGroupNavbar-title {</b>
<b>+┊  ┊14┊    line-height: 56px;</b>
<b>+┊  ┊15┊  }</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  .NewGroupNavbar-back-button {</b>
<b>+┊  ┊18┊    color: var(--primary-text);</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊&#x60;</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊interface NewGroupNavbarProps {</b>
<b>+┊  ┊23┊  history: History</b>
<b>+┊  ┊24┊}</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊export default ({ history }: NewGroupNavbarProps) &#x3D;&gt; {</b>
<b>+┊  ┊27┊  const navToChats &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊28┊    history.push(&#x27;/new-chat&#x27;)</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  return (</b>
<b>+┊  ┊32┊    &lt;Style className&#x3D;&quot;NewGroupNavbar&quot;&gt;</b>
<b>+┊  ┊33┊      &lt;Button className&#x3D;&quot;NewGroupNavbar-back-button&quot; onClick&#x3D;{navToChats}&gt;</b>
<b>+┊  ┊34┊        &lt;ArrowBackIcon /&gt;</b>
<b>+┊  ┊35┊      &lt;/Button&gt;</b>
<b>+┊  ┊36┊      &lt;div className&#x3D;&quot;NewGroupNavbar-title&quot;&gt;New Chat Group&lt;/div&gt;</b>
<b>+┊  ┊37┊    &lt;/Style&gt;</b>
<b>+┊  ┊38┊  )</b>
<b>+┊  ┊39┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;NewGroupScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 2┊import { useState, Suspense } from &#x27;react&#x27;</b>
<b>+┊  ┊ 3┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊  ┊ 4┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 5┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊  ┊ 6┊import UsersList from &#x27;../UsersList&#x27;</b>
<b>+┊  ┊ 7┊import CreateGroupButton from &#x27;./CreateGroupButton&#x27;</b>
<b>+┊  ┊ 8┊import NewGroupNavbar from &#x27;./NewGroupNavbar&#x27;</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊  ┊11┊  .UsersList {</b>
<b>+┊  ┊12┊    height: calc(100% - 56px);</b>
<b>+┊  ┊13┊    overflow-y: overlay;</b>
<b>+┊  ┊14┊  }</b>
<b>+┊  ┊15┊&#x60;</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊export default ({ history }: RouteComponentProps) &#x3D;&gt; {</b>
<b>+┊  ┊18┊  const [selectedUsers, setSelectedUsers] &#x3D; useState([])</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  return (</b>
<b>+┊  ┊21┊    &lt;Style className&#x3D;&quot;NewGroupScreen Screen&quot;&gt;</b>
<b>+┊  ┊22┊      &lt;Navbar&gt;</b>
<b>+┊  ┊23┊        &lt;NewGroupNavbar history&#x3D;{history} /&gt;</b>
<b>+┊  ┊24┊      &lt;/Navbar&gt;</b>
<b>+┊  ┊25┊      &lt;Suspense fallback&#x3D;{null}&gt;</b>
<b>+┊  ┊26┊        &lt;UsersList selectable onSelectionChange&#x3D;{setSelectedUsers} /&gt;</b>
<b>+┊  ┊27┊      &lt;/Suspense&gt;</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊      {!!selectedUsers.length &amp;&amp; &lt;CreateGroupButton history&#x3D;{history} users&#x3D;{selectedUsers} /&gt;}</b>
<b>+┊  ┊30┊    &lt;/Style&gt;</b>
<b>+┊  ┊31┊  )</b>
<b>+┊  ┊32┊}</b>
</pre>

[}]: #

Now we will add a dedicated route, and we will also create a "New Group" button which will be presented in the new chat screen. This way we can create a new group from the new chat screen if we want to, by simply clicking on that button and moving on to the new group screen.

[{]: <helper> (diffStep 4.2 files="src/App, src/components/NewChatScreen" module="client")

#### Step 4.2: Add new group screen

##### Changed src&#x2F;App.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 6┊import AuthScreen from &#x27;./components/AuthScreen&#x27;
 ┊ 7┊ 7┊import ChatsListScreen from &#x27;./components/ChatsListScreen&#x27;
 ┊ 8┊ 8┊import SettingsScreen from &#x27;./components/SettingsScreen&#x27;
<b>+┊  ┊ 9┊import NewGroupScreen from &#x27;./components/NewGroupScreen&#x27;</b>
 ┊ 9┊10┊import { withAuth } from &#x27;./services/auth.service&#x27;
 ┊10┊11┊
 ┊11┊12┊const RedirectToChats &#x3D; () &#x3D;&gt; (
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊20┊21┊      &lt;Route exact path&#x3D;&quot;/settings&quot; component&#x3D;{withAuth(SettingsScreen)} /&gt;
 ┊21┊22┊      &lt;Route exact path&#x3D;&quot;/chats/:chatId&quot; component&#x3D;{withAuth(ChatRoomScreen)} /&gt;
 ┊22┊23┊      &lt;Route exact path&#x3D;&quot;/new-chat&quot; component&#x3D;{withAuth(NewChatScreen)} /&gt;
<b>+┊  ┊24┊      &lt;Route exact path&#x3D;&quot;/new-chat/group&quot; component&#x3D;{withAuth(NewGroupScreen)} /&gt;</b>
 ┊23┊25┊      &lt;Route component&#x3D;{RedirectToChats} /&gt;
 ┊24┊26┊    &lt;/AnimatedSwitch&gt;
 ┊25┊27┊  &lt;/BrowserRouter&gt;
</pre>

##### Added src&#x2F;components&#x2F;NewChatScreen&#x2F;NewGroupButton.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊  ┊ 2┊import GroupAddIcon from &#x27;@material-ui/icons/GroupAdd&#x27;</b>
<b>+┊  ┊ 3┊import { History } from &#x27;history&#x27;</b>
<b>+┊  ┊ 4┊import * as React from &#x27;react&#x27;</b>
<b>+┊  ┊ 5┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊  ┊ 8┊  display: flex;</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  button {</b>
<b>+┊  ┊11┊    border-radius: 0;</b>
<b>+┊  ┊12┊    text-transform: none;</b>
<b>+┊  ┊13┊    font-size: inherit;</b>
<b>+┊  ┊14┊    width: 100%;</b>
<b>+┊  ┊15┊    justify-content: flex-start;</b>
<b>+┊  ┊16┊    padding-left: 15px;</b>
<b>+┊  ┊17┊    padding-right: 15px;</b>
<b>+┊  ┊18┊</b>
<b>+┊  ┊19┊    svg {</b>
<b>+┊  ┊20┊      font-size: 30px;</b>
<b>+┊  ┊21┊      margin-top: 10px;</b>
<b>+┊  ┊22┊    }</b>
<b>+┊  ┊23┊  }</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊  .NewGroupButton-icon {</b>
<b>+┊  ┊26┊    height: 50px;</b>
<b>+┊  ┊27┊    width: 50px;</b>
<b>+┊  ┊28┊    object-fit: cover;</b>
<b>+┊  ┊29┊    border-radius: 50%;</b>
<b>+┊  ┊30┊    color: white;</b>
<b>+┊  ┊31┊    background-color: var(--secondary-bg);</b>
<b>+┊  ┊32┊  }</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊  .NewGroupButton-title {</b>
<b>+┊  ┊35┊    padding-left: 15px;</b>
<b>+┊  ┊36┊    font-weight: bold;</b>
<b>+┊  ┊37┊  }</b>
<b>+┊  ┊38┊&#x60;</b>
<b>+┊  ┊39┊</b>
<b>+┊  ┊40┊interface NewGroupButtonProps {</b>
<b>+┊  ┊41┊  history: History</b>
<b>+┊  ┊42┊}</b>
<b>+┊  ┊43┊</b>
<b>+┊  ┊44┊export default ({ history }: NewGroupButtonProps) &#x3D;&gt; {</b>
<b>+┊  ┊45┊  const navToGroup &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊46┊    history.push(&#x27;/new-chat/group&#x27;)</b>
<b>+┊  ┊47┊  }</b>
<b>+┊  ┊48┊</b>
<b>+┊  ┊49┊  return (</b>
<b>+┊  ┊50┊    &lt;Style&gt;</b>
<b>+┊  ┊51┊      &lt;Button onClick&#x3D;{navToGroup}&gt;</b>
<b>+┊  ┊52┊        &lt;div className&#x3D;&quot;NewGroupButton-icon&quot;&gt;</b>
<b>+┊  ┊53┊          &lt;GroupAddIcon /&gt;</b>
<b>+┊  ┊54┊        &lt;/div&gt;</b>
<b>+┊  ┊55┊        &lt;div className&#x3D;&quot;NewGroupButton-title&quot;&gt;New Group&lt;/div&gt;</b>
<b>+┊  ┊56┊      &lt;/Button&gt;</b>
<b>+┊  ┊57┊    &lt;/Style&gt;</b>
<b>+┊  ┊58┊  )</b>
<b>+┊  ┊59┊}</b>
</pre>

##### Changed src&#x2F;components&#x2F;NewChatScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊14┊import Navbar from &#x27;../Navbar&#x27;
 ┊15┊15┊import UsersList from &#x27;../UsersList&#x27;
 ┊16┊16┊import NewChatNavbar from &#x27;./NewChatNavbar&#x27;
<b>+┊  ┊17┊import NewGroupButton from &#x27;./NewGroupButton&#x27;</b>
 ┊17┊18┊
 ┊18┊19┊const Style &#x3D; styled.div&#x60;
 ┊19┊20┊  .UsersList {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 97┊ 98┊        &lt;NewChatNavbar history&#x3D;{history} /&gt;
 ┊ 98┊ 99┊      &lt;/Navbar&gt;
 ┊ 99┊100┊      &lt;div className&#x3D;&quot;NewChatScreen-users-list&quot;&gt;
<b>+┊   ┊101┊        &lt;NewGroupButton history&#x3D;{history} /&gt;</b>
 ┊100┊102┊        &lt;Suspense fallback&#x3D;{null}&gt;
 ┊101┊103┊          &lt;UsersList onUserPick&#x3D;{onUserPick} /&gt;
 ┊102┊104┊        &lt;/Suspense&gt;
</pre>

[}]: #

Up-next would be the group details screen. The layout consists of:

- A navbar with a back button.
- Picture and name inputs.
- A horizontal list of all the participants.
- A "complete" button that will send a mutation request to the server.

Once a name has been typed, the "complete" button should pop-up. Let's implement the screen then:

[{]: <helper> (diffStep 4.3 files="src/components/GroupDetailsScreen" module="client")

#### Step 4.3: Add group details screen

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;CompleteGroupButton.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊   ┊  2┊import ArrowRightIcon from &#x27;@material-ui/icons/ArrowRightAlt&#x27;</b>
<b>+┊   ┊  3┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  4┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  5┊import { History } from &#x27;history&#x27;</b>
<b>+┊   ┊  6┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  7┊import { useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  8┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  9┊import { time as uniqid } from &#x27;uniqid&#x27;</b>
<b>+┊   ┊ 10┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 11┊import * as queries from &#x27;../../graphql/queries&#x27;</b>
<b>+┊   ┊ 12┊import { Chats, User, CompleteGroupButtonMutation } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 13┊import { useMe } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊ 14┊</b>
<b>+┊   ┊ 15┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 16┊  position: fixed;</b>
<b>+┊   ┊ 17┊  right: 10px;</b>
<b>+┊   ┊ 18┊  bottom: 10px;</b>
<b>+┊   ┊ 19┊</b>
<b>+┊   ┊ 20┊  button {</b>
<b>+┊   ┊ 21┊    min-width: 50px;</b>
<b>+┊   ┊ 22┊    width: 50px;</b>
<b>+┊   ┊ 23┊    height: 50px;</b>
<b>+┊   ┊ 24┊    border-radius: 999px;</b>
<b>+┊   ┊ 25┊    background-color: var(--secondary-bg);</b>
<b>+┊   ┊ 26┊    color: white;</b>
<b>+┊   ┊ 27┊  }</b>
<b>+┊   ┊ 28┊&#x60;</b>
<b>+┊   ┊ 29┊</b>
<b>+┊   ┊ 30┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 31┊  mutation CompleteGroupButtonMutation(</b>
<b>+┊   ┊ 32┊    $userIds: [ID!]!</b>
<b>+┊   ┊ 33┊    $groupName: String!</b>
<b>+┊   ┊ 34┊    $groupPicture: String</b>
<b>+┊   ┊ 35┊  ) {</b>
<b>+┊   ┊ 36┊    addGroup(userIds: $userIds, groupName: $groupName, groupPicture: $groupPicture) {</b>
<b>+┊   ┊ 37┊      ...Chat</b>
<b>+┊   ┊ 38┊    }</b>
<b>+┊   ┊ 39┊  }</b>
<b>+┊   ┊ 40┊  ${fragments.chat}</b>
<b>+┊   ┊ 41┊&#x60;</b>
<b>+┊   ┊ 42┊</b>
<b>+┊   ┊ 43┊interface CompleteGroupButtonProps {</b>
<b>+┊   ┊ 44┊  history: History</b>
<b>+┊   ┊ 45┊  users: User.Fragment[]</b>
<b>+┊   ┊ 46┊  groupName: string</b>
<b>+┊   ┊ 47┊  groupPicture: string</b>
<b>+┊   ┊ 48┊}</b>
<b>+┊   ┊ 49┊</b>
<b>+┊   ┊ 50┊export default ({ history, users, groupName, groupPicture }: CompleteGroupButtonProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 51┊  const me &#x3D; useMe()</b>
<b>+┊   ┊ 52┊</b>
<b>+┊   ┊ 53┊  const addGroup &#x3D; useMutation&lt;</b>
<b>+┊   ┊ 54┊    CompleteGroupButtonMutation.Mutation,</b>
<b>+┊   ┊ 55┊    CompleteGroupButtonMutation.Variables</b>
<b>+┊   ┊ 56┊  &gt;(mutation, {</b>
<b>+┊   ┊ 57┊    optimisticResponse: {</b>
<b>+┊   ┊ 58┊      __typename: &#x27;Mutation&#x27;,</b>
<b>+┊   ┊ 59┊      addGroup: {</b>
<b>+┊   ┊ 60┊        __typename: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 61┊        id: uniqid(),</b>
<b>+┊   ┊ 62┊        name: groupName,</b>
<b>+┊   ┊ 63┊        picture: groupPicture,</b>
<b>+┊   ┊ 64┊        allTimeMembers: users,</b>
<b>+┊   ┊ 65┊        owner: me,</b>
<b>+┊   ┊ 66┊        isGroup: true,</b>
<b>+┊   ┊ 67┊        lastMessage: null,</b>
<b>+┊   ┊ 68┊      },</b>
<b>+┊   ┊ 69┊    },</b>
<b>+┊   ┊ 70┊    variables: {</b>
<b>+┊   ┊ 71┊      userIds: users.map(user &#x3D;&gt; user.id),</b>
<b>+┊   ┊ 72┊      groupName,</b>
<b>+┊   ┊ 73┊      groupPicture,</b>
<b>+┊   ┊ 74┊    },</b>
<b>+┊   ┊ 75┊    update: (client, { data: { addGroup } }) &#x3D;&gt; {</b>
<b>+┊   ┊ 76┊      client.writeFragment({</b>
<b>+┊   ┊ 77┊        id: defaultDataIdFromObject(addGroup),</b>
<b>+┊   ┊ 78┊        fragment: fragments.chat,</b>
<b>+┊   ┊ 79┊        fragmentName: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 80┊        data: addGroup,</b>
<b>+┊   ┊ 81┊      })</b>
<b>+┊   ┊ 82┊</b>
<b>+┊   ┊ 83┊      let chats</b>
<b>+┊   ┊ 84┊      try {</b>
<b>+┊   ┊ 85┊        chats &#x3D; client.readQuery&lt;Chats.Query&gt;({</b>
<b>+┊   ┊ 86┊          query: queries.chats,</b>
<b>+┊   ┊ 87┊        }).chats</b>
<b>+┊   ┊ 88┊      } catch (e) {}</b>
<b>+┊   ┊ 89┊</b>
<b>+┊   ┊ 90┊      if (chats &amp;&amp; !chats.some(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; addGroup.id)) {</b>
<b>+┊   ┊ 91┊        chats.unshift(addGroup)</b>
<b>+┊   ┊ 92┊</b>
<b>+┊   ┊ 93┊        client.writeQuery({</b>
<b>+┊   ┊ 94┊          query: queries.chats,</b>
<b>+┊   ┊ 95┊          data: { chats },</b>
<b>+┊   ┊ 96┊        })</b>
<b>+┊   ┊ 97┊      }</b>
<b>+┊   ┊ 98┊    },</b>
<b>+┊   ┊ 99┊  })</b>
<b>+┊   ┊100┊</b>
<b>+┊   ┊101┊  const onClick &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊102┊    addGroup().then(({ data: { addGroup } }) &#x3D;&gt; {</b>
<b>+┊   ┊103┊      history.push(&#x60;/chats/${addGroup.id}&#x60;)</b>
<b>+┊   ┊104┊    })</b>
<b>+┊   ┊105┊  }</b>
<b>+┊   ┊106┊</b>
<b>+┊   ┊107┊  return (</b>
<b>+┊   ┊108┊    &lt;Style className&#x3D;&quot;CompleteGroupButton&quot;&gt;</b>
<b>+┊   ┊109┊      &lt;Button variant&#x3D;&quot;contained&quot; color&#x3D;&quot;secondary&quot; onClick&#x3D;{onClick}&gt;</b>
<b>+┊   ┊110┊        &lt;ArrowRightIcon /&gt;</b>
<b>+┊   ┊111┊      &lt;/Button&gt;</b>
<b>+┊   ┊112┊    &lt;/Style&gt;</b>
<b>+┊   ┊113┊  )</b>
<b>+┊   ┊114┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;GroupDetailsNavbar.tsx
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
<b>+┊  ┊13┊  .GroupDetailsNavbar-title {</b>
<b>+┊  ┊14┊    line-height: 56px;</b>
<b>+┊  ┊15┊  }</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  .GroupDetailsNavbar-back-button {</b>
<b>+┊  ┊18┊    color: var(--primary-text);</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊&#x60;</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊interface GroupDetailsNavbarProps {</b>
<b>+┊  ┊23┊  history: History</b>
<b>+┊  ┊24┊}</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊export default ({ history }: GroupDetailsNavbarProps) &#x3D;&gt; {</b>
<b>+┊  ┊27┊  const navToNewGroup &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊28┊    history.push(&#x27;/new-chat/group&#x27;)</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  return (</b>
<b>+┊  ┊32┊    &lt;Style className&#x3D;&quot;GroupDetailsNavbar&quot;&gt;</b>
<b>+┊  ┊33┊      &lt;Button className&#x3D;&quot;GroupDetailsNavbar-back-button&quot; onClick&#x3D;{navToNewGroup}&gt;</b>
<b>+┊  ┊34┊        &lt;ArrowBackIcon /&gt;</b>
<b>+┊  ┊35┊      &lt;/Button&gt;</b>
<b>+┊  ┊36┊      &lt;div className&#x3D;&quot;GroupDetailsNavbar-title&quot;&gt;Group Details&lt;/div&gt;</b>
<b>+┊  ┊37┊    &lt;/Style&gt;</b>
<b>+┊  ┊38┊  )</b>
<b>+┊  ┊39┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import TextField from &#x27;@material-ui/core/TextField&#x27;</b>
<b>+┊   ┊  2┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  3┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  4┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  5┊import { useState, useEffect } from &#x27;react&#x27;</b>
<b>+┊   ┊  6┊import { MutationHookOptions } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  7┊import { useQuery, useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  8┊import { Redirect } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊  9┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊ 10┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊ 11┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 12┊import { GroupDetailsScreenQuery, GroupDetailsScreenMutation, User } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 13┊import { useMe } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊ 14┊import { pickPicture, uploadProfilePicture } from &#x27;../../services/picture.service&#x27;</b>
<b>+┊   ┊ 15┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊   ┊ 16┊import CompleteGroupButton from &#x27;./CompleteGroupButton&#x27;</b>
<b>+┊   ┊ 17┊import GroupDetailsNavbar from &#x27;./GroupDetailsNavbar&#x27;</b>
<b>+┊   ┊ 18┊</b>
<b>+┊   ┊ 19┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 20┊  .GroupDetailsScreen-group-name {</b>
<b>+┊   ┊ 21┊    width: calc(100% - 30px);</b>
<b>+┊   ┊ 22┊    margin: 15px;</b>
<b>+┊   ┊ 23┊  }</b>
<b>+┊   ┊ 24┊</b>
<b>+┊   ┊ 25┊  .GroupDetailsScreen-participants-title {</b>
<b>+┊   ┊ 26┊    margin-top: 10px;</b>
<b>+┊   ┊ 27┊    margin-left: 15px;</b>
<b>+┊   ┊ 28┊  }</b>
<b>+┊   ┊ 29┊</b>
<b>+┊   ┊ 30┊  .GroupDetailsScreen-participants-list {</b>
<b>+┊   ┊ 31┊    display: flex;</b>
<b>+┊   ┊ 32┊    overflow: overlay;</b>
<b>+┊   ┊ 33┊    padding: 0;</b>
<b>+┊   ┊ 34┊  }</b>
<b>+┊   ┊ 35┊</b>
<b>+┊   ┊ 36┊  .GroupDetailsScreen-participant-item {</b>
<b>+┊   ┊ 37┊    padding: 10px;</b>
<b>+┊   ┊ 38┊    flex-flow: row wrap;</b>
<b>+┊   ┊ 39┊    text-align: center;</b>
<b>+┊   ┊ 40┊  }</b>
<b>+┊   ┊ 41┊</b>
<b>+┊   ┊ 42┊  .GroupDetailsScreen-participant-picture {</b>
<b>+┊   ┊ 43┊    flex: 0 1 50px;</b>
<b>+┊   ┊ 44┊    height: 50px;</b>
<b>+┊   ┊ 45┊    width: 50px;</b>
<b>+┊   ┊ 46┊    object-fit: cover;</b>
<b>+┊   ┊ 47┊    border-radius: 50%;</b>
<b>+┊   ┊ 48┊    display: block;</b>
<b>+┊   ┊ 49┊    margin-left: auto;</b>
<b>+┊   ┊ 50┊    margin-right: auto;</b>
<b>+┊   ┊ 51┊  }</b>
<b>+┊   ┊ 52┊</b>
<b>+┊   ┊ 53┊  .GroupDetailsScreen-group-info {</b>
<b>+┊   ┊ 54┊    display: flex;</b>
<b>+┊   ┊ 55┊    flex-direction: row;</b>
<b>+┊   ┊ 56┊    align-items: center;</b>
<b>+┊   ┊ 57┊  }</b>
<b>+┊   ┊ 58┊</b>
<b>+┊   ┊ 59┊  .GroupDetailsScreen-participant-name {</b>
<b>+┊   ┊ 60┊    line-height: 10px;</b>
<b>+┊   ┊ 61┊    font-size: 14px;</b>
<b>+┊   ┊ 62┊  }</b>
<b>+┊   ┊ 63┊</b>
<b>+┊   ┊ 64┊  .GroupDetailsScreen-group-picture {</b>
<b>+┊   ┊ 65┊    width: 50px;</b>
<b>+┊   ┊ 66┊    flex-basis: 50px;</b>
<b>+┊   ┊ 67┊    border-radius: 50%;</b>
<b>+┊   ┊ 68┊    margin-left: 15px;</b>
<b>+┊   ┊ 69┊    object-fit: cover;</b>
<b>+┊   ┊ 70┊    cursor: pointer;</b>
<b>+┊   ┊ 71┊  }</b>
<b>+┊   ┊ 72┊&#x60;</b>
<b>+┊   ┊ 73┊</b>
<b>+┊   ┊ 74┊const query &#x3D; gql&#x60;</b>
<b>+┊   ┊ 75┊  query GroupDetailsScreenQuery($chatId: ID!) {</b>
<b>+┊   ┊ 76┊    chat(chatId: $chatId) {</b>
<b>+┊   ┊ 77┊      ...Chat</b>
<b>+┊   ┊ 78┊    }</b>
<b>+┊   ┊ 79┊  }</b>
<b>+┊   ┊ 80┊  ${fragments.chat}</b>
<b>+┊   ┊ 81┊&#x60;</b>
<b>+┊   ┊ 82┊</b>
<b>+┊   ┊ 83┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 84┊  mutation GroupDetailsScreenMutation($chatId: ID!, $name: String, $picture: String) {</b>
<b>+┊   ┊ 85┊    updateChat(chatId: $chatId, name: $name, picture: $picture) {</b>
<b>+┊   ┊ 86┊      ...Chat</b>
<b>+┊   ┊ 87┊    }</b>
<b>+┊   ┊ 88┊  }</b>
<b>+┊   ┊ 89┊  ${fragments.chat}</b>
<b>+┊   ┊ 90┊&#x60;</b>
<b>+┊   ┊ 91┊</b>
<b>+┊   ┊ 92┊export default ({ location, history }: RouteComponentProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 93┊  const users &#x3D; location.state.users</b>
<b>+┊   ┊ 94┊</b>
<b>+┊   ┊ 95┊  // Users are missing from state</b>
<b>+┊   ┊ 96┊  if (!(users instanceof Array)) {</b>
<b>+┊   ┊ 97┊    return &lt;Redirect to&#x3D;&quot;/chats&quot; /&gt;</b>
<b>+┊   ┊ 98┊  }</b>
<b>+┊   ┊ 99┊</b>
<b>+┊   ┊100┊  const me &#x3D; useMe()</b>
<b>+┊   ┊101┊  const [chatName, setChatName] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊102┊  const [chatPicture, setChatPicture] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊103┊  const participants &#x3D; [me].concat(users)</b>
<b>+┊   ┊104┊</b>
<b>+┊   ┊105┊  const updateChatName &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊106┊    setChatName(target.value)</b>
<b>+┊   ┊107┊  }</b>
<b>+┊   ┊108┊</b>
<b>+┊   ┊109┊  const updateChatPicture &#x3D; async () &#x3D;&gt; {</b>
<b>+┊   ┊110┊    const file &#x3D; await pickPicture()</b>
<b>+┊   ┊111┊</b>
<b>+┊   ┊112┊    if (!file) return</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊    const { url } &#x3D; await uploadProfilePicture(file)</b>
<b>+┊   ┊115┊</b>
<b>+┊   ┊116┊    setChatPicture(url)</b>
<b>+┊   ┊117┊  }</b>
<b>+┊   ┊118┊</b>
<b>+┊   ┊119┊  return (</b>
<b>+┊   ┊120┊    &lt;Style className&#x3D;&quot;GroupDetailsScreen Screen&quot;&gt;</b>
<b>+┊   ┊121┊      &lt;Navbar&gt;</b>
<b>+┊   ┊122┊        &lt;GroupDetailsNavbar history&#x3D;{history} /&gt;</b>
<b>+┊   ┊123┊      &lt;/Navbar&gt;</b>
<b>+┊   ┊124┊      &lt;div className&#x3D;&quot;GroupDetailsScreen-group-info&quot;&gt;</b>
<b>+┊   ┊125┊        &lt;img</b>
<b>+┊   ┊126┊          className&#x3D;&quot;GroupDetailsScreen-group-picture&quot;</b>
<b>+┊   ┊127┊          src&#x3D;{chatPicture || &#x27;/assets/default-group-pic.jpg&#x27;}</b>
<b>+┊   ┊128┊          onClick&#x3D;{updateChatPicture}</b>
<b>+┊   ┊129┊        /&gt;</b>
<b>+┊   ┊130┊        &lt;TextField</b>
<b>+┊   ┊131┊          label&#x3D;&quot;Group name&quot;</b>
<b>+┊   ┊132┊          placeholder&#x3D;&quot;Enter group name&quot;</b>
<b>+┊   ┊133┊          className&#x3D;&quot;GroupDetailsScreen-group-name&quot;</b>
<b>+┊   ┊134┊          value&#x3D;{chatName}</b>
<b>+┊   ┊135┊          onChange&#x3D;{updateChatName}</b>
<b>+┊   ┊136┊          autoFocus&#x3D;{true}</b>
<b>+┊   ┊137┊        /&gt;</b>
<b>+┊   ┊138┊      &lt;/div&gt;</b>
<b>+┊   ┊139┊      &lt;div className&#x3D;&quot;GroupDetailsScreen-participants-title&quot;&gt;</b>
<b>+┊   ┊140┊        Participants: {participants.length}</b>
<b>+┊   ┊141┊      &lt;/div&gt;</b>
<b>+┊   ┊142┊      &lt;ul className&#x3D;&quot;GroupDetailsScreen-participants-list&quot;&gt;</b>
<b>+┊   ┊143┊        {participants.map(participant &#x3D;&gt; (</b>
<b>+┊   ┊144┊          &lt;div key&#x3D;{participant.id} className&#x3D;&quot;GroupDetailsScreen-participant-item&quot;&gt;</b>
<b>+┊   ┊145┊            &lt;img</b>
<b>+┊   ┊146┊              src&#x3D;{participant.picture || &#x27;/assets/default-profile-pic.jpg&#x27;}</b>
<b>+┊   ┊147┊              className&#x3D;&quot;GroupDetailsScreen-participant-picture&quot;</b>
<b>+┊   ┊148┊            /&gt;</b>
<b>+┊   ┊149┊            &lt;span className&#x3D;&quot;GroupDetailsScreen-participant-name&quot;&gt;{participant.name}&lt;/span&gt;</b>
<b>+┊   ┊150┊          &lt;/div&gt;</b>
<b>+┊   ┊151┊        ))}</b>
<b>+┊   ┊152┊      &lt;/ul&gt;</b>
<b>+┊   ┊153┊      {chatName &amp;&amp; (</b>
<b>+┊   ┊154┊        &lt;CompleteGroupButton</b>
<b>+┊   ┊155┊          history&#x3D;{history}</b>
<b>+┊   ┊156┊          groupName&#x3D;{chatName}</b>
<b>+┊   ┊157┊          groupPicture&#x3D;{chatPicture}</b>
<b>+┊   ┊158┊          users&#x3D;{users}</b>
<b>+┊   ┊159┊        /&gt;</b>
<b>+┊   ┊160┊      )}</b>
<b>+┊   ┊161┊    &lt;/Style&gt;</b>
<b>+┊   ┊162┊  )</b>
<b>+┊   ┊163┊}</b>
</pre>

[}]: #

This will require us to download a new asset to the `public/assets` directory which represents the default picture for a group. Please save it as `default-group-pic.jpg`:

![default-group-pic.jpg](https://user-images.githubusercontent.com/7648874/51983284-3b1d8300-24d3-11e9-9f8b-afe36a3b9df1.jpg)

Let's add a route for the screen we've just created:

[{]: <helper> (diffStep 4.3 files="src/App" module="client")

#### Step 4.3: Add group details screen

##### Changed src&#x2F;App.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import AnimatedSwitch from &#x27;./components/AnimatedSwitch&#x27;
 ┊ 6┊ 6┊import AuthScreen from &#x27;./components/AuthScreen&#x27;
 ┊ 7┊ 7┊import ChatsListScreen from &#x27;./components/ChatsListScreen&#x27;
<b>+┊  ┊ 8┊import GroupDetailsScreen from &#x27;./components/GroupDetailsScreen&#x27;</b>
 ┊ 8┊ 9┊import SettingsScreen from &#x27;./components/SettingsScreen&#x27;
 ┊ 9┊10┊import NewGroupScreen from &#x27;./components/NewGroupScreen&#x27;
 ┊10┊11┊import { withAuth } from &#x27;./services/auth.service&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊23┊      &lt;Route exact path&#x3D;&quot;/chats/:chatId&quot; component&#x3D;{withAuth(ChatRoomScreen)} /&gt;
 ┊23┊24┊      &lt;Route exact path&#x3D;&quot;/new-chat&quot; component&#x3D;{withAuth(NewChatScreen)} /&gt;
 ┊24┊25┊      &lt;Route exact path&#x3D;&quot;/new-chat/group&quot; component&#x3D;{withAuth(NewGroupScreen)} /&gt;
<b>+┊  ┊26┊      &lt;Route exact path&#x3D;&quot;/new-chat/group/details&quot; component&#x3D;{withAuth(GroupDetailsScreen)} /&gt;</b>
 ┊25┊27┊      &lt;Route component&#x3D;{RedirectToChats} /&gt;
 ┊26┊28┊    &lt;/AnimatedSwitch&gt;
 ┊27┊29┊  &lt;/BrowserRouter&gt;
</pre>

[}]: #

There's one last thing missing in the flow and that would be migrating existing components to work well with the new feature of group chats.

Starting with the chats list component, we would like to display the default profile picture for group chats:

[{]: <helper> (diffStep 4.4 files="src/components/ChatsListScreen" module="client")

#### Step 4.4: Apply group logic to existing components

##### Changed src&#x2F;components&#x2F;ChatsListScreen&#x2F;ChatsList.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 97┊ 97┊          &gt;
 ┊ 98┊ 98┊            &lt;img
 ┊ 99┊ 99┊              className&#x3D;&quot;ChatsList-profile-pic&quot;
<b>+┊   ┊100┊              src&#x3D;{</b>
<b>+┊   ┊101┊                chat.picture ||</b>
<b>+┊   ┊102┊                (chat.isGroup</b>
<b>+┊   ┊103┊                  ? &#x27;/assets/default-group-pic.jpg&#x27;</b>
<b>+┊   ┊104┊                  : &#x27;/assets/default-profile-pic.jpg&#x27;)</b>
<b>+┊   ┊105┊              }</b>
 ┊101┊106┊            /&gt;
 ┊102┊107┊            &lt;div className&#x3D;&quot;ChatsList-info&quot;&gt;
 ┊103┊108┊              &lt;div className&#x3D;&quot;ChatsList-name&quot;&gt;{chat.name}&lt;/div&gt;
</pre>

[}]: #

In the messages list component, we would like to display the name of the owner of the message, so we would know exactly who sent it in case we're in a group chat:

[{]: <helper> (diffStep 4.4 files="src/components/ChatRoomScreen/MessagesList" module="client")

#### Step 4.4: Apply group logic to existing components

##### Changed src&#x2F;components&#x2F;ChatRoomScreen&#x2F;MessagesList.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊105┊105┊export default ({ chatId }: MessagesListProps) &#x3D;&gt; {
 ┊106┊106┊  const {
 ┊107┊107┊    data: {
<b>+┊   ┊108┊      chat: { messages, isGroup },</b>
 ┊109┊109┊    },
 ┊110┊110┊  } &#x3D; useQuery&lt;MessagesListQuery.Query, MessagesListQuery.Variables&gt;(query, {
 ┊111┊111┊    variables: { chatId },
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊132┊132┊              message.ownership ? &#x27;MessagesList-message-mine&#x27; : &#x27;MessagesList-message-others&#x27;
 ┊133┊133┊            }&#x60;}
 ┊134┊134┊          &gt;
<b>+┊   ┊135┊            {isGroup &amp;&amp; !message.ownership &amp;&amp; (</b>
<b>+┊   ┊136┊              &lt;div className&#x3D;&quot;MessagesList-message-sender&quot;&gt;{message.sender.name}&lt;/div&gt;</b>
<b>+┊   ┊137┊            )}</b>
 ┊135┊138┊            &lt;div className&#x3D;&quot;MessagesList-message-contents&quot;&gt;{message.content}&lt;/div&gt;
 ┊136┊139┊            &lt;span className&#x3D;&quot;MessagesList-message-timestamp&quot;&gt;
 ┊137┊140┊              {moment(message.createdAt).format(&#x27;HH:mm&#x27;)}
</pre>

[}]: #

And now what we're gonna do is basically use the group details screen to show the details of the group that we're currently at. If we're an admin of the group, we would be able to edit its details, and if not, we will only be able to view its details without changing any of it. The view and some of the logic are the same whether it's a new group or an existing one, but there are slight differences. To deal with the differences, we will use "if" statements before we use the hooks, but **beware whenever you do that!** If you'll use an expression that is likely to change during the component's lifespan, you should NOT use a hook inside the "if" statement's block, because the React engine relies on the hooks to be called in a similar order.

[{]: <helper> (diffStep 4.3 files="src/components/ChatRoomScreen/ChatNavBar, src/components/GroupDetailsScreen" module="client")

#### Step 4.3: Add group details screen

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;CompleteGroupButton.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import Button from &#x27;@material-ui/core/Button&#x27;</b>
<b>+┊   ┊  2┊import ArrowRightIcon from &#x27;@material-ui/icons/ArrowRightAlt&#x27;</b>
<b>+┊   ┊  3┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  4┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  5┊import { History } from &#x27;history&#x27;</b>
<b>+┊   ┊  6┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  7┊import { useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  8┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊  9┊import { time as uniqid } from &#x27;uniqid&#x27;</b>
<b>+┊   ┊ 10┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 11┊import * as queries from &#x27;../../graphql/queries&#x27;</b>
<b>+┊   ┊ 12┊import { Chats, User, CompleteGroupButtonMutation } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 13┊import { useMe } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊ 14┊</b>
<b>+┊   ┊ 15┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 16┊  position: fixed;</b>
<b>+┊   ┊ 17┊  right: 10px;</b>
<b>+┊   ┊ 18┊  bottom: 10px;</b>
<b>+┊   ┊ 19┊</b>
<b>+┊   ┊ 20┊  button {</b>
<b>+┊   ┊ 21┊    min-width: 50px;</b>
<b>+┊   ┊ 22┊    width: 50px;</b>
<b>+┊   ┊ 23┊    height: 50px;</b>
<b>+┊   ┊ 24┊    border-radius: 999px;</b>
<b>+┊   ┊ 25┊    background-color: var(--secondary-bg);</b>
<b>+┊   ┊ 26┊    color: white;</b>
<b>+┊   ┊ 27┊  }</b>
<b>+┊   ┊ 28┊&#x60;</b>
<b>+┊   ┊ 29┊</b>
<b>+┊   ┊ 30┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 31┊  mutation CompleteGroupButtonMutation(</b>
<b>+┊   ┊ 32┊    $userIds: [ID!]!</b>
<b>+┊   ┊ 33┊    $groupName: String!</b>
<b>+┊   ┊ 34┊    $groupPicture: String</b>
<b>+┊   ┊ 35┊  ) {</b>
<b>+┊   ┊ 36┊    addGroup(userIds: $userIds, groupName: $groupName, groupPicture: $groupPicture) {</b>
<b>+┊   ┊ 37┊      ...Chat</b>
<b>+┊   ┊ 38┊    }</b>
<b>+┊   ┊ 39┊  }</b>
<b>+┊   ┊ 40┊  ${fragments.chat}</b>
<b>+┊   ┊ 41┊&#x60;</b>
<b>+┊   ┊ 42┊</b>
<b>+┊   ┊ 43┊interface CompleteGroupButtonProps {</b>
<b>+┊   ┊ 44┊  history: History</b>
<b>+┊   ┊ 45┊  users: User.Fragment[]</b>
<b>+┊   ┊ 46┊  groupName: string</b>
<b>+┊   ┊ 47┊  groupPicture: string</b>
<b>+┊   ┊ 48┊}</b>
<b>+┊   ┊ 49┊</b>
<b>+┊   ┊ 50┊export default ({ history, users, groupName, groupPicture }: CompleteGroupButtonProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 51┊  const me &#x3D; useMe()</b>
<b>+┊   ┊ 52┊</b>
<b>+┊   ┊ 53┊  const addGroup &#x3D; useMutation&lt;</b>
<b>+┊   ┊ 54┊    CompleteGroupButtonMutation.Mutation,</b>
<b>+┊   ┊ 55┊    CompleteGroupButtonMutation.Variables</b>
<b>+┊   ┊ 56┊  &gt;(mutation, {</b>
<b>+┊   ┊ 57┊    optimisticResponse: {</b>
<b>+┊   ┊ 58┊      __typename: &#x27;Mutation&#x27;,</b>
<b>+┊   ┊ 59┊      addGroup: {</b>
<b>+┊   ┊ 60┊        __typename: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 61┊        id: uniqid(),</b>
<b>+┊   ┊ 62┊        name: groupName,</b>
<b>+┊   ┊ 63┊        picture: groupPicture,</b>
<b>+┊   ┊ 64┊        allTimeMembers: users,</b>
<b>+┊   ┊ 65┊        owner: me,</b>
<b>+┊   ┊ 66┊        isGroup: true,</b>
<b>+┊   ┊ 67┊        lastMessage: null,</b>
<b>+┊   ┊ 68┊      },</b>
<b>+┊   ┊ 69┊    },</b>
<b>+┊   ┊ 70┊    variables: {</b>
<b>+┊   ┊ 71┊      userIds: users.map(user &#x3D;&gt; user.id),</b>
<b>+┊   ┊ 72┊      groupName,</b>
<b>+┊   ┊ 73┊      groupPicture,</b>
<b>+┊   ┊ 74┊    },</b>
<b>+┊   ┊ 75┊    update: (client, { data: { addGroup } }) &#x3D;&gt; {</b>
<b>+┊   ┊ 76┊      client.writeFragment({</b>
<b>+┊   ┊ 77┊        id: defaultDataIdFromObject(addGroup),</b>
<b>+┊   ┊ 78┊        fragment: fragments.chat,</b>
<b>+┊   ┊ 79┊        fragmentName: &#x27;Chat&#x27;,</b>
<b>+┊   ┊ 80┊        data: addGroup,</b>
<b>+┊   ┊ 81┊      })</b>
<b>+┊   ┊ 82┊</b>
<b>+┊   ┊ 83┊      let chats</b>
<b>+┊   ┊ 84┊      try {</b>
<b>+┊   ┊ 85┊        chats &#x3D; client.readQuery&lt;Chats.Query&gt;({</b>
<b>+┊   ┊ 86┊          query: queries.chats,</b>
<b>+┊   ┊ 87┊        }).chats</b>
<b>+┊   ┊ 88┊      } catch (e) {}</b>
<b>+┊   ┊ 89┊</b>
<b>+┊   ┊ 90┊      if (chats &amp;&amp; !chats.some(chat &#x3D;&gt; chat.id &#x3D;&#x3D;&#x3D; addGroup.id)) {</b>
<b>+┊   ┊ 91┊        chats.unshift(addGroup)</b>
<b>+┊   ┊ 92┊</b>
<b>+┊   ┊ 93┊        client.writeQuery({</b>
<b>+┊   ┊ 94┊          query: queries.chats,</b>
<b>+┊   ┊ 95┊          data: { chats },</b>
<b>+┊   ┊ 96┊        })</b>
<b>+┊   ┊ 97┊      }</b>
<b>+┊   ┊ 98┊    },</b>
<b>+┊   ┊ 99┊  })</b>
<b>+┊   ┊100┊</b>
<b>+┊   ┊101┊  const onClick &#x3D; () &#x3D;&gt; {</b>
<b>+┊   ┊102┊    addGroup().then(({ data: { addGroup } }) &#x3D;&gt; {</b>
<b>+┊   ┊103┊      history.push(&#x60;/chats/${addGroup.id}&#x60;)</b>
<b>+┊   ┊104┊    })</b>
<b>+┊   ┊105┊  }</b>
<b>+┊   ┊106┊</b>
<b>+┊   ┊107┊  return (</b>
<b>+┊   ┊108┊    &lt;Style className&#x3D;&quot;CompleteGroupButton&quot;&gt;</b>
<b>+┊   ┊109┊      &lt;Button variant&#x3D;&quot;contained&quot; color&#x3D;&quot;secondary&quot; onClick&#x3D;{onClick}&gt;</b>
<b>+┊   ┊110┊        &lt;ArrowRightIcon /&gt;</b>
<b>+┊   ┊111┊      &lt;/Button&gt;</b>
<b>+┊   ┊112┊    &lt;/Style&gt;</b>
<b>+┊   ┊113┊  )</b>
<b>+┊   ┊114┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;GroupDetailsNavbar.tsx
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
<b>+┊  ┊13┊  .GroupDetailsNavbar-title {</b>
<b>+┊  ┊14┊    line-height: 56px;</b>
<b>+┊  ┊15┊  }</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  .GroupDetailsNavbar-back-button {</b>
<b>+┊  ┊18┊    color: var(--primary-text);</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊&#x60;</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊interface GroupDetailsNavbarProps {</b>
<b>+┊  ┊23┊  history: History</b>
<b>+┊  ┊24┊}</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊export default ({ history }: GroupDetailsNavbarProps) &#x3D;&gt; {</b>
<b>+┊  ┊27┊  const navToNewGroup &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊28┊    history.push(&#x27;/new-chat/group&#x27;)</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  return (</b>
<b>+┊  ┊32┊    &lt;Style className&#x3D;&quot;GroupDetailsNavbar&quot;&gt;</b>
<b>+┊  ┊33┊      &lt;Button className&#x3D;&quot;GroupDetailsNavbar-back-button&quot; onClick&#x3D;{navToNewGroup}&gt;</b>
<b>+┊  ┊34┊        &lt;ArrowBackIcon /&gt;</b>
<b>+┊  ┊35┊      &lt;/Button&gt;</b>
<b>+┊  ┊36┊      &lt;div className&#x3D;&quot;GroupDetailsNavbar-title&quot;&gt;Group Details&lt;/div&gt;</b>
<b>+┊  ┊37┊    &lt;/Style&gt;</b>
<b>+┊  ┊38┊  )</b>
<b>+┊  ┊39┊}</b>
</pre>

##### Added src&#x2F;components&#x2F;GroupDetailsScreen&#x2F;index.tsx
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import TextField from &#x27;@material-ui/core/TextField&#x27;</b>
<b>+┊   ┊  2┊import { defaultDataIdFromObject } from &#x27;apollo-cache-inmemory&#x27;</b>
<b>+┊   ┊  3┊import gql from &#x27;graphql-tag&#x27;</b>
<b>+┊   ┊  4┊import * as React from &#x27;react&#x27;</b>
<b>+┊   ┊  5┊import { useState, useEffect } from &#x27;react&#x27;</b>
<b>+┊   ┊  6┊import { MutationHookOptions } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  7┊import { useQuery, useMutation } from &#x27;react-apollo-hooks&#x27;</b>
<b>+┊   ┊  8┊import { Redirect } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊  9┊import { RouteComponentProps } from &#x27;react-router-dom&#x27;</b>
<b>+┊   ┊ 10┊import styled from &#x27;styled-components&#x27;</b>
<b>+┊   ┊ 11┊import * as fragments from &#x27;../../graphql/fragments&#x27;</b>
<b>+┊   ┊ 12┊import { GroupDetailsScreenQuery, GroupDetailsScreenMutation, User } from &#x27;../../graphql/types&#x27;</b>
<b>+┊   ┊ 13┊import { useMe } from &#x27;../../services/auth.service&#x27;</b>
<b>+┊   ┊ 14┊import { pickPicture, uploadProfilePicture } from &#x27;../../services/picture.service&#x27;</b>
<b>+┊   ┊ 15┊import Navbar from &#x27;../Navbar&#x27;</b>
<b>+┊   ┊ 16┊import CompleteGroupButton from &#x27;./CompleteGroupButton&#x27;</b>
<b>+┊   ┊ 17┊import GroupDetailsNavbar from &#x27;./GroupDetailsNavbar&#x27;</b>
<b>+┊   ┊ 18┊</b>
<b>+┊   ┊ 19┊const Style &#x3D; styled.div&#x60;</b>
<b>+┊   ┊ 20┊  .GroupDetailsScreen-group-name {</b>
<b>+┊   ┊ 21┊    width: calc(100% - 30px);</b>
<b>+┊   ┊ 22┊    margin: 15px;</b>
<b>+┊   ┊ 23┊  }</b>
<b>+┊   ┊ 24┊</b>
<b>+┊   ┊ 25┊  .GroupDetailsScreen-participants-title {</b>
<b>+┊   ┊ 26┊    margin-top: 10px;</b>
<b>+┊   ┊ 27┊    margin-left: 15px;</b>
<b>+┊   ┊ 28┊  }</b>
<b>+┊   ┊ 29┊</b>
<b>+┊   ┊ 30┊  .GroupDetailsScreen-participants-list {</b>
<b>+┊   ┊ 31┊    display: flex;</b>
<b>+┊   ┊ 32┊    overflow: overlay;</b>
<b>+┊   ┊ 33┊    padding: 0;</b>
<b>+┊   ┊ 34┊  }</b>
<b>+┊   ┊ 35┊</b>
<b>+┊   ┊ 36┊  .GroupDetailsScreen-participant-item {</b>
<b>+┊   ┊ 37┊    padding: 10px;</b>
<b>+┊   ┊ 38┊    flex-flow: row wrap;</b>
<b>+┊   ┊ 39┊    text-align: center;</b>
<b>+┊   ┊ 40┊  }</b>
<b>+┊   ┊ 41┊</b>
<b>+┊   ┊ 42┊  .GroupDetailsScreen-participant-picture {</b>
<b>+┊   ┊ 43┊    flex: 0 1 50px;</b>
<b>+┊   ┊ 44┊    height: 50px;</b>
<b>+┊   ┊ 45┊    width: 50px;</b>
<b>+┊   ┊ 46┊    object-fit: cover;</b>
<b>+┊   ┊ 47┊    border-radius: 50%;</b>
<b>+┊   ┊ 48┊    display: block;</b>
<b>+┊   ┊ 49┊    margin-left: auto;</b>
<b>+┊   ┊ 50┊    margin-right: auto;</b>
<b>+┊   ┊ 51┊  }</b>
<b>+┊   ┊ 52┊</b>
<b>+┊   ┊ 53┊  .GroupDetailsScreen-group-info {</b>
<b>+┊   ┊ 54┊    display: flex;</b>
<b>+┊   ┊ 55┊    flex-direction: row;</b>
<b>+┊   ┊ 56┊    align-items: center;</b>
<b>+┊   ┊ 57┊  }</b>
<b>+┊   ┊ 58┊</b>
<b>+┊   ┊ 59┊  .GroupDetailsScreen-participant-name {</b>
<b>+┊   ┊ 60┊    line-height: 10px;</b>
<b>+┊   ┊ 61┊    font-size: 14px;</b>
<b>+┊   ┊ 62┊  }</b>
<b>+┊   ┊ 63┊</b>
<b>+┊   ┊ 64┊  .GroupDetailsScreen-group-picture {</b>
<b>+┊   ┊ 65┊    width: 50px;</b>
<b>+┊   ┊ 66┊    flex-basis: 50px;</b>
<b>+┊   ┊ 67┊    border-radius: 50%;</b>
<b>+┊   ┊ 68┊    margin-left: 15px;</b>
<b>+┊   ┊ 69┊    object-fit: cover;</b>
<b>+┊   ┊ 70┊    cursor: pointer;</b>
<b>+┊   ┊ 71┊  }</b>
<b>+┊   ┊ 72┊&#x60;</b>
<b>+┊   ┊ 73┊</b>
<b>+┊   ┊ 74┊const query &#x3D; gql&#x60;</b>
<b>+┊   ┊ 75┊  query GroupDetailsScreenQuery($chatId: ID!) {</b>
<b>+┊   ┊ 76┊    chat(chatId: $chatId) {</b>
<b>+┊   ┊ 77┊      ...Chat</b>
<b>+┊   ┊ 78┊    }</b>
<b>+┊   ┊ 79┊  }</b>
<b>+┊   ┊ 80┊  ${fragments.chat}</b>
<b>+┊   ┊ 81┊&#x60;</b>
<b>+┊   ┊ 82┊</b>
<b>+┊   ┊ 83┊const mutation &#x3D; gql&#x60;</b>
<b>+┊   ┊ 84┊  mutation GroupDetailsScreenMutation($chatId: ID!, $name: String, $picture: String) {</b>
<b>+┊   ┊ 85┊    updateChat(chatId: $chatId, name: $name, picture: $picture) {</b>
<b>+┊   ┊ 86┊      ...Chat</b>
<b>+┊   ┊ 87┊    }</b>
<b>+┊   ┊ 88┊  }</b>
<b>+┊   ┊ 89┊  ${fragments.chat}</b>
<b>+┊   ┊ 90┊&#x60;</b>
<b>+┊   ┊ 91┊</b>
<b>+┊   ┊ 92┊export default ({ location, history }: RouteComponentProps) &#x3D;&gt; {</b>
<b>+┊   ┊ 93┊  const users &#x3D; location.state.users</b>
<b>+┊   ┊ 94┊</b>
<b>+┊   ┊ 95┊  // Users are missing from state</b>
<b>+┊   ┊ 96┊  if (!(users instanceof Array)) {</b>
<b>+┊   ┊ 97┊    return &lt;Redirect to&#x3D;&quot;/chats&quot; /&gt;</b>
<b>+┊   ┊ 98┊  }</b>
<b>+┊   ┊ 99┊</b>
<b>+┊   ┊100┊  const me &#x3D; useMe()</b>
<b>+┊   ┊101┊  const [chatName, setChatName] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊102┊  const [chatPicture, setChatPicture] &#x3D; useState(&#x27;&#x27;)</b>
<b>+┊   ┊103┊  const participants &#x3D; [me].concat(users)</b>
<b>+┊   ┊104┊</b>
<b>+┊   ┊105┊  const updateChatName &#x3D; ({ target }) &#x3D;&gt; {</b>
<b>+┊   ┊106┊    setChatName(target.value)</b>
<b>+┊   ┊107┊  }</b>
<b>+┊   ┊108┊</b>
<b>+┊   ┊109┊  const updateChatPicture &#x3D; async () &#x3D;&gt; {</b>
<b>+┊   ┊110┊    const file &#x3D; await pickPicture()</b>
<b>+┊   ┊111┊</b>
<b>+┊   ┊112┊    if (!file) return</b>
<b>+┊   ┊113┊</b>
<b>+┊   ┊114┊    const { url } &#x3D; await uploadProfilePicture(file)</b>
<b>+┊   ┊115┊</b>
<b>+┊   ┊116┊    setChatPicture(url)</b>
<b>+┊   ┊117┊  }</b>
<b>+┊   ┊118┊</b>
<b>+┊   ┊119┊  return (</b>
<b>+┊   ┊120┊    &lt;Style className&#x3D;&quot;GroupDetailsScreen Screen&quot;&gt;</b>
<b>+┊   ┊121┊      &lt;Navbar&gt;</b>
<b>+┊   ┊122┊        &lt;GroupDetailsNavbar history&#x3D;{history} /&gt;</b>
<b>+┊   ┊123┊      &lt;/Navbar&gt;</b>
<b>+┊   ┊124┊      &lt;div className&#x3D;&quot;GroupDetailsScreen-group-info&quot;&gt;</b>
<b>+┊   ┊125┊        &lt;img</b>
<b>+┊   ┊126┊          className&#x3D;&quot;GroupDetailsScreen-group-picture&quot;</b>
<b>+┊   ┊127┊          src&#x3D;{chatPicture || &#x27;/assets/default-group-pic.jpg&#x27;}</b>
<b>+┊   ┊128┊          onClick&#x3D;{updateChatPicture}</b>
<b>+┊   ┊129┊        /&gt;</b>
<b>+┊   ┊130┊        &lt;TextField</b>
<b>+┊   ┊131┊          label&#x3D;&quot;Group name&quot;</b>
<b>+┊   ┊132┊          placeholder&#x3D;&quot;Enter group name&quot;</b>
<b>+┊   ┊133┊          className&#x3D;&quot;GroupDetailsScreen-group-name&quot;</b>
<b>+┊   ┊134┊          value&#x3D;{chatName}</b>
<b>+┊   ┊135┊          onChange&#x3D;{updateChatName}</b>
<b>+┊   ┊136┊          autoFocus&#x3D;{true}</b>
<b>+┊   ┊137┊        /&gt;</b>
<b>+┊   ┊138┊      &lt;/div&gt;</b>
<b>+┊   ┊139┊      &lt;div className&#x3D;&quot;GroupDetailsScreen-participants-title&quot;&gt;</b>
<b>+┊   ┊140┊        Participants: {participants.length}</b>
<b>+┊   ┊141┊      &lt;/div&gt;</b>
<b>+┊   ┊142┊      &lt;ul className&#x3D;&quot;GroupDetailsScreen-participants-list&quot;&gt;</b>
<b>+┊   ┊143┊        {participants.map(participant &#x3D;&gt; (</b>
<b>+┊   ┊144┊          &lt;div key&#x3D;{participant.id} className&#x3D;&quot;GroupDetailsScreen-participant-item&quot;&gt;</b>
<b>+┊   ┊145┊            &lt;img</b>
<b>+┊   ┊146┊              src&#x3D;{participant.picture || &#x27;/assets/default-profile-pic.jpg&#x27;}</b>
<b>+┊   ┊147┊              className&#x3D;&quot;GroupDetailsScreen-participant-picture&quot;</b>
<b>+┊   ┊148┊            /&gt;</b>
<b>+┊   ┊149┊            &lt;span className&#x3D;&quot;GroupDetailsScreen-participant-name&quot;&gt;{participant.name}&lt;/span&gt;</b>
<b>+┊   ┊150┊          &lt;/div&gt;</b>
<b>+┊   ┊151┊        ))}</b>
<b>+┊   ┊152┊      &lt;/ul&gt;</b>
<b>+┊   ┊153┊      {chatName &amp;&amp; (</b>
<b>+┊   ┊154┊        &lt;CompleteGroupButton</b>
<b>+┊   ┊155┊          history&#x3D;{history}</b>
<b>+┊   ┊156┊          groupName&#x3D;{chatName}</b>
<b>+┊   ┊157┊          groupPicture&#x3D;{chatPicture}</b>
<b>+┊   ┊158┊          users&#x3D;{users}</b>
<b>+┊   ┊159┊        /&gt;</b>
<b>+┊   ┊160┊      )}</b>
<b>+┊   ┊161┊    &lt;/Style&gt;</b>
<b>+┊   ┊162┊  )</b>
<b>+┊   ┊163┊}</b>
</pre>

[}]: #

That's it! Now we should be able to create group chats and message multiple people at once.


[//]: # (foot-start)

[{]: <helper> (navStep)

⟸ <a href="step3.md">PREVIOUS STEP</a> <b>║</b>

[}]: #
