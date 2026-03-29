package fun.faulkner.kami.dto.response;

public record SiteProfileResponse(
        Long id,
        String siteName,
        String heroTitle,
        String heroTagline,
        String authorName,
        String authorBio,
        String avatarUrl,
        String coverImageUrl,
        String canonicalBaseUrl,
        String defaultShareImageUrl
) {
}
