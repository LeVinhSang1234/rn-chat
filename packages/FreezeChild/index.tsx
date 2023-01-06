import {Component} from 'react';

interface FreezeChildProps {
  children?: JSX.Element;
}

class FreezeChild extends Component<FreezeChildProps> {
  shouldComponentUpdate(nProps: FreezeChildProps): boolean {
    const {children} = this.props;
    return children !== nProps.children;
  }

  render() {
    const {children} = this.props;
    return children;
  }
}

export default FreezeChild;
