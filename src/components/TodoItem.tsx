import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => { success: boolean; error?: string };
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editError, setEditError] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // 편집 시작 시 입력창에 포커스
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(todo.text);
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
    setEditText(todo.text);
    // 수정 버튼으로 포커스 복귀
    setTimeout(() => {
      editButtonRef.current?.focus();
    }, 0);
  };

  const handleSaveEdit = () => {
    const result = onEdit(todo.id, editText);
    if (result.success) {
      setIsEditing(false);
      setEditError(null);
      setTimeout(() => {
        editButtonRef.current?.focus();
      }, 0);
    } else {
      setEditError(result.error ?? '수정 내용을 저장하지 못했습니다.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <li className="todo-item" data-testid={`todo-item-${todo.id}`}>
      {isEditing ? (
        <div className="todo-edit-form">
          <label htmlFor={`edit-todo-${todo.id}`} className="sr-only">
            할 일 내용 수정
          </label>
          <div className="todo-edit-row">
            <input
              id={`edit-todo-${todo.id}`}
              ref={editInputRef}
              type="text"
              className={`input-control todo-edit-input ${editError ? 'is-invalid' : ''}`}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                if (editError) setEditError(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={200}
              aria-invalid={!!editError}
              aria-describedby={editError ? `edit-error-${todo.id}` : undefined}
            />
            <div className="todo-edit-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEdit}
                aria-label="수정 내용 저장"
              >
                저장
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                aria-label="수정 취소"
              >
                취소
              </button>
            </div>
          </div>
          {editError && (
            <p id={`edit-error-${todo.id}`} className="input-error-msg" role="alert">
              {editError}
            </p>
          )}
        </div>
      ) : (
        <>
          <label className="todo-main-label" htmlFor={`checkbox-${todo.id}`}>
            <span className="todo-checkbox-wrapper">
              <input
                id={`checkbox-${todo.id}`}
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                aria-label={todo.completed ? `완료된 할 일: ${todo.text}` : `진행 중인 할 일: ${todo.text}`}
              />
            </span>
            <span
              className={`todo-text ${todo.completed ? 'is-completed' : ''}`}
            >
              {todo.text}
            </span>
          </label>
          <div className="todo-actions">
            <button
              ref={editButtonRef}
              type="button"
              className="btn btn-ghost icon-btn"
              onClick={handleStartEdit}
              aria-label={`할 일 '${todo.text}' 수정`}
              title="수정"
            >
              <span aria-hidden="true">✎</span>
            </button>
            <button
              type="button"
              className="btn btn-destructive icon-btn"
              onClick={() => onDelete(todo.id)}
              aria-label={`할 일 '${todo.text}' 삭제`}
              title="삭제"
            >
              <span aria-hidden="true">🗑</span>
            </button>
          </div>
        </>
      )}
    </li>
  );
};
