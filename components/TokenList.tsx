import React from "react";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Linking, Pressable, Image } from "react-native";
import { StyleSheet } from "react-native";

export default function TokenList({ tokenData }: { tokenData: any }) {
    return (
        <>
            {tokenData && tokenData?.length > 0 ? (
                <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle">Tokens</ThemedText>
                {tokenData.map((token: any) => (
                  <Pressable
                    key={token.mintAddress}
                    onPress={() => Linking.openURL(token.website[0].url)}
                    style={({ pressed }) => [
                      styles.positionItem,
                      pressed && styles.positionItemPressed
                    ]}>
                    <ThemedView key={token.mintAddress} style={styles.positionItem}>
                      <Image source={{ uri: token.image }} style={styles.tokenLogo} />
                      <ThemedText type="defaultSemiBold">{token.name}</ThemedText>
                      <ThemedText>{token.mintAddress}</ThemedText>
                      <ThemedText>{token.amount} {token.symbol}</ThemedText>
                      <ThemedText>${token.usdValue.toFixed(2)}</ThemedText>
                    </ThemedView>
                  </Pressable>
                ))}
              </ThemedView> 
            ) : (
                <ThemedView>
                    <ThemedText>No tokens available</ThemedText>
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
      positionItemPressed: {
        opacity: 0.7,
      },
      tokenLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
      },
});