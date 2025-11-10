import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current aircon state
    const { data, error } = await supabase
      .from('aircon_state')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching aircon state:', error)
      return NextResponse.json(
        { error: 'Failed to fetch aircon state' },
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

    const { is_on } = body

    if (typeof is_on !== 'boolean') {
      return NextResponse.json(
        { error: 'is_on must be a boolean' },
        { status: 400 }
      )
    }

    // Get the existing aircon state
    const { data: existing, error: fetchError } = await supabase
      .from('aircon_state')
      .select('id')
      .limit(1)
      .single()

    if (fetchError) {
      console.error('Error fetching existing aircon state:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch aircon state' },
        { status: 500 }
      )
    }

    // Update the aircon state
    const { data, error } = await supabase
      .from('aircon_state')
      .update({
        is_on,
        last_updated: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating aircon state:', error)
      return NextResponse.json(
        { error: 'Failed to update aircon state' },
        { status: 500 }
      )
    }

    // TODO: When authentication is added, uncomment this:
    // const { data: { user } } = await supabase.auth.getUser()
    // if (user) {
    //   await supabase
    //     .from('aircon_state')
    //     .update({ updated_by: user.id })
    //     .eq('id', existing.id)
    // }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
