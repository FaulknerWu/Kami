package fun.faulkner.kami.service;

import java.text.BreakIterator;
import java.util.Locale;
import java.util.regex.Pattern;

final class ArticleReadMetricsCalculator {
    private static final Pattern FENCED_CODE_BLOCK_PATTERN = Pattern.compile("```[\\s\\S]*?```");
    private static final Pattern INLINE_CODE_PATTERN = Pattern.compile("`[^`]*`");
    private static final Pattern IMAGE_PATTERN = Pattern.compile("!\\[[^]]*]\\([^)]*\\)");
    private static final Pattern LINK_PATTERN = Pattern.compile("\\[([^]]*)]\\([^)]*\\)");
    private static final Pattern MARKDOWN_SYMBOL_PATTERN = Pattern.compile("[#>*_\\-]+");
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");
    private static final int WORDS_PER_MINUTE = 250;

    private ArticleReadMetricsCalculator() {
    }

    static ArticleReadMetrics calculate(String markdownContent) {
        String normalizedText = normalizeMarkdown(markdownContent);
        int wordCount = countWords(normalizedText);
        int readingTimeMinutes = Math.max(1, (int) Math.ceil(wordCount / (double) WORDS_PER_MINUTE));

        return new ArticleReadMetrics(wordCount, readingTimeMinutes);
    }

    private static String normalizeMarkdown(String markdownContent) {
        if (markdownContent == null || markdownContent.isBlank()) {
            return "";
        }

        String withoutCodeBlocks = FENCED_CODE_BLOCK_PATTERN.matcher(markdownContent).replaceAll(" ");
        String withoutInlineCode = INLINE_CODE_PATTERN.matcher(withoutCodeBlocks).replaceAll(" ");
        String withoutImages = IMAGE_PATTERN.matcher(withoutInlineCode).replaceAll(" ");
        String withoutLinkTargets = LINK_PATTERN.matcher(withoutImages).replaceAll("$1");
        String withoutMarkdownSymbols = MARKDOWN_SYMBOL_PATTERN.matcher(withoutLinkTargets).replaceAll(" ");

        return WHITESPACE_PATTERN.matcher(withoutMarkdownSymbols).replaceAll(" ").trim();
    }

    private static int countWords(String normalizedText) {
        if (normalizedText.isBlank()) {
            return 0;
        }

        BreakIterator iterator = BreakIterator.getWordInstance(Locale.ROOT);
        iterator.setText(normalizedText);

        int wordCount = 0;
        int start = iterator.first();

        for (int end = iterator.next(); end != BreakIterator.DONE; start = end, end = iterator.next()) {
            String token = normalizedText.substring(start, end).trim();
            if (token.isEmpty()) {
                continue;
            }

            boolean containsReadableToken = token.codePoints().anyMatch(Character::isLetterOrDigit);
            if (containsReadableToken) {
                wordCount += 1;
            }
        }

        return wordCount;
    }
}

record ArticleReadMetrics(
        int wordCount,
        int readingTimeMinutes
) {
}
