import React from 'react';
import { View } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { ThemedText } from './ThemedText';

interface ChartData {
    base_value: number;
    base_value_asof: string;
    equity: number[];
    profit_loss: number[];
    profit_loss_pct: number[];
    timeframe: string;
    timestamp: number[];
}

interface LineChartComponentProps {
    data: ChartData;
    lineColor?: string;
    verticalLinesColor?: string;
    axisColor?: string;
    labelTextColor?: string;
}
const Separator = () => <View style={{ height: 30 }} />;

const LineChartComponent: React.FC<LineChartComponentProps> = ({
    data,
    lineColor = 'rgb(25, 229, 73)',
    verticalLinesColor = 'rgba(250, 250, 250, 0.5)',
    axisColor = 'rgb(255, 255, 255)',
    labelTextColor = 'rgb(243, 243, 243)',
}) => {
    if (!data) {
        return <ThemedText>Loading...</ThemedText>;
    }

    // Ensure data is sorted by timestamp
    const sortedData = data.timestamp
        .map((timestamp, index) => ({ timestamp, value: data.equity[index] }))
        .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate min and max values for centering
    const minValue = Math.min(...data.equity);
    const maxValue = Math.max(...data.equity);
    // const scaleFactor = 2; // Define the scale factor

    // Scale the data to fit within the desired range
    const scaledChartData = sortedData.map(({ value }, index) => ({
        value: value,
        index
    }));

    // Format x-axis labels from sorted data
    const xAxisLabels = sortedData.map(({ timestamp }) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(); // Format date as needed
    });

    return (
        <View style={{ height: 220, borderRadius: 10, padding: 10 }}>
            <View style={{ flex: 1, marginBottom: 30 }}>
                <Separator />
                <ThemedText style={{ fontSize: 18, padding: 1, fontWeight: 'bold', color: '#fff' }}>Equity</ThemedText>
                <LineChart
                    data={scaledChartData} // Use scaled data
                    color={lineColor}
                    thickness={3}
                    showValuesAsDataPointsText={true}
                    yAxisColor={axisColor}
                    xAxisColor={axisColor}
                    xAxisLabelTextStyle={{ color: labelTextColor, fontSize: 12, fontFamily: 'Arial' }}
                    xAxisLabelTexts={xAxisLabels} // Use formatted x-axis labels
                    yAxisTextStyle={{ color: labelTextColor, fontSize: 12, fontFamily: 'Arial' }}
                    renderDataPointsAfterAnimationEnds={true}
                    yAxisExtraHeight={20}
                    showYAxisIndices={true}
                    dataPointLabelShiftY={40}
                    lineGradient={true} // Enable line gradient
                    lineGradientStartColor={'#ff7e5f'} // Gradient start color
                    lineGradientEndColor={'#feb47b'} // Gradient end color
                    dataPointsColor={'#ff7e5f'} // Data points color
                    dataPointsRadius={4} // Data points radius
                    isAnimated
                    hideRules={true}
                    maxValue={maxValue * 1.5}
                    height={180}
                    hideOrigin={true}
                />
                <Separator />
            </View>
        </View>
    );
};

export default LineChartComponent;
