import React from 'react'
import { Redirect, RouteComponentProps } from '@reach/router'
import useAuth from './useAuth'

export default function Auth({
  children,
  location,
}: { children: any } & RouteComponentProps) {
  const [isAuthenticated, isAuthenticating] = useAuth(location)

  if (isAuthenticated) {
    return children
  }

  if (isAuthenticating) {
    return <Loading />
  }

  return <Redirect to="/" noThrow />
}

function Loading() {
  return (
    <div>
      <p>Loading...</p>
    </div>
  )
}
