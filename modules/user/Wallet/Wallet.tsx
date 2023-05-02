import { Divider } from 'antd';
import { FundFlow } from './FundFlow';
import { Balance } from './Balance';

export const Wallet = () => {
  return (
    <div>
      <Balance />
      <Divider />
      <FundFlow></FundFlow>
    </div>
  );
};
