import React from 'react'
import { Redirect, RouteComponentProps } from '@reach/router'
import LoadingOrError from 'components/LoadingOrError'
import useAuth from './useAuth'

const publicRoutes = [
  '^/$',
  '^/signup$',
  '^/login$',
  '^/logout$',
  '^/reset.*',
  '^/activation/.*',
]

const Auth: React.FC<RouteComponentProps> = ({ children, location }) => {
  const [isAuthenticated, isAuthenticating] = useAuth()
  const isPublicPath = publicRoutes.some(route => {
    const publicRouteRegex = new RegExp(route)
    return !!location?.pathname?.match(publicRouteRegex)
  })
  const isLogout = location?.pathname?.includes('/logout')

  if (isAuthenticated && !isLogout && isPublicPath) {
    return <Redirect to="/home" noThrow />
  }

  if (isAuthenticated || isPublicPath) {
    return <>{children}</>
  }

  if (isAuthenticating) {
    return <LoadingOrError loading={isAuthenticated} />
  }

  return <Redirect to="/" noThrow />
}

export default Auth
