

class Trends {
    private rpcUrl: string;
    constructor() {
        this.rpcUrl = "https://soltrendio.com/api";
    }

    private async fetch(endpoint: string) {
        const response = await fetch(`${this.rpcUrl}/${endpoint}`);

        if (!response.ok) {
            throw new Error(`Trends API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async getTrends() {
        return this.fetch('stats/getTrends');
    }

}

export default Trends; 