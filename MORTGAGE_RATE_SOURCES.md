# Mortgage Rate Data Source

This mortgage calculator uses web scraping to fetch current mortgage rates from Mortgage News Daily. No API keys are required!

## Primary Source: Mortgage News Daily (Web Scraping)

**URL**: `https://www.mortgagenewsdaily.com/mortgage-rates`
- **Update Frequency**: Daily
- **Coverage**: 30-year fixed rate
- **Pros**: Daily updates, no API key required, comprehensive rate information
- **Cons**: Web scraping approach, may break if site structure changes

### How Web Scraping Works

The application uses `cheerio` (a server-side jQuery-like library) to:
1. Fetch the Mortgage News Daily rates page
2. Parse the HTML to find current mortgage rates
3. Extract the 30-year fixed rate using multiple selector strategies
4. Validate the rate is within reasonable bounds (2-15%)

### Rate Detection Strategy

The scraper tries multiple approaches to find the rate:
1. **Specific CSS selectors** (`.rate-30-year-fixed`, `.current-rate`, etc.)
2. **Heading elements** (h1, h2, h3) that might contain rates
3. **Pattern matching** across the entire page for percentage values
4. **Validation** to ensure rates are reasonable (2-15% range)

## Implementation Details

The application:
1. Scrapes Mortgage News Daily for current 30-year fixed rates
2. Falls back to estimate (6.5%) if scraping fails

## Rate Caching

Web scraping requests are cached for 24 hours to:
- Avoid excessive requests to external sites
- Improve performance
- Be respectful to the data source
- Match typical mortgage rate update frequency (daily updates)

## Error Handling

If web scraping fails, the application gracefully falls back to a reasonable estimate (6.5%) and displays a note to the user.

## Web Scraping Best Practices

- **User-Agent Header**: Uses a realistic browser user-agent to avoid being blocked
- **Rate Limiting**: 1-hour caching prevents excessive requests
- **Error Handling**: Graceful fallbacks if scraping fails
- **Validation**: Ensures scraped rates are within reasonable bounds

## Alternative Sources (For Future Implementation)

### 1. Bankrate
- **URL**: `https://www.bankrate.com/rest/svc/rates/mortgage/current`
- **Update Frequency**: Daily
- **Coverage**: Multiple loan types
- **Note**: May require similar web scraping approach

### 2. Federal Housing Finance Agency (FHFA)
- **URL**: `https://www.fhfa.gov/DataTools/Downloads/Pages/Monthly-Interest-Rate-Data.aspx`
- **Update Frequency**: Monthly
- **Coverage**: Various mortgage products
- **Note**: Monthly updates only, official government data

## Dependencies

- `cheerio`: HTML parsing and DOM manipulation (like jQuery for Node.js)
- Built-in `fetch`: HTTP requests (no axios needed)
- Next.js caching: Built-in request caching 