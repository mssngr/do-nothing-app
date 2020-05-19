import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { useFormik } from 'formik'
import LoadingOrError from 'components/LoadingOrError'

const SEND_RESET_EMAIL = gql`
  mutation SendResetEmail($email: String!) {
    sendResetEmail(email: $email)
  }
`

const ResetScreen: React.FC<RouteComponentProps> = () => {
  const [sendResetEmail, { data, ...loadingOrError }] = useMutation(
    SEND_RESET_EMAIL
  )
  const isEmailSent = data?.sendResetEmail
  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit({ email }) {
      sendResetEmail({ variables: { email } })
    },
  })

  return (
    <LoadingOrError {...loadingOrError}>
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
            <input
              id="email"
              placeholder="email"
              type="email"
              onChange={handleChange}
              value={values.email}
            />
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

export default ResetScreen
