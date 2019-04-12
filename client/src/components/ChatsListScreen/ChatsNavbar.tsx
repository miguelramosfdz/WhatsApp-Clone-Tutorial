import { Button, Toolbar } from '@material-ui/core'
import SignOutIcon from '@material-ui/icons/PowerSettingsNew'
import * as React from 'react'
import { useCallback } from 'react'
import styled from 'styled-components'
import { signOut } from '../../services/auth.service'

const Container = styled(Toolbar) `
  display: flex;
  background-color: var(--primary-bg);
  color: var(--primary-text);
  font-size: 20px;
  line-height: 40px;
`

const Title = styled.div `
  flex: 1;
`

const LogoutButton = styled(Button) `
  color: var(--primary-text) !important;
`

const ChatsNavbar = ({ history }) => {
  const handleSignOut = useCallback(() => {
    signOut().then(() => {
      history.replace('/sign-in')
    })
  }, [true])

  return (
    <Container>
      <Title>Whatsapp Clone</Title>
      <LogoutButton data-testid="sign-out-button" onClick={handleSignOut}>
        <SignOutIcon />
      </LogoutButton>
    </Container>
  )
}

export default ChatsNavbar