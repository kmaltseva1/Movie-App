import React from 'react'
import { Pagination } from 'antd'

import MovieList from '../MovieList'

export default function RatedTab({
  ratedData,
  ratedError,
  dataLoading,
  error,
  errorMessage,
  ratedPage,
  totalRatedPages,
  paginationOnChanged,
}) {
  return (
    <>
      <MovieList
        movieData={ratedData}
        ratedError={ratedError}
        dataLoading={dataLoading}
        error={error}
        errorMessage={errorMessage}
      />
      <Pagination
        defaultCurrent={1}
        current={ratedPage}
        defaultPageSize="1"
        hideOnSinglePage
        total={totalRatedPages}
        onChange={paginationOnChanged}
        align="center"
      />
    </>
  )
}
