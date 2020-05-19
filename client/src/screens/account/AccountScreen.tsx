import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'
import * as R from 'ramda'
import { useQuery, gql, useApolloClient } from '@apollo/client'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'

const USER = gql`
  query User {
    user {
      firstName
      lastName
      phone
      email
      isActivated
      createdAt
      updatedAt
    }
  }
`

const UPDATE_INFO = gql`
  mutation UpdateInfo($firstName: String, $lastName: String, $phone: String) {
    updateOneUserInfo(
      firstName: $firstName
      lastName: $lastName
      phone: $phone
    ) {
      id
    }
  }
`

const UPDATE_EMAIL = gql`
  mutation UpdateEmail($email: String!) {
    updateOneUserEmail(email: $email)
  }
`

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($password: String!) {
    updateOneUserPassword(password: $password)
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteOneUser(where: { id: $id }) {
      id
    }
  }
`

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

export const infoValidation = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  lastName: Yup.string()
    .trim()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  phone: Yup.string().trim().matches(phoneRegExp, 'Invalid phone number'),
})

export const emailValidation = Yup.object().shape({
  email: Yup.string().trim().email('Invalid email').required('Required'),
})

export const passwordValidation = Yup.object().shape({
  password: Yup.string()
    .trim()
    .min(8, 'Too Short!')
    .max(64, 'Too Long!')
    .required('Required'),
})

const AccountScreen: React.FC<RouteComponentProps> = ({ navigate }) => {
  const [{ id }] = React.useContext(UserContext)
  const { data, refetch, ...loadingOrError } = useQuery(USER)
  const user = data?.user || {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  }
  const client = useApolloClient()

  async function handleClick(): Promise<void> {
    const { data } = await client.mutate({
      mutation: DELETE_USER,
      variables: { id },
    })
    if (!data?.deleteOneUser) {
      window.alert('The delete failed, for some reason.')
    } else {
      window.alert('Deleted successfully.')
      navigate && navigate('/logout')
    }
  }

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        <h1>Account</h1>
        {!user?.isActivated && (
          <p>
            Your account has not yet been activated. Your functionality will be
            limited until you activate your account.
            <br />
            <Link to="/activation">Click here to activate your account.</Link>
          </p>
        )}
        <h2>Update Info</h2>
        <Formik
          initialValues={R.pick(['firstName', 'lastName', 'phone'], user)}
          validationSchema={infoValidation}
          onSubmit={async variables => {
            const { data, errors } = await client.mutate({
              mutation: UPDATE_INFO,
              variables: { ...variables, id },
            })
            if (R.isEmpty(errors) || !data?.updateOneUserInfo) {
              window.alert('The update failed, for some reason.')
            } else {
              window.alert('Updated successfully.')
              refetch()
            }
          }}
          enableReinitialize
        >
          {() => (
            <Form>
              <Field placeholder="first name" name="firstName" />
              <ErrorMessage name="firstName" />
              <Field placeholder="last name" name="lastName" />
              <ErrorMessage name="lastName" />
              <Field placeholder="phone number" type="tel" name="phone" />
              <ErrorMessage name="phone" />
              <button type="submit">Save</button>
            </Form>
          )}
        </Formik>
        <h2>Update Email</h2>
        <Formik
          initialValues={{ email: user.email, confirmEmail: '' }}
          validationSchema={emailValidation}
          onSubmit={async ({ email, confirmEmail }) => {
            if (email !== confirmEmail) {
              window.alert('New emails do not match.')
            } else {
              const { data, errors } = await client.mutate({
                mutation: UPDATE_EMAIL,
                variables: { email },
              })
              if (R.isEmpty(errors) || !data?.updateOneUserEmail) {
                window.alert('The update failed, for some reason.')
              } else {
                window.alert(
                  'Updated successfully. An activation email has been sent to your new address. Your access will be limited until you reactivate your account.'
                )
                refetch()
              }
            }
          }}
          enableReinitialize
        >
          {() => (
            <Form>
              <Field placeholder="email" type="email" name="email" />
              <ErrorMessage name="email" />
              <Field
                placeholder="confirm email"
                type="email"
                name="confirmEmail"
              />
              <button type="submit">Save</button>
            </Form>
          )}
        </Formik>
        <h2>Update Password</h2>
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={passwordValidation}
          onSubmit={async ({ password, confirmPassword }) => {
            if (password !== confirmPassword) {
              window.alert('New passwords do not match.')
            } else {
              const { data, errors } = await client.mutate({
                mutation: UPDATE_PASSWORD,
                variables: { password },
              })
              if (R.isEmpty(errors) || !data?.updateOneUserPassword) {
                window.alert('The update failed, for some reason.')
              } else {
                window.alert('Updated successfully.')
                refetch()
              }
            }
          }}
        >
          {() => (
            <Form>
              <Field placeholder="password" type="password" name="password" />
              <ErrorMessage name="password" />
              <Field
                placeholder="confirm password"
                type="password"
                name="confirmPassword"
              />
              <button type="submit">Save</button>
            </Form>
          )}
        </Formik>
        <h2>Delete Account</h2>
        <button onClick={handleClick}>Delete Account</button>
        <br />
        <br />
        <Link to="/home">Go Home</Link>
        <br />
        <Link to="/logout">Logout</Link>
      </div>
    </LoadingOrError>
  )
}

export default AccountScreen
