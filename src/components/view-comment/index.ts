//** View Comments Component */
import './style.scss';
import * as ko from 'knockout';
import 'bootstrap';
import tuiViewer from 'tui-editor/dist/tui-editor-Viewer';

const MODAL = '#view-comment-modal';
const COMPONENT = 'e1p-view-comment';

export let ViewCommentVM: ViewModel;

class ViewModel {
    title$ = ko.observable<string>();
    viewer: tuiViewer;
    show(title: string, comment: any) {
        this.title$(title);
        this.viewer.setValue(comment.content);
        $(MODAL).modal();
    }
    constructor() {
        this.viewer = new tuiViewer({
            el: document.querySelector('#log-comment-viewer')
        });
        ViewCommentVM = this;
    }
}

ko.components.register(COMPONENT, {
    viewModel: ViewModel,
    template: require('./template.html')
});
