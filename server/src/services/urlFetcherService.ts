import axios from 'axios';
import { validateUrlForSSRF } from '../utils/ssrfProtection';
import { logger } from '../utils/logger';

export interface FetchedArticle {
  originalUrl: string;
  title: string;
  publisher: string;
  publicationDate?: string;
  retrievalTimestamp: string;
  extractedText: string;
  wordCount: number;
}

export class UrlFetcherService {
  async fetchArticleSafely(rawUrl: string): Promise<FetchedArticle> {
    // 1. SSRF Check
    const ssrfCheck = await validateUrlForSSRF(rawUrl);
    if (!ssrfCheck.isValid) {
      throw new Error(`SSRF Security Violation: ${ssrfCheck.error}`);
    }

    logger.info(`Fetching URL safely: ${rawUrl} (Resolved IP: ${ssrfCheck.resolvedIp})`);

    // 2. HTTP Request with size and redirect limits
    const response = await axios.get(rawUrl, {
      timeout: 7000,
      maxContentLength: 2 * 1024 * 1024, // Max 2 MB response
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TruthLensBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const html: string = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    // 3. Extract title
    let title = 'Untitled Article';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].trim();
    }
    title = this.decodeHtmlEntities(title);

    // 4. Extract publisher
    const parsed = new URL(rawUrl);
    let publisher = parsed.hostname.replace(/^www\./, '');
    const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    if (ogSiteMatch && ogSiteMatch[1]) {
      publisher = ogSiteMatch[1].trim();
    }

    // 5. Extract date (meta tags, ld+json, or time tags)
    let pubDate: string | undefined;
    const ldJsonMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/i);
    if (ldJsonMatch && ldJsonMatch[1]) {
      pubDate = ldJsonMatch[1].trim();
    }
    if (!pubDate) {
      const metaDateMatch = html.match(/<meta[^>]*(?:property|name)=["'](?:article:published_time|cXenseParse:publishtime|pubdate|date|sailthru\.date)["'][^>]*content=["']([^"']+)["']/i);
      if (metaDateMatch && metaDateMatch[1]) {
        pubDate = metaDateMatch[1].trim();
      }
    }
    if (!pubDate) {
      const timeTagMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i);
      if (timeTagMatch && timeTagMatch[1]) {
        pubDate = timeTagMatch[1].trim();
      }
    }

    // 6. Clean text: remove scripts, styles, svg, header, footer, nav
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ' ');

    // Extract text from paragraph and header tags
    const paragraphs: string[] = [];
    const pMatches = clean.match(/<(p|h1|h2|h3)[^>]*>(.*?)<\/\1>/gi);
    if (pMatches) {
      for (const p of pMatches) {
        let textOnly = p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        textOnly = this.decodeHtmlEntities(textOnly);
        if (textOnly.length > 25) {
          paragraphs.push(textOnly);
        }
      }
    }

    let extractedText = paragraphs.join('\n\n');
    if (!extractedText || extractedText.length < 50) {
      // Fallback: strip all tags from remaining body
      extractedText = this.decodeHtmlEntities(clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    }

    // Truncate if massive (max 15,000 characters)
    if (extractedText.length > 15000) {
      extractedText = extractedText.substring(0, 15000) + '... [truncated]';
    }

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    const retrievalTimestamp = new Date().toISOString();

    return {
      originalUrl: rawUrl,
      title,
      publisher,
      publicationDate: pubDate,
      retrievalTimestamp,
      extractedText,
      wordCount
    };
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8211;/g, '-')
      .replace(/&#8212;/g, '--');
  }
}

export const urlFetcherService = new UrlFetcherService();
