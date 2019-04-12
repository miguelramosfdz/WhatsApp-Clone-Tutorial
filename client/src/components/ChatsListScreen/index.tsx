import * as React from 'react'
import styled from 'styled-components'
import AddChatButton from './AddChatButton'
import ChatsNavbar from './ChatsNavbar'
import ChatsList from './ChatsList'

const Container = styled.div `
  height: 100vh;
`

const ChatsListScreen = ({ history }) => (
  <Container>
    <ChatsNavbar history={history} />
    <ChatsList history={history} />
    <AddChatButton history={history} />
  </Container>
)

export default ChatsListScreen
