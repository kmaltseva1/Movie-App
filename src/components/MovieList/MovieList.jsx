import './MovieList.css'
import { Alert } from 'antd'
import React from 'react'

import Movie from '../Movie'

export default function MovieList({ movieData, dataLoading, error, errorMessage, guestSessionId, ratedError }) {
  let movies = []

  if (ratedError) {
    return <Alert type="error" message="Вы еще не оценили ни одного фильма :(" />
  }

  if (error) {
    return (
      <div className="error">
        <Alert
          type="error"
          message={`Произошла ошибка при загрузке данных. Попробуйте отправить запрос повторно.
          Ошибка: ${errorMessage}`}
        />
      </div>
    )
  }

  if (dataLoading) {
    for (let i = 0; i < 20; i++) {
      movies.push(<Movie key={i} dataLoading={dataLoading} error={error} errorMessage={errorMessage} />)
    }
    return <ul className="movie-list">{movies}</ul>
  }

  movies = movieData.movies.map((movie) => {
    const { id, ...movieProps } = movie
    return <Movie {...movieProps} id={id} key={id} guestSessionId={guestSessionId || null} />
  })

  return <ul className="movie-list">{movies}</ul>
}
