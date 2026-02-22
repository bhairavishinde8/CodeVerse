package com.codeverse.backend.repository;

import com.codeverse.backend.model.RepoRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoRequestRepository extends MongoRepository<RepoRequest, String> {
}
