import Component from './Component.mjs';
import {InputText} from './InputText.mjs';
import {InputSelect} from './InputSelect.mjs';

export default class InputChannel extends Component {
  constructor(props) {
    super(props);
  }
  async render(element) {
    await super.render(element);
    if (!this.props.hideTitle) {
      this.title = this.div('form-element-title');
      this.title.innerHTML = this.props.title || this.props.name;
    }
    let options = [];
    if (!this.props.noCreate) options.push('create');
    options.push('find');
    if (!this.props.noRetrieve) options.push('retrieve');
    this.entry = this.div('channel-entry');
    this.searchType = await this.draw(InputSelect,
      {name:'type',data:{},options:options,hideTitle:true},this.entry);
    this.searchType.element.classList.add('channel-type');
    if (options.length === 1) {
      this.searchType.element.style.display = 'none';
    }
    this.searchInput = await this.draw(InputText,
      {name:"channel",data:{},hideTitle:true},this.entry);
    this.searchInput.element.classList.add('channel-name');
    this.setPlaceholder();
    this.searchType.element.addEventListener('change',this.selectType.bind(this));
  }
  async selectType() {
    this.setPlaceholder();
  }
  setPlaceholder() {
    let input = this.searchInput.element.querySelector('input');
    if (this.searchType.value === 'create') {
      input.placeholder = 'Create a new channel';
    } else if (this.searchType.value === 'find') {
     input.placeholder = 'Find a channel by name'
    } else if (this.searchType.value === 'retrieve') {
      input.placeholder = 'Enter a channel pass phrase'
    }
  }
}
