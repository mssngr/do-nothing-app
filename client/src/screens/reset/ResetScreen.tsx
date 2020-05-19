import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import LoadingOrError from 'components/LoadingOrError'

const SEND_RESET_EMAIL = gql`
  mutation SendResetEmail($email: String!) {
    sendResetEmail(email: $email)
  }
`

export default function ResetScreen(props: RouteComponentProps) {
  const [sendResetEmail, { loading, error, data }] = useMutation(
    SEND_RESET_EMAIL
  )
  const isEmailSent = data?.sendResetEmail

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = (e.target as any).children[0].value
    sendResetEmail({ variables: { email } })
  }

  return (
    <LoadingOrError loading={loading} error={error}>
      {isEmailSent ? (
        <div>
          <h1>
            A reset link was sent to your email. Please follow the link to reset
            your password. You have 1 hour before it expires.
          </h1>
          <Link to="/login">Log In</Link>
          <br />
          <Link to="/signup">Sign Up</Link>
        </div>
      ) : (
        <div>
          <form onSubmit={handleSubmit}>
            <input placeholder="email" type="email" />
            <button type="submit">Reset Password</button>
            {isEmailSent === false && <p>No record of that email exists</p>}
          </form>
          <Link to="/login">Log In</Link>
          <br />
          <Link to="/signup">Sign Up</Link>
        </div>
      )}
    </LoadingOrError>
  )
}
