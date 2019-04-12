import * as React from 'react'
import { useMemo } from 'react'
import { Route } from 'react-router-dom'
import styled from 'styled-components'
import AnimatedSwitch from '../AnimatedSwitch'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

const Container = styled.div `
  background: radial-gradient(rgb(34, 65, 67), rgb(17, 48, 50)),
    url(/assets/chat-background.jpg) no-repeat;
  background-size: cover;
  background-blend-mode: multiply;
  color: white;
`

const Intro = styled.div `
  height: 265px;
`

const Icon = styled.img `
  width: 125px;
  height: auto;
  margin-left: auto;
  margin-right: auto;
  padding-top: 70px;
  display: block;
`

const Title = styled.h2 `
  width: 100%;
  text-align: center;
  color: white;
`

const Alternative = styled.div `
  position: fixed;
  bottom: 10px;
  left: 10px;

  a {
    color: var(--secondary-bg);
  }
`

export default ({ history, location }) => {
  const alternative = useMemo(() => {
    if (location.pathname === '/sign-in') {
      const handleSignUp = () => {
        history.replace('/sign-up')
      }

      return (
        <Alternative>
          Don't have an account yet? <a onClick={handleSignUp}>Sign up!</a>
        </Alternative>
      )
    }
    else {
      const handleSignIn = () => {
        history.replace('/sign-in')
      }

      return (
        <Alternative>
          Already have an accout? <a onClick={handleSignIn}>Sign in!</a>
        </Alternative>
      )
    }
  }, [location.pathname])

  return (
    <Container className="AuthScreen Screen">
      <Intro className="AuthScreen-intro">
        <Icon src="assets/whatsapp-icon.png" className="AuthScreen-icon" />
        <Title className="AuthScreen-title">WhatsApp</Title>
      </Intro>
      <AnimatedSwitch>
        <Route exact path="/sign-in" component={SignInForm} />
        <Route exact path="/sign-up" component={SignUpForm} />
      </AnimatedSwitch>
      {alternative}
    </Container>
  )
}
