# Habit Tracker Troubleshooting Guide

## Common Issues and Solutions

### 1. MMKV Storage Issues

**Error Message:**
```
Failed to initialize MMKV, falling back to AsyncStorage: [Error: Failed to create a new MMKV instance: The native MMKV Module could not be found.]
```

**Solution:**
- The app is designed to automatically fall back to AsyncStorage if MMKV fails to initialize
- This warning is expected and can be safely ignored
- Your data will still be saved and retrieved correctly using AsyncStorage

### 2. Reanimated Initialization Error

**Error Message:**
```
ReanimatedError: [Reanimated] Native part of Reanimated doesn't seem to be initialized (Worklets).
```

**Solution:**
1. Make sure the Reanimated plugin is added to babel.config.js:
   ```javascript
   module.exports = function(api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         'react-native-reanimated/plugin',
       ],
     };
   };
   ```
2. Restart the development server with the `--clear` flag:
   ```
   npx expo start --clear
   ```
3. If the issue persists, try rebuilding the app:
   ```
   npx expo prebuild --clean
   npx expo run:android
   ```

### 3. Notification Channel Error

**Error Message:**
```
TypeError: Cannot read property 'createChannel' of null

This error is located at:
    in Main (created by App)
    in HabitProvider (created by App)
    in ThemeProvider (created by App)
    in App (created by withDevTools(App))
```

**Solution:**
1. The app has been updated to handle this error gracefully
2. Notifications may not work in the Expo Go app on certain platforms
3. If you need notifications to work properly, build a standalone app:
   ```
   eas build --platform android --profile development
   ```
4. If you're testing in Expo Go and don't need notifications, you can safely ignore this error

### 4. Package Version Compatibility Issues

**Error Message:**
```
The following packages should be updated to the expected versions:
- @react-native-async-storage/async-storage@2.1.2 expected version: 1.23.1
- @react-native-community/datetimepicker@8.3.0 expected version: 8.2.0
...
```

**Solution:**
1. Run the update-packages.bat script in the project root:
   ```
   ./update-packages.bat
   ```
2. Or manually update the packages:
   ```
   npx expo install @react-native-async-storage/async-storage@1.23.1 @react-native-community/datetimepicker@8.2.0 react-native-reanimated@~3.16.1 react-native-safe-area-context@4.12.0 react-native-screens@~4.4.0 react-native-svg@15.8.0
   ```

### 5. App Crashes on Launch

**Solution:**
1. Clear the cache:
   ```
   npx expo start --clear
   ```
2. Check the console for specific error messages
3. Make sure all dependencies are installed:
   ```
   npm install
   ```
4. If using Expo Go, make sure you have the latest version installed

### 6. Notifications Not Working

**Solution:**
1. Check if notifications are enabled in your device settings
2. Verify that the app has notification permissions
3. Make sure the notification time settings are correct in the app
4. On Android, check that the notification permissions are declared in app.json
5. Note that notifications may not work properly in the Expo Go app - build a standalone app for full notification support

## Building for Production

If you encounter issues when building for production:

1. Make sure all dependencies are compatible
2. Update the Expo SDK if needed
3. Run the build command:
   ```
   eas build --platform android
   ```

## Need More Help?

If you continue to experience issues:

1. Check the React Native and Expo documentation
2. Search for similar issues on GitHub or Stack Overflow
3. Reach out to the community on the Expo forums 