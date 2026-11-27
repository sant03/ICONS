package com.plastyfreddy.icons.notifications;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plastyfreddy.icons.notifications.domain.PushSubscription;
import com.plastyfreddy.icons.notifications.domain.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PushSenderService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final PushService pushService;
    private final ObjectMapper objectMapper;

    @Async
    public void sendPushAsync(Long tenantId, Long userId,
                              String title, String description, String link, String type) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository
            .findByTenantIdAndUserId(tenantId, userId);

        for (PushSubscription sub : subscriptions) {
            sendPush(sub, title, description, link, type);
        }
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
}
