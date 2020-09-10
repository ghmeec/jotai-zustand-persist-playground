import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import {Provider, atom, useAtom} from 'jotai';
import AsyncStorage from '@react-native-community/async-storage';
import {PersistGate, configurePersist} from 'zustand-persist';
import createStore from 'zustand';
// You can import from local files

const simple = atom(['hello', 'world']);
// or any pure javascript modules available in npm

// persist zunstand
const {persist, purge} = configurePersist({
  storage: AsyncStorage, // use `AsyncStorage` in react native
  rootKey: 'root', // optional, default value is `root`
});

const useStore = createStore(
  persist(
    {
      key: 'authzerok2j', // required, child key of storage
    },
    (set) => ({
      bears: 0,
      increasePopulation: () => set((state) => ({bears: state.bears + 1})),
      removeAllBears: () => set({bears: 0}),
    }),
  ),
);

const Consumer = () => {
  const [data, setData] = useAtom(simple);
  return (
    <View>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
};

const API = 'https://jsonplaceholder.typicode.com/todos/1';

const urlAtom = atom(API);
const fetchUrlAtom = atom(async (get) => {
  try {
    const response = await fetch(get(urlAtom));
    return await response.json();
  } catch (e) {
    return [{message: 'oops something went wrong'}];
  }
});

const AsyncSample = () => {
  const [json] = useAtom(fetchUrlAtom);
  return (
    <View>
      <Text>{JSON.stringify(json)}</Text>
    </View>
  );
};
const AddToList = () => {
  const [text, setText] = React.useState('');
  const [data, setData] = useAtom(simple);
  return (
    <View>
      <TextInput
        style={{height: 50, backgroundColor: '#333', color: 'white'}}
        onChangeText={(e) => {
          setText(e);
          console.log('Here is text ', text);
        }}
        value={text}
      />
      <TouchableOpacity
        onPress={() => {
          setText('');
          setData([...data, text]);

          console.log('Now do nothing', text);
        }}>
        <View
          style={{
            backgroundColor: '#5C55CA',
            height: 50,
            marginTop: 22,
            justifyContent: 'center',
          }}>
          <Text style={{textAlign: 'center', color: 'white'}}>Add to List</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Error boundaries currently have to be classes.
class ErrorBoundary extends React.Component {
  state = {hasError: false, error: null};
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function BearCounter() {
  const bears = useStore((state) => state.bears);
  return <Text>{bears} bears around here ...</Text>;
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation);
  return (
    <TouchableOpacity onPress={increasePopulation}>
      <View
        style={{
          backgroundColor: '#5C55CA',
          height: 50,
          marginTop: 22,
          justifyContent: 'center',
        }}>
        <Text style={{textAlign: 'center', color: 'white'}}>Bears UP</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function App() {
  // console.log("app already rendered")
  return (
    <PersistGate
      onBeforeList={() => {
        console.log('onBeforeList');
      }}
      loading={<ActivityIndicator color="blue" size="large" />}>
      <Provider>
        <View style={{padding: 12, flex: 1}}>
          <ScrollView>
            <View style={{paddingVertical:12}}>
              <Text style={{fontSize: 18}}>Handling State with Jotai</Text>
            </View>
            <Consumer />
            <AddToList />
            <View style={{marginVertical: 22}}>
              <ErrorBoundary fallback={<Text>Error fetching Todos.</Text>}>
                <React.Suspense
                  fallback={<ActivityIndicator color="blue" size="large" />}>
                  <AsyncSample />
                </React.Suspense>
              </ErrorBoundary>
            </View>

            <View style={{paddingVertical:12}}>
              <Text style={{fontSize: 18}}>Handling State with Zunstand</Text>
            </View>
            <BearCounter/>
            <Controls/>
          </ScrollView>
        </View>
      </Provider>
    </PersistGate>
  );
}
