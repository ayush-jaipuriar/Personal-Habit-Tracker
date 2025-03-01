# Personal Habit Tracker

A modern, feature-rich mobile application for tracking and building daily habits. Built with React Native and Expo, this app helps you create, monitor, and maintain positive habits with an intuitive and beautiful user interface.

![Habit Tracker App](./assets/screenshots/app-preview.png)

## Features

### Core Features
- **Habit Management**: Create, edit, and delete habits with customizable categories
- **Flexible Scheduling**: Set habits as daily, weekly, or custom with specific days
- **Habit Tracking**: Mark habits as completed or failed with a simple tap
- **Statistics & Analytics**: View your progress with detailed statistics and charts
- **Reminders**: Get notified when it's time to complete your habits
- **Dark Mode**: Switch between light and dark themes based on your preference

### Technical Features
- **Offline Support**: All data is stored locally on your device
- **Data Persistence**: Your habits and progress are saved even when you close the app
- **Responsive Design**: Works on various screen sizes and orientations
- **Performance Optimized**: Fast and smooth user experience
- **Data Export**: Export your habit data in JSON or CSV format

## Screenshots

<div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-around;">
  <img src="./assets/screenshots/home-screen.png" alt="Home Screen" width="200"/>
  <img src="./assets/screenshots/habits-list.png" alt="Habits List" width="200"/>
  <img src="./assets/screenshots/add-habit.png" alt="Add Habit" width="200"/>
  <img src="./assets/screenshots/statistics.png" alt="Statistics" width="200"/>
</div>

## Installation

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-habit-tracker.git
   cd personal-habit-tracker/HabitTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on a device or emulator:
   - Scan the QR code with the Expo Go app on your Android or iOS device
   - Press 'a' to run on an Android emulator
   - Press 'i' to run on an iOS simulator

## Usage

### Creating a Habit
1. Tap the '+' button on the Home or Habits screen
2. Enter a name and optional description for your habit
3. Select a category (Health, Work, Personal, etc.)
4. Choose a frequency (Daily, Weekly, or Custom)
5. Set up reminders if desired
6. Tap 'Save' to create your habit

### Tracking Habits
- On the Home screen, you'll see all habits scheduled for today
- Tap the checkmark to mark a habit as completed
- Tap the X to mark a habit as failed
- Tap on a habit to view more details or edit it

### Viewing Statistics
- Navigate to the Stats screen to view your progress
- Filter statistics by category or time period
- See your completion rate, current streak, and longest streak

## Technology Stack

- **Frontend**: React Native, Expo
- **State Management**: React Context API
- **Storage**: AsyncStorage with MMKV fallback
- **UI Components**: React Native Paper
- **Navigation**: React Navigation
- **Charts**: Victory Native
- **Notifications**: Expo Notifications

## Troubleshooting

If you encounter any issues, please refer to the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) file for common problems and solutions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons provided by [Material Design Icons](https://materialdesignicons.com/)
- UI inspiration from various habit tracking apps
- Thanks to the React Native and Expo communities for their excellent documentation and support 