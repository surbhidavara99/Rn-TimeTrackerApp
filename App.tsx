import { StyleSheet, Text, View } from 'react-native';
import AddProjectTimeTracker from './src/screens/AddProject/AddProjectTimeTracker';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarPickerTracker from './src/screens/CalendarPicker/CalendarPickerTracker';

const Tab = createBottomTabNavigator();
export default function App() {

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={AddProjectTimeTracker} />
        <Tab.Screen name="Calendar" component={CalendarPickerTracker} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
