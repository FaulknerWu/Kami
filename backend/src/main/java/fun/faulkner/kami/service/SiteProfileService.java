package fun.faulkner.kami.service;

import fun.faulkner.kami.dto.request.UpdateSiteProfileRequest;
import fun.faulkner.kami.entity.SiteProfileEntity;
import fun.faulkner.kami.exception.ResourceNotFoundException;
import fun.faulkner.kami.repository.SiteProfileMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SiteProfileService {
    private static final long SINGLETON_SITE_PROFILE_ID = 1L;

    private final SiteProfileMapper siteProfileMapper;

    public SiteProfileService(SiteProfileMapper siteProfileMapper) {
        this.siteProfileMapper = siteProfileMapper;
    }

    public SiteProfileEntity getSiteProfile() {
        SiteProfileEntity siteProfile = siteProfileMapper.selectById(SINGLETON_SITE_PROFILE_ID);
        if (siteProfile == null) {
            throw new ResourceNotFoundException("Site profile not found");
        }

        return siteProfile;
    }

    public SiteProfileEntity updateSiteProfile(UpdateSiteProfileRequest request) {
        SiteProfileEntity siteProfile = getSiteProfile();
        LocalDateTime now = LocalDateTime.now();
        applyEditableFields(siteProfile, request);
        siteProfile.setUpdatedAt(now);

        siteProfileMapper.updateById(siteProfile);
        return siteProfile;
    }

    private void applyEditableFields(SiteProfileEntity siteProfile, UpdateSiteProfileRequest request) {
        siteProfile.setSiteName(request.siteName());
        siteProfile.setHeroTitle(request.heroTitle());
        siteProfile.setHeroTagline(request.heroTagline());
        siteProfile.setAuthorName(request.authorName());
        siteProfile.setAuthorBio(request.authorBio());
        siteProfile.setAvatarUrl(request.avatarUrl());
        siteProfile.setCoverImageUrl(request.coverImageUrl());
        siteProfile.setCanonicalBaseUrl(request.canonicalBaseUrl());
        siteProfile.setDefaultShareImageUrl(request.defaultShareImageUrl());
    }
}
