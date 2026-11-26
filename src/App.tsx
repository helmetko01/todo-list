import React, { useState, useRef } from 'react';
import { useTodos } from './hooks/useTodos';
import { Header } from './components/Header';
import { TodoInput } from './components/TodoInput';
import { FilterSearch } from './components/FilterSearch';
import { TodoList } from './components/TodoList';
import { SummaryFooter } from './components/SummaryFooter';
import { ConfirmDialog } from './components/ConfirmDialog';
import { UndoToast } from './components/UndoToast';

export const App: React.FC = () => {
  const {
    filteredTodos,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    deletedHistory,
    storageError,
    isCorrupted,
    hiddenAfterAddNotice,
    setHiddenAfterAddNotice,
    totalCount,
    completedCount,
    remainingCount,
    progressPercent,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    undoDelete,
    dismissUndo,
    clearCompleted,
    resetFilterAndSearch,
    resetCorruptedStorage,
  } = useTodos();

  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenClearDialog = () => {
    setIsClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    clearCompleted();
    setIsClearDialogOpen(false);
  };

  const handleCancelClear = () => {
    setIsClearDialogOpen(false);
    // 모달 닫힐 때 포커스 복귀
    clearButtonRef.current?.focus();
  };

  const handleFocusInput = () => {
    const input = document.getElementById('new-todo-input') as HTMLInputElement | null;
    input?.focus();
  };

  return (
    <main className="app-container">
      {/* 데이터 손상 알림 배너 */}
      {isCorrupted && (
        <aside className="alert-banner" role="alert">
          <div>
            <strong>데이터 오류:</strong> 저장된 할 일 목록을 읽지 못했습니다. 기존 데이터 보존을 위해 자동 덮어쓰기가 일시 중단되었습니다.
          </div>
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetCorruptedStorage}
            >
              초기화하고 새로 시작
            </button>
          </div>
        </aside>
      )}

      {/* 헤더 */}
      <Header
        totalCount={totalCount}
        completedCount={completedCount}
        progressPercent={progressPercent}
      />

      {/* 새 할 일 입력 */}
      <TodoInput onAdd={addTodo} />

      {/* 필터로 인해 새 항목이 숨겨졌을 때 안내 */}
      {hiddenAfterAddNotice && (
        <aside className="info-banner" role="status">
          <span>할 일을 추가했어요. 현재 조건에서는 보이지 않습니다.</span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetFilterAndSearch}
          >
            전체 보기
          </button>
        </aside>
      )}

      {/* 필터 및 검색 (할 일이 1개 이상이거나 검색어가 있을 때 표시) */}
      {(totalCount > 0 || searchQuery) && (
        <FilterSearch
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setHiddenAfterAddNotice(false);
          }}
          filteredCount={filteredTodos.length}
        />
      )}

      {/* 할 일 목록 */}
      <TodoList
        todos={filteredTodos}
        totalCount={totalCount}
        filter={filter}
        searchQuery={searchQuery}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={deleteTodo}
        onClearSearch={() => setSearchQuery('')}
        onResetFilter={resetFilterAndSearch}
        onFocusInput={handleFocusInput}
      />

      {/* 하단 요약 및 일괄 작업 */}
      <SummaryFooter
        remainingCount={remainingCount}
        completedCount={completedCount}
        storageError={storageError}
        onOpenClearDialog={handleOpenClearDialog}
      />

      {/* 완료 항목 일괄 삭제 확인 모달 */}
      <ConfirmDialog
        isOpen={isClearDialogOpen}
        count={completedCount}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />

      {/* 삭제 실행 취소 토스트 */}
      <UndoToast
        history={deletedHistory}
        onUndo={undoDelete}
        onDismiss={dismissUndo}
      />
    </main>
  );
};

export default App;
