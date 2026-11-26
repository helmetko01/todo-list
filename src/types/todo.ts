export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type FilterType = 'all' | 'active' | 'completed';

export interface TodoStoragePayload {
  schemaVersion: 'todo-app:v1';
  tasks: Todo[];
}

export interface DeletedTodoHistory {
  todo: Todo;
  originalIndex: number;
}
