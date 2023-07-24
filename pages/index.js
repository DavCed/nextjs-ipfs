// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { useWeb3React } from "@web3-react/core";
// import { InjectedConnector } from "@web3-react/injected-connector";
import { abi, contractAddress } from "../constants/config";
import { useMoralis, useWeb3Contract } from "react-moralis";

import { createHelia } from "helia";
import { json } from "@helia/json";
import { useState } from "react";

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
  const [files, setFiles] = useState([]);
  const [storeFieldMessage, setStoreFieldMessage] = useState("");
  const [getFieldMessage, setGetFieldMessage] = useState("");
  const [getFieldOutput, setGetFieldOutput] = useState("");
  const [getAllFieldMessage, setGetAllFieldMessage] = useState("");

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
        onSuccess: (results) => {
          console.log("Transaction Object => ", results);
          setStoreFieldMessage(`Successfully Stored File! ${results.hash}`);
          document.getElementById("name").value = "";
          document.getElementById("age").value = "";
          document.getElementById("gpa").value = "";
          document.getElementById("grade").value = "";
        },
        onError: (error) => {
          console.log(`ERROR => ${error.message}`);
          setStoreFieldMessage(error.message.toUpperCase());
        },
        params: storeFileOptions,
      });

      // SET CID FIELD TO VALUE
      document.getElementById("cid").value = cid.toString();
    } else setStoreFieldMessage("Please Fill Out Input Fields");
  }

  async function getFileOnChain() {
    // GET FILE IN SMART CONTRACT ON BLOCKCHAIN
    const getFileOptions = {
      abi: abi,
      contractAddress: contractAddress,
      functionName: "getFile",
      params: {
        cid: document.getElementById("cid").value,
      },
    };
    runContractFunction({
      onSuccess: (results) => {
        console.log(`URL (getFile) => ${results}`);
        setGetFieldMessage("");
        setGetFieldOutput(results);
      },
      onError: (error) => {
        console.log(`ERROR => ${error}`);
        setGetFieldMessage(
          error
            .toString()
            .split(" ")
            .map((w, i) =>
              i === 0
                ? w.toUpperCase()
                : w.charAt(0).toUpperCase().concat(w.substring(1))
            )
            .join(" ")
        );
        setGetFieldOutput("");
      },
      params: getFileOptions,
    });
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
        results.map((file, index) =>
          console.log(`${index} - CID: ${file.cid} URL: ${file.url}`)
        );
        setFiles(results);
      },
      onError: (error) => {
        console.log(`ERROR => ${error}`);
        setGetAllFieldMessage(error);
      },
      params: getAllFilesOptions,
    });
  }

  return (
    <div>
      {isWeb3Enabled ? (
        <>
          {/* STORE FILE COMPONENT */}
          <div id="storeFields">
            <div>
              <h4>{storeFieldMessage}</h4>
            </div>
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
          {/* GET FILE COMPONENT */}
          <div id="getField">
            <div>
              <h4>{getFieldMessage}</h4>
            </div>
            <div>
              <label>CID: </label>
              <input type="text" id="cid" size={60} />
            </div>
            <div>
              <p>{getFieldOutput}</p>
            </div>
            <div>
              <button onClick={() => getFileOnChain()}>Get File</button>
            </div>
          </div>
          {/* GET ALL FILES COMPONENT */}
          <div>
            <div>{getAllFieldMessage}</div>
            <div>
              <button onClick={() => getAllFilesOnChain()}>
                Get All Files
              </button>
            </div>
            {files.map((file, index) => (
              <div key={++index}>
                <h4>File #{++index}</h4>
                <p>CID : {file.cid}</p>
                <p>URL : {file.url}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <button onClick={() => enableWeb3()}>Connect Metamask</button>
      )}
    </div>
  );
}
