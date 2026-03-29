package fun.faulkner.kami.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SiteContactItemRequest(
        @NotBlank
        @Size(max = 50)
        String type,

        @NotBlank
        @Size(max = 100)
        String label,

        @Size(max = 255)
        String value,

        @Size(max = 500)
        String url,

        @NotNull
        Integer sortOrder,

        @NotNull
        Boolean isPublic
) {
}
