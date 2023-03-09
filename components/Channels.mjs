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
    this.data = {active:true};
    this.billingModels = ['sponsored','ad supported','paid'];
  }
  async render(element) {
    await super.render(element);
    this.channelName = await this.draw(InputChannel,
      {name:"name",data:this.data,hideTitle:true,placeholder:"Channel Name"},
      this.element);
    this.channelName.element.classList.add('channel-selector');
    this.properties = this.div('channel-properties');
    this.section1 = this.div('properties-section',this.properties);
    this.section2 = this.div('properties-section',this.properties);
    this.section3 = this.div('properties-section',this.properties);
    this.description = await this.draw(InputText,
      {name:'description',placeholder:"Enter a brief description"},this.section1);
    this.description.element.classList.add('input-greedy');
    this.billing = await this.draw(InputSelect,
      {name:'billing',options:this.billingModels},this.section2);
    this.wallet = await this.draw(InputWallet,
      {name:'wallet',title:'wallet address (btc/eth/rvt)',placeholder:'Enter wallet address'},this.section2);
    this.wallet.element.classList.add('input-greedy');
    this.active = await this.draw(InputToggle,
      {name:'active',data:this.data},this.section2);
    this.editKey = await this.draw(InputText,
      {name:'editKey',title:'editors pass phrase',placeholder:'enter a pass phrase to allow editing/removal'},this.section3);
    this.editKey.element.classList.add('input-greedy');
    this.viewKey = await this.draw(InputText,
      {name:'viewKey',title:'viewer pass phrase',placeholder:'enter a pass phrase required to view (or leave blank)'},this.section3);
    this.viewKey.element.classList.add('input-greedy');
    this.verificationStatus = this.div('verification-status',this.properties);
    this.updateVerification(this.verificationStatus,this.properties);

    this.controls = this.div('channel-controls');
    this.verifyButton = await this.draw(Button,{icon:"man",title:"verify publisher",onClick:this.updateVerification.bind(this)},this.controls);
    this.saveBtn = await this.draw(Button,{name:'save',icon:'save',title:'save'},this.controls);
  }
  updateVerification(element) {
    if (this.props.data.verified) {
      element.innerHTML = 'verified';
    } else {
      element.innerHTML = 'not verified';
    }
  }
}
