import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Project {
  label: string;
  value: string;
}

const AddProjectTimeTracker: React.FC = () => {
  const projects: Project[] = [
    { label: 'Web design', value: '1' },
    { label: 'R&D', value: '2' },
    { label: 'Web development', value: '3' },
  ];
  const [value, setValue] = useState<string>(projects[0]);
  const [isFocus, setIsFocus] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>(projects[0].value);
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [projectTimers, setProjectTimers] = useState<Record<string, number | undefined>>({});

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };


  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setProjectTimers((prev) => ({
        ...prev,
        [selectedProject]: prev[selectedProject] ? prev[selectedProject] + elapsedTime : elapsedTime,
      }));
      setElapsedTime(0);
    }
  };


  const resetTimer = () => {
    clearInterval(projectTimers[selectedProject]);
    setTimer(0);
    setIsRunning(false);
    setProjectTimers((prev) => ({
      ...prev,
      [selectedProject]: undefined,
    }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedTimers = await AsyncStorage.getItem('projectTimers');
        if (storedTimers) {
          setProjectTimers(JSON.parse(storedTimers));
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('projectTimers', JSON.stringify(projectTimers));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [projectTimers]);

  useEffect(() => {
    return () => {
      clearInterval(projectTimers[selectedProject]);
    };
  }, [projectTimers, selectedProject]);

  useEffect(() => {
    setElapsedTime(0);
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={projects}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select projects' : '...'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
            setSelectedProject(item.value);
            setTimer(projectTimers[item.value] || 0);
          }}
        />
      </View>

      <View style={styles.circle}>
        <Text style={styles.timerText}>{formatTime(timer)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={isRunning ? stopTimer : startTimer}>
          <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.projectList}>
        <Text style={styles.projectListHeading}>Project Timers:</Text>
        {projects.map((project, index) => (
          <View style={styles.timerContainer} >
            <Text key={`${(Math.random() * projects.length + 1)}`} style={styles.projectListItem}>
              {project.label}
            </Text>
            <Text key={`${(Math.random() * projects.length + 1)}`} style={styles.projectTimeItem}>
              {formatTime(projectTimers[project.value] || 0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    marginBottom: 20,
    width: 200,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  projectList: {
    marginTop: 20,
  },
  projectListHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  projectListItem: {
    fontSize: 15,
    marginBottom: 5,
  },
  projectTimeItem: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  timerContainer: {
    padding: 25,
    flexDirection: 'row',
    backgroundColor: '#EEEEEC',
    borderWidth: 0.2,
    borderColor: '#686C6B',
    justifyContent: 'space-between'
  }
});

export default AddProjectTimeTracker;
