// Notification data transformer

import { BaseTransformer } from './index';
import { NotificationResponseDto, PaginatedResponseDto } from '../types';
import { normalizeNotification, normalizePaginatedResponse } from './data-normalizers';
import { isValidNotification, isValidPaginatedResponse } from './type-guards';

// Enhanced notification data structure
export interface TransformedNotificationData {
  notifications: (NotificationResponseDto & {
    isRecent: boolean;
    timeAgo: string;
    priority: 'low' | 'medium' | 'high';
  })[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}

// Notification transformer class
export class NotificationDataTransformer extends BaseTransformer<
  PaginatedResponseDto<NotificationResponseDto>,
  TransformedNotificationData
> {
  validate(input: unknown): input is PaginatedResponseDto<NotificationResponseDto> {
    return isValidPaginatedResponse(input, isValidNotification);
  }

  transform(input: PaginatedResponseDto<NotificationResponseDto>): TransformedNotificationData {
    // Normalize each notification
    const normalizedResponse = normalizePaginatedResponse(input, normalizeNotification);
    
    // Calculate unread count
    const unreadCount = normalizedResponse.items.filter(notification => !notification.read).length;
    
    return {
      notifications: normalizedResponse.items,
      unreadCount,
      totalCount: normalizedResponse.totalCount,
      hasMore: normalizedResponse.hasMore,
      pagination: {
        currentPage: normalizedResponse.meta.currentPage,
        totalPages: normalizedResponse.meta.totalPages,
        itemsPerPage: normalizedResponse.meta.itemsPerPage,
      },
    };
  }

  // Helper method to transform single notification
  transformSingle(notification: NotificationResponseDto) {
    if (!isValidNotification(notification)) {
      return null;
    }
    return normalizeNotification(notification);
  }

  // Helper method to get notifications by priority
  getNotificationsByPriority(
    data: TransformedNotificationData,
    priority: 'low' | 'medium' | 'high'
  ) {
    return data.notifications.filter(notification => notification.priority === priority);
  }

  // Helper method to get recent notifications
  getRecentNotifications(data: TransformedNotificationData) {
    return data.notifications.filter(notification => notification.isRecent);
  }
}

// Export singleton instance
export const notificationTransformer = new NotificationDataTransformer();