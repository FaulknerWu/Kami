package fun.faulkner.kami.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import fun.faulkner.kami.model.ArticleEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ArticleMapper extends BaseMapper<ArticleEntity> {


}
