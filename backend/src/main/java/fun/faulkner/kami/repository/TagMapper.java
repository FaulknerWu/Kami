package fun.faulkner.kami.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.repository.projection.TagArticleCount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TagMapper extends BaseMapper<TagEntity>
{
    @Select("""
            SELECT
                t.id AS tag_id,
                COUNT(a.id) AS article_count
            FROM tag t
            LEFT JOIN article_tag at
                ON at.tag_id = t.id
            LEFT JOIN article a
                ON a.id = at.article_id
                AND a.status = 'PUBLISHED'
            GROUP BY t.id
            ORDER BY t.name ASC, t.id ASC
            """)
    List<TagArticleCount> countPublishedArticlesByTag();
}
