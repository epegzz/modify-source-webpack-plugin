import { compilation, Compiler } from 'webpack';
import path from 'path';

export interface Option {
  test: RegExp | ((module: compilation.Module | any) => boolean);
  modify: (source: string, fileName: string) => string;
  findFirst: boolean;
}

export type Options = Option | Option[];

export class ModifyModuleSourcePlugin {
  constructor(private readonly options: Options) {}

  public apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(this.constructor.name, compilation => {
      compilation.hooks.finishModules.tap(
        this.constructor.name,
        (modules: any[]) => {
          const options: Option[] = [].concat(this.options as never[]);

          options.forEach(({ test, modify, findFirst }) => {
            for (const module of Object.values(modules)) {
              if (
                (typeof test === 'function' && test(module)) ||
                (test instanceof RegExp && test.test(module.userRequest))
              ) {
                module._source._value = modify(
                  module._source._value,
                  path.basename(module.userRequest)
                );

                if (findFirst) {
                  break;
                }
              }
            }
          });
        }
      );
    });
  }
}