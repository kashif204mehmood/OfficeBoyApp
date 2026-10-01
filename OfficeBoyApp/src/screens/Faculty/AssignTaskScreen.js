import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import DateTimePicker from '@react-native-community/datetimepicker';
import {API_BASE} from '../../config';

// Geofence ka fixed center. Yeh backend (TaskController.cs) mein
// UNIVERSITY_LAT / UNIVERSITY_LNG se match hona chahiye.
const GEOFENCE_CENTER_NAME = 'Main Campus (University)';
const GEOFENCE_SUBTITLE = 'Dept. of Computer Science & Faculty Block';
const GEOFENCE_LAT = 33.6007;
const GEOFENCE_LNG = 73.0679;

// Leaflet (OpenStreetMap) map ka HTML. Koi API key nahi chahiye.
const buildMapHtml = (lat, lng, radius) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {zoomControl: false, attributionControl: false})
      .setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([${lat}, ${lng}]).addTo(map);
    var circle = L.circle([${lat}, ${lng}], {
      radius: ${radius},
      color: '#1B6E47',
      fillColor: '#1B6E47',
      fillOpacity: 0.15
    }).addTo(map);
    map.fitBounds(circle.getBounds());
  </script>
</body>
</html>
`;

const IN_SUGGESTIONS = ['Make Tea', 'Turn on AC', 'Open Office'];
const OUT_SUGGESTIONS = ['Turn off AC', 'Close Office'];

const initials = name => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
};

const AssignTaskScreen = ({navigation, route}) => {
  const {user, officeBoy} = route.params || {};

  const [taskMode, setTaskMode] = useState('Now'); // 'Now' | 'Later' | 'Geofence'
  const [description, setDescription] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null); // JS Date object
  const [pickerMode, setPickerMode] = useState(null); // 'date' | 'time' | null

  // Geofence ke liye
  const [geofenceTrigger, setGeofenceTrigger] = useState('IN'); // 'IN' | 'OUT'
  const [geofenceRadius, setGeofenceRadius] = useState('300');

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Tasks/Locations`);
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      setLocations([]);
    }
  };

  // Chip dabane par uska text description mein jod do
  const appendSuggestion = text => {
    setDescription(prev => {
      if (!prev) return text;
      if (prev.includes(text)) return prev;
      return `${prev}, ${text}`;
    });
  };

  const openDatePicker = () => setPickerMode('date');
  const openTimePicker = () => setPickerMode('time');

  const onPickerChange = (event, value) => {
    // Android: picker apne aap band ho jata hai; iOS: yahan khud band karenge
    if (Platform.OS === 'android') {
      setPickerMode(null);
    }
    if (event.type === 'dismissed' || !value) {
      return;
    }
    setSelectedDateTime(prev => {
      const base = prev ? new Date(prev) : new Date();
      if (pickerMode === 'date') {
        base.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
      } else {
        base.setHours(value.getHours(), value.getMinutes(), 0, 0);
      }
      return new Date(base);
    });
  };

  const formatPickedDate = d => {
    if (!d) return null;
    return d.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
  };

  const formatPickedTime = d => {
    if (!d) return null;
    return d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true});
  };

  const handleAssignTask = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter task description');
      return;
    }
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    if (taskMode === 'Later' && !selectedDateTime) {
      Alert.alert('Error', 'Please select date and time for scheduled task');
      return;
    }
    if (taskMode === 'Geofence' && (!geofenceRadius || Number(geofenceRadius) <= 0)) {
      Alert.alert('Error', 'Please enter a valid radius');
      return;
    }

    // Scheduled datetime banao (sirf "Later" ke liye)
    let scheduledAt = null;
    if (taskMode === 'Later' && selectedDateTime) {
      scheduledAt = selectedDateTime.toISOString();
    }

    const payload = {
      facultyAccountId: user?.id,
      officeBoyAccountId: officeBoy?.id,
      locationId: selectedLocation.id,
      description: description,
      taskMode: taskMode,
      scheduledAt: scheduledAt,
    };

    if (taskMode === 'Geofence') {
      payload.geofenceTrigger = geofenceTrigger;
      payload.geofenceRadius = Number(geofenceRadius);
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/Tasks`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Success', 'Task assigned successfully!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', 'Could not assign task');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = geofenceTrigger === 'IN' ? IN_SUGGESTIONS : OUT_SUGGESTIONS;
  const isGeofence = taskMode === 'Geofence';
  const radiusNumber = Number(geofenceRadius) || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Task</Text>
        <View style={styles.headerIconBox}>
          <Text style={styles.headerIcon}>📋</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* When to Assign? */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>🕐</Text>
            </View>
            <Text style={styles.cardTitle}>When to Assign?</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.modeRow}>
            {/* Now option */}
            <TouchableOpacity
              style={[
                styles.modeBox,
                taskMode === 'Now' && styles.modeBoxActiveGreen,
              ]}
              onPress={() => setTaskMode('Now')}>
              <View
                style={[
                  styles.modeIconBox,
                  taskMode === 'Now' && styles.modeIconBoxGreen,
                ]}>
                <Text style={styles.modeIcon}>⚡</Text>
              </View>
              <Text
                style={[
                  styles.modeTitle,
                  taskMode === 'Now' && styles.modeTitleGreen,
                ]}>
                Now
              </Text>
              <Text style={styles.modeSubtitle}>Immediately</Text>
              <View
                style={[
                  styles.radio,
                  taskMode === 'Now' && styles.radioActiveGreen,
                ]}>
                {taskMode === 'Now' && <View style={styles.radioDotGreen} />}
              </View>
            </TouchableOpacity>

            {/* Later option */}
            <TouchableOpacity
              style={[
                styles.modeBox,
                taskMode === 'Later' && styles.modeBoxActivePurple,
              ]}
              onPress={() => setTaskMode('Later')}>
              <View
                style={[
                  styles.modeIconBox,
                  taskMode === 'Later' && styles.modeIconBoxPurple,
                ]}>
                <Text style={styles.modeIcon}>📅</Text>
              </View>
              <Text
                style={[
                  styles.modeTitle,
                  taskMode === 'Later' && styles.modeTitlePurple,
                ]}>
                Later
              </Text>
              <Text style={styles.modeSubtitle}>Schedule time</Text>
              <View
                style={[
                  styles.radio,
                  taskMode === 'Later' && styles.radioActivePurple,
                ]}>
                {taskMode === 'Later' && <View style={styles.radioDotPurple} />}
              </View>
            </TouchableOpacity>

            {/* Geofence option */}
            <TouchableOpacity
              style={[
                styles.modeBox,
                isGeofence && styles.modeBoxActiveGreen,
              ]}
              onPress={() => setTaskMode('Geofence')}>
              <View
                style={[
                  styles.modeIconBox,
                  isGeofence && styles.modeIconBoxGreen,
                ]}>
                <Text style={styles.modeIcon}>☀️</Text>
              </View>
              <Text
                style={[
                  styles.modeTitle,
                  isGeofence && styles.modeTitleGreen,
                ]}>
                Geofence
              </Text>
              <Text style={styles.modeSubtitle}>On Enter/Exit</Text>
              <View
                style={[
                  styles.radio,
                  isGeofence && styles.radioActiveGreen,
                ]}>
                {isGeofence && <View style={styles.radioDotGreen} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Geofence Parameters (sirf Geofence mode mein) */}
        {isGeofence && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Text style={styles.cardIcon}>📍</Text>
                </View>
                <Text style={styles.cardTitle}>Geofence Parameters</Text>
              </View>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>Active Mode</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <Text style={styles.label}>Campus Geo-Hub Location</Text>
            <View style={styles.lockedBox}>
              <Text style={styles.lockedIcon}>📍</Text>
              <View style={{flex: 1}}>
                <Text style={styles.lockedTitle}>{GEOFENCE_CENTER_NAME}</Text>
                <Text style={styles.lockedSubtitle}>{GEOFENCE_SUBTITLE}</Text>
              </View>
              <Text style={styles.lockedIcon}>🔒</Text>
            </View>

            <Text style={[styles.label, {marginTop: 16}]}>Trigger Condition</Text>
            <View style={styles.triggerRow}>
              <TouchableOpacity
                style={[
                  styles.triggerBtn,
                  geofenceTrigger === 'IN' && styles.triggerBtnActive,
                ]}
                onPress={() => setGeofenceTrigger('IN')}>
                <Text
                  style={[
                    styles.triggerBtnText,
                    geofenceTrigger === 'IN' && styles.triggerBtnTextActive,
                  ]}>
                  ⭇ On Entering (IN)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.triggerBtn,
                  geofenceTrigger === 'OUT' && styles.triggerBtnActive,
                ]}
                onPress={() => setGeofenceTrigger('OUT')}>
                <Text
                  style={[
                    styles.triggerBtnText,
                    geofenceTrigger === 'OUT' && styles.triggerBtnTextActive,
                  ]}>
                  ⭈ On Exiting (OUT)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.radiusHeaderRow}>
              <Text style={styles.label}>Geofence Radius</Text>
              <Text style={styles.radiusValueText}>{geofenceRadius || 0} meters</Text>
            </View>
            <View style={styles.radiusRow}>
              <View style={styles.radiusInputBox}>
                <TextInput
                  style={styles.radiusInput}
                  keyboardType="numeric"
                  value={geofenceRadius}
                  onChangeText={setGeofenceRadius}
                  placeholder="300"
                />
                <Text style={styles.radiusUnit}>m</Text>
              </View>
              <TouchableOpacity
                style={styles.setRadiusBtn}
                onPress={() => Keyboard.dismiss()}>
                <Text style={styles.setRadiusBtnText}>Set Radius</Text>
              </TouchableOpacity>
            </View>

            {/* Asal Map — OpenStreetMap + Leaflet, koi API key nahi chahiye */}
            <View style={styles.mapBox}>
              <WebView
                originWhitelist={['*']}
                source={{html: buildMapHtml(GEOFENCE_LAT, GEOFENCE_LNG, radiusNumber)}}
                style={{flex: 1}}
                scrollEnabled={false}
              />
              <View style={styles.mapCaption}>
                <Text style={styles.mapCaptionText}>
                  {geofenceRadius || 0}m Radius • Trigger: {geofenceTrigger}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Task Details / Task & Assignee */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>{isGeofence ? '📝' : '✅'}</Text>
            </View>
            <Text style={styles.cardTitle}>
              {isGeofence ? 'Task & Assignee' : 'Task Details'}
            </Text>
          </View>
          <View style={styles.divider} />

          {isGeofence && officeBoy && (
            <>
              <Text style={styles.label}>Select Office Boy</Text>
              <View style={styles.officeBoyBox}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials(officeBoy?.name)}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.officeBoyName}>{officeBoy?.name}</Text>
                  <Text style={styles.officeBoySub}>
                    ● Available{officeBoy?.floor ? ` in ${officeBoy.floor}` : ''}
                  </Text>
                </View>
              </View>

              <Text style={[styles.label, {marginTop: 16}]}>
                Quick Suggestions ({geofenceTrigger === 'IN' ? 'Arrival' : 'Departure'} Triggers)
              </Text>
              <View style={styles.chipsRow}>
                {suggestions.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      description.includes(item) && styles.chipActive,
                    ]}
                    onPress={() => appendSuggestion(item)}>
                    <Text
                      style={[
                        styles.chipText,
                        description.includes(item) && styles.chipTextActive,
                      ]}>
                      {description.includes(item) ? '✓ ' : '+ '}
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={[styles.label, {marginTop: isGeofence ? 14 : 0}]}>
            {isGeofence ? 'Custom Instructions / Task Notes' : 'Task Description'}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter detailed task instructions..."
            placeholderTextColor="#B0B0B0"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
          {isGeofence && (
            <Text style={styles.hint}>
              This notification will automatically alert {officeBoy?.name || 'the office boy'} as soon
              as your GPS {geofenceTrigger === 'IN' ? 'enters' : 'exits'} the {geofenceRadius || 0}m campus boundary.
            </Text>
          )}
        </View>

        {/* Assignment Criteria */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>⚙</Text>
            </View>
            <Text style={styles.cardTitle}>Assignment Criteria</Text>
          </View>
          <View style={styles.divider} />

          {/* Date + Time sirf "Later" mode mein — phone ka apna calendar/clock */}
          {taskMode === 'Later' && (
            <>
              <Text style={styles.label}>Select Date</Text>
              <TouchableOpacity style={styles.dropdown} onPress={openDatePicker}>
                <Text style={styles.dropdownIcon}>📅</Text>
                <Text
                  style={
                    selectedDateTime ? styles.dropdownText : styles.dropdownPlaceholder
                  }>
                  {formatPickedDate(selectedDateTime) || 'Select date'}
                </Text>
                <Text style={styles.dropdownArrow}>⌄</Text>
              </TouchableOpacity>

              <Text style={[styles.label, {marginTop: 16}]}>Select Time</Text>
              <TouchableOpacity style={styles.dropdown} onPress={openTimePicker}>
                <Text style={styles.dropdownIcon}>🕐</Text>
                <Text
                  style={
                    selectedDateTime ? styles.dropdownText : styles.dropdownPlaceholder
                  }>
                  {formatPickedTime(selectedDateTime) || 'Select time'}
                </Text>
                <Text style={styles.dropdownArrow}>⌄</Text>
              </TouchableOpacity>

              {pickerMode && (
                <DateTimePicker
                  value={selectedDateTime || new Date()}
                  mode={pickerMode}
                  is24Hour={false}
                  minimumDate={pickerMode === 'date' ? new Date() : undefined}
                  onChange={onPickerChange}
                />
              )}
            </>
          )}

          <Text style={[styles.label, taskMode === 'Later' && {marginTop: 16}]}>
            Select Location
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowLocationModal(true)}>
            <Text
              style={
                selectedLocation
                  ? styles.dropdownText
                  : styles.dropdownPlaceholder
              }>
              {selectedLocation ? selectedLocation.name : 'Choose location...'}
            </Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Locations are predefined by the system</Text>
        </View>

        {/* Geofence status footer */}
        {isGeofence && (
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>✓ Geofence armed & ready</Text>
            <Text style={styles.statusTextRight}>Auto-dispatch</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleAssignTask}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                ➤ {isGeofence ? 'Send Geofence Task' : 'Assign Task'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{height: 20}} />
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <FlatList
              data={locations}
              keyExtractor={(item, i) => String(item.id || i)}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedLocation(item);
                    setShowLocationModal(false);
                  }}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowLocationModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F1F5F3'},

  header: {
    backgroundColor: '#1B6E47',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: {color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 28},
  headerTitle: {
    flex: 1, color: '#fff', fontSize: 21,
    fontWeight: 'bold', marginLeft: 14,
  },
  headerIconBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerIcon: {fontSize: 18},

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center'},
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIconBox: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: '#E3F2E8',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  cardIcon: {fontSize: 17},
  cardTitle: {fontSize: 17, fontWeight: 'bold', color: '#1A1A1A'},
  divider: {height: 1, backgroundColor: '#EFEFEF', marginVertical: 14},

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2E8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#1B6E47', marginRight: 5,
  },
  activeBadgeText: {fontSize: 11, color: '#1B6E47', fontWeight: '600'},

  // Now / Later / Geofence
  modeRow: {flexDirection: 'row', gap: 8},
  modeBox: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#FAFAFA',
  },
  modeBoxActiveGreen: {borderColor: '#1B6E47', backgroundColor: '#F2F9F5'},
  modeBoxActivePurple: {borderColor: '#7C5CFC', backgroundColor: '#F5F2FF'},
  modeIconBox: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: '#EEEEEE',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  modeIconBoxGreen: {backgroundColor: '#D5EADF'},
  modeIconBoxPurple: {backgroundColor: '#E5DEFF'},
  modeIcon: {fontSize: 15},
  modeTitle: {fontSize: 13, fontWeight: 'bold', color: '#555'},
  modeTitleGreen: {color: '#1B6E47'},
  modeTitlePurple: {color: '#7C5CFC'},
  modeSubtitle: {fontSize: 9, color: '#9E9E9E', marginTop: 1, textAlign: 'center'},
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#C4C4C4',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  radioActiveGreen: {borderColor: '#1B6E47'},
  radioActivePurple: {borderColor: '#7C5CFC'},
  radioDotGreen: {width: 9, height: 9, borderRadius: 5, backgroundColor: '#1B6E47'},
  radioDotPurple: {width: 9, height: 9, borderRadius: 5, backgroundColor: '#7C5CFC'},

  label: {fontSize: 14, color: '#3A3A3A', fontWeight: '600', marginBottom: 8},
  textArea: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
  },
  dropdown: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {fontSize: 15, marginRight: 10},
  dropdownText: {flex: 1, fontSize: 14, color: '#333'},
  dropdownPlaceholder: {flex: 1, fontSize: 14, color: '#B0B0B0'},
  dropdownArrow: {fontSize: 16, color: '#999'},
  hint: {fontSize: 12, color: '#A0A0A0', fontStyle: 'italic', marginTop: 8},

  // Geofence Parameters card
  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lockedIcon: {fontSize: 16, marginHorizontal: 4},
  lockedTitle: {fontSize: 14, fontWeight: 'bold', color: '#333'},
  lockedSubtitle: {fontSize: 11, color: '#999', marginTop: 2},

  triggerRow: {flexDirection: 'row', gap: 10},
  triggerBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  triggerBtnActive: {borderColor: '#1B6E47', backgroundColor: '#1B6E47'},
  triggerBtnText: {fontSize: 12, fontWeight: '600', color: '#555'},
  triggerBtnTextActive: {color: '#fff'},

  radiusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusValueText: {fontSize: 13, color: '#1B6E47', fontWeight: '700'},
  radiusRow: {flexDirection: 'row', gap: 10, alignItems: 'center'},
  radiusInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  radiusInput: {flex: 1, paddingVertical: 13, fontSize: 14, color: '#333'},
  radiusUnit: {fontSize: 13, color: '#999'},
  setRadiusBtn: {
    backgroundColor: '#1B6E47',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  setRadiusBtnText: {color: '#fff', fontSize: 13, fontWeight: 'bold'},

  // Static illustrated "map"
  mapBox: {
    marginTop: 16,
    height: 210,
    borderRadius: 14,
    backgroundColor: '#EAF2EC',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DCE8DF',
  },
  mapBlock: {
    position: 'absolute',
    backgroundColor: '#D3E0D6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBlockText: {fontSize: 9, color: '#7B8B7E', fontWeight: '700', textAlign: 'center'},
  mapRoadV: {
    position: 'absolute', top: 0, bottom: 0, left: '50%',
    width: 10, marginLeft: -5, backgroundColor: '#D9E4DB',
  },
  mapRoadH: {
    position: 'absolute', left: 0, right: 0, top: '50%',
    height: 10, marginTop: -5, backgroundColor: '#D9E4DB',
  },
  geoCircle: {
    position: 'absolute',
    top: '50%', left: '50%',
    width: 130, height: 130,
    marginTop: -65, marginLeft: -65,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#1B6E47',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(27,110,71,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geoPinIcon: {fontSize: 26},
  geoPinLabel: {
    position: 'absolute',
    top: -14,
    backgroundColor: '#1B6E47',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  geoPinLabelText: {color: '#fff', fontSize: 9, fontWeight: '700'},
  mapCaption: {
    position: 'absolute',
    bottom: 10, alignSelf: 'center',
    backgroundColor: 'rgba(27,44,34,0.85)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  mapCaptionText: {color: '#fff', fontSize: 11, fontWeight: '600'},

  officeBoyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 12,
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1B6E47',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {color: '#fff', fontSize: 13, fontWeight: 'bold'},
  officeBoyName: {fontSize: 14, fontWeight: 'bold', color: '#1A1A1A'},
  officeBoySub: {fontSize: 12, color: '#4CAF50', marginTop: 2},

  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14},
  chip: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FAFAFA',
  },
  chipActive: {borderColor: '#1B6E47', backgroundColor: '#F2F9F5'},
  chipText: {fontSize: 12, color: '#555'},
  chipTextActive: {color: '#1B6E47', fontWeight: '600'},

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  statusText: {fontSize: 12, color: '#1B6E47', fontWeight: '600'},
  statusTextRight: {fontSize: 12, color: '#9E9E9E'},

  buttonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1B6E47',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelBtnText: {color: '#1B6E47', fontSize: 15, fontWeight: 'bold'},
  submitBtn: {
    flex: 2,
    backgroundColor: '#1B6E47',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitBtnText: {color: '#fff', fontSize: 15, fontWeight: 'bold'},

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '62%',
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#1A1A1A',
    marginBottom: 14, textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  modalItemText: {fontSize: 15, color: '#333'},
  modalCancel: {
    marginTop: 12, paddingVertical: 14, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  modalCancelText: {fontSize: 15, color: '#C62828', fontWeight: '600'},
});

export default AssignTaskScreen;