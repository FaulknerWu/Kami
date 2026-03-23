package fun.faulkner.kami.service;

import fun.faulkner.kami.model.ArticleEntity;
import fun.faulkner.kami.repository.ArticleMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleService {
    private final ArticleMapper articleMapper;

    public ArticleService(ArticleMapper articleMapper) {
        this.articleMapper = articleMapper;
    }

    public List<ArticleEntity> listArticles() {
        return articleMapper.selectList(null);
    }

}
