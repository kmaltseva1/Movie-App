import './MovieApp.css'
import React, { Component } from 'react'

import { createGuestSession, getGenresList, searchMoviesByQuery, getRatedMovies } from '../../MovieApiService'
import FilterTabs from '../FilterTabs'
import { MovieGenresProvider } from '../MovieGenresContext'
import SearchTab from '../Tabs/SearchTab'
import RatedTab from '../Tabs/RatedTab'

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
      { label: 'Search', isActive: true },
      { label: 'Rated', isActive: false },
    ],
    guestSessionId: null,
  }

  componentDidMount() {
    const { query } = this.state

    createGuestSession()
      .then(() => {
        this.setState({ guestSessionId: localStorage.getItem('guestSessionId') })
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
          { label: 'Search', isActive: true },
          { label: 'Rated', isActive: false },
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
          { label: 'Search', isActive: false },
          { label: 'Rated', isActive: true },
        ],
      })
    }
  }

  getRatedMovies(page = 1) {
    getRatedMovies(page)
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
    getGenresList()
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
    searchMoviesByQuery(query, page)
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

    const movieAppFiltered = filterTabs[0].isActive ? (
      <SearchTab
        searchMovie={this.searchMovie}
        movieData={movieData}
        dataLoading={dataLoading}
        error={error}
        errorMessage={errorMessage}
        guestSessionId={guestSessionId}
        page={page}
        totalPages={movieData ? movieData.totalPages : 1}
        paginationOnChanged={this.paginationOnChanged}
      />
    ) : (
      <RatedTab
        ratedData={ratedData}
        ratedError={ratedError}
        dataLoading={dataLoading}
        error={error}
        errorMessage={errorMessage}
        ratedPage={ratedPage}
        totalRatedPages={ratedData ? ratedData.totalRatedPages : 1}
        paginationOnChanged={this.paginationOnChanged}
      />
    )

    return (
      <MovieGenresProvider value={{ genresData, genresDataLoading, genresError }}>
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
