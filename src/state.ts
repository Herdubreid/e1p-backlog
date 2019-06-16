import * as ko from 'knockout';

/** App State */

export const TIMEZONE_ADJUST = 0; /*36000*/;
export const DATE_FORMAT = 'MM/DD/YYYY';

export interface IPage {
    id: string;
    component: string;
    title: string;
    short: string;
    icon: string;
    visible$: ko.Observable<boolean>;
    order$: ko.Observable<number>;
    data: any;
}

export interface IBacklog {
    project: any;
    issueTypes: any[];
    statuses: any[];
    categories: any[];
    priorities: any[];
}

export interface IProject {
    status: string;
    name: string;
    rows: any[];
}

export interface IE1 {
    projectStatuses: any[];
    projects: IProject[];
}

export interface IState {
    data: Map<string, any>;
}

export const AboutPage: IPage = {
    id: 'about',
    component: 'e1p-about',
    title: 'About Backlog',
    short: 'About',
    icon: '',
    visible$: ko.observable(false),
    order$: ko.observable(0),
    data: null
};
