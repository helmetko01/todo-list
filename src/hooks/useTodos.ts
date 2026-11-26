import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Todo, FilterType, DeletedTodoHistory } from '../types/todo';
import { loadTodosFromStorage, saveTodosToStorage } from '../lib/storage';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedHistory, setDeletedHistory] = useState<DeletedTodoHistory | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isCorrupted, setIsCorrupted] = useState(false);
  const [hiddenAfterAddNotice, setHiddenAfterAddNotice] = useState(false);

  const isMountedRef = useRef(false);

  // 1. 초기 로드
  useEffect(() => {
    const result = loadTodosFromStorage();
    if (result.success) {
      setTodos(result.todos);
      setStorageError(null);
    } else {
      setStorageError(result.error ?? '저장된 할 일을 불러오지 못했습니다.');
      if (result.isCorrupted) {
        setIsCorrupted(true);
      }
    }
    isMountedRef.current = true;
  }, []);

  // 2. 변경 시 저장 (데이터 손상 상태에서는 원본 보존을 위해 자동 덮어쓰지 않음)
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (isCorrupted) return; // 손상된 데이터 보호

    const saveResult = saveTodosToStorage(todos);
    if (!saveResult.success) {
      setStorageError(
        saveResult.error ?? '변경 내용을 로컬에 저장하지 못했습니다. 브라우저를 닫으면 사라질 수 있습니다.'
      );
    } else {
      setStorageError(null);
    }
  }, [todos, isCorrupted]);

  // 할 일 추가
  const addTodo = useCallback(
    (text: string): { success: boolean; error?: string } => {
      const trimmed = text.trim();
      if (!trimmed) {
        return { success: false, error: '할 일을 입력해 주세요.' };
      }
      if (trimmed.length > 200) {
        return { success: false, error: '할 일은 최대 200자까지 입력할 수 있습니다.' };
      }

      const now = new Date().toISOString();
      const newTodo: Todo = {
        id: crypto.randomUUID ? crypto.randomUUID() : `todo_${Date.now()}_${Math.random()}`,
        text: trimmed,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      setTodos((prev) => [newTodo, ...prev]);

      // 현재 조건(필터/검색)에서 새 항목이 가려지는지 확인
      const trimmedQuery = searchQuery.trim().toLowerCase();
      const isVisibleInFilter = filter === 'all' || filter === 'active';
      const isVisibleInSearch = !trimmedQuery || trimmed.toLowerCase().includes(trimmedQuery);

      if (!isVisibleInFilter || !isVisibleInSearch) {
        setHiddenAfterAddNotice(true);
      } else {
        setHiddenAfterAddNotice(false);
      }

      return { success: true };
    },
    [filter, searchQuery]
  );

  // 완료 상태 토글
  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  }, []);

  // 할 일 내용 수정
  const editTodo = useCallback((id: string, newText: string): { success: boolean; error?: string } => {
    const trimmed = newText.trim();
    if (!trimmed) {
      return { success: false, error: '할 일 내용을 입력해 주세요.' };
    }
    if (trimmed.length > 200) {
      return { success: false, error: '할 일은 최대 200자까지 입력할 수 있습니다.' };
    }

    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              text: trimmed,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    return { success: true };
  }, []);

  // 단일 삭제 (실행 취소용 히스토리 기록)
  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index === -1) return prev;
      const target = prev[index];
      setDeletedHistory({
        todo: target,
        originalIndex: index,
      });
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  // 삭제 실행 취소 (원래 위치로 복원)
  const undoDelete = useCallback(() => {
    if (!deletedHistory) return;
    const { todo, originalIndex } = deletedHistory;

    setTodos((prev) => {
      // 이미 같은 ID가 있으면 중복 방지
      if (prev.some((t) => t.id === todo.id)) return prev;
      const copy = [...prev];
      if (originalIndex >= 0 && originalIndex <= copy.length) {
        copy.splice(originalIndex, 0, todo);
      } else {
        copy.push(todo);
      }
      return copy;
    });

    setDeletedHistory(null);
  }, [deletedHistory]);

  const dismissUndo = useCallback(() => {
    setDeletedHistory(null);
  }, []);

  // 완료 항목 일괄 삭제
  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  // 전체 보기로 전환
  const resetFilterAndSearch = useCallback(() => {
    setFilter('all');
    setSearchQuery('');
    setHiddenAfterAddNotice(false);
  }, []);

  // 손상 데이터 초기화 후 새 저장 시작
  const resetCorruptedStorage = useCallback(() => {
    setIsCorrupted(false);
    setTodos([]);
    setStorageError(null);
    saveTodosToStorage([]);
  }, []);

  // 통계 계산
  const totalCount = todos.length;
  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const remainingCount = totalCount - completedCount;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // 필터 및 검색된 목록 (createdAt 내림차순 유지)
  const filteredTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return todos.filter((todo) => {
      // 필터
      if (filter === 'active' && todo.completed) return false;
      if (filter === 'completed' && !todo.completed) return false;
      // 검색
      if (q && !todo.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [todos, filter, searchQuery]);

  return {
    todos,
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
  };
}
