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

const black = '#404040';
const white = '#B0B3B8';

class IconDrag extends Component<ViewProps, ViewSystemState> {
  listener: NativeEventSubscription;
  constructor(props: ViewProps) {
    super(props);
    this.state = {colorScheme: Appearance.getColorScheme() || 'light'};
    this.listener = Appearance.addChangeListener(this.appearanceChange);
  }

  shouldComponentUpdate(_: ViewProps, nextState: ViewSystemState): boolean {
    const {colorScheme} = this.state;
    return colorScheme !== nextState.colorScheme;
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
    const {style} = this.props;
    const {colorScheme} = this.state;
    return (
      <View
        style={[
          {backgroundColor: colorScheme === 'dark' ? black : white},
          style,
        ]}
      />
    );
  }
}

export default IconDrag;
