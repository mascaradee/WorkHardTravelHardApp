import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput, 
  ScrollView, 
  Alert,
} from "react-native";
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome , Fontisto } from '@expo/vector-icons';


/**
 * 탭 추가 - button 컴포넌트 
 * TouchableOpacity : 터치 이벤트가 발생했을 때 약간 투명하게 변하는 애니메이션이 들어감 
 *  ㄴ activeOpacity : 글씨 투명도 정도 조절 prop
 * TouchableHighlight : 터치 이벤트가 발생했을 때 배경색이 변경됨
 *  ㄴ onPress: 누르는 이벤트가 발생했을때 하는 처리
 *  ㄴ underlayColor: 변경할 배경색
 * TouchableWithoutFeedback : UI에 변경이 없이 터치 이벤트 처리하고 싶을 때 사용 
 * Pressable: 새 기능, 많은 기능들이 포함
 * 
 * TextInput: html의 <input> 태그와 동일 기능
 *  ㄴ keyboardType: 숫자, 영문, 특수문자 키보드로 변경하는 기능
 *  ㄴ returnKeyType: 엔터 문자가 바뀜
 *  ㄴ secureTextEntry​:  비번
 *  ㄴ multiline: 여러줄 입력 가능, 일정 길이가 되면 줄바꿈이 됨.
 *  ㄴ placeholderTextColor:  색 변경
 *  ㄴ onChangeText : 변경된 텍스트를 받을 수 있다. 즉, 입력값을 받을 수 있다. 
 *  ㄴ autoCapitalize : 대문자 자동 변경, 단어별로 대문자, 첫자만 대문자 설정을 할 수 있다. 
 *  ㄴ autoCorrect: 자동 고침
 * 
 * AsyncStorage : loacal storage, 암호화되지 않은 문자열만 저장할 수 있다. 
 * async, await는 용도에 따라 추가한다. 응답을 받을 때 까지 기다려서 오류를 출력할 수도 있따. 
 * 
 * step1. 입력한 텍스트를 받는다.
 * step2. 입력한 텍스트를 아래 목록으로 노출한다.
 * step3. 탭별로 입력된 내용을 나눠서 보여준다. 
 * step4. 입력한 텍스트를 저장한다. - AsyncStorage, async - await
 * step5. 텍스트를 삭제하기 위해 X 버튼을 만든다. 
 * step6. x버튼 이벤트를 추가한다. 
 * 
 * JSON.stringify - Javascript값이나 객체를 JSON문자열로 변환
 * JSON.parse - 위의 반대
 * 
 * 
 * challenge
 * 1) 탭 선택한 상태를 저장하자 : useEffect로 toDos 생성된 이후에만 저장된 값 세팅
 * 2) 체크박스 + 취소선 = complete 상태로  done: true, false : checkToDo 함수 추가
 * 3) 유저가 텍스트 수정할 수 있게 고치기 수정아이콘 추가
 */

const STORAGE_KEY = "@toDos";

export default function App() {
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [working, setWorking] = useState(true);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    loadToDos();
  },[]);
  useEffect(() => {
    setWorking(toDos.tap);
  },[toDos]);
  const edit = () => {
    setEditing(true);
  }
  const travel = () => {
    setWorking(false);
    saveTap(false);
  };
  const work = () => {
    setWorking(true);
    saveTap(true);
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeText1 = (payload) => setEditText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (error) {
      console.log(error);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    //save to do
    // 방법 1
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });
    // 방법 2 : ES6 방식 (... -> object를 받을 수 있음 )
    const newToDos = { 
      ...toDos, 
      [Date.now()]: { text, working } 
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const editToDo = async (key) => {
    if (editText === "") {
      return;
    }
    const newToDos = { 
      ...toDos, 
      key: { editText, working } 
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditing(false);
  }
  const deleteToDo = async (key) => {
    Alert.alert("", "삭제할래?", [
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

  return (
    <View style={styles.container}>
      {/* <StatusBar style="light" /> */}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        returnKeyType="done"
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
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
              <TouchableOpacity onPress={edit}>
                {editing ? (
                  <TextInput
                    returnKeyType="done"
                    onSubmitEditing={editToDo}
                    onChangeText={onChangeText1}
                    value={toDos[key].text}
                    placeholder={toDos[key].text}
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.toDoText,
                      textDecorationLine: toDos[key].check
                        ? "line-through"
                        : "",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                )}
              </TouchableOpacity>
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
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,    
  }, 
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white"
  },
  input: {
    backgroundColor: "white",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },

});
 