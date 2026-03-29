package fun.faulkner.kami.dto.response;

import java.util.List;

public record PublicSiteProfileResponse(
        Long id,
        String siteName,
        String heroTitle,
        String heroTagline,
        String authorName,
        String authorBio,
        String avatarUrl,
        String coverImageUrl,
        String canonicalBaseUrl,
        String defaultShareImageUrl,
        List<SiteContactResponse> contacts
) {
    public PublicSiteProfileResponse {
        contacts = contacts == null ? List.of() : List.copyOf(contacts);
    }
}
