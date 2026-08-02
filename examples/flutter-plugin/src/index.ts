import { NorixPlugin } from '../../../src/plugins/Plugin.js';
import { FlutterDetector } from './FlutterDetector.js';

const plugin: NorixPlugin = {
  name: 'Flutter Plugin',
  version: '1.0.0',
  norix: '^1.0.0 || ^2.0.0',
  description: 'Detects Flutter mobile application stacks',
  homepage: 'https://github.com/example/flutter-plugin',
  register(registry) {
    registry.registerDetector(this, FlutterDetector);
  },
};

export default plugin;
export { plugin };
