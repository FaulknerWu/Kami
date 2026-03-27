package fun.faulkner.kami.dto.response;

public record PublicTagResponse(
        Long id,
        String name,
        String slug,
        long articleCount
) {
}
