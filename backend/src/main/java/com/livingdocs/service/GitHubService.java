package com.livingdocs.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class GitHubService {

    private final WebClient githubWebClient;

    public GitHubService(WebClient githubWebClient) {
        this.githubWebClient = githubWebClient;
    }

    public Mono<String> fetchRepo(String owner, String repo) {
        return githubWebClient.get()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .retrieve()
                .bodyToMono(String.class);
    }

    public Mono<String> fetchCommits(String owner, String repo) {
        return githubWebClient.get()
                .uri("/repos/{owner}/{repo}/commits", owner, repo)
                .retrieve()
                .bodyToMono(String.class);
    }

    public Mono<String> fetchPulls(String owner, String repo) {
        return githubWebClient.get()
                .uri("/repos/{owner}/{repo}/pulls?state=all", owner, repo)
                .retrieve()
                .bodyToMono(String.class);
    }
}
