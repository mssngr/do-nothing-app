import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps, navigate } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'

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

const SignupScreen: React.FC<RouteComponentProps> = () => {
  const updateUser = React.useContext(UserContext)[1]
  const [signup, loadingOrError] = useMutation(SIGN_UP)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    const firstName = (e.currentTarget.children[0] as HTMLInputElement).value
    const lastName = (e.currentTarget.children[1] as HTMLInputElement).value
    const email = (e.currentTarget.children[2] as HTMLInputElement).value
    const password = (e.currentTarget.children[3] as HTMLInputElement).value
    const confirmPassword = (e.currentTarget.children[4] as HTMLInputElement)
      .value
    const phone = (e.currentTarget.children[5] as HTMLInputElement).value

    if (password !== confirmPassword) {
      window.alert('Passwords do not match')
    } else if (password.length < 8) {
      window.alert('Password is not long enough (8 characters minimum)')
    } else {
      const { data } = await signup({
        variables: { firstName, lastName, email, password, phone },
      })
      const newUser = data?.signup
      updateUser({
        ...R.pick(['id', 'accessToken', 'refreshToken'], newUser),
        isAuthenticated: true,
      })
      window.alert(
        'An activation link was sent to your email. Please follow the link to activate your account. You have 24 hours before it expires.'
      )
      navigate('/home')
    }
  }

  return (
    <LoadingOrError {...loadingOrError}>
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
    </LoadingOrError>
  )
}

export default SignupScreen
