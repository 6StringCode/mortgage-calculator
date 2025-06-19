import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const MORTGAGE_NEWS_DAILY_URL = 'https://www.mortgagenewsdaily.com/mortgage-rates';

async function scrapeMortgageNewsDaily(): Promise<{ rate: number; date: string; source: string } | null> {
  try {
    const res = await fetch(MORTGAGE_NEWS_DAILY_URL, {
      next: { revalidate: 86400 }, // cache for 24 hours
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Mortgage News Daily: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for the 30-year fixed rate on the page
    // The rate is typically displayed prominently on the page
    let rateText = '';

    // Try multiple selectors to find the rate
    const selectors = [
      '.rate-30-year-fixed',
      '.mortgage-rate-30',
      '.rate-display',
      '.current-rate',
      '[data-rate="30-year"]',
      '.rate-value',
      'h1, h2, h3', // Look in headings
      '.rate, .rates' // Look in rate-related classes
    ];

    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        // Look for percentage patterns like "6.5%" or "6.50%"
        const rateMatch = text.match(/(\d+\.\d+)%/);
        if (rateMatch) {
          rateText = rateMatch[1];
          break;
        }
      }
    }

    // If no specific selector worked, search the entire page for rate patterns
    if (!rateText) {
      const bodyText = $('body').text();
      const rateMatches = bodyText.match(/(\d+\.\d+)%/g);
      if (rateMatches && rateMatches.length > 0) {
        // Take the first reasonable rate (between 2% and 15%)
        for (const match of rateMatches) {
          const rate = parseFloat(match);
          if (rate >= 2 && rate <= 15) {
            rateText = rate.toString();
            break;
          }
        }
      }
    }

    if (!rateText) {
      console.warn('Could not find rate on Mortgage News Daily page');
      return null;
    }

    const rate = parseFloat(rateText);
    if (isNaN(rate) || rate < 2 || rate > 15) {
      console.warn('Invalid rate found:', rateText);
      return null;
    }

    return {
      rate,
      date: new Date().toISOString().split('T')[0], // Today's date since we're scraping current rates
      source: 'Mortgage News Daily'
    };
  } catch (error) {
    console.warn('Mortgage News Daily scraping failed:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Try web scraping Mortgage News Daily
    const rateData = await scrapeMortgageNewsDaily();

    // If scraping fails, return a reasonable fallback
    if (!rateData) {
      return NextResponse.json({
        rate: 6.5,
        date: new Date().toISOString().split('T')[0],
        source: 'Fallback estimate',
        note: 'Unable to fetch current rates from Mortgage News Daily'
      });
    }

    return NextResponse.json(rateData);
  } catch (error) {
    console.error('Mortgage News Daily scraping failed:', error);
    return NextResponse.json({
      error: 'Failed to fetch mortgage rate from Mortgage News Daily',
      rate: 6.5,
      date: new Date().toISOString().split('T')[0],
      source: 'Fallback estimate'
    }, { status: 500 });
  }
} 