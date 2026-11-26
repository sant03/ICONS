package com.plastyfreddy.icons.notifications;

import com.plastyfreddy.icons.notifications.dto.NotificationResponse;
import com.plastyfreddy.icons.notifications.dto.PushSubscriptionRequest;
import com.plastyfreddy.icons.notifications.dto.PushUnsubscribeRequest;
import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import com.plastyfreddy.icons.shared.web.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final WebPushProperties webPushProperties;

    @GetMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public PageResponse<NotificationResponse> list(
            @RequestParam(required = false) String filter,
            Pageable pageable) {
        return PageResponse.from(notificationService.list(filter, pageable));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public Map<String, Long> unreadCount() {
        return Map.of("count", notificationService.unreadCount());
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public void delete(@PathVariable Long id) {
        notificationService.delete(id);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public void clearAll() {
        notificationService.clearAll();
    }

    // ── Push Notification Endpoints (any authenticated user) ──

    @PostMapping("/push/subscribe")
    @ResponseStatus(HttpStatus.CREATED)
    public void subscribe(@Valid @RequestBody PushSubscriptionRequest request,
                          HttpServletRequest httpRequest) {
        Long tenantId = TenantContext.require();
        Long userId = CurrentUser.getUserId();
        String userAgent = httpRequest.getHeader("User-Agent");
        notificationService.subscribe(tenantId, userId, request, userAgent);
    }

    @PostMapping("/push/unsubscribe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unsubscribe(@Valid @RequestBody PushUnsubscribeRequest request) {
        Long tenantId = TenantContext.require();
        notificationService.unsubscribe(tenantId, request.endpoint());
    }

    @GetMapping("/push/vapid-key")
    public Map<String, String> vapidKey() {
        return Map.of("publicKey", webPushProperties.getPublicKey());
    }
}
