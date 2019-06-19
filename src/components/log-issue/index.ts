//** Add Project Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import tuiEditor from 'tui-editor';
import { BacklogService } from '../../services/backlog';
import { Actions, StoreKeys } from '../../store';

const MODAL = '#log-issue-modal';
const COMPONENT = 'e1p-log-issue';

export let LogIssueVM: ViewModel;

class ViewModel {
    readonly regex = new RegExp(/\[(.*?)\]/);
    bs: BacklogService;
    title$ = ko.observable<string>();
    issues: any[];
    issueType: any;
    editIssue: any;
    edit$ = ko.observable(false);
    status$ = ko.observable<any>();
    priority$ = ko.observable<any>();
    summary$ = ko.observable<string>();
    contentLength$ = ko.observable<number>(0);
    attachments$ = ko.observableArray<any>();
    descriptionEditor: tuiEditor.Editor;
    commentEditor: tuiEditor.Editor;
    ok() {
        const attachments: any[] = this.attachments$().filter(a => a.content);
        if (attachments) {
            Promise.all(attachments.map(f => {
                const fd = new FormData();
                fd.append('file', f.content, f.name);
                return this.bs.postSpaceAttachment(fd);
            })).then((result:any[]) => {
                this.postIssue(result.map(r => r.id));
            }).catch(err => console.error(err));
        } else {
            this.postIssue([]);
        }
    }
    postIssue(attachmentId: number[]) {
        if (this.edit$()) {
            this.bs.patchIssue(this.editIssue.id, {
                priorityId: this.priority$().id,
                statusId: this.status$().id,
                description: this.descriptionEditor.getMarkdown(),
                comment: this.commentEditor.getMarkdown(),
                attachmentId
            }).then(issue => {
                const index = this.bs.issues$.indexOf(this.editIssue);
                this.bs.issues$.splice(index, 1, issue);
                Actions.KeySave([StoreKeys.Issues, this.bs.issues$()]);
                $(MODAL).modal('hide');
            }).catch(e => console.error(e));
        } else {
            const issue = {
                projectId: this.bs.backlog.project.id,
                issueTypeId: this.issueType.id,
                priorityId: this.priority$().id,
                summary: this.summary$(),
                description: this.descriptionEditor.getMarkdown(),
                attachmentId
            };
            this.bs.postIssue(issue)
                .then(issue => {
                    this.bs.issues$.push(issue);
                    Actions.KeySave([StoreKeys.Issues, this.bs.issues$()]);
                    $(MODAL).modal('hide');
                })
                .catch(e => console.error(e));
        }
    }
    showEdit(issue: any) {
        this.edit$(true);
        this.attachments$.removeAll();
        this.attachments$(issue.attachments);
        this.editIssue = issue;
        this.status$(this.bs.backlog.statuses.find(s => s.id === issue.status.id));
        this.priority$(this.bs.backlog.priorities.find(p => p.id === issue.priority.id));
        this.summary$(issue.summary);
        this.descriptionEditor.setValue(issue.description);
        this.contentLength$(issue.description.length);
        this.commentEditor.setValue('');
        $(MODAL).modal();
    }
    showNew(issueType: any, summary: any) {
        this.edit$(false);
        this.attachments$.removeAll();
        this.issueType = issueType;
        this.summary$(summary.title);
        this.descriptionEditor.setValue(summary.description);
        this.contentLength$(summary.description.length);
        $(MODAL).modal();
    }
    constructor(params: { bs: BacklogService }) {
        LogIssueVM = this;
        this.bs = params.bs;
        const options = {
            initialEditType: 'wysiwyg',
            language: 'en_AU',
            hideModeSwitch: true,
            toolbarItems: [
                'heading',
                'bold',
                'italic',
                'strike',
                'divider',
                'ul',
                'ol',
                'indent',
                'outdent',
                'divider',
                'table',
                'image',
                'link'
            ]
        };
        this.descriptionEditor = new tuiEditor({
            el: document.querySelector('#log-issue-editor'),
            placeholder: 'Enter description...',
            height: '200px',
            ...options
        });
        this.descriptionEditor.addHook('change', _ => this.contentLength$(this.descriptionEditor.getValue().length));
        this.commentEditor = new tuiEditor({
            el: document.querySelector('#log-issue-comment-editor'),
            placeholder: 'Enter comment...',
            height: '150px',
            ...options
        });
    }
}

ko.components.register(COMPONENT, {
    viewModel: ViewModel,
    template: require('./template.html')
});
