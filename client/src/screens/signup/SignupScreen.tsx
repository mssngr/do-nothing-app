import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps, navigate } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'
import { useFormik } from 'formik'

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
  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
    },
    async onSubmit({
      firstName,
      lastName,
      phone,
      email,
      confirmEmail,
      password,
      confirmPassword,
    }) {
      if (password !== confirmPassword) {
        window.alert('Passwords do not match')
      } else if (email !== confirmEmail) {
        window.alert('Emails do not match')
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
    },
  })

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            id="firstName"
            placeholder="first name"
            type="text"
            onChange={handleChange}
            value={values.firstName}
          />
          <input
            id="lastName"
            placeholder="last name"
            type="text"
            onChange={handleChange}
            value={values.lastName}
          />
          <input
            id="phone"
            placeholder="phone"
            type="tel"
            onChange={handleChange}
            value={values.phone}
          />
          <input
            id="email"
            placeholder="email"
            type="email"
            onChange={handleChange}
            value={values.email}
          />
          <input
            id="confirmEmail"
            placeholder="confirm email"
            type="email"
            onChange={handleChange}
            value={values.confirmEmail}
          />
          <input
            id="password"
            placeholder="password"
            type="password"
            onChange={handleChange}
            value={values.password}
          />
          <input
            id="confirmPassword"
            placeholder="confirm password"
            type="password"
            onChange={handleChange}
            value={values.confirmPassword}
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </LoadingOrError>
  )
}

export default SignupScreen
