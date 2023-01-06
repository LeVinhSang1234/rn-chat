import React from 'react';
import {Dimensions} from 'react-native';

export declare type ChatRootViewValue = {
  width: number;
  height: number;
};

const {width, height} = Dimensions.get('window');

export const ChatRootViewContext = React.createContext<ChatRootViewValue>({
  width,
  height,
});

export declare type ChatRootKeyboardValue = {
  setStateFromChat: (props: {
    inputChat?: JSX.Element;
    kbDescription?: JSX.Element;
    distanceBottomBar?: number;
  }) => void;
  registerKeyboard: (element: JSX.Element) =>
    | {
        remove: () => void;
        show: () => void;
        hide: () => void;
      }
    | undefined;
};

export const ChatRootKeyboard = React.createContext<ChatRootKeyboardValue>({
  setStateFromChat: () => null,
  registerKeyboard: () => ({
    remove: () => null,
    show: () => null,
    hide: () => null,
  }),
});
