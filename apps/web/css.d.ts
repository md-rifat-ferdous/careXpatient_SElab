// Declare CSS files as valid side-effect imports for TypeScript
// Required for TS2882 error when using moduleResolution: "bundler"
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
