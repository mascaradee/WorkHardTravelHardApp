import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome , Fontisto } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos1";

export default function App() {

  const [text, setText] = useState('');
  const [editText, setEditText] = useState('');
  const [working, setWorking] = useState(true);
  const [toDos, setToDos] = useState({});
  const onChangeText = (payload) => setText(payload); // 이벤트리스너
  const onChangeEditText = (payload) => setEditText(payload);
  const work = () => {
    setWorking(true);
    saveTap(true);
  };  
  const travel = () => {
    setWorking(false);
    saveTap(false);
  };

  useEffect(() => {
    loadToDos();
  }, []);
  useEffect(() => {
    setWorking(toDos.tap);
  },[toDos]);
  
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) {
      setToDos(JSON.parse(s));
    }
  };
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };
  const addToDo = async () => {
    if (text === '') {
      return;
    }
    const newToDos = {
      ...toDos, [Date.now()]: {text, working, editMode: false}
    }
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm('Do you want to delete this To Do?');
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          onPress: async () => {
            try {
              const newToDos = { ...toDos };
              delete newToDos[key];
              setToDos(newToDos);
              await saveToDos(newToDos);
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]);
    }
  };
  const checkToDo = async (key) => {
    // 체크박스 체크
    try {
      const newToDos = { ...toDos};
      newToDos[key].check = newToDos[key].check ? false : true;
      setToDos(newToDos);
      await saveToDos(newToDos);
    } catch (error) {
      console.log(error);
    }
  };
  const saveTap = async (flag) => {
    // 탭 정보를 저장한다. 
    try {
      const newToDos = { ...toDos};
      newToDos.tap = flag; // true: travel, false: work
      setToDos(newToDos);
      await saveToDos(newToDos);
    } catch (error) {
      console.log(error);
    }
  }
  const updateToDo = async (key) => {
    console.log("updateToDo:  " + key);
    if (editText === '') {
      return;
    }
    try {
      const newToDos = {...toDos}
      newToDos[key].text = editText;
      newToDos[key].editMode = false;
      setToDos(newToDos);
      await saveToDos(newToDos);
      setEditText('');
    } catch (error) {
      console.log(error);
    }
  };
  const editMe =  (key) => {
    const newToDos = {...toDos}
    newToDos[key].editMode = true;
    setToDos(newToDos);
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              color: "white",
              fontSize: 35,
              fontWeight: "600",
              color: working ? "white" : theme.grey,
            }}
          >
            WORK
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              color: "white",
              fontSize: 35,
              fontWeight: "600",
              color: working ? theme.grey : "white",
            }}
          >
            TRAVEL
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        onChangeText={onChangeText}
        value={text}
        onSubmitEditing={addToDo}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working == working ? (
            <View style={styles.toDo} key={key}>
              <TouchableOpacity
                onPress={() => {
                  checkToDo(key);
                }}
              >
                {!toDos[key].check ? (
                  <Fontisto name="checkbox-passive" size={24} color="black" />
                ) : (
                  <Fontisto name="checkbox-active" size={24} color="black" />
                )}
              </TouchableOpacity>

              <View style={styles.toDoText}>
                <TouchableOpacity onPress={() => editMe(key)}>
                  {toDos[key].editMode ? (
                    <TextInput
                      style={styles.edit}
                      placeholder={toDos[key].text}
                      onChangeText={onChangeEditText}
                      value={editText}
                      onSubmitEditing={() => updateToDo(key)}
                    />
                  ) : (
                    <Text
                      style={{
                        ...styles.toDoText,
                        textDecorationLine: toDos[key].check
                          ? "line-through"
                          : null,
                      }}
                    >
                      {toDos[key].text}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  deleteToDo(key);
                }}
              >
                <FontAwesome name="trash" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 100
  },
  btnText: {

  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 15
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1
  },
  toDoText: {
    flex: 0.9, 
    color: 'white'

  },
  edit: {
    backgroundColor: theme.lg,
  }
});
 