import React from 'react'
import { Redirect, RouteComponentProps } from '@reach/router'
import LoadingOrError from 'components/LoadingOrError'
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
    return <LoadingOrError loading={isAuthenticated} />
  }

  return <Redirect to="/" noThrow />
}
