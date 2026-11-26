import React from 'react';
import { FilterType } from '../types/todo';

interface FilterSearchProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
}

export const FilterSearch: React.FC<FilterSearchProps> = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  filteredCount,
}) => {
  return (
    <div className="filter-search-container">
      {/* 상태 필터 그룹 */}
      <div className="filter-group" role="group" aria-label="할 일 상태 필터">
        <button
          type="button"
          className="filter-btn"
          aria-pressed={filter === 'all'}
          onClick={() => onFilterChange('all')}
        >
          전체
        </button>
        <button
          type="button"
          className="filter-btn"
          aria-pressed={filter === 'active'}
          onClick={() => onFilterChange('active')}
        >
          진행 중
        </button>
        <button
          type="button"
          className="filter-btn"
          aria-pressed={filter === 'completed'}
          onClick={() => onFilterChange('completed')}
        >
          완료
        </button>
      </div>

      {/* 검색 입력 상자 */}
      <div className="search-box">
        <label htmlFor="todo-search-input" className="sr-only">
          할 일 검색
        </label>
        <input
          id="todo-search-input"
          type="search"
          className="input-control search-input"
          placeholder="할 일 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="검색어 초기화"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      {/* 검색 중일 때 결과 개수 (보조 텍스트) */}
      {searchQuery.trim() && (
        <span className="sr-only" aria-live="polite">
          검색 결과 {filteredCount}개
        </span>
      )}
    </div>
  );
};
