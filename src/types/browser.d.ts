interface Window {
  umami?: { track: (name: string, data: { page: string }) => unknown };
}
interface Navigator {
  readonly globalPrivacyControl?: boolean;
}
