package fun.faulkner.kami.dto.response;

public record SiteContactResponse(
        Long id,
        String type,
        String label,
        String value,
        String url,
        Integer sortOrder,
        Boolean isPublic
) {
}
