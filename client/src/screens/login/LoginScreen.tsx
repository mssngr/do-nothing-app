import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps, Link, Redirect } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { Field, ErrorMessage, Formik, Form } from 'formik'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'
import {
  emailValidation,
  passwordValidation,
} from 'screens/account/AccountScreen'

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      refreshToken
      accessToken
      passwordAttempts
    }
  }
`

const validation = emailValidation.concat(passwordValidation)

const LoginScreen: React.FC<RouteComponentProps> = ({ navigate }) => {
  const [user, updateUser] = React.useContext(UserContext)
  const [login, loadingOrError] = useMutation(LOGIN)
  const [isIncorrect, setIsIncorrect] = React.useState(false)
  const [isLocked, setIsLocked] = React.useState(false)

  if (user.isAuthenticated) {
    return <Redirect to="/home" noThrow />
  }

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validation}
          onSubmit={async ({ email, password }) => {
            const { data } = await login({ variables: { email, password } })
            const loggedInUser = data?.login

            if (loggedInUser?.id) {
              updateUser({
                ...R.pick(['id', 'accessToken', 'refreshToken'], loggedInUser),
                isAuthenticated: true,
              })
              navigate && navigate('/home')
            } else {
              setIsIncorrect(true)
              loggedInUser?.passwordAttempts > 4 && setIsLocked(true)
            }
          }}
        >
          {() => (
            <Form>
              <Field placeholder="email" type="email" name="email" />
              <ErrorMessage name="email" />
              <Field placeholder="password" type="password" name="password" />
              <ErrorMessage name="password" />
              <button type="submit">Log In</button>
              {isIncorrect && <div>Incorrect email or password</div>}
              {isLocked && (
                <div>
                  Due to too many password attempts, your account has been
                  locked. Please reset your password to regain access to your
                  account.
                </div>
              )}
            </Form>
          )}
        </Formik>
        <Link to="/signup">Sign Up</Link>
        <br />
        <Link to="/reset">Reset Password</Link>
      </div>
    </LoadingOrError>
  )
}

export default LoginScreen
