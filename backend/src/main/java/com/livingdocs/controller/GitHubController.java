package com.livingdocs.controller;

import com.livingdocs.service.GitHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubService gitHubService;

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @GetMapping("/repo/{owner}/{repo}")
    public Mono<ResponseEntity<String>> getRepo(@PathVariable String owner, @PathVariable String repo) {
        return gitHubService.fetchRepo(owner, repo).map(ResponseEntity::ok);
    }

    @GetMapping("/commits/{owner}/{repo}")
    public Mono<ResponseEntity<String>> getCommits(@PathVariable String owner, @PathVariable String repo) {
        return gitHubService.fetchCommits(owner, repo).map(ResponseEntity::ok);
    }

    @GetMapping("/pulls/{owner}/{repo}")
    public Mono<ResponseEntity<String>> getPulls(@PathVariable String owner, @PathVariable String repo) {
        return gitHubService.fetchPulls(owner, repo).map(ResponseEntity::ok);
    }
}
