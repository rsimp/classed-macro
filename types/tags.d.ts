import { ElementType } from 'react';
import { HTMLBasicElement } from './types';
export declare const tags: HTMLBasicElement[];
export declare const filterPropsToForward: (tag: ElementType<any>, props: object) => {
    [x: string]: any;
    [x: number]: any;
};
