package com.livingdocs.repository;

import com.livingdocs.model.ChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChangeLogRepository extends JpaRepository<ChangeLog, Long> {
    List<ChangeLog> findByDocumentIdOrderByTimestampDesc(Long documentId);
}