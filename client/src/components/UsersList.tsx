import MaterialList from '@material-ui/core/List'
import MaterialItem from '@material-ui/core/ListItem'
import CheckCircle from '@material-ui/icons/CheckCircle'
import gql from 'graphql-tag'
import * as React from 'react'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import * as fragments from '../graphql/fragments'
import { useUsersListQuery, User } from '../graphql/types'

const ActualList = styled(MaterialList) `
  padding: 0;
`

const UserItem = styled(MaterialItem) `
  position: relative;
  padding: 7.5px 15px;
  display: flex;
  cursor: pinter;
`

const ProfilePicture = styled.img `
  height: 50px;
  width: 50px;
  object-fit: cover;
  border-radius: 50%;
`

const Name = styled.div `
  padding-left: 15px;
  font-weight: bold;
`

export const UsersListQuery = gql`
  query UsersList {
    users {
      ...User
    }
  }
  ${fragments.user}
`

const UsersList = ({ onUserPick = (user: User) => {} }) => {
  const { data: { users }, loading: loadingUsers } = useUsersListQuery()

  return (
    <ActualList>
      {!loadingUsers && users.map(user => (
        <UserItem
          key={user.id}
          data-testid="user"
          onClick={onUserPick.bind(null, user)}
          button
        >
          <ProfilePicture data-testid="picture" src={user.picture} />
          <Name data-testid="name">{user.name}</Name>
        </UserItem>
      ))}
    </ActualList>
  )
}

export default UsersList
