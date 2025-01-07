import './MovieApp.css'

import React, { Component, Fragment } from 'react'
import { Pagination } from 'antd'

import MovieApiService from '../../MovieApiService'
import MovieList from '../MovieList'
import FilterTabs from '../FilterTabs'
import SearchBar from '../SearchBar'
import { MovieGenresProvider } from '../MovieGenresContext'

export default class MovieApp extends Component {
  state = {
    query: 'return',
    page: 1,
    ratedPage: 1,
    movieData: null,
    ratedData: null,
    dataLoading: true,
    ratedError: false,
    error: false,
    errorMessage: null,
    genresData: null,
    genresDataLoading: true,
    genresError: false,
    filterTabs: [
      {
        label: 'Search',
        isActive: true,
      },
      {
        label: 'Rated',
        isActive: false,
      },
    ],
    guestSessionId: null,
  }

  movieService = new MovieApiService()

  componentDidMount() {
    const { query } = this.state

    this.movieService
      .createGuestSession()
      .then(() => {
        this.setState({ guestSessionId: this.movieService.guestSessionId })
      })
      .catch((err) => {
        console.error('Ошибка при создании гостевой сессии:', err.message)
      })

    this.updateMovies(query)
    this.downloadGenres()
    sessionStorage.clear()
  }

  onError = (err) => {
    this.setState({
      error: true,
      dataLoading: false,
      errorMessage: err.message,
    })
  }

  onFilterTab = (e) => {
    const filterTab = e.target
    const { filterTabs, query, page, ratedPage } = this.state
    const activeFilterTab = filterTabs.filter((tab) => tab.isActive === true)[0]
    if (filterTab.textContent === 'Search' && activeFilterTab.label !== 'Search') {
      this.setState({ dataLoading: true })
      this.updateMovies(query, page)
      this.setState({
        filterTabs: [
          {
            label: 'Search',
            isActive: true,
          },
          {
            label: 'Rated',
            isActive: false,
          },
        ],
      })
    } else if (filterTab.textContent === 'Rated' && activeFilterTab.label !== 'Rated') {
      if (sessionStorage.length === 0) {
        this.setState({ ratedError: true })
      } else {
        this.setState({ ratedError: false, dataLoading: true })
        this.getRatedMovies(ratedPage)
      }
      this.setState({
        filterTabs: [
          {
            label: 'Search',
            isActive: false,
          },
          {
            label: 'Rated',
            isActive: true,
          },
        ],
      })
    }
  }

  getRatedMovies(page = 1) {
    this.movieService
      .getRatedMovies(page)
      .then((apiData) => {
        this.setState({ ratedData: apiData, ratedPage: page })
      })
      .then(() => {
        this.setState({ dataLoading: false })
      })
      .catch((err) => {
        this.onError(err)
      })
  }

  paginationOnChanged = (page) => {
    const { query, filterTabs } = this.state
    if (!filterTabs[0].isActive) {
      this.getRatedMovies(page)
    } else {
      this.updateMovies(query, page)
    }
  }

  searchMovie = (e) => {
    const query = e.target.value
    if (query.length !== 0) {
      this.updateMovies(query)
    }
  }

  downloadGenres() {
    this.movieService
      .getGenresList()
      .then((genresData) => {
        this.setState({ genresData })
      })
      .then(() => {
        this.setState({ genresDataLoading: false })
      })
      .catch(() => {
        this.setState({ genresError: true, genresDataLoading: false })
      })
  }

  updateMovies(query, page = 1) {
    this.movieService
      .searchMoviesByQuery(query, page)
      .then((apiData) => {
        this.setState({ movieData: apiData, query, page })
      })
      .then(() => {
        this.setState({ dataLoading: false })
      })
      .catch((err) => {
        this.onError(err)
      })
  }

  render() {
    const {
      movieData,
      dataLoading,
      error,
      ratedError,
      errorMessage,
      filterTabs,
      page,
      ratedData,
      ratedPage,
      genresData,
      genresDataLoading,
      genresError,
      guestSessionId,
    } = this.state
    const genresObj = {
      genresData,
      genresDataLoading,
      genresError,
    }
    const movieAppFiltered = filterTabs[0].isActive ? (
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
          defaultCurrent={1}
          current={page}
          defaultPageSize="1"
          hideOnSinglePage="true"
          total={this.movieService.totalPages}
          onChange={this.paginationOnChanged}
          align="center"
        />
      </>
    ) : (
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
          hideOnSinglePage="true"
          total={this.movieService.totalRatedPages}
          onChange={this.paginationOnChanged}
          align="center"
        />
      </>
    )
    return (
      <MovieGenresProvider value={genresObj}>
        <div className="movie-app">
          <div className="movie-app__body">
            <FilterTabs onFilterTab={this.onFilterTab} filterTabs={filterTabs} />
            {movieAppFiltered}
          </div>
        </div>
      </MovieGenresProvider>
    )
  }
}
