import React, {Component} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import Chat from '../packages/Chat';

class Test extends Component {
  refChat?: Chat | null;
  keyboard:
    | {remove: () => void; show: () => void; hide: () => void}
    | undefined;

  onPress = () => {
    if (this.refChat && !this.keyboard) {
      this.keyboard = this.refChat.registerKeyboard(
        <>
          <View style={styles.keyboard}>
            <Text>Snag</Text>
          </View>
          <View style={styles.keyboard}>
            <Text>Snag</Text>
          </View>
          <View style={styles.keyboard}>
            <Text>Snag</Text>
          </View>
          <View style={styles.keyboard}>
            <Text>Snag</Text>
          </View>
        </>,
      );
    } else {
      this.keyboard?.show();
    }
  };

  onPressDown = () => {
    this.keyboard?.hide();
  };

  renderMessage = ({item}: any) => {
    return (
      <View style={{paddingBottom: 250}}>
        <Text>{item.message}</Text>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.root}>
        <Button title="Click" onPress={this.onPress} />
        <Button title="Down" onPress={this.onPressDown} />
        <Chat
          onPress={this.onPressDown}
          renderItem={this.renderMessage}
          inputChat={
            <TextInput
              style={styles.input}
              multiline
              placeholder="Type a message..."
              placeholderTextColor="#6e6e6e"
            />
          }
          keyExtractor={item => item.id}
          ref={ref => (this.refChat = ref)}
          data={[
            {title: '1', message: 'asdsdads', id: 1},
            {title: '2', message: 'asdsdads', id: 2},
            {title: '3', message: 'asdsdads', id: 3},
            {title: '3', message: 'asdsdads', id: 4},
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  keyboard: {
    flexGrow: 1,
    paddingBottom: 250,
  },
  root: {
    flex: 1,
    paddingTop: 50,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});

export default Test;
