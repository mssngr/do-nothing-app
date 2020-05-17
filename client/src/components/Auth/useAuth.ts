import React from 'react'
import { useApolloClient, gql } from '@apollo/client'
import { WindowLocation } from '@reach/router'
import { UserContext } from 'components/Providers/User'

const VERIFY = gql`
  query Verify($accessToken: String!) {
    verify(accessToken: $accessToken)
  }
`

const REFRESH = gql`
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken)
  }
`

const publicRoutes = ['/', '/signup', '/login', '/logout']

export default function useAuth(location?: WindowLocation) {
  const client = useApolloClient()
  const [user, updateUser] = React.useContext(UserContext)
  const [state, setState] = React.useState<{
    isVerified?: boolean
    isRefreshed?: boolean
  }>({})
  const hasYetToVerifyOrRefresh =
    state.isVerified === undefined ||
    (state.isRefreshed === undefined && !!user.refreshToken)
  const isLoggedOut = !user.isActive && !user.accessToken && !user.refreshToken
  const isPublicPath = publicRoutes.some(route => route === location?.pathname)

  const isAuthenticated = user.isActive || (isLoggedOut && isPublicPath)
  const isAuthenticating = !isAuthenticated && hasYetToVerifyOrRefresh

  async function verify() {
    try {
      if (user.accessToken) {
        const { data } = await client.query({
          query: VERIFY,
          variables: { accessToken: user.accessToken },
        })
        const id = data?.verify

        if (id) {
          updateUser({ id, isActive: true })
          // setState({ isRefreshed: true, isVerified: true })
        } else {
          setState({ ...state, isVerified: false })
        }
      } else {
        setState({ ...state, isVerified: false })
      }
    } catch (error) {
      console.error(error)
      setState({ ...state, isVerified: false })
    }
  }

  async function refresh() {
    try {
      if (user.refreshToken) {
        const { data } = await client.mutate({
          mutation: REFRESH,
          variables: { refreshToken: user.refreshToken },
        })
        const accessToken = data?.refresh

        if (accessToken) {
          updateUser({ accessToken })
          setState({ isRefreshed: true })
        } else {
          setState({ ...state, isRefreshed: false })
        }
      } else {
        setState({ ...state, isRefreshed: false })
      }
    } catch (error) {
      console.error(error)
      setState({ ...state, isRefreshed: false })
    }
  }

  if (!isAuthenticated && state.isVerified === undefined) {
    verify()
  } else if (!isAuthenticated && state.isRefreshed === undefined) {
    refresh()
  }

  return [isAuthenticated, isAuthenticating]
}
