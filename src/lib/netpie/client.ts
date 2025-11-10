/**
 * NETPIE 2020 REST API Client
 * Handles message publishing to NETPIE IoT platform via REST API
 */

export interface NetpieConfig {
  clientId: string;
  token: string;
}

export interface AirconControlMessage {
  is_on: boolean;
  protocol: {
    id: string;
    name: string;
    protocol_type: string;
  };
  timestamp: string;
}

class NetpieClient {
  private config: NetpieConfig;
  private readonly apiBaseUrl = 'https://api.netpie.io/v2';

  constructor() {
    this.config = {
      clientId: process.env.NETPIE_CLIENT_ID || '',
      token: process.env.NETPIE_TOKEN || '',
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.clientId || !this.config.token) {
      throw new Error(
        'NETPIE configuration is incomplete. Please check your environment variables (NETPIE_CLIENT_ID, NETPIE_TOKEN).',
      );
    }
  }

  /**
   * Gets the authorization header for NETPIE API requests
   * NETPIE 2020 uses "Device ClientID:Token" format (plain text, NOT base64)
   */
  private getAuthHeader(): string {
    return `Device ${this.config.clientId}:${this.config.token}`;
  }

  /**
   * Publishes a message to a NETPIE topic
   * @param topic The topic to publish to (without @msg prefix - REST API adds it automatically)
   * @param message The message payload
   * @returns Promise that resolves when message is published
   */
  async publish(topic: string, message: unknown): Promise<void> {
    try {
      // Topic is specified in the URL path
      // Note: Do NOT include @msg prefix - REST API adds it automatically
      const url = `${this.apiBaseUrl}/device/message/${topic}`;

      console.log(`[NETPIE] Publishing to topic: ${topic}...`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `NETPIE API request failed with status ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();
      console.log('[NETPIE] Published successfully:', responseData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[NETPIE] Publish error:', errorMessage);
      throw new Error(`NETPIE publish failed: ${errorMessage}`);
    }
  }

  /**
   * Publishes aircon control message to NETPIE
   * Topic: aircon/control (equivalent to MQTT @msg/aircon/control)
   */
  async publishAirconControl(message: AirconControlMessage): Promise<void> {
    // Note: No @msg prefix needed - REST API adds it automatically
    return this.publish('aircon/control', message);
  }
}

// Singleton instance
let netpieClient: NetpieClient | null = null;

/**
 * Gets or creates the NETPIE client singleton
 */
export function getNetpieClient(): NetpieClient {
  if (!netpieClient) {
    netpieClient = new NetpieClient();
  }
  return netpieClient;
}

/**
 * Helper function to publish aircon control message
 */
export async function publishAirconControl(
  message: AirconControlMessage,
): Promise<void> {
  const client = getNetpieClient();
  return client.publishAirconControl(message);
}
