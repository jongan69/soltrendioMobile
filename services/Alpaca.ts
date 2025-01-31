interface AlpacaConfig {
  keyId: string;
  secretKey: string;
  paper: boolean;
}

class Alpaca {
  private baseUrl: string;
  private keyId: string;
  private secretKey: string;

  constructor(config: AlpacaConfig) {
    this.keyId = config.keyId;
    this.secretKey = config.secretKey;
    this.baseUrl = config.paper ? 
      'https://paper-api.alpaca.markets' : 
      'https://api.alpaca.markets';
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/v2/${endpoint}`, {
        ...options,
        headers: {
        'APCA-API-KEY-ID': this.keyId,
        'APCA-API-SECRET-KEY': this.secretKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText}`);
    }

      return response.json();
    } catch (error) {
      console.log('[Alpaca] Fetch error:', error);
      throw error;
    }
  }

  async getAccount() {
    return this.fetch('account');
  }

  async getPositions() {
    return this.fetch('positions');
  }

  async getOrders(params = {}) {
    return this.fetch('orders');
  }

  async getPortfolioHistory() {
    return this.fetch('account/portfolio/history?intraday_reporting=market_hours&pnl_reset=per_day');
  }

  async getNews() {
    const response = await fetch(`https://data.alpaca.markets/v1beta1/news?sort=desc`, {
      headers: {
        'APCA-API-KEY-ID': this.keyId,
        'APCA-API-SECRET-KEY': this.secretKey,
      },
    });
    return response.json();
  }
}

export default Alpaca; 