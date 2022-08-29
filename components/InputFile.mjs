import Component from './Component.mjs';

export default class InputFile extends Component {
    constructor(props) {
        super(props)
    }
    async render(element) {
        await super.render(element);
        if (!this.props.hideTitle && (this.props.name || this.props.title)) {
            this.title = this.div('form-element-title');
            this.title.innerHTML = this.props.title || this.props.name;
        }
        this.input = document.createElement("input");
        this.input.type = "file"
        this.element.append(this.input);
    }
    get value() {
        return this.input.files[0];
    }
}
