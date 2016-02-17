/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var StyleSheet = require('StyleSheet');
var Orientation = require('react-native-orientation');
var {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  WebView,
  TouchableOpacity,
  Alert
} = React;

var HEADER = '#3b5998';
var BGWASH = 'rgba(255,255,255,0.8)';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://www.google.com';

const ErrMsgBox = ( <View>
        <Text>Wrong serial number,Please try again.</Text>
      </View> );

var hmeWebView = React.createClass({

  getInitialState: function() {
    return {
      url: DEFAULT_URL,
      serialNumber: null,
      status: 'No Page Loaded',
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      loading: true,
      showWebView: false,
      showNav: true,
      piStatus: false,
      message: null
    };
  },

  inputText: '',

  handleTextInputChange: function(event) {
    // this.inputText = event.nativeEvent.text;
    this.setState({
      serialNumber: event.nativeEvent.text
    });
  },

  _orientationDidChange: function(orientation) {
    if(orientation == 'LANDSCAPE') {
      //do something with landscape layout
    }else{
      //do something with portrait layout
    }
  },

  componentDidMount: function() {
    // Orientation.lockToPortrait(); //this will lock the view to Portrait
    Orientation.lockToLandscape(); //this will lock the view to Landscape
    //Orientation.unlockAllOrientations(); //this will unlock the view to all Orientations

    Orientation.addOrientationListener(this._orientationDidChange);
  },

  componentWillUnmount: function() {
    Orientation.getOrientation((err,orientation)=> {
        console.log("Current Device Orientation: ", orientation);
    });
    Orientation.removeOrientationListener(this._orientationDidChange);
  },

  render: function() {

    let nav = this.state.showNav? (
      <View style={[styles.addressBarRow]} key={'nav'}>
        {/*
        <TouchableOpacity onPress={this.goBack}>
          <View style={this.state.backButtonEnabled ? styles.navButton : styles.disabledButton}>
            <Text>
               {'<'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.goForward}>
          <View style={this.state.forwardButtonEnabled ? styles.navButton : styles.disabledButton}>
            <Text>
              {'>'}
            </Text>
          </View>
        </TouchableOpacity>
        */}
        <TextInput
          ref={TEXT_INPUT_REF}
          placeholder="Enter Serial Number"
          value={this.state.serialNumber}
          autoCapitalize="none"
          onSubmitEditing={this.onSubmitEditing}
          onChange={this.handleTextInputChange}
          clearButtonMode="while-editing"
          style={styles.addressBarTextInput}
        />
        <TouchableOpacity onPress={this.pressGoButton}>
          <View style={styles.goButton}>
            <Text>
               Go!
            </Text>
          </View>
        </TouchableOpacity>
      </View> ) : null ;

    let webView = this.state.showWebView? (
       <WebView
        key={'webview'}
        ref={WEBVIEW_REF}
        automaticallyAdjustContentInsets={false}
        style={styles.webView}
        url={this.state.url}
        onNavigationStateChange={this.onNavigationStateChange}
        startInLoadingState={true}
        renderError={this.handleDomainError}  />
      ) : null ;

    let Msg = this.state.piStatus? null : this.getMsgBox();
    return (
      <View style={[styles.container]}>
        {nav}
        {webView}
        {/*
          <View style={styles.statusBar}>
            <Text style={styles.statusBarText}>{this.state.status}</Text>
          </View>
        */}
        {Msg}
      </View>
    );
  },

  goBack: function() {
    this.refs[WEBVIEW_REF].goBack();
  },

  goForward: function() {
    this.refs[WEBVIEW_REF].goForward();
  },

  reload: function() {
    this.refs[WEBVIEW_REF].reload();
  },

  onNavigationStateChange: function(navState) {
    if(navState.url.indexOf('/close') > 0)
      this.setState({
        backButtonEnabled: navState.canGoBack,
        forwardButtonEnabled: navState.canGoForward,
        loading: navState.loading,
        status: navState.url,
        showWebView: false,
        showNav: true
      });
    else
      this.setState({
        backButtonEnabled: navState.canGoBack,
        forwardButtonEnabled: navState.canGoForward,
        loading: navState.loading,
        status: navState.url,
        showWebView: true,
        showNav: false
      });
  },

  handleDomainError: function() {
    this.setState({
      showWebView: true,
      showNav: true
    });
    return ErrMsgBox;
  },

  onSubmitEditing: function(event) {
    this.pressGoButton();
  },

  async pressGoButton () {

    var url = this.state.serialNumber;//'http://' + this.inputText + '.local';
    if(url.indexOf('http') != 0) {
      url = 'http://' + url;
    }

    let isExist = await this.pingHmeDomain(url);

    // dismiss keyoard
    this.refs[TEXT_INPUT_REF].blur();

    if(isExist) {
      this.setState({
        url: url,
        showWebView: true,
        showNav: false,
        piStatus: true,
        message: null
      });
    }
    else {
      this.setState({
        piStatus: false,
        message: 'Pi is not online, Please try again.'
      });
    }
    // if (url === this.state.url) {
    //   // this.reload();
    // } else {
    //   this.setState({
    //     url: url,
    //     showWebView: true,
    //     showNav: false
    //   });
    // }
  },

  async pingHmeDomain(url) {
    try {
      let response = await fetch( url );
      if (response)
        return response.ok
      return false;
    } catch(error) {
      // throw error;
    }
  },

  getMsgBox() {
    return (
      <View>
        <Text>{this.state.message}</Text>
      </View>
    );
  }

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEADER,
  },
  addressBarRow: {
    flexDirection: 'row',
    padding: 8,
  },
  webView: {
    backgroundColor: BGWASH,
    height: 350,
  },
  addressBarTextInput: {
    backgroundColor: BGWASH,
    borderColor: 'transparent',
    borderRadius: 3,
    borderWidth: 1,
    height: 24,
    paddingLeft: 10,
    paddingTop: 3,
    paddingBottom: 3,
    flex: 1,
    fontSize: 14,
  },
  navButton: {
    width: 20,
    padding: 3,
    marginRight: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BGWASH,
    borderColor: 'transparent',
    borderRadius: 3,
  },
  disabledButton: {
    width: 20,
    padding: 3,
    marginRight: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DISABLED_WASH,
    borderColor: 'transparent',
    borderRadius: 3,
  },
  goButton: {
    height: 24,
    padding: 3,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: BGWASH,
    borderColor: 'transparent',
    borderRadius: 3,
    alignSelf: 'stretch',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    height: 22,
  },
  statusBarText: {
    color: 'white',
    fontSize: 13,
  },
  spinner: {
    width: 20,
    marginRight: 6,
  },
});

exports.title = '<WebView>';
exports.description = 'Base component to display web content';
exports.examples = [
  {
    title: 'WebView',
    render(): ReactElement { return <ReactNativeWebView />; }
  }
];

AppRegistry.registerComponent('hmeWebView', () => hmeWebView);


// url: navState.url,
// status: navState.title,
