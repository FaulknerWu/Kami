package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import fun.faulkner.kami.dto.request.CreateTagRequest;
import fun.faulkner.kami.dto.request.UpdateTagRequest;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.repository.TagMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {
    private final TagMapper tagMapper;

    public TagService(TagMapper tagMapper) {
        this.tagMapper = tagMapper;
    }

    public List<TagEntity> listTags() {
        LambdaQueryWrapper<TagEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByAsc(TagEntity::getName);
        return tagMapper.selectList(queryWrapper);
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

    public TagEntity getTagById(Long id) {
        TagEntity tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new IllegalArgumentException("Tag not found, id=" + id);
        }
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
