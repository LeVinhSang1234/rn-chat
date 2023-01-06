import {
  FlatListProps,
  GestureResponderEvent,
  KeyboardEventListener,
  ViewStyle,
} from 'react-native';

export declare type KeyboardProps = {
  children?: JSX.Element;
  keyboardWillShow?: KeyboardEventListener;
  keyboardDidShow?: KeyboardEventListener;
  keyboardWillHide?: KeyboardEventListener;
};

export declare type ChatRootViewProps = {
  children?: JSX.Element;
  style?: ViewStyle;
  distanceBottomBar?: number;
  dragKeyboardStart?: () => void;
  dragKeyboardEnd?: () => void;
};

export declare type KeyboardViewProps = {
  children?: JSX.Element;
  style?: ViewStyle;
  distanceBottomBar?: number;
  elementDes?: JSX.Element;
  height: number;
  dragKeyboardStart?: () => void;
  dragKeyboardEnd?: () => void;
};

export declare type ChatProps = {
  children?: JSX.Element;
  placeholder?: string;
  inputChat?: JSX.Element;
  kbDescription?: JSX.Element;
  onPress?: (event: GestureResponderEvent) => void;
} & FlatListProps<any>;

export declare type RegisterKeyboard = (element: JSX.Element) =>
  | {
      remove: () => void;
      show: () => void;
      hide: () => void;
    }
  | undefined;
