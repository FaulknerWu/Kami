package fun.faulkner.kami.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.repository.projection.CategoryArticleCount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<CategoryEntity> {
    @Select("""
            SELECT
                c.id AS category_id,
                COUNT(a.id) AS article_count
            FROM category c
            LEFT JOIN article a
                ON a.category_id = c.id
                AND a.status = 'PUBLISHED'
            GROUP BY c.id, c.sort_order
            ORDER BY c.sort_order, c.id
            """)
    List<CategoryArticleCount> countPublishedArticlesByCategory();
}
