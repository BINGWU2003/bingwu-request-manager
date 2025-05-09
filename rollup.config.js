import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const extensions = ['.js', '.ts']
const input = 'src/index.ts'

export default [
  // UMD/IIFE 格式构建 (可直接在浏览器中使用)
  {
    input,
    output: {
      name: 'BingwuRequestManager',
      file: 'dist/index.umd.js',
      format: 'umd',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      babel({
        extensions,
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ]
  },
  // UMD/IIFE minified 版本
  {
    input,
    output: {
      name: 'BingwuRequestManager',
      file: 'dist/index.umd.min.js',
      format: 'umd',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      babel({
        extensions,
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      }),
      terser()
    ]
  },
  // ESM 格式构建 (现代浏览器和工具链)
  {
    input,
    output: {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ extensions }),
      typescript({ tsconfig: './tsconfig.json' }),
    ]
  },
  // CommonJS 格式构建 (Node.js环境)
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  }
] 