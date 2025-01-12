const API_KEY = '9f0391eae7d2dd3127f3c365c41bf809'
const API_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'

const options = {
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZjAzOTFlYWU3ZDJkZDMxMjdmM2MzNjVjNDFiZjgwOSIsIm5iZiI6MTczNjA3ODA3Mi43ODU5OTk4LCJzdWIiOiI2NzdhNzJmODZkN2NhMDBlNzg3MmFhMzEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.CdqDCXGqESUPwI4kaK8q6b81UNbgjAavNwiI7v8K3e0',
  },
}
let totalPages = 1
let totalRatedPages = 1

export async function searchMoviesByQuery(query, page = 1) {
  const url = `${API_URL}/search/movie?query=${query}&page=${page}`
  const res = await fetch(url, { method: 'GET', ...options })

  if (!res.ok) {
    throw new Error(`Could not fetch ${url} received: ${res.status}`)
  }

  const body = await res.json()
  totalPages = body['total_pages'] > 100 ? 100 : body['total_pages']
  const resArray = body['results']

  if (resArray.length === 0 || !resArray) {
    throw new Error('Incorrect query')
  }

  const moviesWithoutPoster = resArray.filter((resObj) => !resObj['poster_path'])
  const moviesWithPoster = resArray.filter((resObj) => resObj['poster_path'])
  moviesWithoutPoster.forEach((movie) => {
    moviesWithPoster.push(movie)
  })

  return {
    movies: moviesWithPoster.map((resObj) => ({
      id: resObj.id,
      title: resObj.title,
      releaseDate: resObj['release_date'],
      genresIds: resObj['genre_ids'],
      overview: resObj.overview,
      voteAverage: resObj['vote_average'],
      imageSrc: `${IMAGE_BASE_URL}${resObj['poster_path']}`,
    })),
    totalPages,
  }
}

export async function getGenresList() {
  const url = `${API_URL}/genre/movie/list`
  const res = await fetch(url, { method: 'GET', ...options })

  if (!res.ok) {
    throw new Error(`Could not fetch ${url} received: ${res.status}`)
  }

  const body = await res.json()
  return body.genres
}

export async function createGuestSession() {
  const url = `${API_URL}/authentication/guest_session/new`
  const res = await fetch(url, { method: 'GET', ...options })

  if (!res.ok) {
    throw new Error(`Could not create guest session received: ${res.status}`)
  }

  const body = await res.json()
  if (body.success) {
    const guestSessionId = body['guest_session_id']
    localStorage.setItem('guestSessionId', guestSessionId)
    return body
  }

  throw new Error('Создание гостевой сессии завершилось неудачей.')
}

export async function addRating(movieId, rating) {
  const guestSessionId = localStorage.getItem('guestSessionId')

  if (!guestSessionId) {
    throw new Error('guestSessionId не найден. Пожалуйста, авторизуйтесь или создайте гостевую сессию.')
  }

  if (!movieId || typeof movieId !== 'number') {
    throw new Error('Некорректный идентификатор фильма (movieId).')
  }
  if (!rating || typeof rating !== 'number' || rating < 0.5 || rating > 10.0) {
    throw new Error('Рейтинг должен быть числом от 0.5 до 10.')
  }

  const url = `${API_URL}/movie/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`

  const options2 = {
    method: 'POST',
    headers: {
      ...options.headers,
    },

    body: JSON.stringify({ value: rating }),
  }

  try {
    const res = await fetch(url, options2)

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

export async function getRatedMovies(page = 1) {
  const guestSessionId = localStorage.getItem('guestSessionId')
  const url = `${API_URL}/guest_session/${guestSessionId}/rated/movies?language=en-US&page=${page}&sort_by=created_at.asc`
  const res = await fetch(url, { method: 'GET', ...options })

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `Рейтинг фильмов не найден. Проверьте guestSessionId или наличие оцененных фильмов. Код ошибки: ${res.status}`
      )
    }
    throw new Error(`Не удалось получить рейтинг фильмов. Код ошибки: ${res.status}`)
  }

  const body = await res.json()
  totalRatedPages = body['total_pages'] > 100 ? 100 : body['total_pages']
  const resArray = body['results']

  const moviesWithoutPoster = resArray.filter((resObj) => !resObj['poster_path'])
  const moviesWithPoster = resArray.filter((resObj) => resObj['poster_path'])
  moviesWithoutPoster.forEach((movie) => {
    moviesWithPoster.push(movie)
  })

  return {
    movies: moviesWithPoster.map((resObj) => ({
      id: resObj.id,
      title: resObj.title,
      releaseDate: resObj['release_date'],
      genresIds: resObj['genre_ids'],
      overview: resObj.overview,
      voteAverage: resObj['vote_average'],
      imageSrc: `${IMAGE_BASE_URL}${resObj['poster_path']}`,
    })),
    totalRatedPages,
  }
}

export function addGuestSessionId(guestSessionId) {
  localStorage.setItem('guestSessionId', guestSessionId)
}

export function clearGuestSession() {
  localStorage.removeItem('guestSessionId')
}
