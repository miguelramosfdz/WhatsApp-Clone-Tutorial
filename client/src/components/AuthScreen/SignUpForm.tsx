import * as React from 'react'
import { useCallback, useState } from 'react'
import { signUp } from '../../services/auth.service'
import {
  SignForm,
  ActualForm,
  Legend,
  Section,
  TextField,
  Button,
  ErrorMessage,
} from './form-components'

export default ({ history }) => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')

  const updateName = useCallback(({ target }) => {
    setError('')
    setName(target.value)
  }, [true])

  const updateUsername = useCallback(({ target }) => {
    setError('')
    setUsername(target.value)
  }, [true])

  const updatePassword = useCallback(({ target }) => {
    setError('')
    setPassword(target.value)
  }, [true])

  const updatePasswordConfirm = useCallback(({ target }) => {
    setError('')
    setPasswordConfirm(target.value)
  }, [true])

  const maySignUp = useCallback(() => {
    return !!(name && username && password && password === passwordConfirm)
  }, [name, username, password, passwordConfirm])

  const handleSignUp = useCallback(() => {
    signUp({ username, password, passwordConfirm, name })
      .then(() => {
        history.replace('/sign-in')
      })
      .catch(error => {
        setError(error.message || error)
      })
  }, [name, username, password, passwordConfirm])

  return (
    <SignForm>
      <ActualForm>
        <Legend>Sign up</Legend>
        <Section
          style={{
            float: 'left',
            width: 'calc(50% - 10px)',
            paddingRight: '10px',
          }}
        >
          <TextField
            data-testid="name-input"
            label="Name"
            value={name}
            onChange={updateName}
            autoComplete="off"
            margin="normal"
          />
          <TextField
            data-testid="username-input"
            label="Username"
            value={username}
            onChange={updateUsername}
            autoComplete="off"
            margin="normal"
          />
        </Section>
        <Section
          style={{
            float: 'right',
            width: 'calc(50% - 10px)',
            paddingLeft: '10px',
          }}
        >
          <TextField
            data-testid="password-input"
            label="Password"
            type="password"
            value={password}
            onChange={updatePassword}
            autoComplete="off"
            margin="normal"
          />
          <TextField
            data-testid="password-confirm-input"
            label="Confirm password"
            type="password"
            value={passwordConfirm}
            onChange={updatePasswordConfirm}
            autoComplete="off"
            margin="normal"
          />
        </Section>
        <Button
          data-testid="sign-up-button"
          type="button"
          color="secondary"
          variant="contained"
          disabled={!maySignUp()}
          onClick={handleSignUp}
        >
          Sign up
        </Button>
        <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
      </ActualForm>
    </SignForm>
  )
}