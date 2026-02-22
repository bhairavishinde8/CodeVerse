package com.codeverse.backend.service;

import com.codeverse.backend.model.RepoRequest;
import com.codeverse.backend.repository.RepoRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GitHubService {

    private final WebClient webClient;
    private final RepoRequestRepository repoRequestRepository;
    private final OpenAIService openAIService;

    @Value("${github.api.token:}") // Optional token
    private String githubToken;

    @Autowired
    public GitHubService(WebClient.Builder webClientBuilder, RepoRequestRepository repoRequestRepository, OpenAIService openAIService) {
        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
        this.repoRequestRepository = repoRequestRepository;
        this.openAIService = openAIService;
    }

    public Map<String, Object> fetchRepoStructure(String repoUrl) {
        String[] ownerRepo = extractOwnerRepo(repoUrl);
        if (ownerRepo == null) {
            throw new IllegalArgumentException("Invalid GitHub repository URL");
        }

        String owner = ownerRepo[0];
        String repo = ownerRepo[1];

        // Save request to MongoDB
        RepoRequest request = new RepoRequest();
        request.setRepoUrl(repoUrl);
        request.setOwner(owner);
        request.setRepoName(repo);
        request.setRequestTime(LocalDateTime.now());
        repoRequestRepository.save(request);

        try {
            // 1. Get Repo Info (for default branch)
            Map repoInfo = webClient.get()
                    .uri("/repos/{owner}/{repo}", owner, repo)
                    .headers(h -> {
                        if (githubToken != null && !githubToken.isEmpty()) {
                            h.setBearerAuth(githubToken);
                        }
                    })
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (repoInfo == null) {
                throw new RuntimeException("Repository not found");
            }

            String defaultBranch = (String) repoInfo.getOrDefault("default_branch", "main");

            // 2. Get Tree (Recursive)
            Map treeData = webClient.get()
                    .uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", owner, repo, defaultBranch)
                    .headers(h -> {
                        if (githubToken != null && !githubToken.isEmpty()) {
                            h.setBearerAuth(githubToken);
                        }
                    })
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (treeData == null || !treeData.containsKey("tree")) {
                throw new RuntimeException("Failed to fetch repository tree");
            }

            List<Map<String, Object>> rawTree = (List<Map<String, Object>>) treeData.get("tree");
            List<Map<String, String>> structure = rawTree.stream()
                    .map(item -> {
                        Map<String, String> node = new HashMap<>();
                        node.put("path", (String) item.get("path"));
                        String type = (String) item.get("type");
                        node.put("type", "tree".equals(type) ? "dir" : "file");
                        return node;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("repo_name", repo);
            response.put("owner", owner);
            response.put("repo_url", "https://github.com/" + owner + "/" + repo);
            response.put("default_branch", defaultBranch);
            response.put("structure", structure);

            return response;

        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new IllegalArgumentException("Repository not found");
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new RuntimeException("Access denied or rate limit exceeded");
            }
            throw new RuntimeException("GitHub API error: " + e.getMessage());
        }
    }

    public Mono<String> fetchFileContent(String owner, String repo, String branch, String path) {
        String rawUrl = String.format("https://raw.githubusercontent.com/%s/%s/%s/%s", owner, repo, branch, path);
        return WebClient.create(rawUrl)
                .get()
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(e -> Mono.just("⚠️ Error fetching file: " + e.getMessage()));
    }

    public Mono<String> summarizeRepo(String repoUrl, String mode, String length) {
        String[] ownerRepo = extractOwnerRepo(repoUrl);
        if (ownerRepo == null) {
            return Mono.error(new IllegalArgumentException("Invalid GitHub repository URL"));
        }
        String owner = ownerRepo[0];
        String repo = ownerRepo[1];

        return webClient.get()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .headers(h -> {
                    if (githubToken != null && !githubToken.isEmpty()) {
                        h.setBearerAuth(githubToken);
                    }
                })
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(repoInfo -> {
                    String defaultBranch = (String) repoInfo.getOrDefault("default_branch", "main");
                    Mono<String> readmeMono = fetchFileContent(owner, repo, defaultBranch, "README.md")
                            .onErrorReturn("No README found.");

                    Mono<List<String>> structureMono = webClient.get()
                            .uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", owner, repo, defaultBranch)
                            .headers(h -> {
                                if (githubToken != null && !githubToken.isEmpty()) {
                                    h.setBearerAuth(githubToken);
                                }
                            })
                            .retrieve()
                            .bodyToMono(Map.class)
                            .map(treeData -> {
                                List<Map<String, Object>> rawTree = (List<Map<String, Object>>) treeData.get("tree");
                                return rawTree.stream()
                                        .map(item -> (String) item.get("path"))
                                        .collect(Collectors.toList());
                            });

                    return Mono.zip(readmeMono, structureMono)
                            .flatMap(tuple -> openAIService.summarizeRepository(tuple.getT1(), tuple.getT2(), mode, length));
                });
    }

    public String[] extractOwnerRepo(String url) {
        try {
            URI uri = new URI(url);
            String path = uri.getPath();
            if (path.startsWith("/")) {
                path = path.substring(1);
            }
            String[] parts = path.split("/");
            if (parts.length >= 2) {
                return new String[]{parts[0], parts[1].replace(".git", "")};
            }
        } catch (URISyntaxException e) {
            return null;
        }
        return null;
    }
}
