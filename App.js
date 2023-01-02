import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View, Alert, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { FontAwesome } from '@expo/vector-icons'; 
import styled from '@emotion/native'
import { useEffect, useState } from 'react';
import { doc, getDoc, getDocs, addDoc, collection, query, updateDoc, deleteDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { dbService } from './firebaseConfig';

const App = () => {

  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [editText, setEditText] = useState("");

  // todos가 변경될 때마다 데이터 새로 불러오기
  // useEffect(() => {
  //   getTodos();
  // }, [todos]);

  // 1. onSnapshot API를 이용해서 todos 콜렉션에 변경이 생길 때 마다
  // 2. todos 콜렉션 안의 모든 document들을 불러와서 setTodos 한다.
  useEffect(() => {
    const q = query(
      collection(dbService, "todos"),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
      const newTodos = snapshot.docs.map((doc) => {
        const neWTodo = {
          id: doc.id,
          ...doc.data()
        };
        return neWTodo
      });
      setTodos(newTodos);
    });
  }, []);

  // 현재 카테고리 (문서 하나만)불러오기
  useEffect(() => {
    const getCate = async () => {
      const snapshot = await getDoc(doc(dbService, "category", "currentCategory"));
      setCategory(snapshot.data().category)
    }
    getCate();
  }, []);

  // 카테고리 저장하기
  const setCate = async (cate) => {
    setCategory(cate)
    const snapshot = updateDoc(doc(dbService, "category", "currentCategory"), {
      category: cate
    });
  };
 
  // firestore에서 데이터 가져오기
  const getTodos = async () => {
    const array = [];
    const querySnapshot = await getDocs(collection(dbService, "todos"));
    querySnapshot.forEach((doc) => array.push({id: doc.id,...doc.data()}));
    setTodos(array)
  };

  // firestore에 데이터 추가하기
  const addTodo = async () => {
    const neWTodo = {
      // id: Date.now(),
      text,
      isDone: false,
      isEdit: false,
      category,
      createdAt: Date.now()
    };
    await addDoc(collection(dbService, "todos"), neWTodo);
    // setTodos([...todos, neWTodo]);
    setText("");
  };

  // [완료] 아이콘 클릭 시 작동-firestore 데이터 수정
  const setDone = async (id) => {
    const switchTodo = todos.find((todo) => todo.id === id); 
    const todoRef = doc(dbService, "todos", id);
    await updateDoc(todoRef, {
      isDone: !switchTodo.isDone
    });
    // const copy = [...todos];
    // const newTodos = copy.map((todo) => todo.id === id ? {...todo, isDone: !todo.isDone} : todo);
    // setTodos(newTodos)
  };

  // [삭제] 아이콘 클릭 시 작동-firestore 데이터 삭제
  const deleteTodo = (id) => {
    Alert.alert("삭제", "정말 삭제하시겠습니다?", [
      {text: "취소", 
      style: "caneel"},
      {text: "삭제", 
      style: "destructive", 
      onPress: () => {
        deleteDoc(doc(dbService, "todos", id));
        // const copy = [...todos];
        // const newTodos = copy.filter((todo) => todo.id !== id);
        // setTodos(newTodos)
      }}
    ])
  };

  // [수정] 아이콘 클릭 시 input으로 변경
  // firestore 데이터 수정
  const setEdit = async (id) => {
    const switchTodo = todos.find((todo) => todo.id === id); 
    const todoRef = doc(dbService, "todos", id);
    await updateDoc(todoRef, {
      isEdit: !switchTodo.isEdit
    });
    // const copy = [...todos];
    // const newTodos = copy.map((todo) => todo.id === id ? {...todo, isEdit: !todo.isEdit} : todo);
    // setTodos(newTodos);
  };

  // [수정] input 제출 시 텍스트 수정됨
  // firestore 데이터 수정
  const editTodo = async (id) => {
    const switchTodo = todos.find((todo) => todo.id === id); 
    const todoRef = doc(dbService, "todos", id);
    await updateDoc(todoRef, {
      text: editText,
      isEdit: false
    });
    // const copy = [...todos];
    // const newTodos = copy.map((todo) => todo.id === id ? {...todo, isEdit: false, text: editText} : todo )
    // setTodos(newTodos);
  };

  return (
    <Wrap>
      <StatusBar style="auto" />
        <ButtonBox>
          <ToDoButton onPress={() => setCate("Javascript")}
          style={{backgroundColor: category === "Javascript" ? "#D09CFA" : "gray"}}>
            <ButtonText>Javascript</ButtonText>
          </ToDoButton>
          <ToDoButton onPress={() => setCate("React")}
          style={{backgroundColor: category === "React" ? "#D09CFA" : "gray"}}>
            <ButtonText>React</ButtonText>
          </ToDoButton>
          <ToDoButton onPress={() => setCate("Coding Test")}
          style={{backgroundColor: category === "Coding Test" ? "#D09CFA" : "gray"}}>
            <ButtonText>Coding Test</ButtonText>
          </ToDoButton>
        </ButtonBox>
        <Line />
        <InputBox>
          <ToDoInput value={text}
          onChangeText={setText} 
          onSubmitEditing={addTodo}
          placeholder='Enter Your Task' />
        </InputBox>
        <Line />
        <ToDoList>
          {todos.map((todo) => {
            // 카테고리가 같은 때만 return해라
            if (category === todo.category) {
              return (
              <OneToDo key={todo.id}>
                { todo.isEdit 
                ? <EditInput defaultValue={todo.text} onChangeText={setEditText} onSubmitEditing={() => editTodo(todo.id)} /> 
                : <ToDoText style={{textDecorationLine: todo.isDone === false ? "none" : "line-through"}}>{todo.text}</ToDoText> }  
                <IconBox>
                  <TouchableOpacity onPress={() => setDone(todo.id)}>
                    <AntDesign name="checksquare" size={26} color="black" style={{marginRight: 5}} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEdit(todo.id)}>
                    <MaterialCommunityIcons name="pencil-circle-outline" size={26} color="black" style={{marginRight: 5}} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
                    <FontAwesome name="trash-o" size={26} color="black" />
                  </TouchableOpacity>
                </IconBox>  
              </OneToDo>
              )
            }
            
          }) }
        </ToDoList>
    </Wrap>
  );
};


const Wrap = styled.SafeAreaView`
  padding-top: 30px;
  align-items: center;
`

const ButtonBox = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px 0 0 20px;
  /* border-bottom: 2px solid black; */
`

const ToDoButton = styled.TouchableOpacity`
  height: 55px;
  width: 110px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
`

const ButtonText = styled.Text`
  color: white;
  font-size: 20px;
  font-weight: bold;
`

const InputBox = styled.View`
  display: flex;
  width: 90%;
`

const Line = styled.View`
  width: 90%;
  text-align: center;
  height: 1.5px;
  background-color: gray;
  margin: 15px 0;
`

const ToDoInput = styled.TextInput`
  border: 1px solid gray;
  height: 50px;
  padding: 10px 20px;
  font-size: 22px;
`

const ToDoList = styled.ScrollView`
  width: 90%;
`

const OneToDo = styled.View`
  width: 100%;
  height: 55px;
  background-color: lightgray;
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  
`

const EditInput = styled.TextInput`
  flex: 1;
  background-color: white;
  border: 1px solid gray;
  height: 50px;
  padding: 10px 20px;
  font-size: 22px;
  margin: 0 10px 0 5px;
`

const ToDoText = styled.Text`
  padding: 0 20px;
  font-size: 22px;
`

const IconBox = styled.View`
  display: flex;
  flex-direction: row;
  gap: 0 50px;
  padding-right: 10px;
`

export default App;