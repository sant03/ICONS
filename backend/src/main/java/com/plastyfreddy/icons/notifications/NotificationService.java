package com.plastyfreddy.icons.notifications;

import com.plastyfreddy.icons.notifications.domain.Notification;
import com.plastyfreddy.icons.notifications.domain.NotificationRepository;
import com.plastyfreddy.icons.notifications.dto.NotificationResponse;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(String filter, Pageable pageable) {
        Long tenantId = TenantContext.require();
        Long userId = CurrentUser.getUserId();

        Page<Notification> page;
        if ("unread".equalsIgnoreCase(filter)) {
            page = notificationRepository.findByTenantIdAndUserIdAndReadFalseOrderByCreatedAtDesc(tenantId, userId, pageable);
        } else {
            page = notificationRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        Long tenantId = TenantContext.require();
        Long userId = CurrentUser.getUserId();
        return notificationRepository.countByTenantIdAndUserIdAndReadFalse(tenantId, userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        Long tenantId = TenantContext.require();
        Notification notification = notificationRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Notificación", id));
        notification.markAsRead();
    }

    @Transactional
    public void markAllAsRead() {
        Long tenantId = TenantContext.require();
        Long userId = CurrentUser.getUserId();
        notificationRepository.markAllAsReadByUser(tenantId, userId);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        Notification notification = notificationRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Notificación", id));
        notificationRepository.delete(notification);
    }

    @Transactional
    public void clearAll() {
        Long tenantId = TenantContext.require();
        Long userId = CurrentUser.getUserId();
        notificationRepository.deleteAllByTenantIdAndUserId(tenantId, userId);
    }

    @Transactional
    public void send(Long tenantId, Long userId, String title, String description, String type, String link) {
        Notification notification = Notification.builder()
            .tenantId(tenantId)
            .userId(userId)
            .title(title)
            .description(description)
            .type(type)
            .link(link)
            .build();
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
            n.getId(), n.getTitle(), n.getDescription(),
            n.getType(), n.isRead(), n.getLink(), n.getCreatedAt()
        );
    }
}
