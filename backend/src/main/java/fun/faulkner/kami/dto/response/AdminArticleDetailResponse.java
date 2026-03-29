package fun.faulkner.kami.dto.response;

import fun.faulkner.kami.enums.ArticleStatus;

import java.time.LocalDateTime;
import java.util.List;

public record AdminArticleDetailResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String coverImage,
        Integer wordCount,
        Integer readingTimeMinutes,
        ArticleStatus status,
        CategoryResponse category,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<TagResponse> tags
) {
    public AdminArticleDetailResponse {
        tags = tags == null ? List.of() : List.copyOf(tags);
    }
}
