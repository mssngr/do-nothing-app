import React from 'react'

export default function LoadingOrError({
  loading,
  error,
  children,
}: {
  loading?: boolean
  error?: any
  children?: React.ReactElement
}) {
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

  return children || null
}
