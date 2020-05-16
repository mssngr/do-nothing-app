import React from 'react'
import { RouteComponentProps, Redirect } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { UserContext } from 'components/Providers/User'

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
  const [user, setUser] = React.useContext(UserContext)
  const [login, { loading, error, data }] = useMutation(LOGIN)
  const loggedInUser = data?.login

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = (e.target as any).children[0].value
    const password = (e.target as any).children[1].value
    login({ variables: { email, password } })
  }

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    console.error(error)
    return (
      <div>
        <p>Error...</p>
      </div>
    )
  }

  if (loggedInUser) {
    localStorage.setItem('refreshToken', loggedInUser.refreshToken)
    setUser({ id: loggedInUser.id, accessToken: loggedInUser.accessToken })
    return <Redirect to="/home" noThrow />
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="email" type="email" />
        <input placeholder="password" type="password" />
        <button type="submit">Log In</button>
        {loggedInUser === null && <p>Incorrect email or password</p>}
      </form>
    </div>
  )
}
