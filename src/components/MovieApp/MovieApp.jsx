import './MovieApp.css'
import React, { Component } from 'react'

import { createGuestSession, getGenresList, getRatedMovies } from '../../MovieApiService'
import FilterTabs from '../FilterTabs'
import { MovieGenresProvider } from '../MovieGenresContext'
import SearchTab from '../Tabs/SearchTab'
import RatedTab from '../Tabs/RatedTab'

export default class MovieApp extends Component {
  state = {
    ratedPage: 1,
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
    createGuestSession()
      .then(() => {
        this.setState({ guestSessionId: localStorage.getItem('guestSessionId') })
      })
      .catch((err) => {
        console.error('Ошибка при создании гостевой сессии:', err.message)
      })

    this.downloadGenres()
    sessionStorage.clear()
  }

  onFilterTab = (e) => {
    const filterTab = e.target
    const { filterTabs, ratedPage } = this.state
    const activeFilterTab = filterTabs.filter((tab) => tab.isActive === true)[0]

    if (filterTab.textContent === 'Search' && activeFilterTab.label !== 'Search') {
      this.setState({ dataLoading: true })
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
        this.setState({
          error: true,
          dataLoading: false,
          errorMessage: err.message,
        })
      })
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

  render() {
    const {
      dataLoading,
      error,
      ratedError,
      errorMessage,
      filterTabs,
      ratedData,
      ratedPage,
      genresData,
      genresDataLoading,
      genresError,
      guestSessionId,
    } = this.state

    const movieAppFiltered = filterTabs[0].isActive ? (
      <SearchTab guestSessionId={guestSessionId} />
    ) : (
      <RatedTab
        ratedData={ratedData}
        ratedError={ratedError}
        dataLoading={dataLoading}
        error={error}
        errorMessage={errorMessage}
        ratedPage={ratedPage}
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
