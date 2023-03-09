import Component from './Component.mjs';
import {InputText} from './InputText.mjs';

export default class InputWallet extends Component {
  constructor(props) {
    super(props);
  }
  async render(element) {
    await super.render(element);
    this.wallet = await this.draw(InputText,
      {name:'wallet',title:this.props.title||'wallet address (btc/eth/rvt)',
        placeholder:this.props.placeholder||'Enter wallet address',hideTitle:this.props.hideTitle},this.element);
    this.wallet.element.classList.add('wallet-address');
    this.wallet.element.addEventListener('change',this.testAddress.bind(this));
  }
  testAddress() {

  }
}
