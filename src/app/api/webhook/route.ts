import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Webhook endpoint for NETPIE events
 * Receives temperature data and other sensor events from NETPIE IoT platform
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    console.log('Received NETPIE webhook:', body);

    // Extract temperature data from NETPIE payload
    // Adjust this based on your actual NETPIE payload structure
    const { temperature, unit = 'celsius', timestamp } = body;

    // Validate required fields
    if (typeof temperature !== 'number') {
      return NextResponse.json(
        { error: 'Temperature value is required and must be a number' },
        { status: 400 },
      );
    }

    // Insert temperature reading
    const { data: tempData, error: tempError } = await supabase
      .from('temperature_readings')
      .insert({
        temperature,
        unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
        timestamp: timestamp
          ? new Date(timestamp).toISOString()
          : new Date().toISOString(),
      })
      .select()
      .single();

    if (tempError) {
      console.error('Error inserting temperature from webhook:', tempError);
      return NextResponse.json(
        { error: 'Failed to store temperature data' },
        { status: 500 },
      );
    }

    // Handle other NETPIE events if needed
    // For example, if NETPIE sends aircon state changes:
    if ('aircon_state' in body && typeof body.aircon_state === 'boolean') {
      const { data: existingAircon } = await supabase
        .from('aircon_state')
        .select('id')
        .limit(1)
        .single();

      if (existingAircon) {
        await supabase
          .from('aircon_state')
          .update({
            is_on: body.aircon_state,
            last_updated: new Date().toISOString(),
          })
          .eq('id', existingAircon.id);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook processed successfully',
        data: tempData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Unexpected error in webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Optional: Add GET handler for webhook verification/testing
export async function GET() {
  return NextResponse.json(
    {
      message: 'NETPIE webhook endpoint is active',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
