import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';
import { FileDownloadManager } from '../utils/fileDownload';

export default function FileDownloadTest() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const testDownload = async (templateId: number, type: 'template' | 'sample' | 'instructions') => {
    try {
      setDownloading(`${type}_${templateId}`);
      let success = false;

      switch (type) {
        case 'template':
          success = await FileDownloadManager.downloadTemplate(templateId);
          break;
        case 'sample':
          success = await FileDownloadManager.downloadSample(templateId);
          break;
        case 'instructions':
          success = await FileDownloadManager.downloadInstructions(templateId);
          break;
      }

      if (success) {
        Alert.alert('Success', `${type} file downloaded successfully!`);
      }
    } catch (error) {
      console.error('Download test error:', error);
      Alert.alert('Error', `Failed to download ${type} file`);
    } finally {
      setDownloading(null);
    }
  };

  const testDirectUrlDownload = async () => {
    try {
      setDownloading('direct_url');
      
      // Test with the correct URL (using the API config IP)
      const success = await FileDownloadManager.downloadAndSaveFileFromUrl(
        'http://192.168.1.2:8000/api/v1/schedule-import-templates/2/download-sample',
        'test_sample.csv'
      );

      if (success) {
        Alert.alert('Success', 'Direct URL download successful!');
      }
    } catch (error) {
      console.error('Direct URL download error:', error);
      Alert.alert('Error', 'Failed to download from direct URL');
    } finally {
      setDownloading(null);
    }
  };

  const isLoading = (type: string, id?: number) => {
    return downloading === (id ? `${type}_${id}` : type);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>File Download Test</Text>
        <Text style={styles.subtitle}>Test CSV file downloads on mobile devices</Text>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>API Downloads</Text>
        <Text style={styles.sectionDescription}>
          Test downloads using the FileDownloadManager with base64 response
        </Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.templateButton]}
            onPress={() => testDownload(2, 'template')}
            disabled={downloading !== null}
          >
            <Text style={styles.buttonText}>
              {isLoading('template', 2) ? 'Downloading...' : 'Download Template'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.sampleButton]}
            onPress={() => testDownload(2, 'sample')}
            disabled={downloading !== null}
          >
            <Text style={styles.buttonText}>
              {isLoading('sample', 2) ? 'Downloading...' : 'Download Sample'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.instructionsButton]}
            onPress={() => testDownload(2, 'instructions')}
            disabled={downloading !== null}
          >
            <Text style={styles.buttonText}>
              {isLoading('instructions', 2) ? 'Downloading...' : 'Download Instructions'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Direct URL Download</Text>
        <Text style={styles.sectionDescription}>
          Test direct URL download functionality
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.directButton]}
          onPress={testDirectUrlDownload}
          disabled={downloading !== null}
        >
          <Text style={styles.buttonText}>
            {isLoading('direct_url') ? 'Downloading...' : 'Test Direct URL'}
          </Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Expected Behavior</Text>
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>• Files should download to app documents directory</Text>
          <Text style={styles.listItem}>• Share dialog should appear on successful download</Text>
          <Text style={styles.listItem}>• User can save to device or share via apps</Text>
          <Text style={styles.listItem}>• CSV files should open in spreadsheet apps</Text>
          <Text style={styles.listItem}>• Proper error handling for network/permission issues</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    flex: 1,
    minWidth: 150,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateButton: {
    backgroundColor: Colors.primary,
  },
  sampleButton: {
    backgroundColor: Colors.success,
  },
  instructionsButton: {
    backgroundColor: Colors.warning,
  },
  directButton: {
    backgroundColor: Colors.secondary,
  },
  buttonText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '600',
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
});