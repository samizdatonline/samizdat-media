import Component from './Component.mjs';
import {InputText} from './InputText.mjs';

export default class InputWallet extends InputText {
  constructor(props) {
    super(props);
  }
  async render(element) {
    if (!this.props.title) this.props.title = 'wallet address (btc/eth/rvt)';
    if (!this.props.placeholder) this.props.placeholder = 'Enter wallet address'
    await super.render(element);
    this.element.addEventListener('change',this.testAddress.bind(this));
  }
  testAddress() {

  }
}
