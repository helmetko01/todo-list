import { Todo, TodoStoragePayload } from '../types/todo';

export const STORAGE_KEY = 'todo-app:v1';
export const CURRENT_SCHEMA_VERSION = 'todo-app:v1';

export interface StorageLoadResult {
  success: boolean;
  todos: Todo[];
  error?: string;
  isCorrupted?: boolean;
}

export interface StorageSaveResult {
  success: boolean;
  error?: string;
}

/**
 * ISO 8601 날짜 문자열 검증
 */
function isValidDateString(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Todo 항목 스키마 유효성 검사
 */
function isValidTodo(item: unknown): item is Todo {
  if (!item || typeof item !== 'object') return false;
  const t = item as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    t.id.trim().length > 0 &&
    typeof t.text === 'string' &&
    typeof t.completed === 'boolean' &&
    isValidDateString(t.createdAt) &&
    isValidDateString(t.updatedAt)
  );
}

/**
 * localStorage에서 Todo 목록을 안전하게 로드합니다.
 * 파싱 실패 또는 손상된 구조일 경우 기존 데이터를 덮어쓰지 않고 에러를 반환합니다.
 */
export function loadTodosFromStorage(): StorageLoadResult {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return { success: true, todos: [] };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      return {
        success: false,
        todos: [],
        error: '저장된 데이터 형식이 올바르지 않습니다(JSON 파싱 오류).',
        isCorrupted: true,
      };
    }

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        todos: [],
        error: '저장된 데이터 구조가 올바르지 않습니다.',
        isCorrupted: true,
      };
    }

    const payload = parsed as Record<string, unknown>;

    // 스키마 버전 검증
    if (payload.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      return {
        success: false,
        todos: [],
        error: `지원하지 않는 데이터 스키마 버전(${payload.schemaVersion})입니다.`,
        isCorrupted: true,
      };
    }

    if (!Array.isArray(payload.tasks)) {
      return {
        success: false,
        todos: [],
        error: '할 일 목록(tasks)이 배열 형태가 아닙니다.',
        isCorrupted: true,
      };
    }

    // 각 태스크 검증 및 ID 중복 검사
    const seenIds = new Set<string>();
    const validTodos: Todo[] = [];

    for (const item of payload.tasks) {
      if (!isValidTodo(item)) {
        return {
          success: false,
          todos: [],
          error: '유효하지 않은 할 일 항목 데이터가 포함되어 있습니다.',
          isCorrupted: true,
        };
      }
      if (seenIds.has(item.id)) {
        return {
          success: false,
          todos: [],
          error: `중복된 식별자(${item.id})를 가진 할 일 항목이 있습니다.`,
          isCorrupted: true,
        };
      }
      seenIds.add(item.id);
      validTodos.push({
        id: item.id,
        text: item.text,
        completed: item.completed,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    return { success: true, todos: validTodos };
  } catch (err) {
    return {
      success: false,
      todos: [],
      error: err instanceof Error ? err.message : '저장소 접근 중 알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * localStorage에 Todo 목록을 안전하게 저장합니다.
 */
export function saveTodosToStorage(todos: Todo[]): StorageSaveResult {
  try {
    const payload: TodoStoragePayload = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks: todos,
    };
    const serialized = JSON.stringify(payload);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : '로컬 저장소 공간 부족 또는 접근 제한으로 저장에 실패했습니다.',
    };
  }
}
