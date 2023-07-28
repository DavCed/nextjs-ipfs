import { React } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

export function Home() {
  /* SECOND METHOD TO CONNECT TO BLOCKCHAIN NETWORK */
  const injected = new InjectedConnector();
  const { activate, active, library: provider } = useWeb3React();

  async function connect() {
    try {
      await activate(injected);
    } catch (error) {
      console.log(error);
    }
  }

  async function execute() {
    if (active) {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        console.log(await contract.storeFile("cid", "url"));
        console.log(await contract.getFile("cid"));
        console.log(await contract.getAllFiles());
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div>
      {active ? (
        <button onClick={() => execute()}>Execute</button>
      ) : (
        <button onClick={() => connect()}>Connect Metamask</button>
      )}
    </div>
  );
}
