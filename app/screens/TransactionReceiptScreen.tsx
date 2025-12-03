import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { ShareNewIcon } from '../components/icons/ShareNewIcon';
import { SaveContactIcon } from '../components/icons/SaveContactIcon';
import { SplitMoneyIcon } from '../components/icons/SplitMoneyIcon';
import { Colors } from '../constants';

interface TransactionData {
  amount: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  senderNote: string;
  transactionCode: string;
  date: string;
  time: string;
}

export default function TransactionReceiptScreen() {
  const [transactionData, setTransactionData] = useState<TransactionData>({
    amount: '243,890',
    recipientName: 'WINCOMMERCE JSC',
    recipientBank: 'Ngân hàng TMCP Quân Đội\nVQRQ AFNC H630 5',
    recipientAccount: 'VQRQ AFNC H630 5',
    senderNote: '110743625112517245',
    transactionCode: 'FT253293236003880',
    date: '25 thg 11, 2025',
    time: '17:25',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: keyof TransactionData, value: string) => {
    setTransactionData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      Alert.alert('Thông báo', 'Đã lưu thông tin giao dịch');
    }
  };

  const renderField = (label: string, value: string, field: keyof TransactionData) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={(text) => handleInputChange(field, text)}
          multiline={field === 'recipientBank'}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check" size={40} color="white" />
          </View>
        </View>

        {/* Bank Logo */}
        <View style={styles.bankLogoContainer}>
          <SvgUri
            uri="https://business.techcombank.com.vn/origination/vi/techcombank-logo.89cc4063db74ec9f.svg"
            width={150}
            height={40}
          />
        </View>

        {/* Transaction Title */}
        <Text style={styles.transactionTitle}>
          Chuyển thành công{'\n'}Tới {transactionData.recipientName}{'\n'}
          <Text style={styles.amountText}>VND {transactionData.amount}</Text>
        </Text>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          {renderField('Tài khoản nhận', transactionData.recipientBank, 'recipientBank')}
          {renderField('Lời nhận', transactionData.senderNote, 'senderNote')}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Ngày thực hiện</Text>
            <View style={styles.dateTimeContainer}>
              {isEditing ? (
                <>
                  <TextInput
                    style={[styles.fieldInput, styles.dateInput]}
                    value={transactionData.date}
                    onChangeText={(text) => handleInputChange('date', text)}
                  />
                  <TextInput
                    style={[styles.fieldInput, styles.timeInput]}
                    value={transactionData.time}
                    onChangeText={(text) => handleInputChange('time', text)}
                  />
                </>
              ) : (
                <Text style={styles.fieldValue}>
                  {transactionData.date} lúc {transactionData.time}
                </Text>
              )}
            </View>
          </View>

          {renderField('Mã giao dịch', transactionData.transactionCode, 'transactionCode')}
        </View>

        {/* Help Link */}
        <TouchableOpacity style={styles.helpContainer}>
          <Text style={styles.helpText}>Đây là khoản chi tiêu gì?</Text>
        </TouchableOpacity>

        {/* Promotion Banner */}
        <View style={styles.promotionBanner}>
          <View style={styles.promotionIcon}>
            <Text style={styles.promotionEmoji}>🎁</Text>
          </View>
          <Text style={styles.promotionText}>
            Quá đơn giản để vay tới 100 triệu VND khi thông cầu chỉ 5 phút mà thôi.{' '}
            <Text style={styles.promotionLink}>Đăng ký</Text>
          </Text>
        </View>


        {/* Edit/Save Button */}
        {/* <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
          <Text style={styles.editButtonText}>
            {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'}
          </Text>
        </TouchableOpacity> */}
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <ShareNewIcon size={25} color="black" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <SaveContactIcon size={25} color="black" />
            <Text style={styles.actionText}>Lưu người nhận</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <SplitMoneyIcon size={25} color="black" />
            <Text style={styles.actionText}>Chia tiền</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.completeButtonText}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6ea',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  successContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 40,
    backgroundColor: '#0bc45a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankLogoContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  transactionTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 30,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 18,
    color: Colors.text.textColorTechComBank,
    fontWeight: 600,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 20,
    color: Colors.text.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
  fieldInput: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 6,
    padding: 8,
    minHeight: 40,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 2,
    marginRight: 10,
  },
  timeInput: {
    flex: 1,
  },
  helpContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  helpText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500"
  },
  promotionBanner: {
    backgroundColor: '#FCE4EC',
    borderWidth: 1,
    borderColor: '#8A8A8A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  promotionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  promotionEmoji: {
    fontSize: 20,
  },
  promotionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  promotionLink: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    gap: 5
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: 500
  },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignSelf: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: "#101010",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fdf6ea',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 50,
    // justifyContent: 'space-around',
    marginBottom: 16,
  },
  shareMoneyButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  shareMoneyText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});