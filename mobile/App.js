import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/auth';
import { colors } from './src/theme';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const headerStyle = { headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.ink, headerShadowVisible: false };

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ ...headerStyle, tabBarActiveTintColor: colors.accent }}>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Projects" component={ProjectsScreen} />
      <Tabs.Screen name="Account" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={({ route }) => ({ title: route.params.name })} />
          <Stack.Screen name="TaskForm" component={TaskFormScreen} options={({ route }) => ({ title: route.params.task ? 'Edit task' : 'New task', presentation: 'modal' })} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
