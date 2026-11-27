package com.plastyfreddy.icons.notifications;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plastyfreddy.icons.notifications.domain.Notification;
import com.plastyfreddy.icons.notifications.domain.NotificationRepository;
import com.plastyfreddy.icons.notifications.domain.NotificationType;
import com.plastyfreddy.icons.notifications.domain.PushSubscription;
import com.plastyfreddy.icons.notifications.domain.PushSubscriptionRepository;
import com.plastyfreddy.icons.notifications.dto.NotificationResponse;
import com.plastyfreddy.icons.notifications.dto.PushSubscriptionRequest;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final PushService pushService;
    private final ObjectMapper objectMapper;

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
    public void send(Long tenantId, Long userId, NotificationType type,
                     String title, String description, String link) {
        Notification notification = Notification.builder()
            .tenantId(tenantId)
            .userId(userId)
            .title(title)
            .description(description)
            .type(type.name().toLowerCase())
            .link(link)
            .build();
        notificationRepository.save(notification);

        sendPushAsync(tenantId, userId, title, description, link, type.name().toLowerCase());
    }

    @Async
    public void sendPushAsync(Long tenantId, Long userId,
                              String title, String description, String link, String type) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository
            .findByTenantIdAndUserId(tenantId, userId);

        for (PushSubscription sub : subscriptions) {
            sendPush(sub, title, description, link, type);
        }
    }

    @Transactional
    public void subscribe(Long tenantId, Long userId, PushSubscriptionRequest req, String userAgent) {
        pushSubscriptionRepository.findByTenantIdAndEndpoint(tenantId, req.endpoint())
            .ifPresentOrElse(
                existing -> {
                    existing.setP256dh(req.p256dh());
                    existing.setAuth(req.auth());
                    existing.setUserId(userId);
                    existing.setUserAgent(userAgent);
                },
                () -> pushSubscriptionRepository.save(PushSubscription.builder()
                    .tenantId(tenantId)
                    .userId(userId)
                    .endpoint(req.endpoint())
                    .p256dh(req.p256dh())
                    .auth(req.auth())
                    .userAgent(userAgent)
                    .build())
            );
    }

    @Transactional
    public void unsubscribe(Long tenantId, String endpoint) {
        pushSubscriptionRepository.deleteByTenantIdAndEndpoint(tenantId, endpoint);
    }

    private void sendPush(PushSubscription sub, String title, String body, String link, String type) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                "title", title,
                "body", body,
                "icon", "/favicon.ico",
                "badge", "/favicon.ico",
                "notificationType", type,
                "data", Map.of("url", link != null ? "/#" + link : "/")
            ));

            nl.martijndwars.webpush.Notification pushNotification =
                new nl.martijndwars.webpush.Notification(
                    sub.getEndpoint(), sub.getP256dh(), sub.getAuth(), payload);

            HttpResponse response = pushService.send(pushNotification);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode == 410 || statusCode == 404) {
                log.info("Push subscription expired ({}), removing: {}", statusCode, sub.getEndpoint());
                pushSubscriptionRepository.delete(sub);
            } else if (statusCode >= 400) {
                log.warn("Push delivery failed with status {}: {}", statusCode, sub.getEndpoint());
            }
        } catch (Exception e) {
            log.warn("Push delivery error for endpoint {}: {}", sub.getEndpoint(), e.getMessage());
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
            n.getId(), n.getTitle(), n.getDescription(),
            n.getType(), n.isRead(), n.getLink(), n.getCreatedAt()
        );
    }
}
