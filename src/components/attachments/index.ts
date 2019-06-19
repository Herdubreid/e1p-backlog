//** Dropzone Component */
import './style.scss';
import * as ko from 'knockout';
import { binaryStringToBlob } from 'blob-util';

const COMPONENT = 'e1p-attachments';

class ViewModel {
    attachments$: ko.ObservableArray<any>;
    dragenter = () => $('.dropzone').toggleClass('drag-over');
    dragleave = () => $('.dropzone').toggleClass('drag-over');
    dragover = (_, e) => e.preventDefault();
    drop(_, e) {
        e.preventDefault();
        const files: FileList = e.originalEvent.dataTransfer.files;
        console.log('drop', files);
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            const reader = new FileReader();
            reader.onload = (f: any) => {
                const content = binaryStringToBlob(f.target.result)
                console.log('Content: ', file, content);
                this.attachments$.push({
                    name: file.name,
                    content
                });
            }
            reader.readAsBinaryString(file);
        }
        $('.dropzone').toggleClass('drag-over');
        return true;
    }
    constructor(params: { attachments: ko.ObservableArray<any> }) {
        this.attachments$ = params.attachments;
    }
}

ko.components.register(COMPONENT, {
    viewModel: ViewModel,
    template: require('./template.html')
});
