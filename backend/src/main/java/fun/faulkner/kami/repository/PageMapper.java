package fun.faulkner.kami.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import fun.faulkner.kami.entity.PageEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PageMapper extends BaseMapper<PageEntity> {
}
