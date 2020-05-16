import React from 'react'
import { RouteComponentProps, Redirect } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { UserContext } from 'components/Providers/User'

const SIGN_UP = gql`
  mutation Signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $phone: String!
    $avatarUrl: String!
  ) {
    signup(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      phone: $phone
      avatarUrl: $avatarUrl
    ) {
      id
      name
      avatarUrl
    }
  }
`

export default function SignupScreen(props: RouteComponentProps) {
  const [user, setUser] = React.useContext(UserContext)
  const [signup, { loading, error, data }] = useMutation(SIGN_UP)
  const newUser = data?.signup

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const firstName = (e.target as any).children[0].value
    const lastName = (e.target as any).children[1].value
    const email = (e.target as any).children[0].value
    const password = (e.target as any).children[1].value
    const confirmPassword = (e.target as any).children[0].value
    const phone = (e.target as any).children[1].value

    if (password !== confirmPassword) {
      window.alert('Passwords do not match')
    } else {
      signup({ variables: { firstName, lastName, email, password, phone } })
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

  if (newUser) {
    localStorage.setItem('refreshToken', newUser.refreshToken)
    setUser({ id: newUser.id, accessToken: newUser.accessToken })
    return <Redirect to="/home" noThrow />
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="first name" type="text" />
        <input placeholder="last name" type="text" />
        <input placeholder="email" type="email" />
        <input placeholder="password" type="password" />
        <input placeholder="confirm password" type="password" />
        <input placeholder="phone" type="tel" />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}
