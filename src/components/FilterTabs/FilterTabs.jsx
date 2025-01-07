import React from 'react'
import './FilterTabs.css'

function FilterTabs({ onFilterTab, filterTabs }) {
  const buttons = filterTabs.map((tabObj) => {
    let className = 'filter-tabs__tab'
    if (tabObj.isActive) {
      className += ' filter-tabs__tab--active'
    }
    return (
      <button key={tabObj.label} className={className} onClick={onFilterTab}>
        {tabObj.label}
      </button>
    )
  })
  return <div className="filter-tabs">{buttons}</div>
}
export default FilterTabs
