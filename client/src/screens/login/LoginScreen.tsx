import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps, navigate, Link, Redirect } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { useFormik } from 'formik'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'

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

const LoginScreen: React.FC<RouteComponentProps> = () => {
  const [user, updateUser] = React.useContext(UserContext)
  const [login, loadingOrError] = useMutation(LOGIN)
  const [isIncorrect, setIsIncorrect] = React.useState(false)
  const [isLocked, setIsLocked] = React.useState(false)
  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    async onSubmit({ email, password }) {
      const { data } = await login({ variables: { email, password } })
      const loggedInUser = data?.login

      if (loggedInUser?.id) {
        updateUser({
          ...R.pick(['id', 'accessToken', 'refreshToken'], loggedInUser),
          isAuthenticated: true,
        })
        navigate('/home')
      } else {
        setIsIncorrect(true)
        loggedInUser?.passwordAttempts > 4 && setIsLocked(true)
      }
    },
  })

  if (user.isAuthenticated) {
    return <Redirect to="/home" noThrow />
  }

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            id="email"
            placeholder="email"
            type="email"
            onChange={handleChange}
            value={values.email}
          />
          <input
            id="password"
            placeholder="password"
            type="password"
            onChange={handleChange}
            value={values.password}
          />
          <button type="submit">Log In</button>
          {isIncorrect && <p>Incorrect email or password</p>}
          {isLocked && (
            <p>
              Due to too many password attempts, your account has been locked.
              Please reset your password to regain access to your account.
            </p>
          )}
        </form>
        <Link to="/signup">Sign Up</Link>
        <br />
        <Link to="/reset">Reset Password</Link>
      </div>
    </LoadingOrError>
  )
}

export default LoginScreen
