package fun.faulkner.kami.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record AdminArticleDetailResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String coverImage,
        String status,
        CategoryResponse category,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<TagResponse> tags
) {
}
