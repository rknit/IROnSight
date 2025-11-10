import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { publishAirconControl } from '@/lib/netpie/client'

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

    // Get the existing aircon state (we'll need this for rollback)
    const { data: existing, error: fetchError } = await supabase
      .from('aircon_state')
      .select('id, is_on')
      .limit(1)
      .single()

    if (fetchError) {
      console.error('Error fetching existing aircon state:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch aircon state' },
        { status: 500 }
      )
    }

    // Store the previous state for potential rollback
    const previousState = existing.is_on

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

    // Get the selected IR protocol
    const { data: protocol, error: protocolError } = await supabase
      .from('ir_protocols')
      .select('id, name, protocol_type')
      .eq('is_selected', true)
      .limit(1)
      .single()

    if (protocolError || !protocol) {
      console.error('Error fetching selected IR protocol:', protocolError)

      // Rollback the database change
      await supabase
        .from('aircon_state')
        .update({
          is_on: previousState,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing.id)

      return NextResponse.json(
        { error: 'No IR protocol selected. Please select a protocol first.' },
        { status: 400 }
      )
    }

    // Publish to NETPIE
    try {
      await publishAirconControl({
        is_on,
        protocol: {
          id: protocol.id,
          name: protocol.name,
          protocol_type: protocol.protocol_type,
        },
        timestamp: new Date().toISOString(),
      })

      console.log(`[Aircon API] Successfully published to NETPIE: is_on=${is_on}, protocol=${protocol.name}`)
    } catch (netpieError) {
      console.error('Failed to publish to NETPIE:', netpieError)

      // Rollback the database change
      await supabase
        .from('aircon_state')
        .update({
          is_on: previousState,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing.id)

      const errorMessage = netpieError instanceof Error
        ? netpieError.message
        : 'Failed to send command to device'

      return NextResponse.json(
        { error: `Failed to communicate with device: ${errorMessage}` },
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
