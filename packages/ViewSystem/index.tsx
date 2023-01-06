import React, {Component} from 'react';
import {
  Appearance,
  ColorSchemeName,
  NativeEventSubscription,
  View,
  ViewProps,
} from 'react-native';

interface ViewSystemState {
  colorScheme: ColorSchemeName;
}

const black = '#222222';
const white = '#ffffff';

class ViewSystem extends Component<ViewProps, ViewSystemState> {
  listener: NativeEventSubscription;
  constructor(props: ViewProps) {
    super(props);
    this.state = {colorScheme: Appearance.getColorScheme() || 'light'};
    this.listener = Appearance.addChangeListener(this.appearanceChange);
  }

  componentWillUnmount(): void {
    this.listener?.remove?.();
  }

  private appearanceChange = ({
    colorScheme,
  }: {
    colorScheme: ColorSchemeName;
  }) => {
    const {colorScheme: color} = this.state;
    if (color !== colorScheme) {
      this.setState({colorScheme: colorScheme || 'light'});
    }
  };

  render() {
    const {children, style, ...props} = this.props;
    const {colorScheme} = this.state;
    const styleScheme = {
      backgroundColor: colorScheme === 'dark' ? black : white,
      shadowColor: colorScheme === 'light' ? black : white,
      shadowOpacity: colorScheme === 'light' ? 0.23 : 0,
    };
    return (
      <View style={[styleScheme, style]} {...props}>
        {children}
      </View>
    );
  }
}

export default ViewSystem;
