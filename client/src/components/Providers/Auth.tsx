import React from 'react'
import { useLazyQuery, useMutation, gql } from '@apollo/client'
import { UserContext } from './User'

const VERIFY = gql`
  query Verify($accessToken: String!) {
    verify(accessToken: $accessToken)
  }
`

const REFRESH = gql`
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken)
  }
`

export default function Auth(children: any) {
  const [user, updateUser] = React.useContext(UserContext)
  const [verify, verifyResponse] = useLazyQuery(VERIFY, {
    variables: { accessToken: user.accessToken },
  })
  const [refresh, refreshResponse] = useMutation(REFRESH, {
    variables: { refreshToken: user.refreshToken },
  })

  if (verifyResponse.loading || refreshResponse.loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }

  if (user.accessToken) {
    verify()
    const id = verifyResponse.data?.verify
    if (id) {
      updateUser({ id, isActive: true })
      return children
    }
  } else if (user.refreshToken) {
    refresh()
    const accessToken = refreshResponse.data?.refresh
    if (accessToken) {
      updateUser({ accessToken })
    }
  } else {
    return children
  }
}
