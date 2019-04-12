import { parse as parseCookie } from 'cookie'
import * as React from 'react'
import { useContext } from 'react'
import { Redirect } from 'react-router-dom'
import client from '../client'
import { useMeQuery, User } from '../graphql/types'
import { useCacheService } from './cache.service'

const MyContext = React.createContext<User>(null)

export const useMe = () => {
  return useContext(MyContext)
}

export const withAuth = (Component: React.ComponentType) => {
  return (props) => {
    if (!isSignedIn()) {
      if (props.history.location.pathname === '/sign-in') {
        return null
      }

      return (
        <Redirect to="/sign-in" />
      )
    }

    const { data, error, loading } = useMeQuery()

    useCacheService()

    if (loading) return null

    if (error || !data.me) {
      signOut()

      return <Redirect to="/sign-in" />
    }

    return (
      <MyContext.Provider value={data.me}>
        <Component {...props} />
      </MyContext.Provider>
    )
  }
}

export const signIn = ({ username, password }) => {
  return fetch(`${process.env.REACT_APP_SERVER_URL}/sign-in`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.status >= 400) {
      return res.text().then(e => Promise.reject(e))
    }
  })
}

export const signUp = ({ name, username, password, passwordConfirm }) => {
  return fetch(`${process.env.REACT_APP_SERVER_URL}/sign-up`, {
    method: 'POST',
    body: JSON.stringify({ name, username, password, passwordConfirm }),
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.status >= 400) {
      return res.text().then(e => Promise.reject(e))
    }
  })
}

export const signOut = () => {
  document.cookie = `authToken=;expires=${new Date(0)}`

  return client.clearStore()
}

export const isSignedIn = () => {
  return /authToken=.+(;|$)/.test(document.cookie)
}