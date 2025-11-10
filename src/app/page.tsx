import { TemperatureDisplay } from '@/components/dashboard/TemperatureDisplay'
import { AirconControl } from '@/components/dashboard/AirconControl'
import { ProtocolCatalog } from '@/components/dashboard/ProtocolCatalog'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Ironsight Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor temperature and control your air conditioner via IR signals
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {/* Temperature Display - Top Left */}
          <div className="md:col-span-1">
            <TemperatureDisplay />
          </div>

          {/* Aircon Control - Top Right */}
          <div className="md:col-span-1">
            <AirconControl />
          </div>

          {/* Protocol Catalog - Full Width Bottom */}
          <div className="md:col-span-2">
            <ProtocolCatalog />
          </div>
        </div>
      </div>
    </div>
  )
}
