import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import {
  getPrivateLocationLabel,
  getPublicLocationLabel,
  searchLocationSuggestions,
  type SavedLocation,
} from '@/utils/location';

type LocationFieldProps = {
  collapseSuggestionsOnSelect?: boolean;
  helperText?: string;
  label: string;
  onChange: (value: SavedLocation | null) => void;
  placeholder?: string;
  suggestionMetaFormatter?: (value: SavedLocation) => string;
  suggestionTitleFormatter?: (value: SavedLocation) => string;
  suggestions: SavedLocation[];
  value: SavedLocation | null;
  valueFormatter?: (value: SavedLocation) => string;
};

export function LocationField({
  collapseSuggestionsOnSelect = false,
  helperText,
  label,
  onChange,
  placeholder = 'Search by neighborhood or city',
  suggestionMetaFormatter = getPublicLocationLabel,
  suggestionTitleFormatter = getPrivateLocationLabel,
  suggestions,
  value,
  valueFormatter = getPrivateLocationLabel,
}: LocationFieldProps) {
  const [query, setQuery] = useState(value ? valueFormatter(value) : '');
  const [showSuggestions, setShowSuggestions] = useState(!collapseSuggestionsOnSelect || !value);

  useEffect(() => {
    if (!value) {
      if (collapseSuggestionsOnSelect) {
        setShowSuggestions(true);
      }
      return;
    }

    setQuery(valueFormatter(value));
    if (collapseSuggestionsOnSelect) {
      setShowSuggestions(false);
    }
  }, [collapseSuggestionsOnSelect, value, valueFormatter]);

  const filteredSuggestions = useMemo(() => {
    const results = searchLocationSuggestions(query, suggestions);
    return results.slice(0, query.trim().length > 0 ? 6 : 5);
  }, [query, suggestions]);
  const selected = value ? query === valueFormatter(value) : false;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        onChangeText={(nextValue) => {
          setQuery(nextValue);
          if (collapseSuggestionsOnSelect) {
            setShowSuggestions(true);
          }

          if (value && nextValue !== valueFormatter(value)) {
            onChange(null);
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, collapseSuggestionsOnSelect && selected ? styles.inputSelected : null]}
        value={query}
      />
      {showSuggestions ? (
        <View style={styles.suggestionList}>
          {filteredSuggestions.map((location) => {
            const suggestionSelected = value?.id === location.id;

            return (
              <Pressable
                key={location.id}
                accessibilityRole="button"
                onPress={() => {
                  setQuery(valueFormatter(location));
                  onChange(location);
                  if (collapseSuggestionsOnSelect) {
                    setShowSuggestions(false);
                  }
                }}
                style={({ pressed }) => [
                  styles.suggestionCard,
                  suggestionSelected ? styles.suggestionCardSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.suggestionTitle}>{suggestionTitleFormatter(location)}</Text>
                <Text style={styles.suggestionMeta}>{suggestionMetaFormatter(location)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  inputSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  suggestionList: {
    gap: spacing.sm,
  },
  suggestionCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  suggestionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  suggestionMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.85,
  },
});
