import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps, navigate, Link, Redirect } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
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

export default function LoginScreen(props: RouteComponentProps) {
  const [user, updateUser] = React.useContext(UserContext)
  const [login, loadingOrError] = useMutation(LOGIN)
  const [isIncorrect, setIsIncorrect] = React.useState(false)
  const [isLocked, setIsLocked] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = (e.target as any).children[0].value
    const password = (e.target as any).children[1].value
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
  }

  if (user.isAuthenticated) {
    return <Redirect to="/home" noThrow />
  }

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        <form onSubmit={handleSubmit}>
          <input placeholder="email" type="email" />
          <input placeholder="password" type="password" />
          <button type="submit">Log In</button>
          {isIncorrect && <p>Incorrect email or password</p>}
          {isLocked && <p>Due to too many password attempts, your account has been locked. Please reset your password to regain access to your account.</p>}
        </form>
        <Link to="/signup">Sign Up</Link>
        <br />
        <Link to="/reset">Reset Password</Link>
      </div>
    </LoadingOrError>
  )
}
