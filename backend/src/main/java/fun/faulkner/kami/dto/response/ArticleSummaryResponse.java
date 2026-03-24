package fun.faulkner.kami.dto.response;

public record ArticleSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary
) {
}
