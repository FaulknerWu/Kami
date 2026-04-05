package fun.faulkner.kami.dto.response;

import java.time.LocalDateTime;

public record PublicPageResponse(
        String slug,
        String title,
        String summary,
        String coverImage,
        String contentMarkdown,
        String seoTitle,
        String seoDescription,
        LocalDateTime publishedAt
) {
}
