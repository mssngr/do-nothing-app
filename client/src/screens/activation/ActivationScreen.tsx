import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'

const SEND_ACTIVATION_EMAIL = gql`
  mutation SendActivationEmail($id: ID!) {
    sendActivationEmail(id: $id)
  }
`

export default function ActivationScreen(props: RouteComponentProps) {
  const [user] = React.useContext(UserContext)
  const [
    sendActivationEmail,
    { loading, error, data },
  ] = useMutation(SEND_ACTIVATION_EMAIL, { variables: { id: user.id } })
  const isEmailSent = data?.sendActivationEmail

  async function handleClick(e: React.MouseEvent) {
    sendActivationEmail()
  }

  return (
    <LoadingOrError loading={loading} error={error || isEmailSent === false}>
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

export function ActivationEmailSent() {
  return (
    <div>
      <h1>
        An activation link was sent to your email. Please follow the link to
        activate your account. You have 24 hours before it expires.
      </h1>
      <Link to="/home">Return to Home</Link>
    </div>
  )
}