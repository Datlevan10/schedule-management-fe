import {
  EncodingType,
  documentDirectory,
  downloadAsync,
  writeAsStringAsync,
} from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { ScheduleImportNewAPI } from "../api/schedule-import-new.api";

export interface DownloadResponse {
  success: boolean;
  data?: {
    content_base64: string;
    filename: string;
    content_type: string;
  };
}

export class FileDownloadManager {
  static async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Quyền truy cập bộ nhớ",
            message: "Ứng dụng cần quyền truy cập bộ nhớ để tải xuống tệp",
            buttonNeutral: "Hỏi lại sau",
            buttonNegative: "Hủy",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS doesn't need storage permission for downloads
  }

  static async downloadTemplate(templateId: number): Promise<boolean> {
    try {
      const hasPermission = await this.requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          "Lỗi",
          "Cần có quyền truy cập bộ nhớ để tải xuống tệp"
        );
        return false;
      }

      const response = await ScheduleImportNewAPI.downloadTemplate(templateId);

      if (!response.success || !response.data) {
        throw new Error("Invalid response from server");
      }

      const { content_base64, filename } = response.data;
      return await this.saveBase64File(
        content_base64,
        filename || `template_${templateId}.csv`
      );
    } catch (error) {
      console.error("Error downloading template:", error);
      Alert.alert("Lỗi tải xuống", "Không thể tải xuống tệp mẫu");
      return false;
    }
  }

  static async downloadSample(templateId: number): Promise<boolean> {
    try {
      const hasPermission = await this.requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          "Lỗi",
          "Cần có quyền truy cập bộ nhớ để tải xuống tệp"
        );
        return false;
      }

      const response = await ScheduleImportNewAPI.downloadSample(templateId);

      if (!response.success || !response.data) {
        throw new Error("Invalid response from server");
      }

      const { content_base64, filename } = response.data;
      return await this.saveBase64File(
        content_base64,
        filename || `sample_${templateId}.csv`
      );
    } catch (error) {
      console.error("Error downloading sample:", error);
      Alert.alert("Lỗi tải xuống", "Không thể tải xuống tệp mẫu dữ liệu");
      return false;
    }
  }

  static async downloadInstructions(templateId: number): Promise<boolean> {
    try {
      const hasPermission = await this.requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          "Lỗi",
          "Cần có quyền truy cập bộ nhớ để tải xuống tệp"
        );
        return false;
      }

      const response = await ScheduleImportNewAPI.downloadInstructions(
        templateId
      );

      if (!response.success || !response.data) {
        throw new Error("Invalid response from server");
      }

      const { content_base64, filename } = response.data;
      return await this.saveBase64File(
        content_base64,
        filename || `instructions_${templateId}.pdf`
      );
    } catch (error) {
      console.error("Error downloading instructions:", error);
      Alert.alert("Lỗi tải xuống", "Không thể tải xuống tệp hướng dẫn");
      return false;
    }
  }

  private static async saveBase64File(
    base64Content: string,
    fileName: string
  ): Promise<boolean> {
    try {
      // Create file path in documents directory
      const fileUri = documentDirectory + fileName;

      // Write base64 content to file
      await writeAsStringAsync(fileUri, base64Content, {
        encoding: EncodingType.Base64,
      });

      // Check if sharing is available and share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: this.getMimeType(fileName),
          dialogTitle: "Save or share file",
        });
        return true;
      } else {
        // Fallback for platforms where sharing is not available
        Alert.alert("Tệp đã tải xuống", `Tệp đã được lưu tại: ${fileUri}`, [
          {
            text: "OK",
            onPress: () => {},
          },
        ]);
        return true;
      }
    } catch (error) {
      console.error("Error saving file:", error);
      Alert.alert("Lỗi lưu", "Không thể lưu tệp vào thiết bị");
      return false;
    }
  }

  private static getMimeType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "csv":
        return "text/csv";
      case "pdf":
        return "application/pdf";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "xls":
        return "application/vnd.ms-excel";
      default:
        return "application/octet-stream";
    }
  }

  static async downloadAndSaveFileFromUrl(
    url: string,
    fileName: string
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          "Lỗi",
          "Cần có quyền truy cập bộ nhớ để tải xuống tệp"
        );
        return false;
      }

      // Download file from URL
      const fileUri = documentDirectory + fileName;
      const downloadResult = await downloadAsync(url, fileUri);

      if (downloadResult.status === 200) {
        // Share the downloaded file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: this.getMimeType(fileName),
            dialogTitle: "Save or share file",
          });
        } else {
          Alert.alert(
            "Tệp đã tải xuống",
            `Tệp đã được lưu tại: ${downloadResult.uri}`
          );
        }
        return true;
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult.status}`
        );
      }
    } catch (error) {
      console.error("Error downloading from URL:", error);
      Alert.alert("Lỗi tải xuống", "Không thể tải xuống tệp");
      return false;
    }
  }
}

export default FileDownloadManager;
