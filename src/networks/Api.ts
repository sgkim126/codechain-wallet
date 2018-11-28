import axios from "axios";
import {
    AggsUTXO,
    AssetSchemeDoc,
    PendingParcelDoc,
    PendingTransactionDoc,
    TransactionDoc,
    UTXO
} from "codechain-indexer-types/lib/types";
import {
    AssetTransferTransaction,
    H256,
    U256
} from "codechain-sdk/lib/core/classes";
import { NetworkId } from "codechain-sdk/lib/core/types";
import * as _ from "lodash";
import { PlatformAccount } from "../model/address";
import { getServerHost } from "../utils/network";

async function getRequest<T>(url: string) {
    const response = await axios.get<T>(url);
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(response.statusText);
}

async function postRequest<T>(url: string, body: any) {
    const response = await axios.post<T>(url, body);
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(response.statusText);
}

export function getGatewayHost(networkId: NetworkId) {
    // return server.gateway[networkId];
    return "http://localhost:9000";
}

export async function getAggsUTXOList(
    address: string,
    networkId: NetworkId
): Promise<AggsUTXO[]> {
    const apiHost = getServerHost(networkId);
    return await getRequest<AggsUTXO[]>(`${apiHost}/api/aggs-utxo/${address}`);
}

export async function getAssetByAssetType(
    assetType: H256,
    networkId: NetworkId
) {
    const apiHost = getServerHost(networkId);
    return getRequest<AssetSchemeDoc>(
        `${apiHost}/api/asset/${assetType.value}`
    );
}

export async function getPlatformAccount(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getServerHost(networkId);
    const response = await getRequest<{ balance: string; nonce: string }>(
        `${apiHost}/api/addr-platform-account/${address}`
    );

    if (response) {
        return {
            balance: new U256(response.balance),
            nonce: new U256(response.nonce)
        } as PlatformAccount;
    } else {
        return {
            balance: new U256(0),
            nonce: new U256(0)
        } as PlatformAccount;
    }
}

export async function getUTXOListByAssetType(
    address: string,
    assetType: H256,
    networkId: NetworkId
) {
    const apiHost = getServerHost(networkId);
    return await getRequest<UTXO[]>(
        `${apiHost}/api/utxo/${assetType.value}/owner/${address}`
    );
}

export async function sendTxToGateway(
    tx: AssetTransferTransaction,
    networkId: NetworkId
) {
    const gatewayHost = getGatewayHost(networkId);

    return await postRequest<void>(`${gatewayHost}/send_asset`, {
        tx
    });
}

export async function getPendingPaymentParcels(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getServerHost(networkId);
    return await getRequest<PendingParcelDoc[]>(
        `${apiHost}/api/parcels/pending/${address}`
    );
}

export async function getPendingTransactions(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getServerHost(networkId);
    return await getRequest<PendingTransactionDoc[]>(
        `${apiHost}/api/addr-asset-txs/pending/${address}`
    );
}

export async function getTxsByAddress(
    address: string,
    onlyUnconfirmed: boolean,
    page: number,
    itemsPerPage: number,
    networkId: NetworkId
) {
    const apiHost = getServerHost(networkId);
    let query = `${apiHost}/api/addr-asset-txs/${address}?page=${page}&itemsPerPage=${itemsPerPage}`;
    if (onlyUnconfirmed) {
        query += `&onlyUnconfirmed=true&confirmThreshold=5`;
    }
    return await getRequest<TransactionDoc[]>(query);
}

export async function getBestBlockNumber(networkId: string) {
    const apiHost = getServerHost(networkId);
    return await getRequest<number>(`${apiHost}/api/blockNumber`);
}
