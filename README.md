
1. -v => verbose
2. --attemps => attempts to check before failing test
3. --interval => check interval

```
{
  "scripts": {
    "test:e2e:sim1": "node_modules/.bin/mocha e2e --opts e2e/mocha.opts --configuration ios.sim.sim1.debug",
    "test:e2e:sim2": "node_modules/.bin/mocha e2e --opts e2e/mocha.opts --configuration ios.sim.sim2.debug",
    "test:e2e:interactive-test": "./node_modules/@hai5/detox-ic/parallel_commands.sh \"yarn test:e2e:sim2\" \"yarn test:e2e:sim1\""
  },
  "detox": {
    "configurations": {
      "ios.sim.debug": {
        "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/app-name.app",
        "build": "xcodebuild -workspace ios/app-name.xcworkspace -scheme urryapp-namede -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
        "type": "ios.simulator",
        "name": "iPhone 6"
      },
      "ios.sim.sim1.debug": {
        "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/app-name.app",
        "build": "xcodebuild -workspace ios/app-name.xcworkspace -scheme app-name -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
        "type": "ios.simulator",
        "name": "iPhone 6"
      },
      "ios.sim.sim2.debug": {
        "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/app-name.app",
        "build": "xcodebuild -workspace ios/app-name.xcworkspace -scheme app-name -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
        "type": "ios.simulator",
        "name": "iPhone X"
      }
    }
  }
}


```