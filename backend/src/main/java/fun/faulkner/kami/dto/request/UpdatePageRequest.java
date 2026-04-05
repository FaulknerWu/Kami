package fun.faulkner.kami.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePageRequest(
        @NotBlank
        @Size(max = 100)
        String slug,

        @NotBlank
        @Size(max = 255)
        String title,

        @Size(max = 500)
        String summary,

        @Size(max = 500)
        String coverImage,

        String contentMarkdown,

        @Size(max = 255)
        String seoTitle,

        @Size(max = 500)
        String seoDescription
) {
}
