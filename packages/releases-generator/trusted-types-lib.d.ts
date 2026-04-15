declare module "trusted-types/lib" {
  export class TrustedHTML {}
  export class TrustedScript {}
  export class TrustedScriptURL {}

  export interface TrustedTypePolicy {
    readonly name: string;
    createHTML(input: string): TrustedHTML;
    createScript(input: string): TrustedScript;
    createScriptURL(input: string): TrustedScriptURL;
  }

  export interface TrustedTypePolicyOptions {
    createHTML?: (input: string) => string | TrustedHTML;
    createScript?: (input: string) => string | TrustedScript;
    createScriptURL?: (input: string) => string | TrustedScriptURL;
  }

  export interface TrustedTypePolicyFactory {
    createPolicy(
      name: string,
      rules: TrustedTypePolicyOptions,
    ): TrustedTypePolicy;
    isHTML(value: unknown): value is TrustedHTML;
    isScript(value: unknown): value is TrustedScript;
    isScriptURL(value: unknown): value is TrustedScriptURL;
  }

  export interface TrustedTypesWindow {
    trustedTypes: TrustedTypePolicyFactory;
  }
}
