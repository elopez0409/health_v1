import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ChatMessage from '@/components/ChatMessage';
import { useAuth } from '@/hooks/useAuth';
import { APP_COLORS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

const SUGGESTED_PROMPTS = [
  'Why was my readiness low recently?',
  "How's my HRV trending?",
  "What's been affecting my sleep?",
  'Am I on track with my goals?',
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function send(text: string) {
    if (!text.trim() || !user || loading) return;

    const userMsg: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const { data, error } = await supabase.functions.invoke('health-chat', {
        body: {
          userId: user.id,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      const assistantMsg: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch {
      const errMsg: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ask HealthHub</Text>
          <Text style={styles.emptySubtitle}>
            Ask anything about your health data — readiness, sleep, HRV, goals, and more.
          </Text>
          <View style={styles.chips}>
            {SUGGESTED_PROMPTS.map(prompt => (
              <Pressable key={prompt} style={styles.chip} onPress={() => send(prompt)}>
                <Text style={styles.chipText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={APP_COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your data…</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your health…"
          placeholderTextColor={APP_COLORS.mutedText}
          returnKeyType="send"
          onSubmitEditing={() => send(input)}
          editable={!loading}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => send(input)}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  emptyTitle: {
    color: APP_COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: APP_COLORS.mutedText,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  chips: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  chip: {
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chipText: {
    color: APP_COLORS.text,
    fontSize: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingText: {
    color: APP_COLORS.mutedText,
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
    backgroundColor: APP_COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: APP_COLORS.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: APP_COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
