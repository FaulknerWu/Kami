package fun.faulkner.kami.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank
        @Size(max = 50)
        String name,

        @NotBlank
        @Size(max = 50)
        String slug,

        @Size(max = 255)
        String description,

        @NotNull
        Integer sortOrder
) {
}
