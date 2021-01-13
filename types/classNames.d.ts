declare type BasicClassValue = string | {
    [id: string]: any;
} | undefined | boolean;
declare type ClassesValue<P> = BasicClassValue | ClassesValueArray<P> | ((props: P) => Classes<P>);
export declare type Classes<P> = ClassesValue<P> | ClassesValueArray<P> | TemplateStringsArray;
export interface ClassesValueArray<P> extends Array<ClassesValue<P>> {
}
export declare const processClasses: <P>(classes: Classes<P>, props: P, templateStringPlaceholders?: ClassesValueArray<P>) => BasicClassValue;
export {};
