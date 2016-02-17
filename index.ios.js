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
  TouchableOpacity
} = React;

var HEADER = '#3b5998';
var BGWASH = 'rgba(255,255,255,0.8)';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://www.google.com';

var hmeWebView = React.createClass({

  getInitialState: function() {
    return {
      url: DEFAULT_URL,
      status: 'No Page Loaded',
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      loading: true,
      showWebView: false,
      showNav: true,
    };
  },

  inputText: '',

  handleTextInputChange: function(event) {
    this.inputText = event.nativeEvent.text;
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
      </View>
    ) : null ;

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

    return (
      <View style={[styles.container]}>
        {nav}
        {webView}
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
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      loading: navState.loading,
    });
  },

  handleDomainError: function() {
    this.setState({
      showWebView: true,
      showNav: true
    });
    return (
      <View>
        <Text>Wrong serial number,Please try again.</Text>
      </View>
    );
  },

  onSubmitEditing: function(event) {
    this.pressGoButton();
  },

  async pressGoButton () {
    let isExist = await this.pingHmeDomain();

    var url = 'http://' + this.inputText + '.local';

    // dismiss keyoard
    this.refs[TEXT_INPUT_REF].blur();

    if(isExist) {
      this.setState({
        url: url,
        showWebView: true,
        showNav: false
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

  async pingHmeDomain() {
    try {
      let response = await fetch( 'http://192.168.168.67:3000');
      return response.ok;
    } catch(error) {
      throw error;
    }
  },

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
