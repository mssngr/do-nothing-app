import React from 'react'
import { RouteComponentProps, Redirect } from '@reach/router'
import { UserContext } from 'components/Providers/User'

export default function LoginScreen(props: RouteComponentProps) {
  const [user] = React.useContext(UserContext)

  if (user.isActive) {
    return <Redirect to="/home" noThrow />
  }

  return (
    <div>
      <h1>This is the landing page.</h1>>
    </div>
  )
}
