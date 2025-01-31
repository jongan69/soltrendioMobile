import React from 'react';
import { Image, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

// Expo Plugins
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Assets
import partialReactLogo from '@/assets/images/partial-react-logo.png';

// Store
import { useStore } from '@/store/store';

// Services
import Alpaca from '@/services/Alpaca';
import Trends from '@/services/Trends';

// Utils
import { calculateTotalWalletValue } from '@/utils/getWalletValue';
import { PublicKey } from '@solana/web3.js';

// Components
import TickerScrollView from '@/components/TickerScrollView';
import LineChartComponent from '@/components/LineChart';
import LatestNewsList from '@/components/LatestNewsList';
import PortfolioOverview from '@/components/PortfolioOverview';
import PositionsList from '@/components/PositionsList';
import TokenList from '@/components/TokenList';
import OrdersList from '@/components/OrdersList';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// import { sendWidgetData } from '@/utils/sendWidgetData';

// const ALPACA_WS_TASK = 'ALPACA_WEBSOCKET_TASK';
// const REFRESH_INTERVAL = 5000; // 5 seconds
const WALLET_DATA_CACHE_KEY = 'WALLET_DATA_CACHE';

async function registerBackgroundFetch() {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    console.log('Background execution is not available');
    return;
  }

  // await BackgroundFetch.registerTaskAsync(ALPACA_WS_TASK, {
  //   minimumInterval: 15 * 60, // Runs every 15 minutes
  //   stopOnTerminate: false,
  //   startOnBoot: true,
  // });

  console.log('[BackgroundFetch] Task Registered');
}

interface AccountData {
  cash: string;
  portfolio_value: string;
  buying_power: string;
  equity: string;
}

interface Position {
  symbol: string;
  qty: number;
  market_value: number;
  avg_entry_price: number;
  current_price: number;
  unrealized_pl: number;
  unrealized_plpc: number;
}

interface OrderUpdate {
  event: string;
  price: number;
  qty: number;
  symbol: string;
  timestamp: string;
  side: string;
  type: string;
  status: string;
}

interface TrendsData {
  trendPrice: string;
  largeHoldersCount: number;
  totalAmountStaked: string;
  totalUniqueWallets: number;
  bitcoinPrice: string;
  solanaPrice: string;
  ethereumPrice: string;
  topTweetedTickers: Array<{
    ticker: string;
    count: number;
    ca: string;
  }>;
  whaleActivity: {
    bullish: Array<{
      symbol: string;
      name: string;
      bullishScore: number;
    }>;
    bearish: Array<{
      symbol: string;
      name: string;
      bearishScore: number;
    }>;
  };
}

const NoCredentialsMessage = () => (
  <ThemedView style={styles.noCredentialsContainer}>
    <ThemedText type="subtitle" style={styles.noCredentialsText}>
      Welcome to Soltrendio Mobile!
    </ThemedText>
    <ThemedText style={styles.noCredentialsText}>
      Please enter your Solana address and Alpaca API credentials in the Settings tab to get started.
    </ThemedText>
  </ThemedView>
);

export default function HomeScreen() {
  const { apiKey, apiSecret, solanaAddress } = useStore();
  console.log('[HomeScreen] Component mounted, solanaAddress:', solanaAddress);
  const loadCredentials = useStore((state) => state.loadCredentials);

  const [orders, setOrders] = useState<OrderUpdate[]>([]);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<[]>([]);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendsLoading, setIsTrendsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [initialTrendsLoad, setInitialTrendsLoad] = useState(true);
  const [walletValue, setWalletValue] = useState(0);
  const [tickerData, setTickerData] = useState<Array<{ ticker: string; count: number }>>([]);
  const [mainCryptoData, setMainCryptoData] = useState<Array<{ ticker: string; count: number }>>([]);
  const [trendingTickers, setTrendingTickers] = useState<Array<{ ticker: string; count: number }>>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<any | null>(null);
  const [tokenData, setTokenData] = useState<any | null>(null);
  const loadAccountData = useCallback(async () => {
    try {
      const accountStr = await AsyncStorage.getItem('ACCOUNT_DATA');
      const positionsStr = await AsyncStorage.getItem('POSITIONS_DATA');

      if (accountStr) {
        setAccount(JSON.parse(accountStr));
      }

      if (positionsStr) {
        setPositions(JSON.parse(positionsStr));
      }

      const newsStr = await AsyncStorage.getItem('NEWS_DATA');
      if (newsStr) {
        setNews(JSON.parse(newsStr));
      }

      const trendsStr = await AsyncStorage.getItem('TRENDS_DATA');
      if (trendsStr) {
        setTrendsData(JSON.parse(trendsStr));
        setInitialTrendsLoad(false);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    }
  }, []);

  const fetchAlpacaData = useCallback(async () => {
    if (!apiKey || !apiSecret) return;
    if (initialLoad) setIsLoading(true);

    const alpaca = new Alpaca({
      keyId: apiKey,
      secretKey: apiSecret,
      paper: false,
    });

    try {
      // Fetch account data
      const account = await alpaca.getAccount();
      const portfolioHistory = await alpaca.getPortfolioHistory();
      await AsyncStorage.setItem('ACCOUNT_DATA', JSON.stringify(account));
      await AsyncStorage.setItem('PORTFOLIO_HISTORY', JSON.stringify(portfolioHistory));
      setPortfolioHistory(portfolioHistory);
      // sendWidgetData(account.equity);

      // Fetch positions
      const positions = await alpaca.getPositions();
      const formattedPositions = positions.map((p: any) => ({
        symbol: p.symbol,
        qty: Number(p.qty),
        market_value: Number(p.market_value),
        avg_entry_price: Number(p.avg_entry_price),
        current_price: Number(p.current_price),
        unrealized_pl: Number(p.unrealized_pl),
        unrealized_plpc: Number(p.unrealized_plpc)
      }));
      await AsyncStorage.setItem('POSITIONS_DATA', JSON.stringify(formattedPositions));

      // Fetch news
      const newsResponse = await alpaca.getNews();
      // console.log('[HomeScreen] News:', newsResponse);
      await AsyncStorage.setItem('NEWS_DATA', JSON.stringify(newsResponse.news || []));

      // Refresh local state
      await loadAccountData();
    } catch (error) {
      console.log('Error fetching Alpaca data:', error);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [apiKey, apiSecret, loadAccountData, initialLoad]);

  const fetchTrends = useCallback(async () => {
    if (!trendsData && initialTrendsLoad) setIsTrendsLoading(true);
    try {
      console.log('[HomeScreen] Starting trends fetch...');
      const trends = new Trends();
      const startTime = Date.now();
      const trendsData = await trends.getTrends();
      const endTime = Date.now();
      console.log(`[HomeScreen] Trends fetch completed in ${endTime - startTime}ms`);

      if (!trendsData) {
        throw new Error('Trends data is null');
      }

      await AsyncStorage.setItem('TRENDS_DATA', JSON.stringify(trendsData));
      setTrendsData(trendsData);
      setTickerData(trendsData.topTweetedTickers);
      const mainCryptoData = []
      mainCryptoData.push({ ticker: 'BTC', count: Number(trendsData.bitcoinPrice.replace(",", "")) });
      mainCryptoData.push({ ticker: 'SOL', count: Number(trendsData.solanaPrice) });
      mainCryptoData.push({ ticker: 'ETH', count: Number(trendsData.ethereumPrice) });
      mainCryptoData.push({ ticker: 'TREND', count: Number(trendsData.trendPrice) });
      const trendingTickers = trendsData.whaleActivity.bullish.map((coin: { symbol: string; bullishScore: number }) => ({ ticker: coin.symbol, count: coin.bullishScore }));
      setTrendingTickers(trendingTickers);
      setMainCryptoData(mainCryptoData);
      // console.log('[HomeScreen] Trends Data:', trendsData);
    } catch (error) {
      console.error('Error fetching trends:', error);
      // Try to load cached data if fetch fails
      try {
        const cachedData = await AsyncStorage.getItem('TRENDS_DATA');
        if (cachedData) {
          console.log('[HomeScreen] Loading cached trends data');
          setTrendsData(JSON.parse(cachedData));
        }
      } catch (cacheError) {
        console.error('Error loading cached trends:', cacheError);
      }
    } finally {
      setIsTrendsLoading(false);
      setInitialTrendsLoad(false);
    }
  }, [initialTrendsLoad]);

  const fetchWalletValue = useCallback(async () => {
    try {
      // First try to get cached value
      const cachedValue = await AsyncStorage.getItem(WALLET_DATA_CACHE_KEY);
      if (cachedValue) {
        console.log('[HomeScreen] Using cached wallet data:', cachedValue);
        setWalletValue(Number(JSON.parse(cachedValue).totalValue));
        setTokenData(JSON.parse(cachedValue).allTokenData);
        return;
      }

      console.log('[HomeScreen] No cached wallet value found, fetching fresh value...');
      if (!solanaAddress) {
        console.log('[HomeScreen] No Solana address provided');
        return;
      }
      console.log('[HomeScreen] Using Solana address:', solanaAddress);

      // Verify the address is valid
      try {
        new PublicKey(solanaAddress);
      } catch (e) {
        console.log('[HomeScreen] Invalid Solana address:', e);
        return;
      }

      const walletData = await calculateTotalWalletValue(new PublicKey(solanaAddress));

      const walletValue = walletData.totalValue;
      const tokenData = walletData.allTokenData.sort((a: any, b: any) => b.usdValue - a.usdValue);
      console.log('[HomeScreen] Token data:', tokenData[0].website[0]);
      setTokenData(tokenData);
      if (walletValue > 0) {  // Only cache if we got a valid value
        await AsyncStorage.setItem(WALLET_DATA_CACHE_KEY, JSON.stringify(walletData));
      }
      setWalletValue(walletValue);
    } catch (error) {
      console.log('[HomeScreen] Error fetching wallet value:', error);
      if (error instanceof Error) {
        console.log('[HomeScreen] Error details:', error.message);
      }
      setWalletValue(0);
    }
  }, [solanaAddress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAlpacaData(),
      fetchTrends(),
    ]);
    setRefreshing(false);
  }, [fetchAlpacaData, fetchTrends]);


  useEffect(() => {
    const initializeApp = async () => {
      console.log('[HomeScreen] Starting app initialization...');
      await loadCredentials();
      console.log('[HomeScreen] Credentials loaded');
      await registerBackgroundFetch();
      console.log('[HomeScreen] Background fetch registered');

      if (solanaAddress) {
        console.log('[HomeScreen] Found Solana address:', solanaAddress);
      } else {
        console.log('[HomeScreen] No Solana address found in credentials');
      }

      console.log('[HomeScreen] Starting initial data fetch...');
      await Promise.all([
        fetchAlpacaData(),
        fetchTrends(),
        fetchWalletValue()
      ]);
      console.log('[HomeScreen] Initial data fetch complete');
    };

    initializeApp().catch(error => {
      console.error('[HomeScreen] Error during initialization:', error);
    });

    // const interval = setInterval(async () => {
    //   await Promise.all([
    //     fetchAlpacaData(),
    //   ]);
    // }, REFRESH_INTERVAL);

    // const cleanup = startAutoScroll();

    return () => {
      // clearInterval(interval);
      // cleanup?.();
    };
  }, [loadCredentials]);

  // Add a useEffect to re-fetch data when apiKey or apiSecret changes
  useEffect(() => {
    if (apiKey && apiSecret) {
      fetchAlpacaData();
    }
  }, [apiKey, apiSecret]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image source={partialReactLogo} style={styles.reactLogo} />
      }
      HeaderComponent={() =>
        portfolioHistory ? (
          <LineChartComponent data={portfolioHistory} />
        ) : (
          <ThemedText>Loading chart data...</ThemedText>
        )
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Account Overview</ThemedText>
        <HelloWave />
      </ThemedView>

      {!apiKey || !apiSecret ? (
        <NoCredentialsMessage />
      ) : (
        <>
          {isTrendsLoading && initialTrendsLoad ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </ThemedView>
          ) : trendsData && trendingTickers && mainCryptoData ? (
            <>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Trending Memecoins</ThemedText>
              <TickerScrollView data={trendingTickers} />
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Crypto</ThemedText>
              <TickerScrollView data={mainCryptoData} />
            </>
          ) : (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </ThemedView>
          )}

          {isLoading && initialLoad ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </ThemedView>
          ) : (
            <>
              <PortfolioOverview accountData={account} walletValue={walletValue} />
              <ThemedView style={styles.sectionContainer}>
                <LatestNewsList news={news as any} />
              </ThemedView>
              <PositionsList positions={positions} />
              <TokenList tokenData={tokenData} />
              <OrdersList orders={orders} />
            </>
          )}
        </>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#A1CEDC',
  },
  contentContainer: {
    flexGrow: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  accountContainer: {
    padding: 16,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    margin: 16,
  },
  sectionContainer: {
    padding: 16,
    gap: 8,
  },
  bannerContainer: {
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    overflow: 'hidden',
  },
  bannerContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  bannerItem: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    width: 120,
    paddingVertical: 4,
  },
  bannerLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 4,
  },
  bannerValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    margin: 16,
  },
  noCredentialsContainer: {
    padding: 20,
    margin: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    gap: 12,
  },
  noCredentialsText: {
    textAlign: 'center',
  },
});
