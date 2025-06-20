import { NextResponse } from 'next/server';
import { scrapeMortgageNewsDaily } from '@/lib/scrapers';

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