import React, { Component } from 'react'
import { Pagination } from 'antd'

import MovieList from '../MovieList'
import SearchBar from '../SearchBar'
import { searchMoviesByQuery } from '../../MovieApiService'

export default class SearchTab extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: 'return',
      page: 1,
      movieData: null,
      dataLoading: true,
      error: false,
      errorMessage: null,
    }
  }

  componentDidMount() {
    const { query } = this.state
    this.updateMovies(query, 1)
  }

  updateMovies = (query, page = 1) => {
    this.setState({ dataLoading: true, error: false })

    searchMoviesByQuery(query, page)
      .then((apiData) => {
        this.setState({
          movieData: apiData,
          query,
          page,
          dataLoading: false,
        })
      })
      .catch((err) => {
        this.setState({
          error: true,
          errorMessage: err.message,
          dataLoading: false,
        })
      })
  }

  paginationOnChanged = (currentPage) => {
    const { query } = this.state
    this.updateMovies(query, currentPage)
  }

  searchMovie = (e) => {
    const newQuery = e.target.value.trim()
    if (newQuery.length > 0) {
      this.updateMovies(newQuery)
    }
  }

  render() {
    const { guestSessionId } = this.props
    const { movieData, dataLoading, error, errorMessage, page } = this.state

    return (
      <>
        <SearchBar searchMovie={this.searchMovie} />
        <MovieList
          movieData={movieData}
          dataLoading={dataLoading}
          error={error}
          errorMessage={errorMessage}
          guestSessionId={guestSessionId}
        />
        <Pagination
          current={page}
          defaultPageSize={1}
          hideOnSinglePage
          total={movieData ? movieData.totalPages : 1}
          onChange={this.paginationOnChanged}
          align="center"
        />
      </>
    )
  }
}
