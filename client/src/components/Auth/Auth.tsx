import React from 'react'
import { Redirect, RouteComponentProps } from '@reach/router'
import LoadingOrError from 'components/LoadingOrError'
import useAuth from './useAuth'

const publicRoutes = ['^/$', '^/signup$', '^/login$', '^/reset.*']

export default function Auth({
  children,
  location,
}: { children: any } & RouteComponentProps) {
  const [isAuthenticated, isAuthenticating] = useAuth()
  const isPublicPath = publicRoutes.some(route => {
    const publicRouteRegex = new RegExp(route)
    return !!location?.pathname?.match(publicRouteRegex)
  })

  if (isAuthenticated && isPublicPath) {
    return <Redirect to="/home" noThrow />
  }

  if (isAuthenticated || isPublicPath) {
    return children
  }

  if (isAuthenticating) {
    return <LoadingOrError loading={isAuthenticated} />
  }

  return <Redirect to="/" noThrow />
}
