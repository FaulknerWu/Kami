package fun.faulkner.kami.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record PostDetailResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String coverImage,
        Integer wordCount,
        Integer readingTimeMinutes,
        LocalDateTime publishedAt,
        CategoryResponse category,
        List<TagResponse> tags
) {
    public PostDetailResponse {
        tags = tags == null ? List.of() : List.copyOf(tags);
    }
}
