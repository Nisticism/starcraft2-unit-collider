import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export type SelectItem = {
  value: string;
  label: string;
  /** Optional accent dot color (e.g. race color). */
  accentColor?: string;
  /** Optional thumbnail image. */
  image?: ImageSourcePropType;
};

type Props = {
  visible: boolean;
  title: string;
  items: SelectItem[];
  selectedValue?: string;
  /** Show a search box when there are many options. */
  searchable?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
};

/** A reusable modal list picker with optional search, accent dots and thumbnails. */
export function SelectModal({
  visible,
  title,
  items,
  selectedValue,
  searchable = false,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable hitSlop={8} onPress={onClose}>
              <Text style={styles.close}>Done</Text>
            </Pressable>
          </View>

          {searchable ? (
            <TextInput
              style={styles.search}
              placeholder="Search…"
              placeholderTextColor={colors.darkGray}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(i) => i.value}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => {
              const selected = item.value === selectedValue;
              return (
                <Pressable
                  style={[styles.row, selected && styles.rowSelected]}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                >
                  {item.image ? (
                    <Image source={item.image} style={styles.thumb} />
                  ) : item.accentColor ? (
                    <View style={[styles.dot, { backgroundColor: item.accentColor }]} />
                  ) : null}
                  <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>
                    {item.label}
                  </Text>
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  close: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  search: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: '#f1f2f6',
    color: colors.black,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  rowSelected: {
    backgroundColor: colors.lightBlue,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  rowLabelSelected: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.black,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  check: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '800',
  },
});
