import Component from './Component.mjs';
import {InputText} from './InputText.mjs';
import {InputToggle} from './InputToggle.mjs'
import InputChannel from "./InputChannel.mjs";

export default class Channels extends Component {
  constructor(props) {
    super(props);
    this.data = {};
  }
  async render(element) {
    await super.render(element);
    this.channelName = await this.draw(InputChannel,
      {name:"name",data:this.data,hideTitle:true,placeholder:"Channel Name"},
      this.element);
    this.channelName.element.classList.add('channel-selector');
    this.properties = this.div('channel-properties');
    this.isPublic = await this.draw(InputToggle,{name:'public',data:this.data},this.element);
  }
}
