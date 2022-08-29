import Component from "./Component.mjs";
import InputFile from "./InputFile.mjs";
import {InputText,InputTextArea} from "./InputText.mjs";
import {Button} from "./Button.mjs";

export default class Upload extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        this.inputFile = this.new(InputFile,{data:{},name:"file",title:"upload file"})
        await this.inputFile.render(this.element);
        this.inputDescription = this.new(InputTextArea,{data:{},name:"description",title:"description"})
        await this.inputDescription.render(this.element);
        this.uploadButton = this.new(Button,{icon:"upload",title:"upload",onClick:this.upload.bind(this)});
        await this.uploadButton.render(this.element);
    }
    async upload() {
        let formData = new FormData();
        formData.append('description',this.inputDescription.value);
        formData.append('file',this.inputFile.value)
        await fetch('/put',{
            credentials: "same-origin",
            cache: "no-store",
            body:formData,
            method:"PUT"
        })
    }
}
