import gql from 'graphql-tag'
import * as React from 'react'
import { useCallback } from 'react'
import styled from 'styled-components'
import * as fragments from '../../graphql/fragments'
import UsersList from '../UsersList'
import ChatCreationNavbar from './ChatCreationNavbar'
import { useAddChatMutation } from '../../graphql/types'
import { writeChat } from '../../services/cache.service'

const Container = styled.div `
  height: calc(100% - 56px);
  overflow-y: overlay;
`

const StyledUsersList = styled(UsersList) `
  height: calc(100% - 56px);
`

gql`
  mutation AddChat($recipientId: ID!) {
    addChat(recipientId: $recipientId) {
      ...Chat
    }
  }
  ${fragments.chat}
`

export default ({ history }) => {
  const addChat = useAddChatMutation({
    update: (client, { data: { addChat } }) => {
      writeChat(client, addChat)
    }
  })

  const onUserPick = useCallback((user) => {
    addChat({
      optimisticResponse: {
        __typename: 'Mutation',
        addChat: {
          __typename: 'Chat',
          id: Math.random().toString(36).substr(2, 9),
          name: user.name,
          picture: user.picture,
          lastMessage: null,
        },
      },
      variables: {
        recipientId: user.id,
      },
    }).then(({ data: { addChat } }) => {
      history.push(`/chats/${addChat.id}`)
    })
  }, [addChat])

  return (
    <div>
      <ChatCreationNavbar history={history} />
      <UsersList onUserPick={onUserPick} />
    </div>
  )
}
