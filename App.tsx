import React, {Component} from 'react';
import Test from './examples/Test';
import ChatRootView from './packages/ChatRootView';

class App extends Component {
  render() {
    return (
      <ChatRootView distanceBottomBar={32}>
        <Test />
      </ChatRootView>
    );
  }
}

export default App;
