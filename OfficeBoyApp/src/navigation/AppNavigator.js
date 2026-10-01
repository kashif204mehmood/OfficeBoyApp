import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// Auth Screen
import LoginScreen from '../screens/auth/LoginScreen';

// Supervisor Screens
import SupervisorDashboard from '../screens/Supervisor/DashboardScreen';
import ViewFloorsScreen from '../screens/Supervisor/ViewFloorsScreen';
import ViewOfficeBoyScreen from '../screens/Supervisor/ViewOfficeBoyScreen';
import ViewFacultyScreen from '../screens/Supervisor/ViewFacultyScreen';
// import ViewFeedbackScreen from '../screens/Supervisor/ViewFeedbackScreen';
import ReviewByFiltersScreen from '../screens/Supervisor/ReviewByFiltersScreen';
import SupervisorLeaveRequestsScreen from '../screens/Supervisor/LeaveRequestsScreen';

// Faculty Screens
import FacultyDashboard from '../screens/Faculty/DashboardScreen';
import FacultyViewOfficeBoyScreen from '../screens/Faculty/ViewOfficeBoyScreen';
import PointLocationScreen from '../screens/Faculty/PointLocationScreen';
import AssignTaskScreen from '../screens/Faculty/AssignTaskScreen';
import ViewTaskScreen from '../screens/Faculty/ViewTaskScreen';
import AddFeedbackScreen from '../screens/Faculty/AddFeedbackScreen';
import FacultyProfileScreen from '../screens/Faculty/ProfileScreen';

// OfficeBoy Screens
import OfficeBoyDashboard from '../screens/OfficeBoy/DashboardScreen';
import OfficeBoyViewTaskScreen from '../screens/OfficeBoy/ViewTaskScreen';
import GeoFenceScreen from '../screens/OfficeBoy/GeoFenceScreen';
import MarkCompleteScreen from '../screens/OfficeBoy/MarkCompleteScreen';
import OfficeBoyProfileScreen from '../screens/OfficeBoy/ProfileScreen';
import OfficeBoyLeaveScreen from '../screens/OfficeBoy/LeaveScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{headerShown: false}}>

        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Supervisor */}
        <Stack.Screen name="SupervisorDashboard" component={SupervisorDashboard} />
        <Stack.Screen name="ViewFloors" component={ViewFloorsScreen} />
        <Stack.Screen name="ViewOfficeBoy" component={ViewOfficeBoyScreen} />
        <Stack.Screen name="ViewFaculty" component={ViewFacultyScreen} />
        {/* <Stack.Screen name="ViewFeedback" component={ViewFeedbackScreen} /> */}
        <Stack.Screen name="ReviewByFilters" component={ReviewByFiltersScreen} />
        <Stack.Screen name="SupervisorLeaveRequests" component={SupervisorLeaveRequestsScreen} />

        {/* Faculty */}
        <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} />
        <Stack.Screen name="FacultyViewOfficeBoy" component={FacultyViewOfficeBoyScreen} />
        <Stack.Screen name="PointLocation" component={PointLocationScreen} />
        <Stack.Screen name="AssignTask" component={AssignTaskScreen} />
        <Stack.Screen name="ViewTask" component={ViewTaskScreen} />
        <Stack.Screen name="AddFeedback" component={AddFeedbackScreen} />
        <Stack.Screen name="FacultyProfile" component={FacultyProfileScreen} />

        {/* OfficeBoy */}
        <Stack.Screen name="OfficeBoyDashboard" component={OfficeBoyDashboard} />
        <Stack.Screen name="OfficeBoyViewTask" component={OfficeBoyViewTaskScreen} />
        <Stack.Screen name="GeoFence" component={GeoFenceScreen} />
        <Stack.Screen name="MarkComplete" component={MarkCompleteScreen} />
        <Stack.Screen name="OfficeBoyProfile" component={OfficeBoyProfileScreen} />
        <Stack.Screen name="OfficeBoyLeave" component={OfficeBoyLeaveScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;