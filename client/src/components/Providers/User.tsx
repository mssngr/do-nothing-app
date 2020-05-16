import React from 'react'

const id = localStorage.getItem('id')
  ? parseInt(localStorage.getItem('id') as string, 10)
  : null
const accessToken = localStorage.getItem('accessToken') ?? ''
export const UserContext = React.createContext<
  [
    { id: number | null; accessToken: string },
    React.Dispatch<
      React.SetStateAction<{ id: number | null; accessToken: string }>
    >
  ]
>([{ id, accessToken }, () => null])

export default function User({ children }: { children: any }) {
  const userState = React.useState({ id, accessToken })

  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  )
}
