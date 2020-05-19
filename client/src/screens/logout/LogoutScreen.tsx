import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useApolloClient } from '@apollo/client'
import { UserContext } from 'components/Providers/User'

export default function LogoutScreen(props: RouteComponentProps) {
  const userContext = React.useContext(UserContext)
  const user = userContext[0]
  const invalidateUser = userContext[2]
  const client = useApolloClient()

  React.useEffect(() => {
    if (user.isAuthenticated || user.accessToken || user.refreshToken) {
      invalidateUser(client)
    }
  })

  return (
    <div>
      <h1>You are logged out.</h1>
      <Link to="/login">Log In</Link>
    </div>
  )
}
