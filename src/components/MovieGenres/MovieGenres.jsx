import React from 'react'
import { Alert, Spin } from 'antd'

import './MovieGenres.css'

import { MovieGenresConsumer } from '../MovieGenresContext'

export default function MovieGenres({ genresIds }) {
  return (
    <MovieGenresConsumer>
      {(genresObj) => {
        if (!genresObj) {
          return <Alert type="error" message="No genres data available" />
        }

        const { genresData, genresDataLoading, genresError } = genresObj

        if (genresError) {
          return <Alert type="error" message="Error loading genres data" />
        }

        if (genresDataLoading) {
          return <Spin size="small" />
        }

        if (genresData && genresIds) {
          const genresNamesArray = genresIds.map((genreId) => {
            const genre = genresData.find((genreObj) => genreObj.id === genreId)
            return genre ? genre.name : 'Unknown'
          })

          const buttons = genresNamesArray.map((genreName) => (
            <button className="movie__genre-button" key={genreName}>
              {genreName}
            </button>
          ))

          return <div className="movie__genres">{buttons}</div>
        }
        return <Alert type="info" message="No genres to display" />
      }}
    </MovieGenresConsumer>
  )
}
