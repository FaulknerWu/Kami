package fun.faulkner.kami.dto.response;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        long page,
        long size,
        long total,
        long totalPages
) {
    public PageResponse {
        items = items == null ? List.of() : List.copyOf(items);
    }
}
