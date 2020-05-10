import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { useLazyQuery, gql } from '@apollo/client'

const LOGIN = gql`
  query Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      firstName
      fullName
      email
      avatarUrl
      roles
      isActivated
    }
  }
`

export default function LoginScreen(props: RouteComponentProps) {
  const [login, { loading, error, data }] = useLazyQuery(LOGIN)
  const user = data?.logIn

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

  if (user) {
    return <div>{user.fullName}</div>
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="email" type="email" />
        <input placeholder="password" type="password" />
        <button type="submit">Log In</button>
        {user === null && <p>Incorrect email or password</p>}
      </form>
    </div>
  )
}
