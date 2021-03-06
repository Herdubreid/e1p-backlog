/** Backlog Service */
import * as ko from 'knockout';
import * as bl from 'backlog-js';
import { Actions, StoreKeys } from '../store';
import { IBacklog } from '../state';
const API = require('./bl-key.json');
const PROJECT = 'OMW';

export class BacklogService extends bl.Backlog {
    ready$ = ko.observable(false);
    backlog: IBacklog;
    issues$ = ko.observableArray<any>([]);
    refresh = () => this.getIssues({
        keyword: '',
        projectId: [this.backlog.project.id]
    });
    init(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.backlog = this.data.get(StoreKeys.Backlog);
            if (this.backlog) {
                this.issues$(this.data.get(StoreKeys.Issues));
                resolve(true);
            } else {
                Promise.all([
                    this.getSpace(),
                    this.getProjects(),
                    this.getIssueTypes(PROJECT),
                    this.getCategories(PROJECT),
                    this.getPriorities(),
                    this.getStatuses()
                ]).then((result: any[]) => {
                    this.backlog = {
                        project: result[1].find(p => p.projectKey === PROJECT),
                        issueTypes: result[2],
                        categories: result[3],
                        priorities: result[4],
                        statuses: result[5]
                    };
                    Actions.KeySave([StoreKeys.Backlog, this.backlog]);
                    this.refresh()
                        .then((issues: any[]) => {
                            this.issues$(issues);
                            Actions.KeySave([StoreKeys.Issues, issues]);
                            resolve(true);
                        });
                }).catch(e => {
                    console.error(e);
                    reject(false);
                });
            }
        });
    }
    constructor(public data: Map<string, any>) {
        super(API);
    }
}