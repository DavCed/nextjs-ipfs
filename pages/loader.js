import { React } from "react";
import { Blocks } from "react-loader-spinner";

export function Loader() {
  return <Blocks visible={true} height={70} width={80} />;
}
