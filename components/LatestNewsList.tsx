import React from "react";
import { Pressable, Linking, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface NewsItem {
    id: string;
    headline: string;
    summary: string;
    author: string;
    created_at: string;
    updated_at: string;
    url: string;
    symbols: string[];
}

export default function LatestNewsList({ news }: { news: NewsItem[] }) {
    return (
        <>
        <ThemedText type="subtitle">Latest News</ThemedText>
        {news && news?.length > 0 ? news.slice(0, 5).map((item: NewsItem) => (
            <Pressable
                key={item.id}
                onPress={() => Linking.openURL(item.url)}
                style={({ pressed }) => [
                    styles.newsItem,
                    pressed && styles.newsItemPressed
                ]}>
                <ThemedView>
                    <ThemedText type="defaultSemiBold">{item.headline}</ThemedText>
                    <ThemedText numberOfLines={2} style={styles.newsSummary}>
                        {item.summary}
                    </ThemedText>
                    <ThemedView style={styles.newsFooter}>
                        <ThemedText style={styles.newsMetadata}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </ThemedText>
                        {item.symbols.length > 0 && (
                            <ThemedView style={styles.symbolsContainer}>
                                {item.symbols.slice(0, 30).map((symbol: any) => (
                                    <ThemedText key={symbol} style={styles.symbolTag}>
                                        ${symbol}
                                    </ThemedText>
                                ))}
                            </ThemedView>
                        )}
                    </ThemedView>
                </ThemedView>
            </Pressable>
        )) : 
        <ThemedView style={styles.emptyContainer}>
            <ThemedText>No news available</ThemedText>
        </ThemedView>
        }
        </>
    )
}

const styles = StyleSheet.create({
    newsItem: {
        flexDirection: 'column',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        maxWidth: '100%',
        overflow: 'hidden',
    },
    newsSummary: {
        marginTop: 4,
        marginBottom: 8,
        opacity: 0.8,
    },
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    newsMetadata: {
        fontSize: 12,
        opacity: 0.6,
    },
    symbolsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        maxWidth: '100%',
        overflow: 'hidden',
    },
    symbolTag: {
        fontSize: 10,
        color: '#64B5F6',
        backgroundColor: 'rgba(100, 181, 246, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        flexShrink: 1,
    },
    newsItemPressed: {
        opacity: 0.7,
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
      },
});