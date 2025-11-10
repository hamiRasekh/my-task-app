import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'category_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'scheduled_date', type: 'string', isIndexed: true },
        { name: 'deadline', type: 'string', isOptional: true },
        { name: 'time', type: 'string', isOptional: true },
        { name: 'start_time', type: 'string', isOptional: true },
        { name: 'end_time', type: 'string', isOptional: true },
        { name: 'is_continuous', type: 'boolean' },
        { name: 'is_completed', type: 'boolean', isIndexed: true },
        { name: 'priority', type: 'string' },
        { name: 'reward_points', type: 'number' },
        { name: 'penalty_points', type: 'number' },
        { name: 'notification_enabled', type: 'boolean' },
        { name: 'notification_time', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'is_custom', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'cigarettes',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'count', type: 'number' },
        { name: 'daily_limit', type: 'number' },
        { name: 'timestamps', type: 'string' }, // JSON array of timestamps
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'task_completions',
      columns: [
        { name: 'task_id', type: 'string', isIndexed: true },
        { name: 'completed_at', type: 'number' },
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'points_earned', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'rewards',
      columns: [
        { name: 'task_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'points', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'value', type: 'string' }, // JSON string
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

