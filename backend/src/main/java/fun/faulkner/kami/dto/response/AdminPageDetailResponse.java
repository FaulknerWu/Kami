package fun.faulkner.kami.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import fun.faulkner.kami.enums.PageRenderMode;
import fun.faulkner.kami.enums.PageStatus;

import java.time.LocalDateTime;

public record AdminPageDetailResponse(
        Long id,
        String slug,
        String title,
        String summary,
        String coverImage,
        PageRenderMode renderMode,
        String contentMarkdown,
        JsonNode payload,
        String seoTitle,
        String seoDescription,
        PageStatus status,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
