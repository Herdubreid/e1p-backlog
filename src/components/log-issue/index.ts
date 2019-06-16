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
    descriptionEditor: tuiEditor.Editor;
    commentEditor: tuiEditor.Editor;
    contentLength$ = ko.observable<number>(0);
    ok() {
        if (this.edit$()) {
            this.bs.patchIssue(this.editIssue.id, {
                priorityId: this.priority$().id,
                statusId: this.status$().id,
                description: this.descriptionEditor.getMarkdown(),
                comment: this.commentEditor.getMarkdown()
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
                description: this.descriptionEditor.getMarkdown()
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
        this.editIssue = issue;
        this.status$(this.bs.backlog.statuses.find(s => s.id === issue.status.id));
        this.priority$(this.bs.backlog.priorities.find(p => p.id === issue.priority.id));
        this.summary$(issue.summary);
        this.descriptionEditor.setValue(issue.description);
        this.contentLength$(issue.description.length);
        this.commentEditor.setValue('');
        $(MODAL).modal();
    }
    showNew(issueType: any, summary: string) {
        this.edit$(false);
        this.issueType = issueType;
        this.summary$(summary);
        this.descriptionEditor.setValue(summary);
        this.contentLength$(summary.length);
        $(MODAL).modal();
    }
    constructor(params: { bs: BacklogService }) {
        LogIssueVM = this;
        this.bs = params.bs;
        const toolbarItems = [
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
        ];
        this.descriptionEditor = new tuiEditor({
            el: document.querySelector('#log-issue-editor'),
            initialEditType: 'wysiwyg',
            language: 'en_AU',
            placeholder: 'Enter description...',
            hideModeSwitch: true,
            height: '200px',
            toolbarItems
        });
        this.descriptionEditor.addHook('change', _ => this.contentLength$(this.descriptionEditor.getValue().length));
        this.commentEditor = new tuiEditor({
            el: document.querySelector('#log-issue-comment-editor'),
            initialEditType: 'wysiwyg',
            language: 'en_AU',
            placeholder: 'Enter comment...',
            hideModeSwitch: true,
            height: '150px',
            toolbarItems
        })
    }
}

ko.components.register(COMPONENT, {
    viewModel: ViewModel,
    template: require('./template.html')
});
