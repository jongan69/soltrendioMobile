import { KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useState } from 'react';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { useStore } from '@/store/store';
import { getSolanaAddressFromPrivateKey } from '@/utils/getAddressFromPK';

export default function SettingsScreen() {
  const { setApiKey, setApiSecret, setPrivateKey, setSolanaAddress, apiKey, apiSecret, privateKey, solanaAddress, loadCredentials } = useStore();
  const [tempApiKey, setTempApiKey] = useState<string | undefined>(apiKey || undefined);
  const [tempApiSecret, setTempApiSecret] = useState<string | undefined>(apiSecret || undefined);
  const [tempPrivateKey, setTempPrivateKey] = useState<string | undefined>(privateKey || undefined);

  const handleSave = () => {
    if (tempApiKey) setApiKey(tempApiKey);
    if (tempApiSecret) setApiSecret(tempApiSecret);
    if (tempPrivateKey) setPrivateKey(tempPrivateKey);
    if (tempPrivateKey) setSolanaAddress(getSolanaAddressFromPrivateKey(tempPrivateKey));

    // Trigger a re-fetch of data after saving credentials
    loadCredentials().then(() => {
      console.log('[SettingsScreen] Credentials saved and reloaded');
    });
    // Could add a success toast here
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <Collapsible title="Solana Wallet" defaultExpanded>  
        <ThemedText style={styles.description}>
          Enter your Solana Private Key below. You can find this in your Solana dashboard.
        </ThemedText>
        {solanaAddress && (
            <ThemedView style={styles.currentCredentials}>
              <ThemedText>Current Private Key:</ThemedText>
              <ThemedText>
                {solanaAddress.substring(0, 4)}...{solanaAddress.substring(solanaAddress.length - 4)}
              </ThemedText>
            </ThemedView>
          )}

        <TextInput
          label="Private Key"
          value={tempPrivateKey}
          onChangeText={setTempPrivateKey}
          placeholder="Enter your private key"
          secureTextEntry
        />
      </Collapsible>

      <Collapsible title="Alpaca API Credentials" defaultExpanded>
        <ThemedText style={styles.description}>
          Enter your Alpaca API credentials below. You can find these in your Alpaca dashboard.
        </ThemedText>
        
        <ThemedView style={styles.inputContainer}>
          {apiKey && (
            <ThemedView style={styles.currentCredentials}>
              <ThemedText>Current API Key:</ThemedText>
              <ThemedText>
                {apiKey.substring(0, 4)}...{apiKey.substring(apiKey.length - 4)}
              </ThemedText>
            </ThemedView>
          )}
          
          {apiSecret && (
            <ThemedView style={styles.currentCredentials}>
              <ThemedText>Current API Secret:</ThemedText>
              <ThemedText>
                {apiSecret.substring(0, 4)}...{apiSecret.substring(apiSecret.length - 4)}
              </ThemedText>
            </ThemedView>
          )}

          <TextInput
            label="API Key"
            value={tempApiKey}
            onChangeText={setTempApiKey}
            placeholder="Enter your API key"
            secureTextEntry
          />
          
          <TextInput
            label="API Secret"
            value={tempApiSecret}
            onChangeText={setTempApiSecret}
            placeholder="Enter your API secret"
            secureTextEntry
          />

          <Button 
            onPress={handleSave}
            style={styles.saveButton}
          >
            Save Credentials
          </Button>
        </ThemedView>
      </Collapsible>

      <Collapsible title="About">
        <ThemedText>
          This app allows you to monitor and manage your Alpaca trading account. Make sure to keep your API credentials secure and never share them with anyone.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
  },
  inputContainer: {
    gap: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  currentCredentials: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
});
