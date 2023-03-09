import Component from "./Component.mjs";
import InputFile from "./InputFile.mjs";
import {InputText,InputTextArea} from "./InputText.mjs";
import {Button} from "./Button.mjs";
import InputChannel from "./InputChannel.mjs";
import InputWallet from "./InputWallet.mjs";

export default class Upload extends Component {
    constructor(props) {
        super(props);
        const imageExtensions = ['.bmp', '.svg', '.jpg', '.jpeg', '.png', '.ico', '.gif'];
        const videoExtensions = ['.m4v', '.mp4', '.webm', '.mov', '.mkv'];
        const audioExtensions = ['.mp3', '.wav', '.ogg'];
        this.allowedTypes = videoExtensions;
        this.languages = ['', 'EN', 'UA', 'RU', 'BY', 'FA'];
        this.browserLanguage = window.navigator.language.split('-')[0].toUpperCase();
    }

    async render(element) {
        await super.render(element);
        this.progressDisplay = this.div('progress-display');
        this.inputFile = await this.draw(InputFile,{data:{},name:"file",title:"upload file",accept:this.allowedTypes},this.element);
        this.properties = this.div('media-properties');
        await this.draw(InputChannel,{name:'channel',data:{},noCreate:true},this.properties)
        await this.draw(InputWallet,{name:'wallet'},this.properties);
        await this.draw(InputText,{name:'language',data:{language:this.browserLanguage},options:this.languages},this.properties)
        this.inputDescription = await this.draw(InputTextArea,{data:{},name:"description",title:"description"},this.element);
        this.uploadButton = await this.draw(Button,{icon:"upload",title:"upload",onClick:this.startJob.bind(this)},this.element);
    }

    static jobs = [];
    async startJob() {
        let job = new Job({
            description:this.inputDescription.value,
            file:this.inputFile.value
        });
        job.draw(this.progressDisplay);
        await job.stage();
        Upload.jobs.push(job);
    }

    updateJobs() {
        this.progressDisplay.innerHTML = "";
        for (let job of Upload.jobs) {
            this.progressDisplay.innerHTML += `<div>${job.id}</div>`;
        }
    }
}

class Job {
    constructor(form) {
        this.parent = parent;
        this.form = form;
        this.status = Job.NEW;
    }
    static NEW = 1;
    static UPLOAD = 2;
    static FAILED = 3;
    static SUCCESS = 4;
    static COMPLETE = 5;

    draw(hostElement) {
        this.element = document.createElement("div");
        this.element.classList.add('job');
        this.element.innerHTML = this.form.file.name;
        this.progressBar = document.createElement("div")
        this.progressBar.classList.add('progress');
        this.element.append(this.progressBar);
        hostElement.append(this.element);
    }
    destroy(wait=1000) {
        this.progressBar.style.backgroundColor = "red";
        setTimeout(()=>{
            this.element.remove();
            this.status = Job.COMPLETE;
        },wait)
    }

    /**
     * An upload is first staged to declare the metadata and receive an id.
     * @returns {Promise<void>}
     */
    async stage() {
        let body = {
            description: this.form.description,
            language: window.navigator.language,
            timezone: Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
            type: this.form.file.type,
            size: this.form.file.size,
            captured: this.form.file.lastModified
        }
        let options = {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        };
        let response = await fetch('/stage', options);
        let result = await response.json();
        if (response.ok) {
            this.status = Job.UPLOAD;
            await this.upload(result);
        } else {
            this.status = Job.FAILED;
            window.toast.error("something went wrong: " + result.message);
            this.destroy(2000);
        }
    }

    async upload(stageResult) {
        try {
            let formData = new FormData();
            formData.append('file',this.form.file);

            let xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (e) => {
                this.progressBar.style.left = ((e.loaded / e.total) * 100)+"%";
            };
            xhr.open("PUT", "/upload/" + stageResult._id);
            xhr.send(formData);
            xhr.onload = (e) => {
                this.status = Job.SUCCESS;
                this.destroy();
            };
        } catch(error) {
            window.toast.error("something went wrong: " + error);
        }
    }
}
