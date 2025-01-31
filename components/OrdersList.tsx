import React from "react";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
export default function OrdersList({ orders }: { orders: any }) {
    return (
        <>
            {orders.length > 0 ? (
             <ThemedView style={styles.sectionContainer}>
             <ThemedText type="subtitle">Recent Orders</ThemedText>
               {orders.map((item: { timestamp: any; symbol: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; side: string; qty: any; price: any; status: string; }, index: any) => (
                 <ThemedView key={`${item.timestamp}-${index}`} style={styles.orderItem}>
                   <ThemedText type="defaultSemiBold">{item.symbol}</ThemedText>
                   <ThemedText>{`${item.side.toUpperCase()} ${item.qty} @ $${item.price}`}</ThemedText>
                   <ThemedText type="defaultSemiBold" style={{ color: item.status === 'filled' ? '#4CAF50' : '#FFA000' }}>
                     {item.status.toUpperCase()}
                   </ThemedText>
                 </ThemedView>
               ))}
             </ThemedView>
            ) : (
                <ThemedView>
                    <ThemedText>No orders yet</ThemedText>
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
    orderItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
      ordersList: {
        marginTop: 16,
      },
});