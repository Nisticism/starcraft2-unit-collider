import { StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/** A themed search input, reusable across list screens. */
export function SearchBar({ value, onChangeText, placeholder = 'Search…' }: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.darkGray}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 0,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray,
    color: colors.black,
    fontSize: 16,
  },
});
