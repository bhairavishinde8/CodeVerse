package com.codeverse.backend.controller;

import com.codeverse.backend.service.GitHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class RepoController {

    private final GitHubService gitHubService;

    @Autowired
    public RepoController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @GetMapping("/repo")
    public ResponseEntity<?> getRepo(@RequestParam("url") String repoUrl) {
        if (repoUrl == null || repoUrl.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Repository URL is required"));
        }

        try {
            Map<String, Object> repoData = gitHubService.fetchRepoStructure(repoUrl);
            return ResponseEntity.ok(repoData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch repository structure: " + e.getMessage()));
        }
    }

    @GetMapping("/repo/content")
    public Mono<ResponseEntity<Map<String, String>>> getFileContent(
            @RequestParam String owner,
            @RequestParam String repo,
            @RequestParam String branch,
            @RequestParam String path) {

        return gitHubService.fetchFileContent(owner, repo, branch, path)
                .map(content -> ResponseEntity.ok(Map.of("content", content)))
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch file content"))
                ));
    }

    @PostMapping("/repo/summarize")
    public Mono<ResponseEntity<Map<String, String>>> summarizeRepo(@RequestBody Map<String, String> request) {
        String repoUrl = request.get("repoUrl");
        String mode = request.getOrDefault("mode", "paragraph");
        String length = request.getOrDefault("length", "medium");

        if (repoUrl == null || repoUrl.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "Repository URL is required")));
        }

        return gitHubService.summarizeRepo(repoUrl, mode, length)
                .map(summary -> ResponseEntity.ok(Map.of("summary", summary)))
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.internalServerError().body(Map.of("error", "Failed to summarize repository: " + e.getMessage()))
                ));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }
}
