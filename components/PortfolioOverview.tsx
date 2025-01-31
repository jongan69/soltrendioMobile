import React from "react";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
export default function PortfolioOverview({ accountData, walletValue }: { accountData: any, walletValue: number }) {
    return (
        <>
            {accountData ? (
                <ThemedView style={styles.accountContainer}>
                <ThemedText type="subtitle">Total Portfolio Value: ${(Number(accountData.portfolio_value) + Number(walletValue)).toLocaleString()}</ThemedText>
                <ThemedText>Stocks Value: ${Number(accountData.equity).toLocaleString()}</ThemedText>
                <ThemedText>Solana Wallet Value: ${walletValue.toLocaleString()}</ThemedText>
                <ThemedText>Cash: ${Number(accountData.cash).toLocaleString()}</ThemedText>
                <ThemedText>Buying Power: ${Number(accountData.buying_power).toLocaleString()}</ThemedText>
              </ThemedView>
            ) : (
                <ThemedView>
                    <ThemedText>No account data available</ThemedText>
                </ThemedView>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    accountContainer: {
        padding: 16,
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        margin: 16,
      },
});