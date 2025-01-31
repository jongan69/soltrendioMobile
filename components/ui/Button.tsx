import { Pressable, StyleSheet, PressableProps, ViewStyle, StyleProp } from 'react-native';
import { ThemedText } from '../ThemedText';

interface Props extends Omit<PressableProps, 'style'> {
  children: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({ children, style, ...props }: Props) {
  return (
    <Pressable style={[styles.button, style]} {...props}>
      <ThemedText style={styles.text}>{children}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 