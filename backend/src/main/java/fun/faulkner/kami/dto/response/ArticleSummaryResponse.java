package fun.faulkner.kami.dto.response;

import fun.faulkner.kami.enums.ArticleStatus;

import java.util.List;

public record ArticleSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        ArticleStatus status,
        CategoryResponse category,
        List<TagResponse> tags
) {
    public ArticleSummaryResponse {
        tags = tags == null ? List.of() : List.copyOf(tags);
    }
}
