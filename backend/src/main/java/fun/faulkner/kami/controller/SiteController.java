package fun.faulkner.kami.controller;

import fun.faulkner.kami.dto.response.PublicSiteProfileResponse;
import fun.faulkner.kami.dto.response.SiteContactResponse;
import fun.faulkner.kami.entity.SiteContactEntity;
import fun.faulkner.kami.entity.SiteProfileEntity;
import fun.faulkner.kami.service.SiteContactService;
import fun.faulkner.kami.service.SiteProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/site")
public class SiteController {
    private final SiteProfileService siteProfileService;
    private final SiteContactService siteContactService;

    public SiteController(SiteProfileService siteProfileService, SiteContactService siteContactService) {
        this.siteProfileService = siteProfileService;
        this.siteContactService = siteContactService;
    }

    @GetMapping("/profile")
    public PublicSiteProfileResponse getSiteProfile() {
        SiteProfileEntity siteProfile = siteProfileService.getSiteProfile();
        List<SiteContactResponse> contacts = siteContactService.listPublicContacts().stream()
                .map(this::toSiteContactResponse)
                .toList();

        return new PublicSiteProfileResponse(
                siteProfile.getId(),
                siteProfile.getSiteName(),
                siteProfile.getHeroTitle(),
                siteProfile.getHeroTagline(),
                siteProfile.getAuthorName(),
                siteProfile.getAuthorBio(),
                siteProfile.getAvatarUrl(),
                siteProfile.getCoverImageUrl(),
                siteProfile.getCanonicalBaseUrl(),
                siteProfile.getDefaultShareImageUrl(),
                contacts
        );
    }

    private SiteContactResponse toSiteContactResponse(SiteContactEntity contact) {
        return new SiteContactResponse(
                contact.getId(),
                contact.getType(),
                contact.getLabel(),
                contact.getValue(),
                contact.getUrl(),
                contact.getSortOrder(),
                contact.getIsPublic()
        );
    }
}
