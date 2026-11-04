// The member's round, as in the phone's own apps: a soft plain circle with a thin edge - the first
// letter of the member's name once signed in, a person icon before.
import { View } from 'react-native';

import { PersonIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { useTheme } from '@/theme/theme';

export function Avatar({ name, size = 48 }: { name?: string | null; size?: number }) {
  const { c } = useTheme();
  const letter = name?.trim().charAt(0).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {letter ? (
        <Txt size={size * 0.42} weight={600} color={c.ink}>
          {letter}
        </Txt>
      ) : (
        <PersonIcon color={c.ink} size={size * 0.46} />
      )}
    </View>
  );
}
