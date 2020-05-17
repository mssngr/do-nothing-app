import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { useApolloClient } from '@apollo/client'
import { UserContext } from 'components/Providers/User'

export default function LogoutScreen(props: RouteComponentProps) {
  const invalidateUser = React.useContext(UserContext)[2]
  const client = useApolloClient()
  invalidateUser(client)

  return (
    <div>
      <h1>You are logged out.</h1>
    </div>
  )
}
