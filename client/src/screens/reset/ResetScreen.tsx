import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import LoadingOrError from 'components/LoadingOrError'

const RESET = gql`
  mutation SendResetLink($email: String!) {
    sendRestLink(email: $email)
  }
`

export default function ResetScreen(props: RouteComponentProps) {
  const [sendResetLink, { loading, error, data }] = useMutation(RESET)
  const isEmailSent = data?.sendResetLink

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = (e.target as any).children[0].value
    sendResetLink({ variables: { email } })
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
