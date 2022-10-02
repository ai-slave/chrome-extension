// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Base64DataBuffer } from "@mysten/sui.js";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";

import type { SuiTransactionResponse } from "@mysten/sui.js";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TransactionRequest } from "_payloads/transactions";
import type { RootState } from "_redux/RootReducer";
import type { TransactionRequestResponse } from "_src/shared/messaging/messages/payloads/transactions/ui/TransactionRequestResponse";
import type { AppThunkConfig } from "_store/thunk-extras";

const txRequestsAdapter = createEntityAdapter<TransactionRequest>({
  sortComparer: (a, b) => {
    const aDate = new Date(a.createdDate);
    const bDate = new Date(b.createdDate);
    return aDate.getTime() - bDate.getTime();
  },
});

export const respondToTransactionRequest = createAsyncThunk<
  {
    txRequestID: string;
    approved: boolean;
    txResponse: SuiTransactionResponse | null;
  },
  { txRequestID: string; approved: boolean },
  AppThunkConfig
>(
  "respond-to-transaction-request",
  async (
    { txRequestID, approved },
    { extra: { background, api, keypairVault }, getState }
  ) => {
    const state = getState();

    const txRequest = txRequestsSelectors.selectById(state, txRequestID);
    if (!txRequest) {
      throw new Error(`TransactionRequest ${txRequestID} not found`);
    }

    let txResult: SuiTransactionResponse | undefined = undefined;
    let tsResultError: string | undefined;
    if (approved) {
      const {
        account: { address, authentication, activeAccountIndex },
      } = getState();

      let signer;
      if (authentication) {
        signer = api.getEthosSignerInstance(address || "", authentication);
      } else {
        signer = api.getSignerInstance(
          keypairVault.getKeyPair(activeAccountIndex)
        );
      }

      try {
        if (txRequest.type === "move-call") {
          txResult = await signer.executeMoveCall(txRequest.tx);
        } else if (txRequest.type === "serialized-move-call") {
          const txBytes = new Base64DataBuffer(txRequest.txBytes);
          txResult = await signer.signAndExecuteTransaction(txBytes);
        } else {
          throw new Error(`Either tx or txBytes needs to be defined.`);
        }
      } catch (e) {
        tsResultError = (e as Error).message;
      }
    }
    background.sendTransactionRequestResponse(
      txRequestID,
      approved,
      txResult,
      tsResultError
    );
    return { txRequestID, approved: approved, txResponse: null };
  }
);

export const sendTransactionResponse = createAsyncThunk<
  {
    response: TransactionRequestResponse;
  },
  { response: TransactionRequestResponse },
  AppThunkConfig
>(
  "send-transaction-response",
  async ({ response }, { extra: { background } }) => {
    background.sendTransactionRequestResponse(
      response.txID,
      response.approved,
      response.txResult,
      response.tsResultError
    );
    return { response };
  }
);

const slice = createSlice({
  name: "transaction-requests",
  initialState: txRequestsAdapter.getInitialState({ initialized: false }),
  reducers: {
    setTransactionRequests: (
      state,
      { payload }: PayloadAction<TransactionRequest[]>
    ) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      txRequestsAdapter.setAll(state, payload);
      state.initialized = true;
    },
  },
  extraReducers: (build) => {
    build.addCase(
      respondToTransactionRequest.fulfilled,
      (state, { payload }) => {
        const { txRequestID, approved: allowed, txResponse } = payload;
        txRequestsAdapter.updateOne(state, {
          id: txRequestID,
          changes: {
            approved: allowed,
            txResult: txResponse || undefined,
          },
        });
      }
    );
  },
});

export default slice.reducer;

export const { setTransactionRequests } = slice.actions;

export const txRequestsSelectors = txRequestsAdapter.getSelectors(
  (state: RootState) => state.transactionRequests
);
