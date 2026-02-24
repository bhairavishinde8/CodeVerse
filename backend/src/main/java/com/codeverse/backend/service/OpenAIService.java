package com.codeverse.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OpenAIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${huggingface.api.url}")
    private String apiUrl;

    @Value("${huggingface.api.token}")
    private String apiToken;

    @Value("${huggingface.api.model}")
    private String modelName;

    public OpenAIService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public Mono<String> explainCode(String codeSnippet) {
        if (apiToken == null || apiToken.isEmpty()) {
            return Mono.error(new IllegalStateException("Hugging Face API token not configured"));
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "You are a helpful assistant that explains code."),
                Map.of("role", "user", "content", "Explain this code:\n" + codeSnippet)
        ));
        requestBody.put("max_tokens", 500);
        requestBody.put("temperature", 0.7);

        return makeRequest(requestBody);
    }

    public Mono<String> summarizeRepository(String readmeContent, List<String> fileStructure, String mode, String length, String languageLevel) {
        if (apiToken == null || apiToken.isEmpty()) {
            return Mono.error(new IllegalStateException("Hugging Face API token not configured"));
        }

        String truncatedReadme = readmeContent.length() > 4000 ? readmeContent.substring(0, 4000) + "..." : readmeContent;
        String fileList = String.join("\n", fileStructure.subList(0, Math.min(fileStructure.size(), 60)));

        boolean isBulletMode = "bullet".equalsIgnoreCase(mode);

        // Define strict JSON structure based on mode
        String jsonStructure = isBulletMode ?
                """
                {
                  "overview": "String (Brief summary)",
                  "key_features": ["Feature 1", "Feature 2", ...],
                  "technologies": ["Tech 1", "Tech 2", ...],
                  "main_modules": ["Module 1", "Module 2", ...],
                  "how_it_works": ["Step 1", "Step 2", ...],
                  "future_improvements": ["Improvement 1", "Improvement 2", ...]
                }
                """ :
                """
                {
                  "overview": "String (Complete paragraph)",
                  "key_features": "String (Complete paragraph listing features)",
                  "technologies": "String (Complete paragraph listing tech)",
                  "main_modules": "String (Complete paragraph explaining modules)",
                  "how_it_works": "String (Complete paragraph explaining flow)",
                  "future_improvements": "String (Complete paragraph)"
                }
                """;

        String lengthInstruction = switch (length.toLowerCase()) {
            case "short" -> "Keep it concise.";
            case "long" -> "Provide detailed explanations.";
            default -> "Provide standard detail.";
        };

        String toneInstruction = switch (languageLevel.toLowerCase()) {
            case "beginner" -> "Explain like I'm 5 years old. Avoid jargon. Use simple analogies.";
            case "technical" -> "Use professional technical terminology. Focus on architecture and implementation details.";
            default -> "Use standard developer-friendly language.";
        };

        String prompt = String.format("""
                Analyze this GitHub repository and generate a structured summary.
                
                CONTEXT:
                README: %s
                FILES: %s
                
                INSTRUCTIONS:
                1. Mode: %s
                2. Length: %s
                3. Tone/Level: %s
                4. OUTPUT FORMAT: Return ONLY a valid JSON object matching the structure below. Do NOT wrap in markdown code blocks.
                
                REQUIRED JSON STRUCTURE:
                %s
                """, truncatedReadme, fileList, mode, lengthInstruction, toneInstruction, jsonStructure);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "You are a technical documentation expert. You strictly output valid JSON."),
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("max_tokens", 1500);
        requestBody.put("temperature", 0.3);

        return makeRequest(requestBody);
    }

    public Mono<String> analyzeFile(String fileContent, String languageLevel) {
        if (apiToken == null || apiToken.isEmpty()) {
            return Mono.error(new IllegalStateException("Hugging Face API token not configured"));
        }

        String toneInstruction = switch (languageLevel.toLowerCase()) {
            case "beginner" -> "Explain like I'm a complete beginner. Use simple analogies.";
            case "technical" -> "Provide a deep, technical analysis for an expert developer.";
            default -> "Provide a standard, developer-friendly explanation.";
        };

        String prompt = String.format("""
            Analyze the following code file and generate a structured analysis.
            
            CODE:
            ```
            %s
            ```
            
            INSTRUCTIONS:
            1. Tone/Level: %s
            2. OUTPUT FORMAT: Return ONLY a valid JSON object. Do not include markdown.
            
            REQUIRED JSON STRUCTURE:
            {
              "explanation": {
                "overview": "String (What this file does)",
                "key_logic": "String (Explain the main business logic)",
                "code_flow": "String (Describe the step-by-step execution flow)"
              },
              "comments": [
                { 
                  "line": "Int (Approximate line number)", 
                  "code_snippet": "String (Exact code snippet being explained)",
                  "comment": "String (Explanation)" 
                }
              ],
              "insights": {
                "best_practices": ["String (List of best practices followed)"],
                "possible_improvements": ["String (List of suggestions for improvement)"],
                "complexity": "String (e.g., Low, Medium, High)"
              }
            }
            """, fileContent, toneInstruction);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "You are a senior software engineer who analyzes code files. You strictly output valid JSON."),
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("max_tokens", 2000);
        requestBody.put("temperature", 0.2);

        return makeRequest(requestBody);
    }

    public Mono<String> findBugsInFile(String fileContent, String languageLevel) {
        if (apiToken == null || apiToken.isEmpty()) {
            return Mono.error(new IllegalStateException("Hugging Face API token not configured"));
        }

        String toneInstruction = switch (languageLevel.toLowerCase()) {
            case "beginner" -> "Explain bugs in very simple terms, as if for a first-time coder.";
            case "technical" -> "Provide a deep, technical analysis of the bug, including potential memory or performance impacts.";
            default -> "Provide a standard, developer-friendly explanation of the bug.";
        };

        String prompt = String.format("""
            [INST] You are an expert static analysis tool. Your task is to find critical bugs in the provided code that would cause a runtime error if not corrected.
            
            CODE:
            ```
            %s
            ```
            
            INSTRUCTIONS:
            1. Focus ONLY on critical bugs like Null Pointer Exceptions, Index Out of Bounds, Type Mismatches, or unhandled exceptions.
            2. For each bug found, provide the exact line of code as a snippet.
            3. If no critical bugs are found, return an empty array.
            4. OUTPUT FORMAT: Return ONLY a valid JSON array of objects. Do not include markdown.
            
            REQUIRED JSON STRUCTURE:
            [
              {
                "line": "Int (Your best guess for the line number)",
                "code_snippet": "String (The exact line of code containing the bug)",
                "type": "String (A short, descriptive bug category, e.g., 'Null Pointer Risk')",
                "severity": "String ('High', 'Medium', or 'Low')",
                "explanation": "String (A beginner-friendly explanation of why this is a bug)",
                "suggestion": "String (A concrete code suggestion on how to fix the bug)"
              }
            ]
            [/INST]
            """, fileContent, toneInstruction);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "You are a code analysis expert. You strictly output valid JSON."),
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("max_tokens", 2000);
        requestBody.put("temperature", 0.1);

        return makeRequest(requestBody);
    }

    private Mono<String> makeRequest(Map<String, Object> requestBody) {
        return webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiToken)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    if (response.containsKey("choices")) {
                        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                        if (choices != null && !choices.isEmpty()) {
                            Map<String, Object> choice = choices.get(0);
                            if (choice.containsKey("message")) {
                                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                                return (String) message.get("content");
                            }
                        }
                    }
                    return "{}";
                })
                .onErrorResume(WebClientResponseException.class, e -> {
                    System.err.println("Hugging Face API Error: " + e.getStatusCode() + " " + e.getResponseBodyAsString());
                    return Mono.just("{\"error\": \"API Error: " + e.getStatusCode() + "\"}");
                })
                .onErrorResume(e -> {
                    System.err.println("Error calling Hugging Face API: " + e.getMessage());
                    return Mono.just("{\"error\": \"Failed to generate response.\"}");
                });
    }
}
