import React, { memo, useCallback, useMemo } from 'react';
import { FilterType } from '../store/todoSlice';
import './FilterButtons.css';

interface FilterButtonsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = memo(({ currentFilter, onFilterChange }) => {
  const filters = useMemo(() => [
    { key: 'all' as FilterType, label: 'All' },
    { key: 'active' as FilterType, label: 'Active' },
    { key: 'completed' as FilterType, label: 'Completed' },
  ], []);

  const handleFilterClick = useCallback((key: FilterType) => {
    onFilterChange(key);
  }, [onFilterChange]);

  return (
    <div className="filter-buttons">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleFilterClick(key)}
          className={`filter-button ${currentFilter === key ? 'active' : ''}`}
          aria-pressed={currentFilter === key}
          aria-label={`Show ${label.toLowerCase()} tasks`}
        >
          {label}
        </button>
      ))}
    </div>
  );
});

FilterButtons.displayName = 'FilterButtons';

export default FilterButtons;
