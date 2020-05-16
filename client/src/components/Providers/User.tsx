import React from 'react'
import * as R from 'ramda'

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
    }) => void
  ]
>([{ id, accessToken, refreshToken, isActive: false }, () => null])

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

  return (
    <UserContext.Provider value={[user, updateUser]}>
      {children}
    </UserContext.Provider>
  )
}
