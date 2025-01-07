export default class MovieApiService {
  guestSessionId = null

  options = {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZjAzOTFlYWU3ZDJkZDMxMjdmM2MzNjVjNDFiZjgwOSIsIm5iZiI6MTczNjA3ODA3Mi43ODU5OTk4LCJzdWIiOiI2NzdhNzJmODZkN2NhMDBlNzg3MmFhMzEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.CdqDCXGqESUPwI4kaK8q6b81UNbgjAavNwiI7v8K3e0',
    },
  }

  totalPages = 1

  totalRatedPages = 1

  async searchMoviesByQuery(query, page = 1) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${query}&page=${page}`
    const res = await fetch(url, { method: 'GET', ...this.options })
    if (!res.ok) {
      throw new Error(`Could not fetch ${url} received: ${res.status}`)
    }
    const body = await res.json()
    this.totalPages = body['total_pages'] > 100 ? 100 : body['total_pages']
    const resArray = body['results']
    if (resArray.length === 0 || !resArray) {
      throw new Error('Incorrect query')
    }
    const moviesWithoutPoster = resArray.filter((resObj) => !resObj['poster_path'])
    const moviesWithPoster = resArray.filter((resObj) => resObj['poster_path'])
    moviesWithoutPoster.forEach((movie) => {
      moviesWithPoster.push(movie)
    })
    return moviesWithPoster.map((resObj) => ({
      id: resObj.id,
      title: resObj.title,
      releaseDate: resObj['release_date'],
      genresIds: resObj['genre_ids'],
      overview: resObj.overview,
      voteAverage: resObj['vote_average'],
      imageSrc: `https://image.tmdb.org/t/p/original${resObj['poster_path']}`,
    }))
  }

  async getGenresList() {
    const url = 'https://api.themoviedb.org/3/genre/movie/list'
    const res = await fetch(url, { method: 'GET', ...this.options })
    if (!res.ok) {
      throw new Error(`Could not fetch ${url} received: ${res.status}`)
    }
    const body = await res.json()
    return body.genres
  }

  async createGuestSession() {
    const url = 'https://api.themoviedb.org/3/authentication/guest_session/new'
    const res = await fetch(url, { method: 'GET', ...this.options })
    if (!res.ok) {
      throw new Error(`Could not create guest session received: ${res.status}`)
    }
    const body = await res.json()
    if (body.success !== true) {
      throw new Error('Could not create guest session received, try again')
    }
    this.guestSessionId = body['guest_session_id']
    return body
  }

  async addRating(movieId, rating) {
    if (!this.guestSessionId) {
      throw new Error('Guest session ID отсутствует. Создайте гостевую сессию перед выставлением рейтинга.')
    }
    if (!movieId || typeof movieId !== 'number') {
      throw new Error('Некорректный идентификатор фильма (movieId).')
    }
    if (!rating || typeof rating !== 'number' || rating < 0.5 || rating > 10.0) {
      throw new Error('Рейтинг должен быть числом от 0.5 до 10.')
    }

    const url = `https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=9f0391eae7d2dd3127f3c365c41bf809&guest_session_id=${this.guestSessionId}`

    const options = {
      method: 'POST',
      headers: {
        ...this.options.headers,
      },

      body: JSON.stringify({ value: rating }),
    }

    try {
      const res = await fetch(url, options)

      if (!res.ok) {
        const errorBody = await res.json()
        throw new Error(`Ошибка выставления рейтинга: ${res.status}. Сообщение: ${errorBody.status_message}`)
      }

      const body = await res.json()
      return body.status_message
    } catch (error) {
      throw new Error('Не удалось выставить рейтинг. Проверьте параметры и попробуйте снова.')
    }
  }

  async getRatedMovies(page = 1) {
    const url = `https://api.themoviedb.org/3/guest_session/${this.guestSessionId}/rated/movies?language=en-US&page=${page}&sort_by=created_at.asc`
    const res = await fetch(url, { method: 'GET', ...this.options })

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          `Рейтинг фильмов не найден. Проверьте guestSessionId или наличие оцененных фильмов. Код ошибки: ${res.status}`
        )
      }
      throw new Error(`Не удалось получить рейтинг фильмов. Код ошибки: ${res.status}`)
    }

    const body = await res.json()
    this.totalRatedPages = body['total_pages'] > 100 ? 100 : body['total_pages']
    const resArray = body['results']

    const moviesWithoutPoster = resArray.filter((resObj) => !resObj['poster_path'])
    const moviesWithPoster = resArray.filter((resObj) => resObj['poster_path'])
    moviesWithoutPoster.forEach((movie) => {
      moviesWithPoster.push(movie)
    })

    return moviesWithPoster.map((resObj) => ({
      id: resObj.id,
      title: resObj.title,
      releaseDate: resObj['release_date'],
      genresIds: resObj['genre_ids'],
      overview: resObj.overview,
      voteAverage: resObj['vote_average'],
      imageSrc: `https://image.tmdb.org/t/p/original${resObj['poster_path']}`,
    }))
  }

  addGuestSessionId(guestSessionId) {
    this.guestSessionId = guestSessionId
  }
}
