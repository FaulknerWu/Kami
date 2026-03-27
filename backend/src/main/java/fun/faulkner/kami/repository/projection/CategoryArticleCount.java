package fun.faulkner.kami.repository.projection;

public record CategoryArticleCount(
        Long categoryId,
        long articleCount
) {
}
