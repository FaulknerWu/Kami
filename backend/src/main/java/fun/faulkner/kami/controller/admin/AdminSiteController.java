package fun.faulkner.kami.controller.admin;

import fun.faulkner.kami.dto.request.UpdateSiteContactsRequest;
import fun.faulkner.kami.dto.request.UpdateSiteProfileRequest;
import fun.faulkner.kami.dto.response.SiteContactResponse;
import fun.faulkner.kami.dto.response.SiteProfileResponse;
import fun.faulkner.kami.entity.SiteContactEntity;
import fun.faulkner.kami.entity.SiteProfileEntity;
import fun.faulkner.kami.service.SiteContactService;
import fun.faulkner.kami.service.SiteProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/site")
public class AdminSiteController {
    private final SiteProfileService siteProfileService;
    private final SiteContactService siteContactService;

    public AdminSiteController(SiteProfileService siteProfileService, SiteContactService siteContactService) {
        this.siteProfileService = siteProfileService;
        this.siteContactService = siteContactService;
    }

    @GetMapping("/profile")
    public SiteProfileResponse getSiteProfile() {
        return toSiteProfileResponse(siteProfileService.getSiteProfile());
    }

    @PutMapping("/profile")
    public SiteProfileResponse updateSiteProfile(@RequestBody @Valid UpdateSiteProfileRequest request) {
        return toSiteProfileResponse(siteProfileService.updateSiteProfile(request));
    }

    @GetMapping("/contacts")
    public List<SiteContactResponse> listContacts() {
        return siteContactService.listAllContacts().stream()
                .map(this::toSiteContactResponse)
                .toList();
    }

    @PutMapping("/contacts")
    public List<SiteContactResponse> updateContacts(@RequestBody @Valid UpdateSiteContactsRequest request) {
        return siteContactService.replaceContacts(request.contacts()).stream()
                .map(this::toSiteContactResponse)
                .toList();
    }

    private SiteProfileResponse toSiteProfileResponse(SiteProfileEntity siteProfile) {
        return new SiteProfileResponse(
                siteProfile.getId(),
                siteProfile.getSiteName(),
                siteProfile.getHeroTitle(),
                siteProfile.getHeroTagline(),
                siteProfile.getAuthorName(),
                siteProfile.getAuthorBio(),
                siteProfile.getAvatarUrl(),
                siteProfile.getCoverImageUrl(),
                siteProfile.getCanonicalBaseUrl(),
                siteProfile.getDefaultShareImageUrl()
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
