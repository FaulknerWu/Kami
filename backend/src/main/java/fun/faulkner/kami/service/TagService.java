package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import fun.faulkner.kami.dto.request.CreateTagRequest;
import fun.faulkner.kami.dto.request.UpdateTagRequest;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.exception.ResourceNotFoundException;
import fun.faulkner.kami.repository.ArticleTagMapper;
import fun.faulkner.kami.repository.TagMapper;
import fun.faulkner.kami.repository.projection.ArticleTagRelation;
import fun.faulkner.kami.repository.projection.TagArticleCount;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TagService {
    private final TagMapper tagMapper;
    private final ArticleTagMapper articleTagMapper;

    public TagService(TagMapper tagMapper, ArticleTagMapper articleTagMapper) {
        this.tagMapper = tagMapper;
        this.articleTagMapper = articleTagMapper;
    }

    public List<TagEntity> listTags() {
        LambdaQueryWrapper<TagEntity> tagQuery = new LambdaQueryWrapper<>();
        tagQuery.orderByAsc(TagEntity::getName);
        return tagMapper.selectList(tagQuery);
    }

    public List<TagEntity> listTagsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        return tagMapper.selectByIds(ids);
    }

    public Map<Long, Long> countPublishedArticlesByTag() {
        List<TagArticleCount> counts = tagMapper.countPublishedArticlesByTag();
        if (counts.isEmpty()) {
            return Map.of();
        }

        Map<Long, Long> articleCountMap = new HashMap<>();
        for (TagArticleCount count : counts) {
            articleCountMap.put(count.tagId(), count.articleCount());
        }

        return articleCountMap;
    }

    public TagEntity getTagById(Long id) {
        TagEntity tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new ResourceNotFoundException("Tag not found, id=" + id);
        }
        return tag;
    }

    public Map<Long, List<TagEntity>> listTagsGroupedByArticleIds(List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) {
            return Map.of();
        }

        List<ArticleTagRelation> relations = articleTagMapper.selectByArticleIds(articleIds);
        if (relations == null || relations.isEmpty()) {
            return Map.of();
        }

        List<Long> tagIds = relations.stream()
                .map(ArticleTagRelation::tagId)
                .distinct()
                .toList();

        List<TagEntity> tags = tagMapper.selectByIds(tagIds);

        Map<Long, TagEntity> tagMap = new HashMap<>();
        for (TagEntity tag : tags) {
            tagMap.put(tag.getId(), tag);
        }

        Map<Long, List<TagEntity>> tagsByArticleId = new HashMap<>();
        for (ArticleTagRelation relation : relations) {
            Long articleId = relation.articleId();
            Long tagId = relation.tagId();

            TagEntity tag = tagMap.get(tagId);
            if (tag == null) {
                continue;
            }

            tagsByArticleId
                    .computeIfAbsent(articleId, _ -> new ArrayList<>())
                    .add(tag);
        }

        return tagsByArticleId;
    }

    public TagEntity createTag(CreateTagRequest request) {
        ensureTagSlugAvailable(request.slug(), null);
        ensureTagNameAvailable(request.name(), null);

        TagEntity tag = new TagEntity();
        tag.setName(request.name());
        tag.setSlug(request.slug());

        tagMapper.insert(tag);
        return tag;
    }

    public TagEntity updateTag(Long id, UpdateTagRequest request) {
        TagEntity tag = getTagById(id);
        ensureTagSlugAvailable(request.slug(), id);
        ensureTagNameAvailable(request.name(), id);

        tag.setName(request.name());
        tag.setSlug(request.slug());

        tagMapper.updateById(tag);
        return tag;
    }

    public void deleteTag(Long id) {
        TagEntity tag = getTagById(id);
        tagMapper.deleteById(tag.getId());
    }

    private void ensureTagSlugAvailable(String slug, Long excludedTagId) {
        TagEntity existingTag = findTagBySlug(slug);
        if (existingTag != null && !existingTag.getId().equals(excludedTagId)) {
            throw new IllegalArgumentException("Tag slug already exists: " + slug);
        }
    }

    private void ensureTagNameAvailable(String name, Long excludedTagId) {
        TagEntity existingTag = findTagByName(name);
        if (existingTag != null && !existingTag.getId().equals(excludedTagId)) {
            throw new IllegalArgumentException("Tag name already exists: " + name);
        }
    }

    private TagEntity findTagBySlug(String slug) {
        LambdaQueryWrapper<TagEntity> tagQuery = new LambdaQueryWrapper<>();
        tagQuery.eq(TagEntity::getSlug, slug);
        return tagMapper.selectOne(tagQuery);
    }

    private TagEntity findTagByName(String name) {
        LambdaQueryWrapper<TagEntity> tagQuery = new LambdaQueryWrapper<>();
        tagQuery.eq(TagEntity::getName, name);
        return tagMapper.selectOne(tagQuery);
    }
}
