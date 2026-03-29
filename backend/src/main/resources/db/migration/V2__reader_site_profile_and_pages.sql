CREATE TABLE page (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500),
    cover_image VARCHAR(500),
    render_mode VARCHAR(20) NOT NULL,
    content_markdown TEXT,
    payload JSONB,
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_page_render_mode CHECK (render_mode IN ('CODED', 'MARKDOWN')),
    CONSTRAINT chk_page_status CHECK (status IN ('DRAFT', 'PUBLISHED'))
);

CREATE TABLE site_profile (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL,
    hero_title VARCHAR(255),
    hero_tagline VARCHAR(255),
    author_name VARCHAR(100) NOT NULL,
    author_bio VARCHAR(500),
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    canonical_base_url VARCHAR(255),
    default_share_image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_contact (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(255),
    url VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE article
    ADD COLUMN word_count INT NOT NULL DEFAULT 0,
    ADD COLUMN reading_time_minutes INT NOT NULL DEFAULT 1;

WITH article_metrics AS (
    SELECT
        id,
        GREATEST(0, CHAR_LENGTH(REGEXP_REPLACE(COALESCE(content, ''), E'\\s+', '', 'g'))) AS normalized_length
    FROM article
)
UPDATE article AS target
SET
    word_count = metrics.normalized_length,
    reading_time_minutes = GREATEST(1, CEIL(metrics.normalized_length / 250.0)::INT)
FROM article_metrics AS metrics
WHERE target.id = metrics.id;

INSERT INTO site_profile (
    site_name,
    hero_title,
    hero_tagline,
    author_name,
    author_bio,
    avatar_url,
    cover_image_url
) VALUES (
    'Felix_SANA',
    'Felix_SANA ''S BLOG',
    'Beyond your heart and light',
    'Felix_SANA',
    '一个普普通通大学生，现在是社畜了……',
    'https://picsum.photos/seed/avatar/200/200',
    'https://picsum.photos/seed/cover/1920/600?blur=2'
);

INSERT INTO site_contact (
    type,
    label,
    value,
    url,
    sort_order,
    is_public
) VALUES
    ('EMAIL', 'hello@example.com', 'hello@example.com', 'mailto:hello@example.com', 0, TRUE),
    ('GITHUB', 'github.com/felix_sana', 'github.com/felix_sana', 'https://github.com/felix_sana', 1, TRUE);

INSERT INTO page (
    slug,
    title,
    summary,
    cover_image,
    render_mode,
    payload,
    seo_title,
    seo_description,
    status,
    published_at
) VALUES (
    'about',
    '关于我',
    '一个普普通通大学生，现在是社畜了……',
    'https://picsum.photos/seed/cover/1920/600?blur=2',
    'CODED',
    '{
      "sections": [
        {
          "title": "阴暗地爬行中",
          "paragraphs": [
            "应该会不断更新这个blog，技术，生活，近况等。现在在学习一些很杂的东西，基本上感兴趣的就会想办法弄弄，比如这个blog网站就是学习之余摸出来的。",
            "秉承着利用我一切的空余时间把东西弄到最好的习惯，你现在看到的东西就是消耗我差不多所有空闲时间弄出来的。虽然不怎么样，但是却是我的最好。",
            "互联网上绝不吵架，你要是和我吵我马上删评，你说的都对，纯社恐一个。",
            "ACG爱好者，可以在 Bangumi 看到我2023年以后的状态，有兴趣可以加个 Steam 好友，让我看看你在玩什么游戏啊。"
          ]
        }
      ],
      "skills": [
        "前端开发: React, Vue, TypeScript, Next.js",
        "后端架构: Node.js, Go, 微服务设计",
        "数据库: PostgreSQL, Redis, MongoDB",
        "其他: Docker, CI/CD, 性能优化"
      ]
    }'::jsonb,
    '关于我 - Felix_SANA',
    '一个普普通通大学生，现在是社畜了……',
    'PUBLISHED',
    CURRENT_TIMESTAMP
);
