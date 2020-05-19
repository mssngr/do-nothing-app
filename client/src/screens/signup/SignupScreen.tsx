import React from 'react'
import * as R from 'ramda'
import { RouteComponentProps } from '@reach/router'
import { useMutation, gql } from '@apollo/client'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'
import {
  infoValidation,
  emailValidation,
  passwordValidation,
} from 'screens/account/AccountScreen'

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

const validation = infoValidation
  .concat(emailValidation)
  .concat(passwordValidation)

const SignupScreen: React.FC<RouteComponentProps> = ({ navigate }) => {
  const updateUser = React.useContext(UserContext)[1]
  const [signup, loadingOrError] = useMutation(SIGN_UP)

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            confirmEmail: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={validation}
          onSubmit={async ({
            firstName,
            lastName,
            phone,
            email,
            confirmEmail,
            password,
            confirmPassword,
          }) => {
            if (password !== confirmPassword) {
              window.alert('Passwords do not match')
            } else if (email !== confirmEmail) {
              window.alert('Emails do not match')
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
              navigate && navigate('/home')
            }
          }}
        >
          {() => (
            <Form>
              <Field placeholder="first name" name="firstName" />
              <ErrorMessage name="firstName" />
              <Field placeholder="last name" name="lastName" />
              <ErrorMessage name="lastName" />
              <Field placeholder="phone number" type="tel" name="phone" />
              <ErrorMessage name="phone" />
              <Field placeholder="email" type="email" name="email" />
              <ErrorMessage name="email" />
              <Field
                placeholder="confirm email"
                type="email"
                name="confirmEmail"
              />
              <Field placeholder="password" type="password" name="password" />
              <ErrorMessage name="password" />
              <Field
                placeholder="confirm password"
                type="password"
                name="confirmPassword"
              />
              <button type="submit">Sign Up</button>
            </Form>
          )}
        </Formik>
      </div>
    </LoadingOrError>
  )
}

export default SignupScreen
