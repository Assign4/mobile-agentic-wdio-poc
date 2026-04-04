type PlatformLocators = Record<"android" | "ios", Record<string, string>>;

export const nativeAlertLocators: PlatformLocators = {
  android: {
    alertTitle: '*//android.widget.TextView[@resource-id="com.wdiodemoapp:id/alert_title"]',
    alertMessage: '*//android.widget.TextView[@resource-id="android:id/message"]',
    okButton: '*//android.widget.Button[@text="OK"]',
  },
  ios: {
    alert: "-ios predicate string:type == 'XCUIElementTypeAlert'",
    okButton: "~OK",
  },
};
