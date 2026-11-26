import React, { useState, useRef } from 'react';

interface TodoInputProps {
  onAdd: (text: string) => { success: boolean; error?: string };
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onAdd(text);
    if (result.success) {
      setText('');
      setErrorMessage(null);
      // 추가 후 포커스 유지
      inputRef.current?.focus();
    } else {
      setErrorMessage(result.error ?? '할 일을 추가하지 못했습니다.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중 Enter에 의한 중복 제출 방지
    if (e.nativeEvent.isComposing) {
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-todo-input" className="sr-only">
        새 할 일
      </label>
      <div className="todo-input-row">
        <input
          id="new-todo-input"
          ref={inputRef}
          type="text"
          className={`input-control ${errorMessage ? 'is-invalid' : ''}`}
          placeholder="어떤 일을 할 예정인가요?"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={200}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? 'todo-input-error' : undefined}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary">
          추가
        </button>
      </div>
      {errorMessage && (
        <p id="todo-input-error" className="input-error-msg" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
};
