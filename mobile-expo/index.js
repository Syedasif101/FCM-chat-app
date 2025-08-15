import { AppRegistry } from "react-native";
import App from "./App";
import messaging from "@react-native-firebase/messaging";

// Register background handler (fires when app is killed/backgrounded)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("Message handled in the background!", remoteMessage);
  // For "notification" messages, Android will show the system notification automatically.
  // For "data-only" messages, you could display a local notification here with a library if desired.
});

AppRegistry.registerComponent("main", () => App);
