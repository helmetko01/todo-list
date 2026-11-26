import React from 'react';
import { Todo, FilterType } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  totalCount: number;
  filter: FilterType;
  searchQuery: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => { success: boolean; error?: string };
  onDelete: (id: string) => void;
  onClearSearch: () => void;
  onResetFilter: () => void;
  onFocusInput: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  totalCount,
  filter,
  searchQuery,
  onToggle,
  onEdit,
  onDelete,
  onClearSearch,
  onResetFilter,
  onFocusInput,
}) => {
  // 빈 상태 처리
  if (todos.length === 0) {
    // 1. 검색어가 있을 때 검색 결과 없음 우선
    if (searchQuery.trim()) {
      return (
        <div className="empty-state" role="status">
          <p className="empty-state-title">일치하는 할 일이 없어요</p>
          <p className="empty-state-desc">다른 검색어로 다시 찾아보세요.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClearSearch}
          >
            검색어 초기화
          </button>
        </div>
      );
    }

    // 2. 전체 데이터가 없을 때
    if (totalCount === 0) {
      return (
        <div className="empty-state" role="status">
          <p className="empty-state-title">아직 할 일이 없어요</p>
          <p className="empty-state-desc">오늘 해야 할 일을 등록하고 하루를 시작해 보세요.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onFocusInput}
          >
            첫 할 일 입력하기
          </button>
        </div>
      );
    }

    // 3. 필터 조건에 따른 빈 상태
    if (filter === 'active') {
      return (
        <div className="empty-state" role="status">
          <p className="empty-state-title">진행 중인 할 일이 없어요</p>
          <p className="empty-state-desc">모든 할 일을 완료했습니다. 멋져요!</p>
        </div>
      );
    }

    if (filter === 'completed') {
      return (
        <div className="empty-state" role="status">
          <p className="empty-state-title">아직 완료한 할 일이 없어요</p>
          <p className="empty-state-desc">할 일을 하나씩 완료해 나가보세요.</p>
        </div>
      );
    }

    return (
      <div className="empty-state" role="status">
        <p className="empty-state-title">이 조건에 맞는 할 일이 없어요</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onResetFilter}
        >
          전체 보기
        </button>
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label="할 일 목록">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};
