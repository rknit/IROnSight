# IR-On-Sight (Ironsight)

A web application for controlling microcontrollers via NETPIE IoT platform. Features remote IR controller for air conditioners and real-time temperature reporting.

## Overview

Ironsight is an IoT dashboard designed to work with microcontrollers that provide IR (infrared) transmission capabilities and temperature sensing. The webapp connects to your microcontroller via the NETPIE platform, enabling you to:

- Monitor real-time temperature readings from connected sensors
- Control air conditioners remotely via IR commands
- Select IR protocols (planned feature)

## Tech Stack

- Next.js, React, TypeScript, Tailwind CSS
- Supabase (PostgreSQL database with Realtime subscriptions)
- NETPIE 2020 IoT Platform for device communication

## Prerequisites

- Node.js 18.17 or later
- [Supabase](https://supabase.com) project
- [NETPIE](https://netpie.io) account and device credentials
- Compatible microcontroller with:
  - IR transmitter capability
  - Temperature sensor
  - NETPIE connectivity

## Getting Started

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NETPIE IoT Platform
NETPIE_CLIENT_ID=your-client-id
NETPIE_TOKEN=your-token
NETPIE_SECRET=your-secret
```

**Supabase credentials**: Found in your [Supabase project settings](https://app.supabase.com/project/_/settings/api)

**NETPIE credentials**: Obtain from your [NETPIE device settings](https://portal.netpie.io)

### 2. Database Setup

Apply the database migrations to your Supabase project:

```bash
# Link to your project
npx supabase link --project-ref your-project-ref

# Apply migrations
npx supabase db push
```

This will create the necessary tables:
- `temperature_readings` - Stores temperature data with realtime enabled
- `aircon_state` - Tracks air conditioner on/off state
- `ir_protocols` - IR protocol catalog (TBD)

### 3. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 4. Microcontroller Setup

Your microcontroller should be configured to:

**Subscribe to NETPIE topic** for receiving commands:
- Topic: `@msg/aircon/control`
- Message format:
  ```json
  {
    "is_on": true,
    "protocol": {
      "id": "uuid",
      "name": "NEC",
      "protocol_type": "nec"
    },
    "timestamp": "2025-11-10T12:00:00Z"
  }
  ```

**Send temperature data** to the webhook endpoint:
- Endpoint: `POST https://your-app-url/api/webhook`
- Payload:
  ```json
  {
    "temperature": 25.5,
    "unit": "celsius"
  }
  ```

## Features

### Real-time Temperature Monitoring
- Live temperature display with automatic updates
- Unit conversion (Celsius ↔ Fahrenheit)
- Timestamp of latest reading
- Powered by Supabase Realtime subscriptions

### Air Conditioner Control
- Toggle AC on/off remotely
- Visual status indicator with pulse animation
- Commands sent via NETPIE to microcontroller
- Automatic state rollback on failure
- Last updated timestamp

### IR Protocol Catalog
- Protocol selection interface (planned feature)
- Support for common IR protocols: NEC, RC5, RC6, Sony SIRC, Samsung, LG, Panasonic, Sharp

## API Endpoints

- `GET /api/temperature` - Fetch latest temperature reading
- `POST /api/temperature` - Insert new temperature reading
- `POST /api/webhook` - Receive temperature data from IoT devices
- `GET /api/aircon` - Get current AC state
- `POST /api/aircon` - Toggle AC state and publish to NETPIE

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard
│   └── api/                  # API routes
│       ├── temperature/
│       ├── aircon/
│       └── webhook/
├── components/
│   ├── dashboard/
│   │   ├── TemperatureDisplay.tsx
│   │   ├── AirconControl.tsx
│   │   └── ProtocolCatalog.tsx
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── supabase/             # Supabase clients
│   └── netpie/               # NETPIE REST API client
└── types/                    # TypeScript type definitions
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
