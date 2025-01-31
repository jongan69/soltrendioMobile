import React from "react";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
export default function PositionsList({ positions }: { positions: any }) {
    return (
        <>
            {positions && positions?.length > 0 ? (
                <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle">Positions</ThemedText>
                {positions.map((position: any) => (
                  <ThemedView key={position.symbol} style={styles.positionItem}>
                    <ThemedText type="defaultSemiBold">{position.symbol}</ThemedText>
                    <ThemedText>{position.qty} shares @ ${position.current_price}</ThemedText>
                    <ThemedText style={{ color: position.unrealized_pl >= 0 ? '#4CAF50' : '#F44336' }}>
                      P/L: ${position.unrealized_pl.toFixed(2)} ({(position.unrealized_plpc * 100).toFixed(2)}%)
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            ) : (
                <ThemedView>
                    <ThemedText>No positions available</ThemedText>
                </ThemedView>
            )}
        </>
    )
}       

const styles = StyleSheet.create({
    sectionContainer: {
        padding: 16,
        gap: 8,
    },
    positionItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
});