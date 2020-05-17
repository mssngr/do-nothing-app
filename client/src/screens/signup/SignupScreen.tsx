import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps, navigate } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { UserContext } from 'components/Providers/User'

const SIGN_UP = gql`
  mutation Signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $phone: String!
  ) {
    signup(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      phone: $phone
    ) {
      id
      accessToken
      refreshToken
    }
  }
`

export default function SignupScreen({}: RouteComponentProps) {
  const updateUser = React.useContext(UserContext)[1]
  const [signup, { loading, error }] = useMutation(SIGN_UP)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const firstName = (e.target as any).children[0].value
    const lastName = (e.target as any).children[1].value
    const email = (e.target as any).children[2].value
    const password = (e.target as any).children[3].value
    const confirmPassword = (e.target as any).children[4].value
    const phone = (e.target as any).children[5].value

    if (password !== confirmPassword) {
      window.alert('Passwords do not match')
    } else {
      const { data } = await signup({
        variables: { firstName, lastName, email, password, phone },
      })
      const newUser = data?.signup
      updateUser({
        ...R.pick(['id', 'accessToken', 'refreshToken'], newUser),
        isActive: true,
      })
      navigate('/home')
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
