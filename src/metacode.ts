/* eslint-disable @typescript-eslint/no-unused-vars */
function isFunction(o: any) {
  return 'function' === typeof o;
}
function isUndefined(o: any) {
  return o === undefined;
}

const definitionPropName = 'definition';

export class MemberAttribute {
  constructor(protected attributeName: string) {}

  private registerMember(target: object, key: string) {
    const def = ((target as any)[definitionPropName] = (target as any)[definitionPropName] || {});
    const md = def.members || [];
    if (md.indexOf(key) < 0) {
      md.push(key);
    }

    def.members = md;
  }

  getDecoratorValue(target: object, key: string, presentedValue?: any) {
    return presentedValue;
  }

  decorate(value?: any) {
    return (target: object, key: string, descriptor?: object) => {
      this.registerMember(target, key);
      const decoratorValue = this.getDecoratorValue(target, key, value);

      (target as any)[definitionPropName][this.attributeName] = (target as any)[definitionPropName][this.attributeName] || {};
      (target as any)[definitionPropName][this.attributeName][key] = decoratorValue;
    };
  }

  get decorator() {
    return this.decorate();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static getMembers(target: Function | object) {
    return (target as any)[definitionPropName].members;
  }

  static getAttributeValue(target: object, memberName: string, attributeName: string) {
    return (((target as any)[definitionPropName] || {})[attributeName] || {})[memberName];
  }
}

export class AttributeFunctionChain {
  // eslint-disable-next-line @typescript-eslint/ban-types
  private steps: Array<Function> = [];
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(...steps: Array<Function>) {
    this.steps = steps;
  }

  invoke(definition: any, instance: any) {
    let result = definition;
    this.steps.forEach((fn) => {
      result = fn(result, instance);
    });
    return result;
  }
}

export class ParseAttribute extends MemberAttribute {
  constructor() {
    super('serialize');
  }

  getDecoratorValue(target: object, key: string, presentedValue?: any) {
    if (!isUndefined(presentedValue)) {
      return presentedValue;
    }
    return new AttributeFunctionChain((d: { [x: string]: any }) => d[key]);
  }
}

export const required = new MemberAttribute('required').decorate(true);
export const defaultValueAttribute = new MemberAttribute('defaultValue');
export const defaultValue = defaultValueAttribute.decorate.bind(defaultValueAttribute);
export const parseAttribute = new ParseAttribute();
export const parse = parseAttribute.decorator;
export const parseAs = parseAttribute.decorate.bind(parseAttribute);
export const typeArgument = new MemberAttribute('typeArgument');
