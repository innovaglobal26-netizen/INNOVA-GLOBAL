import { dbStore } from '../db/store';
import { Task, TaskCompletion } from '../../types';

export const taskService = {
  getTasks(): Task[] {
    return dbStore.getTasks().filter((t) => t.is_active);
  },

  getAllTasks(): Task[] {
    return dbStore.getTasks();
  },

  getTodayCompletions(innovaId: string): TaskCompletion[] {
    return dbStore.getTodayTaskCompletions(innovaId);
  },

  completeTask(innovaId: string, taskId: string, startTime: string) {
    return dbStore.completeDailyTask(innovaId, taskId, startTime);
  },
};
