import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

interface TickerScrollViewProps {
    data: Array<{ ticker: string; count: number }>;
}

const TickerScrollView: React.FC<TickerScrollViewProps> = ({ data }) => {
    return (
        <ScrollView horizontal style={styles.scrollView}>
            {data.map((item, index) => (
                <View key={index} style={styles.tickerItem}>
                    <Text style={styles.symbol}>{item.ticker}</Text>
                    <Text style={styles.price}>{item.count.toFixed(2)}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    tickerItem: {
        marginRight: 20,
        alignItems: 'center',
    },
    symbol: {
        fontWeight: 'bold',
    },
    price: {
        color: 'green',
    },
});

export default TickerScrollView;
