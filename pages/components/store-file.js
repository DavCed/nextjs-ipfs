import { createHelia } from "helia";
import { json } from "@helia/json";
import { strings } from "@helia/strings";
import { unixfs } from "@helia/unixfs";
import { abi, contractAddress } from "../constants/config";
import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { MemoryDatastore } from "datastore-core";
import { MemoryBlockstore } from "blockstore-core";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { bootstrap } from "@libp2p/bootstrap";
import { tcp } from "@libp2p/tcp";
import { createLibp2p } from "libp2p";
import { identifyService } from "libp2p/identify";

export let helia2 = await createHelia({
  datastore: new MemoryDatastore(),
  blockstore: new MemoryBlockstore(),
  libp2p: await createLibp2p({
    datastore: new MemoryDatastore(),
    /* addresses: {
       listen: ["/ip4/127.0.0.1/tcp/0", "/ip4/0.0.0.0/tcp/0"],
     }, */
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
      bootstrap({
        list: [
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
        ],
      }),
    ],
    services: {
      identify: identifyService(),
    },
  }),
});

export let cidJSON = "";

export function StoreFile() {
  const { runContractFunction } = useWeb3Contract();
  const [storeFieldMessage, setStoreFieldMessage] = useState("");

  /* CREATE HELIA NODES 1 & 3*/
  async function createHeliaNode() {
    const blockstore = new MemoryBlockstore();
    const datastore = new MemoryDatastore();
    const libp2p = await createLibp2p({
      datastore: datastore,
      /* addresses: {
         listen: ["/ip4/127.0.0.1/tcp/0", "/ip4/0.0.0.0/tcp/0"],
       }, */
      transports: [tcp()],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      peerDiscovery: [
        bootstrap({
          list: [
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
          ],
        }),
      ],
      services: {
        identify: identifyService(),
      },
    });

    return await createHelia({
      datastore: datastore,
      blockstore: blockstore,
      libp2p: libp2p,
    });
  }

  async function storeFileOnChain() {
    if (
      document.getElementById("name").value.length > 0 &&
      document.getElementById("age").value.length > 0 &&
      document.getElementById("gpa").value.length > 0 &&
      document.getElementById("grade").value.length > 0
    ) {
      /* CONSTRUCT STUDENT OBJECT FROM INPUT FIELDS */
      const studentObj = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        gpa: document.getElementById("gpa").value,
        grade: document.getElementById("grade").value,
      };

      /* STORE IN HELIA IPFS - 3 MAIN WAYS
      1ST */
      const helia1 = await createHeliaNode();
      const fs = unixfs(helia1);
      const encoder = new TextEncoder();
      const cidFS = await fs.addBytes(encoder.encode(studentObj));
      const urlFS = `https://ipfs.io/ipfs/${cidFS}`;
      const decoder = new TextDecoder();
      let text = "";
      for await (const chunk of fs.cat(cidFS)) {
        text += decoder.decode(chunk, { stream: true });
      }
      console.log(`CID (UNIXFS) => ${cidFS.toString()}`);
      console.log(`URL (UNIXFS) => ${urlFS}`);
      console.log("Student Object (UNIXFS) => ", text);

      /* 2ND */
      const jsonObj = json(helia2);
      cidJSON = await jsonObj.add(studentObj);
      const studentObject = await jsonObj.get(cidJSON);
      const urlJSON = `https://ipfs.io/ipfs/${cidJSON}`;
      console.log(`CID (JSON) => ${cidJSON.toString()}`);
      console.log(`URL (JSON) => ${urlJSON}`);
      console.log("Student Object (JSON) => ", studentObject);

      /* 3RD */
      const helia3 = await createHeliaNode();
      const str = strings(helia3);
      const cidSTR = await str.add(studentObj);
      const studObj = await str.get(cidSTR);
      const urlSTR = `https://ipfs.io/ipfs/${cidSTR}`;
      console.log(`CID (STRINGS) => ${cidSTR.toString()}`);
      console.log(`URL (STRINGS) => ${urlSTR}`);
      console.log("Student Object (STRINGS) => ", studObj);

      // const multiaddrs = helia2.libp2p.getMultiaddrs();
      // await helia1.libp2p.dial(multiaddrs[0]);
      console.log("Network Peers (1) => ", helia1.libp2p.getPeers());
      console.log("External Addresses (1) => ", helia1.libp2p.getMultiaddrs());
      console.log("Network Peers (2) => ", helia2.libp2p.getPeers());
      console.log("External Addresses (2) => ", helia2.libp2p.getMultiaddrs());
      console.log("Network Peers (3) => ", helia3.libp2p.getPeers());
      console.log("External Addresses (3) => ", helia3.libp2p.getMultiaddrs());

      // helia1.stop();
      // helia2.stop();
      // helia3.stop();

      /* STORE IN SMART CONTRACT ON BLOCKCHAIN NETWORK */
      const storeFileOptions = {
        abi: abi,
        contractAddress: contractAddress,
        functionName: "storeFile",
        params: {
          cid: cidJSON.toString(),
          url: urlJSON,
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

      /* SET CID FIELD TO VALUE */
      document.getElementById("cid").value = cidJSON;
    } else setStoreFieldMessage("Please Fill Out Input Fields");
  }

  return (
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
  );
}
