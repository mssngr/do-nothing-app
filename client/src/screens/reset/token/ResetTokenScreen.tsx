import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import LoadingOrError from 'components/LoadingOrError'

const RESET_PASSWORD = gql`
  mutation ResetPassword($resetToken: String!, $newPassword: String!) {
    resetPassword(resetToken: $resetToken, newPassword: $newPassword)
  }
`

const ResetTokenScreen: React.FC<
  { resetToken?: string } & RouteComponentProps
> = ({ resetToken }) => {
  const [resetPassword, { data, ...loadingOrError }] = useMutation(
    RESET_PASSWORD
  )
  const isReset = data?.resetPassword

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    const newPassword = (e.currentTarget.children[0] as HTMLInputElement).value
    const confirmPassword = (e.currentTarget.children[1] as HTMLInputElement)
      .value

    if (newPassword !== confirmPassword) {
      window.alert('Passwords do not match')
    } else if (newPassword.length < 8) {
      window.alert('Password is not long enough (8 characters minimum)')
    } else {
      await resetPassword({
        variables: { resetToken, newPassword },
      })
    }
  }

  if (isReset) {
    return (
      <div>
        <h1>
          Your password has been reset. Please log in using your new password.
        </h1>
        <Link to="/login">Log In</Link>
      </div>
    )
  }

  if (isReset === false) {
    return (
      <div>
        <h1>
          Your password failed to reset. Please try resetting your password
          again.
        </h1>
        <Link to="/reset">Reset Password</Link>
      </div>
    )
  }

  return (
    <LoadingOrError {...loadingOrError}>
      <form onSubmit={handleSubmit}>
        <input placeholder="new password" type="password" />
        <input placeholder="confirm new password" type="password" />
        <button type="submit">Reset Password</button>
      </form>
    </LoadingOrError>
  )
}

export default ResetTokenScreen
