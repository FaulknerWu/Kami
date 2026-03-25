package fun.faulkner.kami.dto.response;

import java.util.List;

public record ArticleSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String status,
        CategoryResponse category,
        List<TagResponse> tags
) {
}
