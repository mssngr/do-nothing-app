import React from 'react'
import * as R from 'ramda'
import { ApolloClient } from '@apollo/client'

const id = localStorage.getItem('id')
  ? parseInt(localStorage.getItem('id') as string, 10)
  : null
const accessToken = localStorage.getItem('accessToken') ?? ''
const refreshToken = localStorage.getItem('refreshToken') ?? ''
export const UserContext = React.createContext<
  [
    {
      id: number | null
      accessToken: string
      refreshToken: string
      isActive: boolean
    },
    (updates: {
      id?: number | null
      accessToken?: string
      refreshToken?: string
      isActive?: boolean
    }) => void,
    (client?: ApolloClient<any>) => void
  ]
>([{ id, accessToken, refreshToken, isActive: false }, () => null, () => null])

export default function User({ children }: { children: any }) {
  const [user, setUser] = React.useState({
    id,
    accessToken,
    refreshToken,
    isActive: false,
  })

  function updateUser(updates: {
    id?: number | null
    accessToken?: string
    refreshToken?: string
    isActive?: boolean
  }) {
    R.forEachObjIndexed(
      (value, key) => localStorage.setItem(key, `${value}`),
      updates
    )
    setUser({ ...user, ...updates })
  }

  function invalidateUser(client?: ApolloClient<any>) {
    client && client.resetStore()
    R.forEachObjIndexed((value, key) => localStorage.removeItem(key), user)
    setUser({ id: null, accessToken: '', refreshToken: '', isActive: false })
  }

  return (
    <UserContext.Provider value={[user, updateUser, invalidateUser]}>
      {children}
    </UserContext.Provider>
  )
}
