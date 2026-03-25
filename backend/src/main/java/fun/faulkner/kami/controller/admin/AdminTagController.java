package fun.faulkner.kami.controller.admin;

import fun.faulkner.kami.dto.request.CreateTagRequest;
import fun.faulkner.kami.dto.request.UpdateTagRequest;
import fun.faulkner.kami.dto.response.TagResponse;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.service.TagService;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequestMapping("/api/admin/tags")
@RestController
public class AdminTagController {
    private final TagService tagService;

    public AdminTagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<TagResponse> listTags() {
        List<TagEntity> tags = tagService.listTags();
        return tags.stream().map(this::toTagResponse).toList();
    }

    @PostMapping
    public TagResponse createTag(@RequestBody @Valid CreateTagRequest request) {
        TagEntity tag = tagService.createTag(request);
        return toTagResponse(tag);
    }

    @PutMapping("/{id}")
    public TagResponse updateTag(@PathVariable Long id, @RequestBody @Valid UpdateTagRequest request) {
        TagEntity tag = tagService.updateTag(id, request);
        return toTagResponse(tag);
    }

    @DeleteMapping("/{id}")
    public void deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
    }

    private TagResponse toTagResponse(TagEntity tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getSlug()
        );
    }
}
