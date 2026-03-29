package fun.faulkner.kami.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateSiteContactsRequest(
        @NotNull
        List<@Valid SiteContactItemRequest> contacts
) {
    public UpdateSiteContactsRequest {
        contacts = contacts == null ? List.of() : List.copyOf(contacts);
    }
}
