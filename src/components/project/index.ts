//** Project Component */
import './style.scss';
import * as ko from 'knockout';
import * as dateformat from 'dateformat';
import tuiViewer from 'tui-editor/dist/tui-editor-Viewer';
import { Services } from '../../services';
import { IProject } from '../../state';
import { LogIssueVM } from '../log-issue';
import { LogCommentVM } from '../log-comment';
import { ViewCommentVM } from '../view-comment';

const COMPONENT = 'e1p-project';

class ViewModel {
    readonly regexCommentStart = new RegExp(/(.*?)[\[\n\r]/);
    readonly colorCodes = new Map<string, string>([
        ['High', 'danger'],
        ['Normal', 'warning'],
        ['Low', 'info'],
        ['Open', 'danger'],
        ['In Progress', 'info'],
        ['Resolved', 'success'],
        ['Closed', 'success']
    ]);
    readonly logTypes = ['status', 'priority'];
    services: Services;
    issue: any;
    viewer: tuiViewer;
    comments$ = ko.observableArray<any>([]);
    short(content: string) {
        const s = this.regexCommentStart.exec(content);
        if (s) {
            return `${s[1]}...`;
        }
        return content;
    }
    format(d) {
        return dateformat(d, 'dddd, mmmm d, h:MM TT');
    }
    addComment = () => LogCommentVM.show(this.issue, this.comments$);
    viewComment = (data, issue) => ViewCommentVM.show(issue.summary, data);
    editIssue = () => LogIssueVM.showEdit(this.issue);
    descendantsComplete = () => {
        this.services.backlog.getIssueComments(this.issue.id, {})
            .then((comments: any[]) => {
                this.comments$.push(...comments.filter(c => c.content || c.changeLog.find(cl => this.logTypes.includes(cl.field))));
            });
        this.viewer = new tuiViewer({
            el: document.querySelector(`#project-text-viewer-${this.issue.id}`),
            initialValue: this.issue.description
        });
    }
    constructor(params: { issue: any; projects: IProject[]; services: Services }) {
        this.issue = params.issue;
        console.log('Issue: ', params.issue);
        this.services = params.services;
    }
}

ko.components.register(COMPONENT, {
    viewModel: {
        createViewModel: (params, componentInfo) => {
            const vm = new ViewModel(params);
            const sub = (ko as any).bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete);
            (vm as any).dispose = () => sub.dispose();
            return vm;
        }
    },
    template: require('./template.html')
});
