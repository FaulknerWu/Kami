package fun.faulkner.kami.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("site_profile")
public class SiteProfileEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String siteName;
    private String heroTitle;
    private String heroTagline;
    private String authorName;
    private String authorBio;
    private String avatarUrl;
    private String coverImageUrl;
    private String canonicalBaseUrl;
    private String defaultShareImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSiteName() {
        return siteName;
    }

    public void setSiteName(String siteName) {
        this.siteName = siteName;
    }

    public String getHeroTitle() {
        return heroTitle;
    }

    public void setHeroTitle(String heroTitle) {
        this.heroTitle = heroTitle;
    }

    public String getHeroTagline() {
        return heroTagline;
    }

    public void setHeroTagline(String heroTagline) {
        this.heroTagline = heroTagline;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorBio() {
        return authorBio;
    }

    public void setAuthorBio(String authorBio) {
        this.authorBio = authorBio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getCanonicalBaseUrl() {
        return canonicalBaseUrl;
    }

    public void setCanonicalBaseUrl(String canonicalBaseUrl) {
        this.canonicalBaseUrl = canonicalBaseUrl;
    }

    public String getDefaultShareImageUrl() {
        return defaultShareImageUrl;
    }

    public void setDefaultShareImageUrl(String defaultShareImageUrl) {
        this.defaultShareImageUrl = defaultShareImageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
