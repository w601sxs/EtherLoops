pragma solidity ^0.4.17;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract EtherLoopCoin is StandardToken {

string public name = 'EtherLoopCoin';
string public symbol = 'ELC';
uint8 public decimals = 2;
uint public INITIAL_SUPPLY = 12000;

constructor() public {
  totalSupply_ = INITIAL_SUPPLY;
  balances[msg.sender] = INITIAL_SUPPLY;
}

}