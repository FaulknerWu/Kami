package fun.faulkner.kami.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import fun.faulkner.kami.entity.TagEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TagMapper extends BaseMapper<TagEntity>
{
}
