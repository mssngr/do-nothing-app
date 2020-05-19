import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'
import { ActivationEmailSent } from '../ActivationScreen'

const SEND_ACTIVATION_EMAIL = gql`
  mutation {
    sendActivationEmail
  }
`

const ACTIVATE = gql`
  mutation Activate($activationToken: String!) {
    activate(activationToken: $activationToken)
  }
`

export default function ActivationTokenScreen({
  activationToken,
}: { activationToken?: string } & RouteComponentProps) {
  const [user] = React.useContext(UserContext)
  const [activate, activateResponse] = useMutation(ACTIVATE, {
    variables: { activationToken },
  })
  const [sendActivationEmail, sendActivationEmailResponse] = useMutation(
    SEND_ACTIVATION_EMAIL
  )
  const isEmailSent = sendActivationEmailResponse.data?.sendActivationEmail
  const isActivated = activateResponse.data?.activate

  async function handleClick(e: React.MouseEvent) {
    sendActivationEmail()
  }

  React.useEffect(() => {
    activate()
  }, [])

  if (isActivated) {
    return (
      <div>
        <h1>Your account has been activated.</h1>
        {user.isAuthenticated ? (
          <Link to="/home">Return Home</Link>
        ) : (
          <Link to="/login">Log In</Link>
        )}
      </div>
    )
  }

  if (isEmailSent) return <ActivationEmailSent />

  return (
    <LoadingOrError
      loading={sendActivationEmailResponse.loading || activateResponse.loading}
      error={sendActivationEmailResponse.error || activateResponse.error}
    >
      <div>
        <h1>
          Your account failed to activate. Please try activating your account
          again.
        </h1>
        {user.isAuthenticated ? (
          <button onClick={handleClick}>Resend Activation Email</button>
        ) : (
          <Link to="/login">Log In</Link>
        )}
      </div>
    </LoadingOrError>
  )
}
