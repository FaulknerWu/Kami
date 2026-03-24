package fun.faulkner.kami.dto.response;

import java.time.LocalDateTime;

public record AdminArticleDetailResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String coverImage,
        String status,
        Long categoryId,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
