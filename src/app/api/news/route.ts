import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_API_TUBE_KEY;
const API_URL = 'https://api.apitube.io/v1/news/everything';

export async function GET() {
  try {
    const response = await axios.get(API_URL, {
      params: {
        'source.country.code': 'in',
        'language': 'en',
        export: 'json',
        per_page: 2,
        api_key: API_KEY,
      },
    });
    console.log(response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
