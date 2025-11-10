'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase/database.types'

type TemperatureReading = Database['public']['Tables']['temperature_readings']['Row']
type TemperatureUnit = 'celsius' | 'fahrenheit'

export function TemperatureDisplay() {
  const [temperature, setTemperature] = useState<TemperatureReading | null>(null)
  const [displayUnit, setDisplayUnit] = useState<TemperatureUnit>('celsius')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch initial temperature
  useEffect(() => {
    fetchTemperature()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('temperature_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'temperature_readings'
        },
        (payload) => {
          console.log('New temperature reading:', payload)
          setTemperature(payload.new as TemperatureReading)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  async function fetchTemperature() {
    try {
      const response = await fetch('/api/temperature')
      if (response.ok) {
        const data = await response.json()
        setTemperature(data)
      }
    } catch (error) {
      console.error('Error fetching temperature:', error)
    } finally {
      setLoading(false)
    }
  }

  function convertTemperature(temp: number, fromUnit: TemperatureUnit, toUnit: TemperatureUnit): number {
    if (fromUnit === toUnit) return temp

    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      return (temp * 9/5) + 32
    } else {
      return (temp - 32) * 5/9
    }
  }

  function getDisplayTemperature(): string {
    if (!temperature) return '--'

    const temp = convertTemperature(
      temperature.temperature,
      temperature.unit,
      displayUnit
    )

    return temp.toFixed(1)
  }

  function toggleUnit() {
    setDisplayUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Temperature</CardTitle>
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
        <CardTitle>Room Temperature</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold">{getDisplayTemperature()}</span>
            <span className="text-3xl text-muted-foreground">
              {displayUnit === 'celsius' ? '°C' : '°F'}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={toggleUnit}
            className="h-12"
          >
            Switch to {displayUnit === 'celsius' ? '°F' : '°C'}
          </Button>
        </div>
        {temperature && (
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date(temperature.timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
