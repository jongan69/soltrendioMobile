import { StyleSheet, TextInput as RNTextInput, TextInputProps, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface Props extends TextInputProps {
  label: string;
}

export function TextInput({ label, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <RNTextInput 
        style={[styles.input, style]}
        placeholderTextColor="#666"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
}); 