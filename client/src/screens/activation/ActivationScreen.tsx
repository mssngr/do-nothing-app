import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import LoadingOrError from 'components/LoadingOrError'

const SEND_ACTIVATION_EMAIL = gql`
  mutation {
    sendActivationEmail
  }
`

const ActivationScreen: React.FC<RouteComponentProps> = () => {
  const [sendActivationEmail, { loading, error, data }] = useMutation(
    SEND_ACTIVATION_EMAIL
  )
  const isEmailSent = data?.sendActivationEmail

  async function handleClick(e: React.MouseEvent): Promise<void> {
    sendActivationEmail()
  }

  return (
    <LoadingOrError
      loading={loading}
      error={
        error ||
        (isEmailSent === false
          ? 'There was an error sending the activation email'
          : undefined)
      }
    >
      {isEmailSent ? (
        <ActivationEmailSent />
      ) : (
        <div>
          <button onClick={handleClick}>Send Activation Email</button>
          <Link to="/home">Return to Home</Link>
        </div>
      )}
    </LoadingOrError>
  )
}

export const ActivationEmailSent: React.FC = () => (
  <div>
    <h1>
      An activation link was sent to your email. Please follow the link to
      activate your account. You have 24 hours before it expires.
    </h1>
    <Link to="/home">Return to Home</Link>
  </div>
)

export default ActivationScreen
