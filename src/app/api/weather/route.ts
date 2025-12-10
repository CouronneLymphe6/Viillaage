import { NextResponse } from 'next/server';
import { getWeatherForBeaupuy } from '@/lib/weather';

export async function GET() {
    try {
        const weather = await getWeatherForBeaupuy();
        return NextResponse.json(weather);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch weather' },
            { status: 500 }
        );
    }
}
