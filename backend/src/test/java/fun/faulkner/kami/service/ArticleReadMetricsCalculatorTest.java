package fun.faulkner.kami.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ArticleReadMetricsCalculatorTest {

    @Test
    void calculateShouldIgnoreMarkdownNoiseAndCountReadableTokens() {
        ArticleReadMetrics metrics = ArticleReadMetricsCalculator.calculate("""
                # 标题

                这是一段正文，包含 [链接](https://example.com) 和 `inline code`。

                ```ts
                const ignored = true;
                ```
                """);

        assertThat(metrics.wordCount()).isEqualTo(5);
        assertThat(metrics.readingTimeMinutes()).isEqualTo(1);
    }
}
