import React, {Component} from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import FreezeChild from '../FreezeChild';
import Keyboard from '../Keyboard';
import {ChatRootKeyboard, ChatRootViewContext} from '../Providers';
import {ChatRootViewProps} from '../types';

interface ChatRootViewState {
  width: number;
  height: number;
  opacity: number;
  inputChat?: JSX.Element;
  kbDescription?: JSX.Element;
}

class ChatRootView extends Component<ChatRootViewProps, ChatRootViewState> {
  keyboardRef?: Keyboard | null;
  isDimension?: boolean;
  dimensionEvent: any;

  constructor(props: ChatRootViewProps) {
    super(props);
    const {width, height} = Dimensions.get('window');
    this.state = {width, height, opacity: 0};
    this.isDimension = true;
    this.dimensionEvent = Dimensions.addEventListener(
      'change',
      this.changeDimension,
    );
  }

  shouldComponentUpdate(
    nProps: ChatRootViewProps,
    nState: ChatRootViewState,
  ): boolean {
    const {children} = this.props;
    const {width, height, opacity, inputChat, kbDescription} = this.state;
    return (
      children !== nProps.children ||
      width !== nState.width ||
      height !== nState.height ||
      inputChat !== nState.inputChat ||
      kbDescription !== nState.kbDescription ||
      opacity !== nState.opacity
    );
  }

  componentWillUnmount(): void {
    this.dimensionEvent?.remove?.();
  }

  changeDimension = () => {
    this.isDimension = true;
  };

  private onLayout = ({nativeEvent}: LayoutChangeEvent) => {
    const {width, height} = nativeEvent.layout;
    if (!this.isDimension && Platform.OS === 'android') {
      return;
    }
    this.setState({width, height, opacity: 1}, () => {
      this.isDimension = false;
    });
  };

  private setStateFromChat = (props: {inputChat?: JSX.Element}) => {
    this.setState(props);
  };

  private registerKeyboard = (element: JSX.Element) => {
    return this.keyboardRef?.registerKeyboard?.(element);
  };

  render() {
    const {
      children,
      style,
      distanceBottomBar,
      dragKeyboardEnd,
      dragKeyboardStart,
    } = this.props;
    const {width, height, opacity, inputChat, kbDescription} = this.state;

    return (
      <ChatRootViewContext.Provider value={{width, height}}>
        <View style={[styles.root, style]} onLayout={this.onLayout}>
          <View style={{width, height, opacity}}>
            <FreezeChild>
              <ChatRootKeyboard.Provider
                value={{
                  setStateFromChat: this.setStateFromChat,
                  registerKeyboard: this.registerKeyboard,
                }}>
                {children}
              </ChatRootKeyboard.Provider>
            </FreezeChild>
            {inputChat || null}
            <Keyboard
              elementDes={kbDescription}
              dragKeyboardEnd={dragKeyboardEnd}
              dragKeyboardStart={dragKeyboardStart}
              height={height}
              distanceBottomBar={distanceBottomBar}
              ref={ref => (this.keyboardRef = ref)}
            />
          </View>
        </View>
      </ChatRootViewContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default ChatRootView;
