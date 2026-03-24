package fun.faulkner.kami.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateArticleRequest(
        @NotBlank
        @Size(max = 255)
        String title,

        @NotBlank
        @Size(max = 50)
        String slug,

        @NotBlank
        @Size(max = 500)
        String summary,

        @NotBlank
        String content,

        @Size(max = 500)
        String coverImage,

        Long categoryId
) {
}