import React from 'react'
import { Pagination } from 'antd'

import MovieList from '../MovieList'
import SearchBar from '../SearchBar'

export default function SearchTab({
  searchMovie,
  movieData,
  dataLoading,
  error,
  errorMessage,
  guestSessionId,
  page,
  totalPages,
  paginationOnChanged,
}) {
  return (
    <>
      <SearchBar searchMovie={searchMovie} />
      <MovieList
        movieData={movieData}
        dataLoading={dataLoading}
        error={error}
        errorMessage={errorMessage}
        guestSessionId={guestSessionId}
      />

      <Pagination
        defaultCurrent={1}
        current={page}
        defaultPageSize="1"
        hideOnSinglePage
        total={totalPages}
        onChange={paginationOnChanged}
        align="center"
      />
    </>
  )
}
