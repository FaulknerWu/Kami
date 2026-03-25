package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import fun.faulkner.kami.dto.request.CreateTagRequest;
import fun.faulkner.kami.dto.request.UpdateTagRequest;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.repository.ArticleTagMapper;
import fun.faulkner.kami.repository.TagMapper;
import fun.faulkner.kami.repository.projection.ArticleTagRelation;
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
        LambdaQueryWrapper<TagEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByAsc(TagEntity::getName);
        return tagMapper.selectList(queryWrapper);
    }

    public List<TagEntity> listTagsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        return tagMapper.selectByIds(ids);
    }

    public TagEntity getTagById(Long id) {
        TagEntity tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new IllegalArgumentException("Tag not found, id=" + id);
        }
        return tag;
    }

    public Map<Long, List<TagEntity>> getTagByArticleIds(List<Long> articleIds) {
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

        Map<Long, List<TagEntity>> tagByArticleIdsMap = new HashMap<>();
        for (ArticleTagRelation relation : relations) {
            Long articleId = relation.articleId();
            Long tagId = relation.tagId();

            TagEntity tag = tagMap.get(tagId);
            if (tag == null) {
                continue;
            }

            tagByArticleIdsMap
                    .computeIfAbsent(articleId, ignored -> new ArrayList<>())
                    .add(tag);
        }

        return tagByArticleIdsMap;
    }

    public TagEntity createTag(CreateTagRequest request) {
        LambdaQueryWrapper<TagEntity> slugQueryWrapper = new LambdaQueryWrapper<>();
        slugQueryWrapper.eq(TagEntity::getSlug, request.slug());

        TagEntity existingTagBySlug = tagMapper.selectOne(slugQueryWrapper);
        if (existingTagBySlug != null) {
            throw new IllegalArgumentException("Tag slug already exists: " + request.slug());
        }

        LambdaQueryWrapper<TagEntity> nameQueryWrapper = new LambdaQueryWrapper<>();
        nameQueryWrapper.eq(TagEntity::getName, request.name());

        TagEntity existingTagByName = tagMapper.selectOne(nameQueryWrapper);
        if (existingTagByName != null) {
            throw new IllegalArgumentException("Tag name already exists: " + request.name());
        }

        TagEntity tag = new TagEntity();
        tag.setName(request.name());
        tag.setSlug(request.slug());

        tagMapper.insert(tag);
        return tag;
    }

    public TagEntity updateTag(Long id, UpdateTagRequest request) {
        TagEntity tag = getTagById(id);

        LambdaQueryWrapper<TagEntity> slugQueryWrapper = new LambdaQueryWrapper<>();
        slugQueryWrapper.eq(TagEntity::getSlug, request.slug());

        TagEntity existingTagBySlug = tagMapper.selectOne(slugQueryWrapper);
        if (existingTagBySlug != null && !existingTagBySlug.getId().equals(id)) {
            throw new IllegalArgumentException("Tag slug already exists: " + request.slug());
        }

        LambdaQueryWrapper<TagEntity> nameQueryWrapper = new LambdaQueryWrapper<>();
        nameQueryWrapper.eq(TagEntity::getName, request.name());

        TagEntity existingTagByName = tagMapper.selectOne(nameQueryWrapper);
        if (existingTagByName != null && !existingTagByName.getId().equals(id)) {
            throw new IllegalArgumentException("Tag name already exists: " + request.name());
        }

        tag.setName(request.name());
        tag.setSlug(request.slug());

        tagMapper.updateById(tag);
        return tag;
    }

    public void deleteTag(Long id) {
        TagEntity tag = getTagById(id);
        tagMapper.deleteById(tag.getId());
    }
}
