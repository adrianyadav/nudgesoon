export const features = {
  // Toggle the Chrome Extension marketing and banner features
  // Defaults to false in production unless explicitly set to true
  chromeExtension: process.env.NEXT_PUBLIC_FEATURE_EXTENSION === 'true',
};
