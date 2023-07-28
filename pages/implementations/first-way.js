import { useState, React } from "react";
import { ethers } from "ethers";

export function Home() {
  /* FIRST METHOD TO CONNECT TO BLOCKCHAIN NETWORK */
  const [isConnected, setIsConnect] = useState(false);
  const [signer, setSigner] = useState();

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" });
        setIsConnect(true);
        let connectedProvider = new ethers.providers.Web3Provider(
          window.ethereum
        );
        setSigner(connectedProvider.getSigner());
      } catch (error) {
        console.log(error);
      }
    } else {
      setIsConnect(false);
    }
  }

  async function execute() {
    if (typeof window.ethereum !== "undefined") {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        console.log(await contract.storeFile("cid", "url"));
        console.log(await contract.getFile("cid"));
        console.log(await contract.getAllFiles());
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install metamask");
    }
  }

  return (
    <div>
      {isConnected ? (
        <button onClick={() => execute()}>Execute</button>
      ) : (
        <button onClick={() => connect()}>Connect Metamask</button>
      )}
    </div>
  );
}
