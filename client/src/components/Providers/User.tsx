import React from 'react'
import * as R from 'ramda'
import { ApolloClient } from '@apollo/client'

const id = localStorage.getItem('id') ?? ''
const accessToken = localStorage.getItem('accessToken') ?? ''
const refreshToken = localStorage.getItem('refreshToken') ?? ''
export const UserContext = React.createContext<
  [
    {
      id: string
      accessToken: string
      refreshToken: string
      isAuthenticated: boolean
    },
    (updates: {
      id?: string
      accessToken?: string
      refreshToken?: string
      isAuthenticated?: boolean
    }) => void,
    (client?: ApolloClient<object>) => void
  ]
>([
  { id, accessToken, refreshToken, isAuthenticated: false },
  () => null,
  () => null,
])

const User: React.FC = ({ children }) => {
  const [user, setUser] = React.useState({
    id,
    accessToken,
    refreshToken,
    isAuthenticated: false,
  })

  function updateUser(updates: {
    id?: string
    accessToken?: string
    refreshToken?: string
    isAuthenticated?: boolean
  }): void {
    R.forEachObjIndexed(
      (value, key) => localStorage.setItem(key, `${value}`),
      R.omit(['isAuthenticated'], updates)
    )
    setUser({ ...user, ...updates })
  }

  function invalidateUser(client?: ApolloClient<object>): void {
    client && client.resetStore()
    R.forEachObjIndexed((value, key) => localStorage.removeItem(key), user)
    setUser({
      id: '',
      accessToken: '',
      refreshToken: '',
      isAuthenticated: false,
    })
  }

  return (
    <UserContext.Provider value={[user, updateUser, invalidateUser]}>
      {children}
    </UserContext.Provider>
  )
}

export default User
