import React from 'react'
import { useApolloClient, gql } from '@apollo/client'
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

export default function useAuth(): [boolean, boolean] {
  const client = useApolloClient()
  const [user, updateUser] = React.useContext(UserContext)
  const [state, setState] = React.useState<{
    isVerified?: boolean
    isRefreshed?: boolean
  }>({})
  const hasYetToVerifyOrRefresh =
    state.isVerified === undefined ||
    (state.isRefreshed === undefined && !!user.refreshToken)

  const isAuthenticating = !user.isAuthenticated && hasYetToVerifyOrRefresh

  async function verify(): Promise<void> {
    try {
      if (user.accessToken) {
        const { data } = await client.query({
          query: VERIFY,
          variables: { accessToken: user.accessToken },
        })
        const id = data?.verify

        if (id) {
          updateUser({ id, isAuthenticated: true })
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

  async function refresh(): Promise<void> {
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

  if (!user.isAuthenticated && state.isVerified === undefined) {
    verify()
  } else if (!user.isAuthenticated && state.isRefreshed === undefined) {
    refresh()
  }

  return [user.isAuthenticated, isAuthenticating]
}
