/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {Component, Fragment} from 'react';
import {
  FlatList,
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
} from 'react-native';
import {ChatRootKeyboard, ChatRootKeyboardValue} from '../Providers';
import {ChatProps} from '../types';

interface ChatState {}

class Chat extends Component<ChatProps, ChatState> {
  beginScroll?: boolean;

  componentDidMount() {
    this.changeContext(this.props);
  }

  changeContext = (props: ChatProps) => {
    const {setStateFromChat} = this.context as ChatRootKeyboardValue;
    const {inputChat, kbDescription} = props;
    setStateFromChat({inputChat, kbDescription});
  };

  registerKeyboard = (element: JSX.Element) => {
    const {registerKeyboard} = this.context as ChatRootKeyboardValue;
    return registerKeyboard(element);
  };

  private onPress = (event: GestureResponderEvent) => {
    const {onTouchEnd, onPress} = this.props;
    onTouchEnd?.(event);
    if (!this.beginScroll) {
      onPress?.(event);
    }
  };

  private onScrollBeginDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const {onScrollBeginDrag} = this.props;
    onScrollBeginDrag?.(event);
    this.beginScroll = true;
  };

  private onScrollEndDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const {onScrollEndDrag} = this.props;
    onScrollEndDrag?.(event);
    this.beginScroll = false;
  };

  render() {
    const {style, contentContainerStyle, inputChat, ...props} = this.props;

    return (
      <FlatList
        {...props}
        onTouchEnd={this.onPress}
        onScrollBeginDrag={this.onScrollBeginDrag}
        onScrollEndDrag={this.onScrollEndDrag}
        contentContainerStyle={[styles.container, contentContainerStyle]}
        inverted
        style={[styles.root, style]}
      />
    );
  }
}

Chat.contextType = ChatRootKeyboard;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

export default Chat;
