package fun.faulkner.kami.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import fun.faulkner.kami.entity.SiteProfileEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SiteProfileMapper extends BaseMapper<SiteProfileEntity> {
}
