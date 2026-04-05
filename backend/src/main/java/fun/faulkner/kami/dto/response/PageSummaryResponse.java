package fun.faulkner.kami.dto.response;

import fun.faulkner.kami.enums.PageStatus;

import java.time.LocalDateTime;

public record PageSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        PageStatus status,
        LocalDateTime publishedAt,
        LocalDateTime updatedAt
) {
}
