
// Notification type definitions for better organization
export const NOTIFICATION_TYPES = {
     TASK_ASSIGNED: 'TASK_ASSIGNED',
     TASK_COMPLETED: 'TASK_COMPLETED',
     TASK_REVIEW: 'TASK_REVIEW',
     MILESTONE_REACHED: 'MILESTONE_REACHED',
     PROJECT_UPDATE: 'PROJECT_UPDATE',
     FEEDBACK_RECEIVED: 'FEEDBACK_RECEIVED',
     DEADLINE_APPROACHING: 'DEADLINE_APPROACHING',
     SYSTEM_ALERT: 'SYSTEM_ALERT'
};

export const NOTIFICATION_PRIORITIES = {
     HIGH: 'high',
     MEDIUM: 'medium',
     LOW: 'low'
};

export const NOTIFICATION_ICONS = {
     [NOTIFICATION_TYPES.TASK_ASSIGNED]: '📋',
     [NOTIFICATION_TYPES.TASK_COMPLETED]: '✅',
     [NOTIFICATION_TYPES.TASK_REVIEW]: '👀',
     [NOTIFICATION_TYPES.MILESTONE_REACHED]: '🎯',
     [NOTIFICATION_TYPES.PROJECT_UPDATE]: '🔄',
     [NOTIFICATION_TYPES.FEEDBACK_RECEIVED]: '💬',
     [NOTIFICATION_TYPES.DEADLINE_APPROACHING]: '⏰',
     [NOTIFICATION_TYPES.SYSTEM_ALERT]: '⚠️'
};

export const getNotificationPriority = (type) => {
     switch (type) {
          case NOTIFICATION_TYPES.SYSTEM_ALERT:
          case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
               return NOTIFICATION_PRIORITIES.HIGH;
          case NOTIFICATION_TYPES.TASK_REVIEW:
          case NOTIFICATION_TYPES.MILESTONE_REACHED:
               return NOTIFICATION_PRIORITIES.MEDIUM;
          default:
               return NOTIFICATION_PRIORITIES.LOW;
     }
};

export const getNotificationActionLabel = (type) => {
     switch (type) {
          case NOTIFICATION_TYPES.TASK_ASSIGNED:
               return 'View Task';
          case NOTIFICATION_TYPES.TASK_COMPLETED:
               return 'Review';
          case NOTIFICATION_TYPES.TASK_REVIEW:
               return 'Start Review';
          case NOTIFICATION_TYPES.MILESTONE_REACHED:
               return 'View Milestone';
          case NOTIFICATION_TYPES.PROJECT_UPDATE:
               return 'View Project';
          case NOTIFICATION_TYPES.FEEDBACK_RECEIVED:
               return 'Read Feedback';
          case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
               return 'View Deadline';
          case NOTIFICATION_TYPES.SYSTEM_ALERT:
               return 'Investigate';
          default:
               return 'View Details';
     }
};