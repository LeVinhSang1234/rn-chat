import {Component} from 'react';
import {
  EmitterSubscription,
  Keyboard as KeyboardLibrary,
  Platform,
} from 'react-native';
import {KeyboardProps} from '../types';

class KeyboardListener extends Component<KeyboardProps> {
  willShow?: EmitterSubscription;
  didShow?: EmitterSubscription;
  willHide?: EmitterSubscription;
  didHide?: EmitterSubscription;

  constructor(props: KeyboardProps) {
    super(props);
    const {keyboardWillShow, keyboardDidShow, keyboardWillHide} = props;
    if (keyboardWillShow) {
      this.willShow = KeyboardLibrary.addListener(
        'keyboardWillShow',
        keyboardWillShow,
      );
      if (Platform.OS === 'android' && !keyboardDidShow) {
        this.didShow = KeyboardLibrary.addListener(
          'keyboardDidShow',
          keyboardWillShow,
        );
      }
    }
    if (keyboardDidShow) {
      this.didShow = KeyboardLibrary.addListener(
        'keyboardDidShow',
        keyboardDidShow,
      );
    }
    if (keyboardWillHide) {
      this.willHide = KeyboardLibrary.addListener(
        'keyboardWillHide',
        keyboardWillHide,
      );
      if (Platform.OS === 'android') {
        this.didHide = KeyboardLibrary.addListener(
          'keyboardDidHide',
          keyboardWillHide,
        );
      }
    }
  }

  shouldComponentUpdate(): boolean {
    return false;
  }

  componentWillUnmount(): void {
    this.willShow?.remove?.();
    this.didShow?.remove?.();
    this.willHide?.remove?.();
    this.didHide?.remove?.();
  }

  render() {
    const {children} = this.props;
    return children;
  }
}

export default KeyboardListener;
