import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import LoadingOrError from 'components/LoadingOrError'

const RESET = gql`
  mutation ResetPassword($activationToken: String!) {
    resetPassword(activationToken: $activationToken)
  }
`

export default function ReactivateScreen({
  activationToken,
}: { activationToken?: string } & RouteComponentProps) {
  const [reset, { loading, error, data }] = useMutation(RESET, {
    variables: { activationToken },
  })
  const isReset = data?.resetPassword

  React.useEffect(() => {
    reset()
  })

  return (
    <LoadingOrError loading={loading} error={error}>
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
