package fun.faulkner.kami.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import fun.faulkner.kami.enums.PageRenderMode;

import java.time.LocalDateTime;

public record PublicPageResponse(
        String slug,
        String title,
        String summary,
        String coverImage,
        PageRenderMode renderMode,
        String contentMarkdown,
        JsonNode payload,
        String seoTitle,
        String seoDescription,
        LocalDateTime publishedAt
) {
}
