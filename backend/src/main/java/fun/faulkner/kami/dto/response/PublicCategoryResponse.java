package fun.faulkner.kami.dto.response;

public record PublicCategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        Integer sortOrder,
        long articleCount
) {
}
