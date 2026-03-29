package fun.faulkner.kami.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSiteProfileRequest(
        @NotBlank
        @Size(max = 100)
        String siteName,

        @Size(max = 255)
        String heroTitle,

        @Size(max = 255)
        String heroTagline,

        @NotBlank
        @Size(max = 100)
        String authorName,

        @Size(max = 500)
        String authorBio,

        @Size(max = 500)
        String avatarUrl,

        @Size(max = 500)
        String coverImageUrl,

        @Size(max = 255)
        String canonicalBaseUrl,

        @Size(max = 500)
        String defaultShareImageUrl
) {
}
