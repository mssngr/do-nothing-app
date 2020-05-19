import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useQuery, gql } from '@apollo/client'
import LoadingOrError from 'components/LoadingOrError'

const USER = gql`
  query User {
    user {
      firstName
      isActivated
    }
  }
`

const HomeScreen: React.FC<RouteComponentProps> = () => {
  const { data, ...loadingOrError } = useQuery(USER)
  const user = data?.user

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        {!user?.isActivated && (
          <p>
            Your account has not yet been activated. Your functionality will be
            limited until you activate your account.
            <br />
            <Link to="/activation">Click here to activate your account.</Link>
          </p>
        )}
        <h1>Hi {user?.firstName}! Welcome to the home page.</h1>
        <Link to="/account">Manage Account</Link>
        <br />
        <Link to="/logout">Logout</Link>
      </div>
    </LoadingOrError>
  )
}

export default HomeScreen
