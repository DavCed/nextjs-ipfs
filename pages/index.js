// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { useWeb3React } from "@web3-react/core";
// import { InjectedConnector } from "@web3-react/injected-connector";
import { abi, contractAddress } from "../constants/config";
import { useMoralis, useWeb3Contract } from "react-moralis";

import { createHelia } from "helia";
import { json } from "@helia/json";

export default function Home() {
  // FIRST METHOD
  // const [isConnected, setIsConnect] = useState(false);
  // const [signer, setSigner] = useState();

  // async function connect() {
  //   if (typeof window.ethereum !== "undefined") {
  //     try {
  //       await ethereum.request({ method: "eth_requestAccounts" });
  //       setIsConnect(true);
  //       let connectedProvider = new ethers.providers.Web3Provider(
  //         window.ethereum
  //       );
  //       setSigner(connectedProvider.getSigner());
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   } else {
  //     setIsConnect(false);
  //   }
  // }

  // async function execute() {
  //   if (typeof window.ethereum !== "undefined") {
  //     const contract = new ethers.Contract(contractAddress, abi, signer);
  //     try {
  //       console.log(await contract.storeFile("cid", "url"));
  //       console.log(await contract.getFile("cid"));
  //       console.log(await contract.getAllFiles());
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   } else {
  //     console.log("Please install metamask");
  //   }
  // }

  // return (
  //   <div>
  //     {isConnected ? (
  //       <>
  //         "Connected"
  //         <button id="executeBtn" onClick={() => execute()}>
  //           Execute
  //         </button>
  //       </>
  //     ) : (
  //       <button onClick={() => connect()}>Connect</button>
  //     )}
  //   </div>
  // );

  // ------------------------------------------------------------------------------------------------------

  // SECOND METHOD
  // const injected = new InjectedConnector();
  // const { activate, active, library: provider } = useWeb3React();

  // async function connect() {
  //   try {
  //     await activate(injected);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async function execute() {
  //   if (active) {
  //     const signer = provider.getSigner();
  //     const contract = new ethers.Contract(contractAddress, abi, signer);
  //     try {
  //       console.log(await contract.storeFile("cid", "url"));
  //       console.log(await contract.getFile("cid"));
  //       console.log(await contract.getAllFiles());
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // }

  // return (
  //   <div>
  //     {active ? (
  //       <>
  //         "Connected"
  //         <button onClick={() => execute()}>
  //           Execute
  //         </button>
  //       </>
  //     ) : (
  //       <button onClick={() => connect()}>Connect</button>
  //     )}
  //   </div>
  // );

  // ------------------------------------------------------------------------------------------------------

  // THIRD METHOD
  const { enableWeb3, isWeb3Enabled } = useMoralis();
  const { runContractFunction } = useWeb3Contract();

  async function storeFileOnChain() {
    if (
      document.getElementById("name").value.length > 0 &&
      document.getElementById("age").value.length > 0 &&
      document.getElementById("gpa").value.length > 0 &&
      document.getElementById("grade").value.length > 0
    ) {
      // CONSTRUCT OBJECT FROM INPUT FIELDS
      const studentObj = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        gpa: document.getElementById("gpa").value,
        grade: document.getElementById("grade").value,
      };

      // STORE IN HELIA IPFS
      const heliaNode = await createHelia();
      const jsonObj = json(heliaNode);
      const cid = await jsonObj.add(studentObj);
      const studentHelia = await jsonObj.get(cid);
      heliaNode.stop();
      const url = `http://ipfs.io/ipfs/${cid}`;
      console.log(`CID (storeFile) => ${cid.toString()}`);
      console.log(`URL (storeFile) => ${url}`);
      console.log("Student Object => ", studentHelia);

      // STORE IN SMART CONTRACT ON BLOCKCHAIN NETWORK
      const storeFileOptions = {
        abi: abi,
        contractAddress: contractAddress,
        functionName: "storeFile",
        params: {
          cid: cid.toString(),
          url: url,
        },
      };
      runContractFunction({
        onSuccess: async (results) =>
          console.log("Transaction Object => ", results),
        params: storeFileOptions,
      });

      // SET CID FIELD TO VALUE
      document.getElementById("cid").value = cid;
    } else console.log("PLEASE FILL OUT INPUT FIELDS");
  }

  async function getFileOnChain() {
    // GET FILE IN SMART CONTRACT ON BLOCKCHAIN
    if (document.getElementById("cid").value !== undefined) {
      const getFileOptions = {
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getFile",
        params: {
          cid: document.getElementById("cid").value,
        },
      };
      runContractFunction({
        onSuccess: (results) => console.log(`URL (getFile) => ${results}`),
        params: getFileOptions,
      });
    } else console.log("EMPTY FIELD");
  }

  async function getAllFilesOnChain() {
    // GET ALL FILES IN SMART CONTRACT ON BLOCKCHAIN
    const getAllFilesOptions = {
      abi: abi,
      contractAddress: contractAddress,
      functionName: "getAllFiles",
    };
    runContractFunction({
      onSuccess: (results) => {
        console.log("All Files (getAllFiles) => ");
        for (let i = 0; i < results.length; i++) {
          console.log(`${i} : ${results[i]}`);
        }
      },
      params: getAllFilesOptions,
    });
  }

  return (
    <div>
      {isWeb3Enabled ? (
        <>
          <div id="storeFields">
            <div>
              <label>Name: </label>
              <input type="text" id="name" size={15} />
            </div>
            <div>
              <label>Age: </label>
              <input type="text" id="age" size={1} />
            </div>
            <div>
              <label>GPA: </label>
              <input type="text" id="gpa" size={1} />
            </div>
            <div>
              <label>Grade: </label>
              <input type="text" id="grade" size={8} />
            </div>
            <button onClick={() => storeFileOnChain()}>Store File</button>
          </div>
          <div id="getField">
            <div>
              <label>CID: </label>
              <input type="text" id="cid" size={60} />
            </div>
            <div>
              <button onClick={() => getFileOnChain()}>Get File</button>
            </div>
          </div>
          <div>
            <button onClick={() => getAllFilesOnChain()}>Get All Files</button>
          </div>
        </>
      ) : (
        <button onClick={() => enableWeb3()}>Connect</button>
      )}
    </div>
  );
}
