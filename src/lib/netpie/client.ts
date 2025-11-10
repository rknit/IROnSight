import mqtt from 'mqtt';

/**
 * NETPIE 2020 MQTT Client
 * Handles connection and publishing to NETPIE IoT platform
 */

export interface NetpieConfig {
  appId: string;
  key: string;
  secret: string;
  alias: string;
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
  private client: mqtt.MqttClient | null = null;
  private config: NetpieConfig;
  private connecting: Promise<void> | null = null;

  constructor() {
    this.config = {
      appId: process.env.NETPIE_APPID || '',
      key: process.env.NETPIE_KEY || '',
      secret: process.env.NETPIE_SECRET || '',
      alias: process.env.NETPIE_ALIAS || '',
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    if (
      !this.config.appId ||
      !this.config.key ||
      !this.config.secret ||
      !this.config.alias
    ) {
      throw new Error(
        'NETPIE configuration is incomplete. Please check your environment variables.',
      );
    }
  }

  /**
   * Establishes connection to NETPIE broker
   */
  private async connect(): Promise<void> {
    // If already connecting, wait for that connection
    if (this.connecting) {
      return this.connecting;
    }

    // If already connected, return immediately
    if (this.client && this.client.connected) {
      return Promise.resolve();
    }

    this.connecting = new Promise((resolve, reject) => {
      try {
        const clientId = `${this.config.key}:${this.config.alias}`;
        const username = this.config.key;
        const password = this.config.secret;

        // NETPIE 2020 broker configuration
        const brokerUrl = 'mqtt://broker.netpie.io:1883';

        console.log(
          `[NETPIE] Connecting to ${brokerUrl} as ${this.config.alias}...`,
        );

        this.client = mqtt.connect(brokerUrl, {
          clientId,
          username,
          password,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 30000,
        });

        this.client.on('connect', () => {
          console.log('[NETPIE] Connected successfully');
          this.connecting = null;
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('[NETPIE] Connection error:', error);
          this.connecting = null;
          reject(new Error(`NETPIE connection failed: ${error.message}`));
        });

        this.client.on('offline', () => {
          console.log('[NETPIE] Client went offline');
        });

        this.client.on('reconnect', () => {
          console.log('[NETPIE] Attempting to reconnect...');
        });
      } catch (error) {
        this.connecting = null;
        reject(error);
      }
    });

    return this.connecting;
  }

  /**
   * Publishes a message to NETPIE
   * @param topic The topic to publish to (e.g., "@msg/aircon/control")
   * @param message The message payload
   * @returns Promise that resolves when message is published
   */
  async publish(topic: string, message: unknown): Promise<void> {
    try {
      // Ensure we're connected
      await this.connect();

      if (!this.client || !this.client.connected) {
        throw new Error('NETPIE client is not connected');
      }

      // Convert message to JSON string
      const payload = JSON.stringify(message);

      // Publish with QoS 1 (at least once delivery)
      return new Promise((resolve, reject) => {
        if (!this.client) {
          reject(new Error('NETPIE client is not initialized'));
          return;
        }

        this.client.publish(topic, payload, { qos: 1 }, (error) => {
          if (error) {
            console.error('[NETPIE] Publish error:', error);
            reject(new Error(`Failed to publish to NETPIE: ${error.message}`));
          } else {
            console.log(`[NETPIE] Published to ${topic}:`, payload);
            resolve();
          }
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`NETPIE publish failed: ${errorMessage}`);
    }
  }

  /**
   * Publishes aircon control message to NETPIE
   */
  async publishAirconControl(message: AirconControlMessage): Promise<void> {
    return this.publish('@msg/aircon/control', message);
  }

  /**
   * Disconnects from NETPIE broker
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        if (!this.client) {
          resolve();
          return;
        }

        this.client.end(false, {}, () => {
          console.log('[NETPIE] Disconnected');
          this.client = null;
          resolve();
        });
      });
    }
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
