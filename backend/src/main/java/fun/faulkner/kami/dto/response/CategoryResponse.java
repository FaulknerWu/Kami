package fun.faulkner.kami.dto.response;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        Integer sortOrder
) {
}
