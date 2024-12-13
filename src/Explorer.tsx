import { getWorldAddress } from "./contract";
import { Address } from "viem";

export type Props = {
  readonly url?: string;
  readonly address: Address;
  readonly className?: string;
};

function constructExplorerUrl(
  baseUrl: string,
  worldAddress: string,
  address: Address,
) {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const url = `${cleanBaseUrl}/${worldAddress}/explore`;
  const params = new URLSearchParams({
    // Position table
    tableId:
      "0x74626170700000000000000000000000506f736974696f6e0000000000000000",
    query: `SELECT * FROM "${worldAddress}__app__position";`,
    filter: address,
  });
  return `${url}?${params}`;
}

export function Explorer({ url, address, className }: Props) {
  if (!url) {
    return null;
  }
  const explorerUrl = constructExplorerUrl(url, getWorldAddress(), address);
  return <iframe src={explorerUrl} className={className} scrolling="no" />;
}
