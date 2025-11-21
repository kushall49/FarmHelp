# Navigation Architecture Documentation

## 📐 Architecture Overview

FarmHelp uses a hierarchical navigation structure built with React Navigation v6:

```
RootStack (Stack.Navigator)
│
├── Auth Screens (Login, Signup)
│
└── MainTabs (Tab.Navigator) ← Bottom tabs for main sections
    │
    ├── HomeTab (Stack.Navigator)
    │   ├── Home (no header)
    │   ├── PlantAnalyzer (with header + back)
    │   ├── Chatbot (with header + back)
    │   └── CropRecommendation (with header + back)
    │
    ├── CommunityTab (Stack.Navigator)
    │   ├── Community (no header)
    │   ├── CreatePost (with header + back)
    │   ├── PostDetail (with header + back)
    │   └── UserProfile (with header + back)
    │
    ├── ServicesTab (Stack.Navigator)
    │   ├── ServicesHome (no header)
    │   └── ... (service screens with headers)
    │
    └── ProfileTab (Profile screen, no stack)
```

## 🎯 Key Features

### ✅ **Proper Back Navigation**
- Feature screens (PlantAnalyzer, Chatbot, etc.) have headers with back buttons
- Tab screens (Home, Community, Services) use custom headers without back buttons
- Android hardware back button works correctly

### ✅ **Deep Link Protection**
- If a feature screen is opened directly (e.g., deep link to PlantAnalyzer)
- Back button navigates to Home tab instead of blank page
- Uses `useSafeGoBack()` hook for fallback logic

### ✅ **Type Safety**
- Full TypeScript types for all navigation routes
- Autocomplete for screen names and params
- Compile-time checks prevent navigation errors

### ✅ **Tab Navigation**
- Persistent bottom tabs: Home, Community, Services, Profile
- Icons change based on active/inactive state
- Platform-specific tab bar styling (iOS/Android/Web)

### ✅ **Android Hardware Back Button**
- Custom BackHandler in App.tsx
- Respects navigation stack (goes back if possible)
- Allows app exit if on root screen
- Does NOT block navigation (user requirement)

## 📁 File Structure

```
frontend/
├── App.tsx                          (Entry point, 30 lines)
└── src/
    └── navigation/
        ├── AppNavigator.tsx         (Main navigation architecture, 350+ lines)
        ├── navigationTypes.ts       (TypeScript type definitions)
        └── README.md                (This file)
```

## 🔧 How to Add a New Screen

### 1. Define Route Type

Edit `navigationTypes.ts`:

```typescript
// Add to appropriate stack param list
export type HomeStackParamList = {
  Home: undefined;
  PlantAnalyzer: undefined;
  NewFeatureScreen: { userId: string }; // ← Add here
};
```

### 2. Register Screen in Navigator

Edit `AppNavigator.tsx`:

```typescript
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      {/* Existing screens */}
      
      {/* Add new screen */}
      <HomeStack.Screen
        name="NewFeatureScreen"
        component={NewFeatureScreen}
        options={{
          headerShown: true,
          title: 'New Feature',
          headerBackTitle: 'Home',
          headerBackTitleVisible: false,
        }}
      />
    </HomeStack.Navigator>
  );
}
```

### 3. Navigate to Screen

From any screen in HomeTab:

```typescript
import { useNavigation } from '@react-navigation/native';
import type { HomeStackNavigationProp } from '../navigation/navigationTypes';

function MyComponent() {
  const navigation = useNavigation<HomeStackNavigationProp>();
  
  const handlePress = () => {
    navigation.navigate('NewFeatureScreen', { userId: '123' });
  };
}
```

## 🔍 Navigation Patterns

### Pattern 1: Navigate to Feature Screen

```typescript
// From Home screen to PlantAnalyzer
navigation.navigate('PlantAnalyzer');
```

### Pattern 2: Go Back

```typescript
// Simple back
navigation.goBack();

// Safe back with fallback (recommended for feature screens)
import { useSafeGoBack } from '../navigation/AppNavigator';

const handleBack = useSafeGoBack();
// Usage: <Button onPress={handleBack}>Back</Button>
```

### Pattern 3: Navigate to Different Tab

```typescript
// From any tab to Community tab
navigation.navigate('MainTabs', {
  screen: 'CommunityTab',
  params: { screen: 'Community' },
});
```

### Pattern 4: Navigate to Feature Screen in Different Tab

```typescript
// From Home to CreatePost (in CommunityTab)
navigation.navigate('MainTabs', {
  screen: 'CommunityTab',
  params: {
    screen: 'CreatePost',
  },
});
```

### Pattern 5: Navigate with Parameters

```typescript
// Navigate to PostDetail with postId
navigation.navigate('PostDetail', { postId: '12345' });

// Access params in target screen
import { useRoute } from '@react-navigation/native';
import type { PostDetailRouteProp } from '../navigation/navigationTypes';

function PostDetailScreen() {
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;
}
```

## 🐛 Troubleshooting

### Problem: "Cannot read property 'navigate' of undefined"

**Solution**: Ensure the screen is registered in a navigator.

```typescript
// Check if screen is in AppNavigator.tsx
<HomeStack.Screen name="YourScreen" component={YourScreen} />
```

### Problem: Back button not appearing

**Solution**: Check `headerShown` option:

```typescript
// Feature screens should have headerShown: true
<Stack.Screen
  name="PlantAnalyzer"
  component={PlantAnalyzer}
  options={{ headerShown: true }} // ← Must be true
/>
```

### Problem: Navigation typescript errors

**Solution**: Import and use proper types:

```typescript
import type { HomeStackNavigationProp } from '../navigation/navigationTypes';
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation<HomeStackNavigationProp>();
```

### Problem: Deep link opens screen but back button navigates to blank page

**Solution**: Use `useSafeGoBack()` hook:

```typescript
import { useSafeGoBack } from '../navigation/AppNavigator';

function MyScreen() {
  const handleBack = useSafeGoBack();
  
  return <Button onPress={handleBack}>Back</Button>;
}
```

### Problem: Android back button exits app instead of going back

**Solution**: Verify `useAndroidBackHandler` is called in App.tsx:

```typescript
// In App.tsx
const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
useAndroidBackHandler(navigationRef);

<NavigationContainer ref={navigationRef}>
```

## 🎨 Customization

### Change Tab Bar Icons

Edit `AppNavigator.tsx` in `MainTabNavigator`:

```typescript
tabBarIcon: ({ focused, color, size }) => {
  let iconName: keyof typeof Ionicons.glyphMap;
  
  if (route.name === 'HomeTab') {
    iconName = focused ? 'leaf' : 'leaf-outline'; // ← Change icons
  }
  
  return <Ionicons name={iconName} size={size} color={color} />;
}
```

### Change Tab Bar Colors

```typescript
tabBarActiveTintColor: '#4CAF50',    // ← Active tab color
tabBarInactiveTintColor: 'gray',     // ← Inactive tab color
```

### Change Screen Header Styling

```typescript
<Stack.Screen
  name="PlantAnalyzer"
  component={PlantAnalyzer}
  options={{
    headerStyle: { backgroundColor: '#4CAF50' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
  }}
/>
```

## 🚀 Migration from Old Structure

### Old Structure (BROKEN)
```typescript
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="PlantAnalyzer" component={PlantAnalyzer} />
  // ... all screens flat
</Stack.Navigator>
```

**Problems:**
- No back buttons (all headers hidden)
- No tab navigation
- Stuck in feature screens

### New Structure (FIXED)
```typescript
RootStack → MainTabs → HomeTab → [Home, PlantAnalyzer, Chatbot, etc.]
```

**Benefits:**
- Feature screens have headers + back buttons
- Tab navigation for main sections
- Android back button works
- Deep link protection

## 📱 Platform-Specific Behavior

### iOS
- Tab bar padding: 20px bottom (accounts for home indicator)
- Tab bar height: 85px
- Native slide transitions

### Android
- Tab bar padding: 5px bottom
- Tab bar height: 60px
- Hardware back button fully functional

### Web
- Tab bar works with mouse clicks
- Keyboard navigation supported
- Browser back button syncs with navigation stack

## 🔗 Deep Linking Setup

To enable deep links (e.g., `farmhelp://plant-analyzer`):

1. Add linking configuration to `NavigationContainer`:

```typescript
const linking = {
  prefixes: ['farmhelp://', 'https://farmhelp.app'],
  config: {
    screens: {
      Login: 'login',
      MainTabs: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              PlantAnalyzer: 'plant-analyzer',
            },
          },
        },
      },
    },
  },
};

<NavigationContainer linking={linking}>
```

2. Configure `app.json`:

```json
{
  "expo": {
    "scheme": "farmhelp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "farmhelp" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## 📊 Navigation State Debugging

Enable logging to debug navigation:

```typescript
<NavigationContainer
  onStateChange={(state) => {
    console.log('Navigation state changed:', state);
  }}
>
```

## 🔐 Authentication Flow

Current flow: Login → MainTabs

To add conditional rendering based on auth state:

```typescript
function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      )}
    </RootStack.Navigator>
  );
}
```

## 📚 Resources

- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Stack Navigator](https://reactnavigation.org/docs/stack-navigator)
- [Tab Navigator](https://reactnavigation.org/docs/tab-based-navigation)
- [TypeScript Guide](https://reactnavigation.org/docs/typescript)

## ✅ Best Practices

1. **Always use TypeScript types** for navigation props
2. **Use `useSafeGoBack()`** in feature screens for deep link protection
3. **Set `headerShown: true`** only on feature screens (not tab screens)
4. **Never use `navigation.replace()`** unless explicitly needed (breaks back stack)
5. **Test on all platforms** (iOS, Android, Web) before deploying
6. **Keep navigation logic in AppNavigator.tsx**, not in individual screens
7. **Use descriptive screen names** (e.g., "PlantAnalyzer" not "Screen1")

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintained by:** FarmHelp Development Team
