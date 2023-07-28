import { useMoralis } from "react-moralis";
import { StoreFile } from "./components/store-file";
import { GetFile } from "./components/get-file";
import { GetAll } from "./components/get-all";
import { React } from "react";

export default function Home() {
  /* THIRD METHOD TO CONNECT TO BLOCKCHAIN NETWORK */
  const { enableWeb3, isWeb3Enabled } = useMoralis();

  return (
    <div>
      {isWeb3Enabled ? (
        <>
          <StoreFile />
          <GetFile />
          <GetAll />
        </>
      ) : (
        <button onClick={() => enableWeb3()}>Connect Metamask</button>
      )}
    </div>
  );
}
