// ============================================================
// SyncUs - Code Input Component
// ============================================================

import React, {useRef, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import {Colors, BorderRadius, Typography} from '../constants/theme';
import {ROOM_CODE_LENGTH} from '../constants';

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  onComplete,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleChange = (text: string, index: number) => {
    // Filter to only uppercase alphanumeric chars
    const char = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    if (char.length > 1) {
      // Handle paste scenario
      const pastedCode = char.slice(0, ROOM_CODE_LENGTH);
      onChange(pastedCode);
      if (pastedCode.length === ROOM_CODE_LENGTH) {
        Keyboard.dismiss();
        onComplete?.(pastedCode);
      }
      return;
    }

    // Build new code string
    const codeArr = value.split('');
    codeArr[index] = char;
    const newCode = codeArr.join('').slice(0, ROOM_CODE_LENGTH);
    onChange(newCode);

    // Auto-focus next input
    if (char && index < ROOM_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check complete
    if (newCode.length === ROOM_CODE_LENGTH && index === ROOM_CODE_LENGTH - 1) {
      Keyboard.dismiss();
      onComplete?.(newCode);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const codeArr = value.split('');
      codeArr[index - 1] = '';
      onChange(codeArr.join(''));
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({length: ROOM_CODE_LENGTH}).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            value[index] && styles.inputFilled,
          ]}
          value={value[index] || ''}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={({nativeEvent}) =>
            handleKeyPress(nativeEvent.key, index)
          }
          onFocus={() => setFocusedIndex(index)}
          maxLength={1}
          keyboardType="default"
          autoCapitalize="characters"
          textAlign="center"
          selectionColor={Colors.primary}
          placeholderTextColor={Colors.textMuted}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  input: {
    width: 52,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    color: Colors.white,
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  inputFilled: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.surfaceLight,
  },
});
