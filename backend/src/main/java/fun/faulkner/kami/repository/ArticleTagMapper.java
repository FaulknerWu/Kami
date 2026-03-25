package fun.faulkner.kami.repository;

import fun.faulkner.kami.repository.projection.ArticleTagRelation;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ArticleTagMapper {
    @Select("""
            SELECT tag_id
            FROM article_tag
            WHERE article_id = #{articleId}
            ORDER BY tag_id ASC
            """)
    List<Long> selectTagIdsByArticleId(@Param("articleId") Long articleId);

    @Delete("""
            DELETE FROM article_tag
            WHERE article_id = #{articleId}
            """)
    void deleteByArticleId(@Param("articleId") Long articleId);

    @Insert({
            "<script>",
            "INSERT INTO article_tag (article_id, tag_id) VALUES",
            "<foreach collection='tagIds' item='tagId' separator=','>",
            "(#{articleId}, #{tagId})",
            "</foreach>",
            "</script>"
    })
    void insertBatch(@Param("articleId") Long articleId, @Param("tagIds") List<Long> tagIds);

    @Select({
            "<script>",
            "SELECT article_id, tag_id",
            "FROM article_tag",
            "WHERE article_id IN",
            "<foreach collection='articleIds' item='articleId' open='(' separator=',' close=')'>",
            "#{articleId}",
            "</foreach>",
            "ORDER BY article_id ASC, tag_id ASC",
            "</script>"
    })
    List<ArticleTagRelation> selectByArticleIds(@Param("articleIds") List<Long> articleIds);
}
