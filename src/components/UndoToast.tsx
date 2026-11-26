import React from 'react';
import { DeletedTodoHistory } from '../types/todo';

interface UndoToastProps {
  history: DeletedTodoHistory | null;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  history,
  onUndo,
  onDismiss,
}) => {
  if (!history) return null;

  return (
    <aside className="toast-container" aria-label="삭제 알림 및 실행 취소">
      <div className="undo-toast" role="status" aria-live="polite">
        <span>할 일을 삭제했어요.</span>
        <div className="undo-actions">
          <button
            type="button"
            className="undo-btn"
            onClick={onUndo}
            aria-label={`삭제한 할 일 '${history.todo.text}' 복원`}
          >
            실행 취소
          </button>
          <button
            type="button"
            className="toast-close-btn"
            onClick={onDismiss}
            aria-label="알림 닫기"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
};
