import React, { Component } from 'react'
import { Pagination } from 'antd'

import MovieList from '../MovieList'
// import { getRatedMovies } from '../../MovieApiService'

export default class RatedTab extends Component {
  paginationOnChanged = (page) => {
    const { getRatedMovies } = this.props
    getRatedMovies(page)
  }

  render() {
    const { ratedData, ratedError, dataLoading, error, errorMessage, ratedPage } = this.props

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
          total={ratedData ? ratedData.totalRatedPages : 1}
          onChange={this.paginationOnChanged}
          align="center"
        />
      </>
    )
  }
}
