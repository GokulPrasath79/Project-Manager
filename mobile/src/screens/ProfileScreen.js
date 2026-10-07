import { Text, View } from 'react-native';
import { useAuth } from '../auth';
import { Button } from '../components';
import { colors } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <View style={{ backgroundColor: colors.surface, padding: 18, borderRadius: 10, marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>{user.fullName}</Text>
        <Text style={{ color: colors.muted }}>{user.email}</Text>
      </View>
      <Button title="Log out" onPress={logout} kind="danger" />
    </View>
  );
}
