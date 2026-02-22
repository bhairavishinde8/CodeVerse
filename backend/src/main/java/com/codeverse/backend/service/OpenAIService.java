package com.codeverse.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private final WebClient webClient;

    @Value("${openai.api.key:}")
    private String apiKey;

    public OpenAIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.openai.com/v1").build();
    }

    public Mono<String> explainCode(String codeSnippet) {
        if (apiKey == null || apiKey.isEmpty()) {
            return Mono.error(new IllegalStateException("OpenAI API key not configured"));
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "You are a helpful assistant that explains code."),
                Map.of("role", "user", "content", "Explain this code:\n" + codeSnippet)
        ));

        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                    return "No explanation available.";
                });
    }
}
