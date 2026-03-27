package fun.faulkner.kami.repository.projection;

public record TagArticleCount(
        Long tagId,
        long articleCount
) {
}
