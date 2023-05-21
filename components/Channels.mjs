import Component from './Component.mjs';
import {InputText} from './InputText.mjs';
import {InputToggle} from './InputToggle.mjs';
import {InputSelect} from './InputSelect.mjs'
import InputChannel from "./InputChannel.mjs";
import InputWallet from "./InputWallet.mjs";
import {Button} from "./Button.mjs";

export default class Channels extends Component {
  constructor(props) {
    super(props);
    this.billingModels = ['sponsored','ad supported','paid'];
    this.channel = {billing:this.billingModels[0]};
  }
  async render(element) {
    await super.render(element);
    this.channelName = await this.draw(InputChannel,
      {name:"_id",data:this.channel,hideTitle:true,placeholder:"Channel Name"},
      this.element);
    this.channelName.element.classList.add('channel-selector');
    this.properties = this.div('channel-properties');
    this.section1 = this.div('properties-section',this.properties);
    this.section2 = this.div('properties-section',this.properties);
    this.section3 = this.div('properties-section',this.properties);
    this.description = await this.draw(InputText,
      {name:'description',placeholder:"Enter a brief description",data:this.channel},this.section1);
    this.description.element.classList.add('input-greedy');
    this.billing = await this.draw(InputSelect,
      {name:'billing',options:this.billingModels,data:this.channel},this.section2);
    this.email = await this.draw(InputText,
      {name:'email',data:this.channel,title:'publisher email'},this.section2);
    this.wallet = await this.draw(InputWallet,
      {name:'wallet',title:'wallet address (btc/eth/rvt)',data:this.channel,
        placeholder:'Enter wallet address'},this.section2);
    this.wallet.element.classList.add('input-greedy');
    this.editKey = await this.draw(InputText,
      {name:'editKey',title:'pass phrase to edit (required)',placeholder:'enter a pass phrase to allow editing/removal'},this.section3);
    this.editKey.element.classList.add('input-greedy');
    this.viewKey = await this.draw(InputText,
      {name:'viewKey',title:'pass phrase to view (optional)',placeholder:'enter a pass phrase required to view (or leave blank)'},this.section3);
    this.viewKey.element.classList.add('input-greedy');
    this.verificationStatus = this.div('verification-status',this.properties);
    this.updateVerification(this.verificationStatus,this.properties);

    this.controls = this.div('channel-controls');
    // this.verifyButton = await this.draw(Button,{icon:"man",title:"verify publisher",onClick:this.updateVerification.bind(this)},this.controls);
    this.suspendButton = await this.draw(Button,{icon:"block",title:"suspend channel",onClick:this.toggleActive.bind(this)},this.controls);
    this.saveButton = await this.draw(Button,{name:'save',icon:'save',title:'save',onClick:this.save.bind(this)},this.controls);
  }
  updateVerification(element) {
    if (this.channel.verified) {
      element.innerHTML = 'verified';
    } else {
      element.innerHTML = 'not verified';
    }
  }
  async save() {
    if (this.channelName.type === 'create') {

    }
    if (!this.channel._id) return window.toast.warning('Please provide a channel name');
    if (!this.editKey.value) return window.toast.warning('Please provide a pass phrase for future editing');
    let options = {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(this.channel)
    };
    let response = await fetch('/channel', options);
    let result = await response.json();
    if (result.ok) {
      window.toast.success(`${this.channel._id} saved`);
    } else {
      window.toast.error(`Error saving: ${result.message}`);
    }
  }
  async toggleActive() {

  }
}
