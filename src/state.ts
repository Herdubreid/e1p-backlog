import * as ko from 'knockout';

/** App State */

export const TIMEZONE_ADJUST = 0; /*36000*/;
export const DATE_FORMAT = 'MM/DD/YYYY';

export interface IPage {
    id: string;
    component: string;
    title: string;
    visible$: ko.Observable<boolean>;
    order$: ko.Observable<number>;
    data: any;
}

export interface IBacklog {
    project: any;
    issueTypes: any[];
    categories: any[];
    priorities: any[];
}

export interface ICalHeatMapData {
    data: any;
    min: number;
    max: number;
}

export interface IProject {
    status: string;
    count: number;
}

export interface IProjectStatus {
    data: any;
    current: IProject[];
}

export interface IUserMap {
    user: string;
    map: any;
}

export interface IE1Stats {
    projectStatuses: any[];
    activityStatuses: any[];
    checkIns: ICalHeatMapData;
    transfers: ICalHeatMapData;
    projects: IProjectStatus;
    users: IUserMap[];
}

export interface IState {
    data: Map<string, any>;
}

export const AboutPage: IPage = {
    id: 'about',
    component: 'e1p-about',
    title: 'About Backlog',
    visible$: ko.observable(false),
    order$: ko.observable(0),
    data: null
};
