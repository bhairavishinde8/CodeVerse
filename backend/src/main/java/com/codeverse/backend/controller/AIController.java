package com.codeverse.backend.controller;

import com.codeverse.backend.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final OpenAIService openAIService;

    @Autowired
    public AIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/explain")
    public Mono<ResponseEntity<Map<String, String>>> explainCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "Code snippet is required")));
        }

        return openAIService.explainCode(code)
                .map(explanation -> ResponseEntity.ok(Map.of("explanation", explanation)))
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().body(Map.of("error", "Failed to get explanation: " + e.getMessage()))));
    }

    @PostMapping("/analyze-file")
    public Mono<ResponseEntity<Map<String, String>>> analyzeFile(@RequestBody Map<String, String> request) {
        String fileContent = request.get("fileContent");
        String languageLevel = request.getOrDefault("languageLevel", "standard");

        if (fileContent == null || fileContent.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "File content is required")));
        }

        return openAIService.analyzeFile(fileContent, languageLevel)
                .map(analysis -> ResponseEntity.ok(Map.of("analysis", analysis)))
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.internalServerError().body(Map.of("error", "Failed to analyze file: " + e.getMessage()))
                ));
    }

    @PostMapping("/find-bugs")
    public Mono<ResponseEntity<Map<String, String>>> findBugs(@RequestBody Map<String, String> request) {
        String fileContent = request.get("fileContent");
        String languageLevel = request.getOrDefault("languageLevel", "standard");

        if (fileContent == null || fileContent.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "File content is required")));
        }

        return openAIService.findBugsInFile(fileContent, languageLevel)
                .map(bugs -> ResponseEntity.ok(Map.of("bugs", bugs)))
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.internalServerError().body(Map.of("error", "Failed to find bugs: " + e.getMessage()))
                ));
    }
}
