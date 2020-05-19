import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import LoadingOrError from 'components/LoadingOrError'

const RESET_PASSWORD = gql`
  mutation ResetPassword($resetToken: String!) {
    resetPassword(resetToken: $resetToken)
  }
`

export default function ResetTokenScreen({
  resetToken,
}: { resetToken?: string } & RouteComponentProps) {
  const [reset, { data, ...loadingOrError }] = useMutation(RESET_PASSWORD, {
    variables: { resetToken },
  })
  const isReset = data?.resetPassword

  React.useEffect(() => {
    reset()
  })

  return (
    <LoadingOrError {...loadingOrError}>
      {isReset ? (
        <div>
          <h1>
            Your password has been reset. Please log in using your new password.
          </h1>
          <Link to="/login">Log In</Link>
        </div>
      ) : (
        <div>
          <h1>
            Your password failed to reset. Please try resetting your password
            again.
          </h1>
          <Link to="/reset">Reset Password</Link>
        </div>
      )}
    </LoadingOrError>
  )
}
