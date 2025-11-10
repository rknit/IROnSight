import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all IR protocols
    const { data, error } = await supabase
      .from('ir_protocols')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching IR protocols:', error)
      return NextResponse.json(
        { error: 'Failed to fetch IR protocols' },
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

    const { protocol_id } = body

    if (!protocol_id || typeof protocol_id !== 'string') {
      return NextResponse.json(
        { error: 'protocol_id must be a valid string' },
        { status: 400 }
      )
    }

    // Update the selected protocol
    // The trigger will automatically unselect other protocols
    const { data, error } = await supabase
      .from('ir_protocols')
      .update({
        is_selected: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', protocol_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating IR protocol:', error)
      return NextResponse.json(
        { error: 'Failed to update IR protocol' },
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
