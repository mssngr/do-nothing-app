import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { useApolloClient } from '@apollo/client'
import { UserContext } from 'components/Providers/User'

export default function LogoutScreen({}: RouteComponentProps) {
  const userContext = React.useContext(UserContext)
  const user = userContext[0]
  const invalidateUser = userContext[2]
  const client = useApolloClient()

  if (user.isActive || user.accessToken || user.refreshToken) {
    invalidateUser(client)
  }

  return (
    <div>
      <h1>You are logged out.</h1>
    </div>
  )
}
