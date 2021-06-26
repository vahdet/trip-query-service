// import type { InitialOptionsTsJest } from 'ts-jest/dist/types'
// import { defaultsESM as tsjPreset } from 'ts-jest/presets'

// const config: InitialOptionsTsJest = {
//   transform: tsjPreset.transform,
//   preset: '@shelf/jest-mongodb'
// }

// export default config

const config = {
  verbose: true,
  preset: "@shelf/jest-mongodb"
};

// eslint-disable-next-line no-undef
module.exports = config
