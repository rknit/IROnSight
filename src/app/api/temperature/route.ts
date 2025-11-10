import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the latest temperature reading
    const { data, error } = await supabase
      .from('temperature_readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching temperature:', error)
      return NextResponse.json(
        { error: 'Failed to fetch temperature' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { temperature, unit = 'celsius' } = body

    if (typeof temperature !== 'number') {
      return NextResponse.json(
        { error: 'Temperature must be a number' },
        { status: 400 }
      )
    }

    if (unit !== 'celsius' && unit !== 'fahrenheit') {
      return NextResponse.json(
        { error: 'Unit must be celsius or fahrenheit' },
        { status: 400 }
      )
    }

    // Insert new temperature reading
    const { data, error } = await supabase
      .from('temperature_readings')
      .insert({
        temperature,
        unit,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting temperature:', error)
      return NextResponse.json(
        { error: 'Failed to insert temperature' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
