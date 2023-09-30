import { useState, useEffect } from "react";
import { ethers } from "ethers";
// Import WarrantyCard ABI to interat with the smart-contract
import WarrantyCard from "./artifacts/contracts/WarrantyCard.sol/WarrantyCard.json";
import "./App.css";
import ListOwners from "./components/ListOwners.js";

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

function App() {
  // property variables
  const [_price, set_Price] = useState(0);
  const [updatedPrice, setupdatedPrice] = useState(1);
  const [defaultOwner, setDefaultOwner] = useState(null);
  const [owner, setOwner] = useState(null);
  const [owners, setOwners] = useState([]);
  const [contractInstance, setContractInstance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [value, setValue] = useState(0);
  const [authoriser, setAuthoriser] = useState("");
  const [showOwners, setShowOwners] = useState(false);
  let ownersItem = null;

  useEffect(() => {
    async function init() {
      // if metawallet exists
      if (typeof window.ethereum !== "undefined") {
        // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
        // const currentAccount = accounts[0];
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const currentAccount = await signer.getAddress();
        const contract = new ethers.Contract(
          contractAddress,
          WarrantyCard.abi,
          signer
        );
        setContractInstance(contract);
        setProvider(provider);
        setSigner(signer);
        setOwner(currentAccount);
        setOwners([...owners, currentAccount]);
        // const defaultPrice = await contract.price();
        // setupdatedPrice(defaultPrice.toString());
        // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // const currentAccount = accounts[0];
        // setOwner(currentAccount);
        // const allOwners = await contract.getWarrantyCardOwner();
        // setOwners(allOwners);
      }
    }
    init();
  }, []);

  // requesting access to users metamask account
  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  // fetches the current value stored in the price
  async function fetchPrice() {
    // if metawallet exists
    // if (typeof window.ethereum !== "undefined") {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const contract = new ethers.Contract(
    //     contractAddress,
    //     WarrantyCard.abi,
    //     provider
    //   );
    try {
      const data = await contractInstance.price();
      set_Price(data);
      console.log("Price: ", data.toString());
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async function setPrice() {
    // const accounts = await requestAccount();
    // const currentAccount = accounts[0];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const cur_account = await signer.getAddress();
    const contract = new ethers.Contract(
      contractAddress,
      WarrantyCard.abi,
      signer
    );
    console.log("Current Account: ", cur_account);
    if (cur_account !== owner) {
      console.log("Only the owner of the card can set the price");
      return;
    }
    const transaction = await contract.setPrice(
      ethers.utils.parseEther(_price.toString())
    );
    await transaction.wait();
    setupdatedPrice(_price);
    console.log(`${_price} set as the price`);
  }

  async function getOwners() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const cur_account = await signer.getAddress();
      console.log("Current Account: ", cur_account);
      if (cur_account !== owner) {
        console.log("Only the owner of the card can get the owners");
        return;
      }
      const data = await contractInstance.getWarrantyCardOwner();
      console.log("Owners: ", data);
      setShowOwners(true);
      setOwners(data);
      // {owners.map((item) => <li key={item}>{item}</li>)}
      // setShowOwners(true)
      // if (showOwners)
      // {
      //   ownersItem = owners.map((item) => <li key={item}>{item}</li>);
      // }
    } else {
      console.log("No Metamask detected");
    }
    // if (typeof window.ethereum !== "undefined") {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   try {
    //     ownersItem = owners.map((item) => <li key={item}>{item}</li>);
    //   } catch (error) {
    //     console.log("Error: ", error);
    //   }
    // try {
    //   const data = await ;
    //   console.log("Owners: ", data);
    // } catch (error) {
    //   console.log("Error: ", error);
    // }
  }

  const buyWarrantyCard = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const cur_account = await signer.getAddress();
    console.log("Current Account: ", cur_account);
    if (cur_account === owner) {
      console.log("You already own the card");
      return;
    }
    const isAut = await contractInstance.isAuthorized(cur_account.toString());
    console.log("Is Authorised: ", isAut);
    if (!isAut) {
      console.log("You are not authorised to buy the card");
      return;
    }
    const toWei = (amt) => ethers.utils.parseEther(amt.toString()); // converting 48 -> 48000000000000000000
    console.log("Here it works");
    const valueInEth = ethers.utils.parseEther(value.toString());
    const updatedPriceInEth = ethers.utils.parseEther(updatedPrice.toString());
    const numValueInEth = Number(valueInEth);
    const numUpdatedPriceInEth = Number(updatedPriceInEth);
    console.log("Updated Price In eth: ", updatedPriceInEth);
    console.log("Value in eth: ", valueInEth);
    console.log("Num Updated Price In eth: ", numUpdatedPriceInEth);
    console.log("Num Value in eth: ", numValueInEth);
    if (numValueInEth !== numUpdatedPriceInEth) {
      console.log("The price is not correct");
      return;
    }

    const txn = await contractInstance.buyWarrantyCard({
      value: valueInEth,
    });
    await txn.wait();
    // const transaction = await contractInstance.buyWarrantyCard({
    //   value: valueInEth,
    // });
    // console.log("here also it works");
    // await transaction.wait();
    console.log("Here also it works");
    setOwner(cur_account);
    setOwners([...owners, cur_account.toString()]);
    console.log(`${cur_account} bought the card`);
    // const transactionValueInEth = ethers.utils.formatEther(value);
    // console.log("Transaction Value: ", transactionValueInEth);
    // if (transactionValueInEth !== updatedPriceInEth) {
    //   console.log("The price is not correct");
    //   return;
    // } else {
    //   setOwner(cur_account);
    //   console.log(`${cur_account} bought the card`);
    // }
  };

  const addAuthoriser = async (authorizer) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const cur_account = await signer.getAddress();
    console.log("Current Account: ", cur_account);
    console.log("Authoriser: ", authorizer);
    if (cur_account !== owner) {
      console.log("Only the owner of the card can add an authoriser");
      return;
    }
    if (authorizer.length === 0) {
      console.log("Please enter an valid address");
      return;
    }
    const transaction = await contractInstance.addAuthorizedBuyer(authorizer);
    await transaction.wait();
    console.log(`${authorizer} added as an authoriser`);
  };

  // async function addAuthoriser(authoriser){
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const signer = provider.getSigner();
  //   const cur_account = await signer.getAddress();
  //   console.log("Current Account: ", cur_account);
  //   if (cur_account !== owner) {
  //     console.log("Only the owner of the card can add an authoriser");
  //     return;
  //   }
  //   if (authoriser.length === 0)
  //   {
  //     console.log("Please enter an valid address");
  //     return;
  //   }
  //   const transaction = await contractInstance.addAuthoriser(authoriser);
  //   await transaction.wait();
  //   console.log(`${authoriser} added as an authoriser`);
  // }

  const removeAuthoriser = async (authorizer) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const cur_account = await signer.getAddress();
    console.log("Current Account: ", cur_account);
    if (cur_account !== owner) {
      console.log("Only the owner of the card can remove an authoriser");
      return;
    }
    const transaction = await contractInstance.removeAuthorizedBuyer(
      authorizer
    );
    await transaction.wait();
    console.log(`${authorizer} removed as an authoriser`);
  };

  const handleAddAuthClick = () => {
    addAuthoriser(authoriser);
  };

  const handleRemoveAuthClick = () => {
    removeAuthoriser(authoriser);
  };

  const connectWalletHandler = () => {
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((result) => {
        accountChangedHandler(result[0]);
      });
  };

  const accountChangedHandler = (newAccount) => {
    setOwner(newAccount);
    console.log("Account: ", owner);
  };

  return (
    <div className="App">
      <h3>The owner of the Card is: {owner}</h3>
      <button onClick={connectWalletHandler}>START</button>
      <div className="container1">
        <button onClick={handleAddAuthClick}>Add Authoriser</button>
        <button onClick={handleRemoveAuthClick}>Remove Authoriser</button>
        <button onClick={setPrice}>Set Price</button>
        <input
          type="number"
          onChange={(e) => set_Price(e.target.value)}
          value={_price}
          placeholder="Enter the price"
        />
        <input
          type="text"
          placeholder="Enter the wallet address"
          onChange={(e) => setAuthoriser(e.target.value)}
          value={authoriser}
        />
      </div>

      <div className="container2">
        <button onClick={fetchPrice}>Get Price</button>
      </div>
      <div className="container3">
        <h2>The Current Price for the Warranty card is {updatedPrice} eth</h2>
        <p style={{ marginTop: -25 }}>
          <b>Note:</b> The default price when page reloads equals 1 ether
        </p>
      </div>

      <div className="container4">
        <h2>Buy Warranty Cards from here</h2>
        <label htmlFor="">
          Enter the equivalent amount of WarrantyCard in ether:
        </label>
        <br />
        <input
          type="number"
          placeholder="Enter the amount"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <button onClick={buyWarrantyCard}>Buy</button>
      </div>

      <div className="container5">
        <h2>Owners of the Warranty Card</h2>
        <button onClick={getOwners}>Get Owners</button>
        {showOwners && owners.map((owner, i) => <li key={i}>{owner}</li>)}
        {/* {owners.map((owner, i) => (<ListOwners key={i} items={owner} />))} */}
      </div>
    </div>
  );
}

export default App;
