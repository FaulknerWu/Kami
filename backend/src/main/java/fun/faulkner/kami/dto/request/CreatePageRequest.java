package fun.faulkner.kami.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import fun.faulkner.kami.enums.PageRenderMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePageRequest(
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

        @NotNull
        PageRenderMode renderMode,

        String contentMarkdown,

        JsonNode payload,

        @Size(max = 255)
        String seoTitle,

        @Size(max = 500)
        String seoDescription
) {
}
