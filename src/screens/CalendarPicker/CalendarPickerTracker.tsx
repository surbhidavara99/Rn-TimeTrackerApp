import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarPicker from 'react-native-calendar-picker';
import { height } from '../../styles/styles';



interface Project {
    label: string;
    value: string;
}

interface DateProjectTimers {
    date: string;
    timers: Record<string, number>;
}

const CalendarPickerTracker: React.FC = () => {
    const projects: Project[] = [
        { label: 'Web design', value: '1' },
        { label: 'R&D', value: '2' },
        { label: 'Web development', value: '3' },
    ];
    const minDate = new Date(); // Today's date
    const maxDate = new Date(2025, 6, 3);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const [value, setValue] = useState(projects[0]);
    const [isFocus, setIsFocus] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>(projects[0].value);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [projectTimers, setProjectTimers] = useState<DateProjectTimers[]>(
        []);
    const [allProjectsData, setAllProjectsData] = useState<Array<{ date: string; project: string; time: number }>>([]);


    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };


    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setTimer(getProjectTimer(date.toISOString(), selectedProject));
    };


    const getProjectTimer = (date: string, project: string): number => {
        const dateProjectTimers = Array.isArray(projectTimers)
            ? projectTimers.find((item) => item.date === date)
            : null;

        return dateProjectTimers?.timers[project] || 0;
    };

    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            setElapsedTime(0);
            setTimer(getProjectTimer(selectedDate.toISOString(), selectedProject));
        }
    };
    

    const stopTimer = () => {
        if (isRunning) {
            setIsRunning(false);
            setAllProjectsData((prevData) => [  // Store project's name and time's as per the date 
                ...prevData,
                {
                    date: selectedDate.toISOString(),
                    project: selectedProject,
                    time: getProjectTimer(selectedDate.toISOString(), selectedProject) + elapsedTime,
                },
            ]);
            setElapsedTime(0);
        }
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

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={{ marginTop: 10 }}>
                <CalendarPicker
                    startFromMonday={true}
                    minDate={minDate}
                    maxDate={maxDate}
                    todayBackgroundColor="#f2e6ff"
                    selectedDayColor="#7300e6"
                    selectedDayTextColor="#FFFFFF"
                    onDateChange={handleDateChange}

                />
            </View>
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
                        setTimer(getProjectTimer(selectedDate.toISOString(), selectedProject));
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
            </View>

            <View style={styles.projectList}>
                <Text style={styles.projectListHeading}>Project Timers:</Text>
                {allProjectsData?.map((projectData) => {
                    const selectedProject = projects.find((project) => project.value === projectData.project);
                    const projectName = selectedProject ? selectedProject.label : 'Test Project';
                    return (
                        <View style={styles.timerContainer}>
                            <Text key={`${projectData.date}-${projectData.project}`}>
                                {new Date(projectData.date).toLocaleDateString('en-GB')}  - {projectName}: {formatTime(projectData.time)}
                            </Text>
                        </View>
                    )
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
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
        marginBottom: height * 0.1
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

export default CalendarPickerTracker;
