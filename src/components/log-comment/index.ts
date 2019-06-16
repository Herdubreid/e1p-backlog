//** Add Comments Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import tuiEditor from 'tui-editor';
import { base64StringToBlob } from 'blob-util';
import { BacklogService } from '../../services/backlog';

const MODAL = '#log-comment-modal';
const COMPONENT = 'e1p-log-comment';

export let LogCommentVM: ViewModel;

class ViewModel {
    imgRegex = new RegExp(/!\[image\..{3}]\((.*?)\)/);
    extRegex = new RegExp(/!\[image\.(.{3})]/);
    bs: BacklogService;
    editor: tuiEditor.Editor;
    issue$ = ko.observable<any>({ summary: '' });
    comments$: ko.ObservableArray<any>;
    contentLength$ = ko.observable<number>(0);
    attachments: [];
    dataURItoBlob(dataURI) {
        const arr = dataURI.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        return base64StringToBlob(arr[1], mime);
    }
    attach() {
        const fd = new FormData();
        let comment = this.editor.getMarkdown();
        let image;
        let count = 0;
        while (image = this.imgRegex.exec(comment)) {
            const filename = `image${++count}.${this.extRegex.exec(image[0])[1]}`;
            const blob = this.dataURItoBlob(image[1]);
            console.log('Images: ', filename);
            fd.append('filename', filename);
            fd.append('file', blob);
            comment = comment.replace(image[0], filename);
        };
        console.log('Comments:', comment);
        this.bs.postSpaceAttachment(fd)
            .then(response => {
                console.log('Attachment: ', response);
            })
            .catch(e => console.error('Attach: ', e));
    }
    add() {
        const comment = this.editor.getMarkdown();
        if (comment) {
            this.bs.postIssueComments(this.issue$().id, {
                content: comment,
                attachmentId: this.attachments
            }).then(comment => {
                this.comments$.unshift(comment);
                $(MODAL).modal('hide');
            })
            .catch(e => console.error(e));
        }
    }
    show(issue: any, comments$: ko.ObservableArray<any>) {
        this.comments$ = comments$;
        this.editor.setValue('');
        this.issue$(issue);
        $(MODAL).modal();
    }
    constructor(params: { bs: BacklogService }) {
        LogCommentVM = this;
        this.bs = params.bs;
        this.editor = new tuiEditor({
            el: document.querySelector('#log-comment-editor'),
            initialEditType: 'wysiwyg',
            language: 'en_AU',
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
            ],
            placeholder: 'Enter comment...',
            hideModeSwitch: true,
            height: '400px'
        });
        this.editor.addHook('change', _ => this.contentLength$(this.editor.getValue().length));
    }
}

ko.components.register(COMPONENT, {
    viewModel: ViewModel,
    template: require('./template.html')
});
