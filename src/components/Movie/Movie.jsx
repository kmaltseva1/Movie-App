import './Movie.css'
import { parseISO, format } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { Rate, Spin } from 'antd'
import React from 'react'

import MovieGenres from '../MovieGenres'
import MovieApiService from '../../MovieApiService'

export default function Movie({ id, dataLoading, error, errorMessage, guestSessionId, ...movieProps }) {
  const movieService = new MovieApiService()
  movieService.addGuestSessionId(guestSessionId)
  const onRated = (starsCount) => {
    if (starsCount < 1 || starsCount > 10) {
      return
    }
    sessionStorage.setItem(id.toString(), starsCount.toString())
    movieService.addRating(id, starsCount)
  }
  const hasStarsDefaultValue = () => {
    const storedRating = sessionStorage.getItem(id)
    return storedRating ? parseFloat(storedRating) : 0
  }
  const content = !(dataLoading || error) ? (
    <MovieFragment {...movieProps} onRated={onRated} hasStarsDefaultValue={hasStarsDefaultValue} />
  ) : null
  const spin = dataLoading ? (
    <div className="movie-list__movie movie__loading">
      <Spin size="large" />
    </div>
  ) : null
  return (
    <li className="movie-list__movie movie" id={id}>
      {content}
      {spin}
    </li>
  )
}

function MovieFragment({
  title,
  releaseDate,
  genresIds,
  overview,
  voteAverage,
  imageSrc,
  onRated,
  hasStarsDefaultValue,
}) {
  function editOverview(text) {
    let maxOverviewLength = 300
    if (title.length > 22 || genresIds.length > 3) {
      maxOverviewLength = 280
    }
    if (title.length > 22 && genresIds.length > 3) {
      maxOverviewLength = 220
    }
    if ((title.length > 30 && genresIds.length > 3) || title.length > 44) {
      maxOverviewLength = 180
    }
    if ((title.length > 44 && genresIds.length > 3) || title.length > 66) {
      maxOverviewLength = 140
    }

    if (text && text.length !== 0) {
      if (text.length > maxOverviewLength) {
        let newText = text.substring(0, maxOverviewLength)
        newText = `${newText.replace(/\s+\S*$/, '')}...`
        return <p className="movie__overview">{newText}</p>
      }
      return <p className="movie__overview">{text}</p>
    }
    return <p className="movie__empty-overview">The overview is empty :</p>
  }
  function editDate(date) {
    if (date && date.length !== 0) {
      return format(parseISO(releaseDate), 'LLLL d, yyyy', { locale: enGB })
    }
    return 'The release date is not known'
  }
  function getVoteAverageClassName(rating) {
    if (rating <= 3) {
      return 'movie__vote-average--terrible'
    }
    if (rating <= 5) {
      return 'movie__vote-average--bad'
    }
    if (rating <= 7) {
      return 'movie__vote-average--ok'
    }
    return 'movie__vote-average--good'
  }
  return (
    <>
      <img src={imageSrc} alt={`poster for '${title}'`} className="movie__image" />
      <div className="movie__info">
        <div className="movie__header">
          <h3 className="movie__title">{title}</h3>
          <p className={`movie__vote-average ${getVoteAverageClassName(voteAverage)}`}>
            {voteAverage.toString().slice(0, 3)}
          </p>
        </div>
        <p className="movie__date">{editDate(releaseDate)}</p>
        <MovieGenres genresIds={genresIds} />
        {editOverview(overview)}
        <Rate
          rootClassName="movie__rate-stars"
          count={10}
          fontSize={10}
          onChange={onRated}
          defaultValue={hasStarsDefaultValue()}
        />
      </div>
    </>
  )
}
