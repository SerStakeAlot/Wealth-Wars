declare module '@jest/globals' {
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const beforeEach: any;
}

declare module NodeJS {
  interface Global {
    localStorage: any;
    window: any;
  }
}
