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

    public List<SiteContactEntity> listPublicContacts() {
        LambdaQueryWrapper<SiteContactEntity> contactQuery = new LambdaQueryWrapper<>();
        contactQuery.eq(SiteContactEntity::getIsPublic, true)
                .orderByAsc(SiteContactEntity::getSortOrder)
                .orderByAsc(SiteContactEntity::getId);

        return siteContactMapper.selectList(contactQuery);
    }

    public List<SiteContactEntity> listAllContacts() {
        LambdaQueryWrapper<SiteContactEntity> contactQuery = new LambdaQueryWrapper<>();
        contactQuery.orderByAsc(SiteContactEntity::getSortOrder)
                .orderByAsc(SiteContactEntity::getId);

        return siteContactMapper.selectList(contactQuery);
    }

    @Transactional
    public List<SiteContactEntity> replaceContacts(List<SiteContactItemRequest> contacts) {
        siteContactMapper.delete(new LambdaQueryWrapper<SiteContactEntity>());

        if (contacts == null || contacts.isEmpty()) {
            return List.of();
        }

        LocalDateTime now = LocalDateTime.now();
        for (SiteContactItemRequest contactRequest : contacts) {
            SiteContactEntity contact = new SiteContactEntity();
            contact.setType(contactRequest.type());
            contact.setLabel(contactRequest.label());
            contact.setValue(contactRequest.value());
            contact.setUrl(contactRequest.url());
            contact.setSortOrder(contactRequest.sortOrder());
            contact.setIsPublic(contactRequest.isPublic());
            contact.setCreatedAt(now);
            contact.setUpdatedAt(now);
            siteContactMapper.insert(contact);
        }

        return listAllContacts();
    }
}
