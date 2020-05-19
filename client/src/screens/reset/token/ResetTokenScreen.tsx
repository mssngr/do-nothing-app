import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { Formik, Field, ErrorMessage, Form } from 'formik'
import LoadingOrError from 'components/LoadingOrError'
import { passwordValidation } from 'screens/account/AccountScreen'

const RESET_PASSWORD = gql`
  mutation ResetPassword($resetToken: String!, $password: String!) {
    resetPassword(resetToken: $resetToken, password: $password)
  }
`

const ResetTokenScreen: React.FC<
  { resetToken?: string } & RouteComponentProps
> = ({ resetToken }) => {
  const [resetPassword, { data, ...loadingOrError }] = useMutation(
    RESET_PASSWORD
  )
  const isReset = data?.resetPassword

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
      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={passwordValidation}
        onSubmit={({ password, confirmPassword }) => {
          if (password !== confirmPassword) {
            window.alert('New passwords do not match.')
          } else {
            resetPassword({ variables: { password, resetToken } })
          }
        }}
      >
        {() => (
          <Form>
            <Field placeholder="password" type="password" name="password" />
            <ErrorMessage name="password" />
            <Field
              placeholder="confirm password"
              type="password"
              name="confirmPassword"
            />
            <button type="submit">Reset Password</button>
          </Form>
        )}
      </Formik>
    </LoadingOrError>
  )
}

export default ResetTokenScreen
