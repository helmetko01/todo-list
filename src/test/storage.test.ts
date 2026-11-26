import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadTodosFromStorage,
  saveTodosToStorage,
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from '../lib/storage';
import { Todo } from '../types/todo';

describe('storage module', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('스토리지에 데이터가 없으면 빈 배열을 반환한다', () => {
    const result = loadTodosFromStorage();
    expect(result.success).toBe(true);
    expect(result.todos).toEqual([]);
  });

  it('정상적인 Todo 목록을 저장하고 복원한다', () => {
    const todos: Todo[] = [
      {
        id: 'todo-1',
        text: '장보기',
        completed: false,
        createdAt: '2026-11-26T10:00:00.000Z',
        updatedAt: '2026-11-26T10:00:00.000Z',
      },
      {
        id: 'todo-2',
        text: '운동하기',
        completed: true,
        createdAt: '2026-11-26T09:00:00.000Z',
        updatedAt: '2026-11-26T09:30:00.000Z',
      },
    ];

    const saveResult = saveTodosToStorage(todos);
    expect(saveResult.success).toBe(true);

    const loadResult = loadTodosFromStorage();
    expect(loadResult.success).toBe(true);
    expect(loadResult.todos).toHaveLength(2);
    expect(loadResult.todos[0].text).toBe('장보기');
    expect(loadResult.todos[1].completed).toBe(true);
  });

  it('JSON 파싱이 불가능한 잘못된 데이터일 경우 손상(corrupted) 플래그를 반환한다', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid json string ');

    const result = loadTodosFromStorage();
    expect(result.success).toBe(false);
    expect(result.isCorrupted).toBe(true);
    expect(result.error).toContain('JSON 파싱');
  });

  it('지원하지 않는 스키마 버전일 경우 에러를 반환한다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 'todo-app:v999',
        tasks: [],
      })
    );

    const result = loadTodosFromStorage();
    expect(result.success).toBe(false);
    expect(result.isCorrupted).toBe(true);
    expect(result.error).toContain('지원하지 않는 데이터 스키마 버전');
  });

  it('중복된 ID가 포함되어 있으면 에러를 반환한다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        tasks: [
          {
            id: 'dup-1',
            text: '첫 번째',
            completed: false,
            createdAt: '2026-11-26T10:00:00.000Z',
            updatedAt: '2026-11-26T10:00:00.000Z',
          },
          {
            id: 'dup-1',
            text: '두 번째',
            completed: false,
            createdAt: '2026-11-26T10:00:00.000Z',
            updatedAt: '2026-11-26T10:00:00.000Z',
          },
        ],
      })
    );

    const result = loadTodosFromStorage();
    expect(result.success).toBe(false);
    expect(result.isCorrupted).toBe(true);
    expect(result.error).toContain('중복된 식별자');
  });

  it('localStorage 접근 실패 또는 용량 초과 시 에러를 반환하고 앱 크래시를 방지한다', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const result = saveTodosToStorage([]);
    expect(result.success).toBe(false);
    expect(result.error).toBe('QuotaExceededError');
  });
});
