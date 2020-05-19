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
    }
  }
`

export default function LoginScreen(props: RouteComponentProps) {
  const [user, updateUser] = React.useContext(UserContext)
  const [login, { loading, error }] = useMutation(LOGIN)
  const [isIncorrect, setIsIncorrect] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = (e.target as any).children[0].value
    const password = (e.target as any).children[1].value
    const { data } = await login({ variables: { email, password } })
    const loggedInUser = data?.login

    if (loggedInUser) {
      updateUser({
        ...R.pick(['id', 'accessToken', 'refreshToken'], loggedInUser),
        isActive: true,
      })
      navigate('/home')
    } else {
      setIsIncorrect(true)
    }
  }

  if (user.isActive) {
    return <Redirect to="/home" noThrow />
  }

  return (
    <LoadingOrError loading={loading} error={error}>
      <div>
        <form onSubmit={handleSubmit}>
          <input placeholder="email" type="email" />
          <input placeholder="password" type="password" />
          <button type="submit">Log In</button>
          {isIncorrect && <p>Incorrect email or password</p>}
        </form>
        <Link to="/signup">Sign Up</Link>
        <br />
        <Link to="/reset">Reset Password</Link>
      </div>
    </LoadingOrError>
  )
}
