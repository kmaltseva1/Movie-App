import React from 'react'
import { debounce } from 'lodash'
import './SearchBar.css'

export default function SearchBar({ searchMovie }) {
  const debouncedSearchMovie = debounce(searchMovie, 700)
  return (
    <input placeholder="Type to search..." className="search-bar" onChange={debouncedSearchMovie} defaultValue="" />
  )
}
