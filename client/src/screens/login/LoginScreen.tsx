import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps, navigate } from '@reach/router'
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
  const updateUser = React.useContext(UserContext)[1]
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

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="email" type="email" />
        <input placeholder="password" type="password" />
        <button type="submit">Log In</button>
        {isIncorrect && <p>Incorrect email or password</p>}
      </form>
    </div>
  )
}
