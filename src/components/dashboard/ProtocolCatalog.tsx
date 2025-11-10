'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/lib/supabase/database.types'

type IRProtocol = Database['public']['Tables']['ir_protocols']['Row']

export function ProtocolCatalog() {
  const [protocols, setProtocols] = useState<IRProtocol[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    fetchProtocols()
  }, [])

  async function fetchProtocols() {
    try {
      const response = await fetch('/api/protocols')
      if (response.ok) {
        const data = await response.json()
        setProtocols(data)
      }
    } catch (error) {
      console.error('Error fetching protocols:', error)
    } finally {
      setLoading(false)
    }
  }

  async function selectProtocol(protocolId: string) {
    setSelecting(protocolId)
    try {
      const response = await fetch('/api/protocols', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          protocol_id: protocolId
        })
      })

      if (response.ok) {
        // Refresh protocols to update selected state
        await fetchProtocols()
      } else {
        console.error('Failed to select protocol')
      }
    } catch (error) {
      console.error('Error selecting protocol:', error)
    } finally {
      setSelecting(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IR Signal Protocols</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IR Signal Protocols</CardTitle>
        <CardDescription>
          Select the IR protocol for your remote control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols.map((protocol) => {
            const isSelected = protocol.is_selected
            const isSelecting = selecting === protocol.id

            return (
              <button
                key={protocol.id}
                onClick={() => selectProtocol(protocol.id)}
                disabled={isSelecting}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                  }
                  ${isSelecting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{protocol.name}</h3>
                  {isSelected && (
                    <Badge variant="default" className="shrink-0">
                      Selected
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {protocol.summary}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {protocol.protocol_type}
                  </Badge>
                  {protocol.frequency_khz && (
                    <Badge variant="outline" className="text-xs">
                      {protocol.frequency_khz} kHz
                    </Badge>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {protocols.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No protocols available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
