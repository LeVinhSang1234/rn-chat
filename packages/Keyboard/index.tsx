import React, {Component, Fragment} from 'react';
import {
  Animated,
  KeyboardEvent,
  StyleSheet,
  Keyboard as KeyboardLib,
  View,
  GestureResponderEvent,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  EmitterSubscription,
  Platform,
  BackHandler,
  NativeEventSubscription,
} from 'react-native';
import FreezeChild from '../FreezeChild';
import IconDrag from '../IconDrag';
import KeyboardListener from '../KeyboardListener';
import {KeyboardViewProps} from '../types';
import ViewSystem from '../ViewSystem';

interface KBState {
  element?: JSX.Element;
  opacity: number;
  startDrag?: boolean;
  startDragScroll?: boolean;
}

const percentHeight = 0.9;
const heightDescription = 43;

class Keyboard extends Component<KeyboardViewProps, KBState> {
  animated: Animated.Value;
  height: number;
  isShow: boolean;
  animatedView: Animated.Value;
  animatedDrag: Animated.Value;
  animatedOpacity: Animated.Value;
  pageY: number;
  isDown: boolean;
  scrollViewRef?: ScrollView | null;
  dimensionEvent: EmitterSubscription;
  keyboardBack: NativeEventSubscription;
  animatedDragDescription: Animated.Value;

  constructor(props: KeyboardViewProps) {
    super(props);
    this.height = 0;
    this.isShow = false;
    this.animated = new Animated.Value(props.distanceBottomBar || 0);
    this.animatedView = new Animated.Value(0);
    this.animatedDrag = new Animated.Value(14.5);
    this.animatedOpacity = new Animated.Value(0);
    this.animatedDragDescription = new Animated.Value(0);
    this.state = {element: undefined, opacity: 1};
    this.pageY = 0;
    this.isDown = false;
    this.dimensionEvent = Dimensions.addEventListener(
      'change',
      this.handleHidenDrag,
    );
    this.keyboardBack = BackHandler.addEventListener(
      'hardwareBackPress',
      this.hardwareBackPress,
    );
  }

  shouldComponentUpdate(nProps: KeyboardViewProps, nState: KBState): boolean {
    const {element, opacity, startDrag, startDragScroll} = this.state;
    const {elementDes} = this.props;
    return (
      element !== nState.element ||
      opacity !== nState.opacity ||
      startDragScroll !== nState.startDragScroll ||
      elementDes !== nProps.elementDes ||
      startDrag !== nState.startDrag
    );
  }

  componentWillUnmount(): void {
    this.dimensionEvent?.remove?.();
    this.keyboardBack?.remove?.();
  }

  hardwareBackPress = () => {
    if ((this.animatedView as any)._value) {
      this.handleHidenDrag();
      return true;
    }
    return false;
  };

  registerKeyboard = (element: JSX.Element) => {
    if ((this.animated as any)._value) {
      KeyboardLib.dismiss();
    }
    this.isShow = true;
    KeyboardLib.dismiss();
    this.setState({element, opacity: 1});
    this.springLayout(this.height || this.getIniteHeight());
    return {
      remove: this.removeKeyboard,
      show: this.showKeyboard,
      hide: this.hideKeyboard,
    };
  };

  private removeKeyboard = () => {
    this.setState({element: undefined, opacity: 0});
    this.downKeyboard();
  };

  private showKeyboard = () => {
    this.isShow = true;
    KeyboardLib.dismiss();
    this.springLayout(this.height || this.getIniteHeight());
    this.setState({opacity: 1});
  };

  private hideKeyboard = () => {
    const heightKB = this.height || this.getIniteHeight();
    if ((this.animatedView as any)._value > heightKB) {
      this.handleDownDrag();
    } else {
      this.downKeyboard();
    }
  };

  private downKeyboard = () => {
    this.isShow = false;
    KeyboardLib.dismiss();
    this.keyboardWillHide({duration: undefined} as any);
  };

  private springLayout = (value: number, duration?: number) => {
    const {distanceBottomBar = 0} = this.props;
    let parallel: Animated.CompositeAnimation;
    if (duration === undefined || duration) {
      parallel = Animated.parallel([
        Animated.spring(this.animated, {
          toValue: value || distanceBottomBar,
          bounciness: 0,
          overshootClamping: true,
          useNativeDriver: false,
        }),
        Animated.spring(this.animatedView, {
          toValue: value,
          bounciness: 0,
          overshootClamping: true,
          useNativeDriver: false,
        }),
      ]);
    } else {
      parallel = Animated.parallel([
        Animated.timing(this.animated, {
          toValue: value || distanceBottomBar,
          useNativeDriver: false,
          duration: 0,
        }),
        Animated.timing(this.animatedView, {
          toValue: value,
          useNativeDriver: false,
          duration: 0,
        }),
      ]);
    }
    parallel.start(({finished}) => {
      const {opacity} = this.state;
      if (finished && !value && opacity) {
        this.setState({opacity: 0});
      }
    });
  };

  private keyboardWillShow = ({endCoordinates, duration}: KeyboardEvent) => {
    this.isShow = false;
    this.height = endCoordinates.height;
    this.springLayout(endCoordinates.height, duration);
  };

  private keyboardWillHide = ({duration}: KeyboardEvent) => {
    if (!this.isShow) {
      this.springLayout(0, duration);
    }
  };

  private keyboardDidShow = (event: KeyboardEvent) => {
    const {opacity} = this.state;
    if (Platform.OS === 'android') {
      this.keyboardWillShow(event);
    }
    if (opacity) {
      this.setState({opacity: 0});
    }
  };

  private beginDrag = ({nativeEvent}: GestureResponderEvent) => {
    this.pageY = nativeEvent.pageY;
    const {dragKeyboardStart} = this.props;
    this.setState({startDrag: true});
    dragKeyboardStart?.();
  };

  private endDrag = () => {
    const {height} = this.props;
    this.pageY = 0;
    const valueDrag = (this.animatedView as any)._value;
    const heightKeyboard = this.height || this.getIniteHeight();
    const nextValue = height * percentHeight;
    if (valueDrag === heightKeyboard) {
      return;
    }
    const {dragKeyboardEnd} = this.props;
    dragKeyboardEnd?.();
    if (
      (!this.isDown && valueDrag > heightKeyboard) ||
      (this.isDown && valueDrag - heightKeyboard > nextValue / 2)
    ) {
      const percent = (nextValue - heightKeyboard) / nextValue;
      return Animated.parallel([
        Animated.spring(this.animatedView, {
          toValue: nextValue,
          bounciness: 0,
          overshootClamping: true,
          useNativeDriver: false,
        }),
        Animated.spring(this.animatedOpacity, {
          toValue: percent,
          bounciness: 0,
          overshootClamping: true,
          useNativeDriver: true,
        }),
        Animated.timing(this.animatedDragDescription, {
          toValue: heightDescription,
          duration: 0,
          useNativeDriver: false,
        }),
      ]).start();
    }
    if (valueDrag > heightKeyboard) {
      return this.handleDownDrag();
    }
    this.handleHidenDrag();
  };

  private handleDownDrag = () => {
    const heightKeyboard = this.height || this.getIniteHeight();
    Animated.parallel([
      Animated.spring(this.animated, {
        toValue: heightKeyboard,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.animatedView, {
        toValue: heightKeyboard,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.animatedOpacity, {
        toValue: 0,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: true,
      }),
      Animated.timing(this.animatedDragDescription, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start(({finished}) => {
      if (finished) {
        this.setState({startDrag: false});
      }
    });
  };

  private handleHidenDrag = () => {
    const {distanceBottomBar = 0} = this.props;
    Animated.parallel([
      Animated.spring(this.animated, {
        toValue: distanceBottomBar,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.animatedView, {
        toValue: 0,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.animatedOpacity, {
        toValue: 0,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: true,
      }),
      Animated.timing(this.animatedDragDescription, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start(({finished}) => {
      if (finished) {
        this.pageY = 0;
        this.setState({startDrag: false, startDragScroll: false});
      }
    });
  };

  private getIniteHeight = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width ? 320 : 171;
  };

  private onResponderMove = ({nativeEvent}: GestureResponderEvent) => {
    const {height} = this.props;
    const space = (nativeEvent.pageY - this.pageY) / 1.4;
    this.isDown = space > 0;
    let nextValue = (this.animatedView as any)._value - space;
    const heightMax = height * percentHeight;
    if (nextValue > heightMax) {
      nextValue = heightMax;
    }

    const heightKeyboard = this.height || this.getIniteHeight();

    let pHNow = (nextValue - heightKeyboard) / (heightMax - heightKeyboard);
    if (pHNow < 0) {
      pHNow = 0;
    }
    const hDes = pHNow * heightDescription;

    const percent = (nextValue - heightKeyboard) / heightMax;
    let parallel: any = [];
    if (nextValue <= heightKeyboard) {
      parallel = [
        Animated.timing(this.animated, {
          toValue: nextValue,
          duration: 0,
          useNativeDriver: false,
        }),
      ];
    } else if ((this.animated as any)._value !== heightKeyboard) {
      parallel = [
        Animated.timing(this.animated, {
          toValue: heightKeyboard,
          duration: 0,
          useNativeDriver: false,
        }),
      ];
    }
    if (nextValue !== (this.animatedView as any)._value) {
      parallel = [
        ...parallel,
        Animated.timing(this.animatedView, {
          toValue: nextValue,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(this.animatedOpacity, {
          toValue: percent,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(this.animatedDragDescription, {
          toValue: hDes,
          duration: 0,
          useNativeDriver: false,
        }),
      ];
    }
    if (parallel.length) {
      Animated.parallel(parallel).start();
    }
    this.pageY = nativeEvent.pageY;
  };

  private onScrollElement = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset} = nativeEvent;
    const {startDrag} = this.state;
    if (contentOffset.y <= 0 && this.scrollViewRef && startDrag) {
      this.scrollViewRef?.scrollTo({y: 0, animated: false});
      this.setState({startDragScroll: true});
    }
  };

  private onResponderMoveScroll = (event: GestureResponderEvent) => {
    const {startDragScroll, startDrag} = this.state;
    if (!startDragScroll || !startDrag) {
      return;
    }
    if (!this.pageY) {
      this.pageY = event.nativeEvent.pageY;
    }
    this.onResponderMove(event);
  };

  private onTouchEnd = () => {
    this.pageY = 0;
    this.endDrag();
    this.setState({startDragScroll: false});
  };

  render() {
    const {element, opacity, startDrag, startDragScroll} = this.state;
    const {elementDes} = this.props;
    const scaleY = this.animatedDragDescription.interpolate({
      inputRange: [0, heightDescription],
      outputRange: [0, 1],
    });
    return (
      <Fragment>
        <Animated.View style={{height: this.animated}}>
          <KeyboardListener
            keyboardWillShow={this.keyboardWillShow}
            keyboardWillHide={this.keyboardWillHide}
            keyboardDidShow={this.keyboardDidShow}
          />
        </Animated.View>
        {startDrag ? (
          <Animated.View
            onTouchEnd={this.handleDownDrag}
            style={[
              styles.viewOverlay,
              StyleSheet.absoluteFillObject,
              {opacity: this.animatedOpacity},
            ]}
          />
        ) : null}
        <Animated.View
          style={[{height: this.animatedView}, styles.viewElement]}>
          <ViewSystem
            style={styles.content}
            onMoveShouldSetResponder={() => !!this.pageY}
            onResponderMove={this.onResponderMove}>
            <Animated.View
              onTouchStart={this.beginDrag}
              onTouchEnd={this.endDrag}
              style={[styles.viewDrag, {height: this.animatedDrag}]}>
              <IconDrag style={styles.divDrag} />
            </Animated.View>
            {elementDes ? (
              <Animated.View style={[{height: this.animatedDragDescription}]}>
                <Animated.View
                  style={[
                    styles.viewDesDrag,
                    {transform: [{scaleY}], opacity: scaleY},
                  ]}>
                  {elementDes}
                </Animated.View>
              </Animated.View>
            ) : null}
            <View style={[styles.element, {opacity}]}>
              <ScrollView
                bounces={!startDragScroll}
                ref={ref => (this.scrollViewRef = ref)}
                onMoveShouldSetResponder={() => !!startDragScroll}
                onResponderMove={this.onResponderMoveScroll}
                onTouchEnd={this.onTouchEnd}
                scrollEnabled={!startDragScroll}
                scrollEventThrottle={startDrag ? 16 : 10000}
                onScroll={this.onScrollElement}>
                <FreezeChild>{element}</FreezeChild>
              </ScrollView>
            </View>
          </ViewSystem>
        </Animated.View>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  element: {
    flexGrow: 1,
  },
  viewElement: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  content: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2.62,
    elevation: 4,
    flex: 1,
  },
  viewDrag: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  divDrag: {
    width: 40,
    height: 4.5,
    borderRadius: 100,
    marginVertical: 6,
  },
  viewOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewDesDrag: {
    flexDirection: 'row',
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default Keyboard;
