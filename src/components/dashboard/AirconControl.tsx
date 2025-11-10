'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase/database.types'

type AirconState = Database['public']['Tables']['aircon_state']['Row']

export function AirconControl() {
  const [airconState, setAirconState] = useState<AirconState | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchAirconState()
  }, [])

  async function fetchAirconState() {
    try {
      const response = await fetch('/api/aircon')
      if (response.ok) {
        const data = await response.json()
        setAirconState(data)
      }
    } catch (error) {
      console.error('Error fetching aircon state:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleAircon() {
    if (!airconState) return

    setUpdating(true)
    try {
      const response = await fetch('/api/aircon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_on: !airconState.is_on
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAirconState(data)
      } else {
        console.error('Failed to update aircon state')
      }
    } catch (error) {
      console.error('Error updating aircon state:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Air Conditioner Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isOn = airconState?.is_on ?? false

  return (
    <Card>
      <CardHeader>
        <CardTitle>Air Conditioner Control</CardTitle>
        <CardDescription>
          Control your air conditioner via IR signal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${isOn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-lg font-medium">
              Status: {isOn ? 'ON' : 'OFF'}
            </span>
          </div>

          <Button
            size="lg"
            variant={isOn ? 'destructive' : 'default'}
            onClick={toggleAircon}
            disabled={updating}
            className="w-full max-w-xs h-14 text-lg"
          >
            {updating ? 'Updating...' : isOn ? 'Turn Off' : 'Turn On'}
          </Button>

          {airconState && (
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(airconState.last_updated).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
