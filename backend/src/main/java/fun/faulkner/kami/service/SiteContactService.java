package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import fun.faulkner.kami.dto.request.SiteContactItemRequest;
import fun.faulkner.kami.entity.SiteContactEntity;
import fun.faulkner.kami.repository.SiteContactMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SiteContactService {
    private final SiteContactMapper siteContactMapper;

    public SiteContactService(SiteContactMapper siteContactMapper) {
        this.siteContactMapper = siteContactMapper;
    }

    public List<SiteContactEntity> listContacts() {
        return siteContactMapper.selectList(createOrderedContactQuery());
    }

    public List<SiteContactEntity> listPublicContacts() {
        LambdaQueryWrapper<SiteContactEntity> query = createOrderedContactQuery();
        query.eq(SiteContactEntity::getIsPublic, true);

        return siteContactMapper.selectList(query);
    }

    @Transactional
    public List<SiteContactEntity> replaceContacts(List<SiteContactItemRequest> contacts) {
        siteContactMapper.delete(new LambdaQueryWrapper<SiteContactEntity>());

        if (contacts == null || contacts.isEmpty()) {
            return List.of();
        }

        LocalDateTime now = LocalDateTime.now();
        for (SiteContactItemRequest contactRequest : contacts) {
            siteContactMapper.insert(createContactEntity(contactRequest, now));
        }

        return listContacts();
    }

    private LambdaQueryWrapper<SiteContactEntity> createOrderedContactQuery() {
        LambdaQueryWrapper<SiteContactEntity> query = new LambdaQueryWrapper<>();
        query.orderByAsc(SiteContactEntity::getSortOrder)
                .orderByAsc(SiteContactEntity::getId);
        return query;
    }

    private SiteContactEntity createContactEntity(SiteContactItemRequest request, LocalDateTime now) {
        SiteContactEntity contact = new SiteContactEntity();
        contact.setType(request.type());
        contact.setLabel(request.label());
        contact.setValue(request.value());
        contact.setUrl(request.url());
        contact.setSortOrder(request.sortOrder());
        contact.setIsPublic(request.isPublic());
        contact.setCreatedAt(now);
        contact.setUpdatedAt(now);
        return contact;
    }
}
