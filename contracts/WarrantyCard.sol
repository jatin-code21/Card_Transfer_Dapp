// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract WarrantyCard{
    address payable public owner;
    uint256 public price;
    mapping(address => bool) isWarrantyCardOwner;
    mapping(address => bool) authorizedBuyer;
    address[] public owners;

    modifier onlyOwner(){
        require(msg.sender == owner, "Only owner of the contract can perform this action");
        _;
    }

    event WarrantyCardTransfer(address indexed previousOwner, address indexed newOwner);

    constructor()
    {
        owner = payable (msg.sender);
        price = 1 ether; 
        authorizedBuyer[msg.sender] = true; // setting the owner as a authorised buyer.
        isWarrantyCardOwner[msg.sender] = true;
        owners.push(owner);
    }

    function setPrice(uint256 _price) public onlyOwner{
        price = _price;
    }

    function addAuthorizedBuyer(address buyer) public onlyOwner{
        authorizedBuyer[buyer] = true;
    }

    function removeAuthorizedBuyer(address buyer) public onlyOwner{
        authorizedBuyer[buyer] = false;
    }

    function isAuthorized(address buyer) public view returns(bool){
        return authorizedBuyer[buyer];
    }

    function getWarrantyCardOwner() public view returns(address[] memory){
       return owners;
    }

    function buyWarrantyCard() public payable{
        require(msg.value == price, "Payment amount is incorrect");
        // future scope of adding the greater than equal to condition to the price
        require(authorizedBuyer[msg.sender], "You are not an authorized buyer");
        // require(!isWarrantyCardOwner[msg.sender], "You already own a warrany card"); // this condtion will be removed 
        // because a buyer can hold more than one warranty card.

        isWarrantyCardOwner[msg.sender] = true;
        emit WarrantyCardTransfer(address(0), msg.sender);
        owner.transfer(msg.value);
        owner = payable (msg.sender);
        owners.push(msg.sender);
        // will be used to record the transaction on the blockchain
    }

    // function transferOwnership(address newOwner) public payable onlyOwner{
    //     uint256 fee = (msg.value * 100)/10000;
    //     uint256 transferAmount = msg.value - fee;
    //     owner = newOwner;
    // }
    // Above function will be used when we start charging some fee for the transfer of ownership as of now we are not charging any fee.
}