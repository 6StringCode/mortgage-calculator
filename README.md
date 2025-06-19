# Mortgage Calculator

A modern, responsive mortgage calculator built with Next.js that automatically fetches current mortgage rates from Mortgage News Daily.

## Features

- **Real-time Rate Data**: Automatically fetches current 30-year fixed mortgage rates
- **Comprehensive Calculations**: Includes principal, interest, taxes, and insurance (PITI)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Built with ARIA labels and semantic HTML
- **No API Keys Required**: Uses web scraping to get current rates

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mortgage-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Rate Data Source

The calculator automatically fetches current 30-year fixed mortgage rates from [Mortgage News Daily](https://www.mortgagenewsdaily.com/mortgage-rates) using web scraping.

**Technical Details:**
- **Update Frequency**: Daily (rates are cached for 24 hours)
- **Data Source**: Mortgage News Daily
- **Method**: Web scraping with cheerio (server-side HTML parsing)
- **Fallback**: 6.5% estimate if scraping fails

### Rate Detection Strategy

The scraper uses multiple approaches to find current rates:
1. **CSS Selectors**: Looks for rate-related classes (`.rate-30-year-fixed`, `.current-rate`, etc.)
2. **Heading Elements**: Searches h1, h2, h3 tags for rate information
3. **Pattern Matching**: Finds percentage patterns (like "6.5%") across the page
4. **Validation**: Ensures rates are reasonable (2-15% range)

### Calculation Formula

The calculator uses the standard mortgage payment formula:

```
Monthly Payment = P × [r(1+r)^n] / [(1+r)^n-1] + (Annual Tax + Annual Insurance) / 12
```

Where:
- P = Principal (loan amount)
- r = Monthly interest rate (annual rate ÷ 12)
- n = Total number of payments (30 years × 12 months)

## Project Structure

```
mortgage-calculator/
├── src/
│   ├── app/
│   │   ├── api/mortgage-rate/route.ts  # Rate fetching API
│   │   ├── page.tsx                    # Main calculator component
│   │   ├── layout.tsx                  # App layout
│   │   └── globals.css                 # Global styles
│   └── ...
├── public/                             # Static assets
└── package.json                        # Dependencies
```

## Dependencies

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Cheerio**: Server-side HTML parsing (like jQuery for Node.js)

## API Endpoints

### GET `/api/mortgage-rate`

Returns current mortgage rate data:

```json
{
  "rate": 6.5,
  "date": "2024-01-15",
  "source": "Mortgage News Daily"
}
```

**Response Codes:**
- `200`: Success with rate data
- `500`: Error with fallback rate (6.5%)

## Web Scraping Best Practices

- **User-Agent Header**: Uses realistic browser user-agent to avoid being blocked
- **Rate Limiting**: 24-hour caching prevents excessive requests
- **Error Handling**: Graceful fallbacks if scraping fails
- **Validation**: Ensures scraped rates are within reasonable bounds

## Future Enhancements

Potential improvements for future versions:
- **Multiple Loan Types**: 15-year, ARM, FHA, VA loans
- **Additional Data Sources**: Bankrate, FRED API (with API key)
- **Rate History**: Historical rate trends and charts
- **Refinance Calculator**: Compare current vs. new rates
- **Amortization Schedule**: Monthly breakdown of payments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cheerio Documentation](https://cheerio.js.org)
