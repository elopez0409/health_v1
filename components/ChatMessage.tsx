import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS } from '@/lib/constants';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

type Props = {
  message: ChatMessageType;
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: APP_COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  textUser: {
    color: '#fff',
  },
  textAssistant: {
    color: APP_COLORS.text,
  },
});
