import 'react-native-get-random-values';
global.Buffer = require("buffer").Buffer;

// Minimal Location polyfill
global.location = {
  protocol: "file:",
  hostname: "localhost",
  host: "localhost",
  port: "",
  href: "file://",
  pathname: "/",
  search: "",
  hash: "",
  origin: "file://",
  ancestorOrigins: {} as any,
  assign: () => {},
  reload: () => {},
  replace: () => {},
  toString: () => "file://",
} as Location;

if (!global.process) {
  global.process = require("process");
}