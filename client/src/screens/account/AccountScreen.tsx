import React from 'react'
import { RouteComponentProps } from '@reach/router'
import * as R from 'ramda'
import { useQuery, gql, useMutation } from '@apollo/client'
import { UserContext } from 'components/Providers/User'
import LoadingOrError from 'components/LoadingOrError'
import { useFormik } from 'formik'

const USER = gql`
  query User($id: ID!) {
    user(id: $id) {
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

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!,
    $firstName: String,
    $lastName: String,
    $phone: String,
  ) {
    updateOneUser(where: { id: $id }, data: ) {
      id
    }
  }
`

const UPDATE_EMAIL = gql`
  mutation UpdateEmail($id: ID!, $email: String!) {
    updateEmail(id: $id, email: $email) {
      id
    }
  }
`

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($id: ID!, $password: String!) {
    updatePassword(id: $id, password: $password) {
      id
    }
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteOneUser(where: { id: $id }) {
      id
    }
  }
`

const AccountScreen: React.FC<RouteComponentProps> = ({ navigate }) => {
  const [{ id }] = React.useContext(UserContext)
  const { data, refetch, ...loadingOrError } = useQuery(USER, {
    variables: { id },
  })
  const user = data?.user
  const [updateUser] = useMutation(UPDATE_USER)
  const [updateEmail] = useMutation(UPDATE_EMAIL)
  const [updatePassword] = useMutation(UPDATE_PASSWORD)
  const [deleteUser] = useMutation(DELETE_USER, { variables: { id } })
  const personal = useFormik({
    initialValues: R.pick(['firstName', 'lastName', 'phone'], user),
    async onSubmit({ firstName, lastName, phone }) {
      const { data } = await updateUser({
        variables: { id, firstName, lastName, phone },
      })
      if (!data?.updateOneUser) {
        window.alert('The update failed, for some reason.')
      } else {
        window.alert('Updated successfully.')
        refetch()
      }
    },
  })
  const email = useFormik({
    initialValues: { email: user.email, confirmEmail: '' },
    async onSubmit({ email, confirmEmail }) {
      if (email !== confirmEmail) {
        window.alert('New emails do not match.')
      } else {
        const { data } = await updateEmail({
          variables: { id, email },
        })
        if (!data?.updateEmail) {
          window.alert('The update failed, for some reason.')
        } else {
          window.alert(
            'Updated successfully. An activation email has been sent to your new address. Your access will be limited until you reactivate your account.'
          )
          refetch()
        }
      }
    },
  })
  const password = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    async onSubmit({ password, confirmPassword }) {
      if (password !== confirmPassword) {
        window.alert('New passwords do not match.')
      } else {
        const { data } = await updatePassword({
          variables: { id, password },
        })
        if (!data?.updatePassword) {
          window.alert('The update failed, for some reason.')
        } else {
          window.alert('Updated successfully.')
          refetch()
        }
      }
    },
  })

  async function handleClick(): Promise<void> {
    await deleteUser()
    navigate && navigate('/')
  }

  return (
    <LoadingOrError {...loadingOrError}>
      <div>
        <h1>Account</h1>
        <h2>Personal</h2>
        <form onSubmit={personal.handleSubmit}>
          <input
            id="firstName"
            placeholder="first name"
            type="text"
            onChange={personal.handleChange}
            value={personal.values.firstName}
          />
          <input
            id="lastName"
            placeholder="last name"
            type="text"
            onChange={personal.handleChange}
            value={personal.values.lastName}
          />
          <input
            id="phone"
            placeholder="phone"
            type="tel"
            onChange={personal.handleChange}
            value={personal.values.phone}
          />
          <button type="submit">Save</button>
        </form>
        <h2>Email</h2>
        <form onSubmit={email.handleSubmit}>
          <input
            id="email"
            placeholder="email"
            type="email"
            onChange={email.handleChange}
            value={email.values.email}
          />
          <input
            id="confirmEmail"
            placeholder="confirm email"
            type="email"
            onChange={email.handleChange}
            value={email.values.confirmEmail}
          />
          <button type="submit">Save</button>
        </form>
        <h2>Password</h2>
        <form onSubmit={password.handleSubmit}>
          <input
            id="password"
            placeholder="password"
            type="password"
            onChange={password.handleChange}
            value={password.values.password}
          />
          <input
            id="confirmPassword"
            placeholder="confirm password"
            type="password"
            onChange={password.handleChange}
            value={password.values.confirmPassword}
          />
          <button type="submit">Save</button>
        </form>
        <button onClick={handleClick}>Delete Account</button>
      </div>
    </LoadingOrError>
  )
}

export default AccountScreen
