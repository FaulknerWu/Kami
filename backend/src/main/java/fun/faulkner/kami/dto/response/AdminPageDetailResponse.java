package fun.faulkner.kami.dto.response;

import fun.faulkner.kami.enums.PageStatus;

import java.time.LocalDateTime;

public record AdminPageDetailResponse(
        Long id,
        String slug,
        String title,
        String summary,
        String coverImage,
        String contentMarkdown,
        String seoTitle,
        String seoDescription,
        PageStatus status,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
