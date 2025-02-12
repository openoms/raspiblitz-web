import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import AppStatusCard from "../components/Home/AppStatusCard/AppStatusCard";
import BitcoinCard from "../components/Home/BitcoinCard/BitcoinCard";
import ConnectionCard from "../components/Home/ConnectionCard/ConnectionCard";
import HardwareCard from "../components/Home/HardwareCard/HardwareCard";
import LightningCard from "../components/Home/LightningCard/LightningCard";
import TransactionCard from "../components/Home/TransactionCard/TransactionCard";
import TransactionDetailModal from "../components/Home/TransactionCard/TransactionDetailModal/TransactionDetailModal";
import WalletCard from "../components/Home/WalletCard/WalletCard";
import LoadingSpinner from "../components/Shared/LoadingSpinner/LoadingSpinner";
import ReceiveModal from "../components/Shared/ReceiveModal/ReceiveModal";
import SendModal from "../components/Shared/SendModal/SendModal";
import UnlockModal from "../components/Shared/UnlockModal/UnlockModal";
import { useInterval } from "../hooks/use-interval";
import useSSE from "../hooks/use-sse";
import { AppStatus } from "../models/app-status";
import { Transaction } from "../models/transaction.model";
import { AppContext } from "../store/app-context";
import { instance } from "../util/interceptor";
import { enableGutter } from "../util/util";

const Home: FC = () => {
  const { t } = useTranslation();
  const { darkMode, walletLocked, setWalletLocked } = useContext(AppContext);
  const {
    systemInfo,
    balance,
    btcInfo,
    lnInfoLite,
    appStatus,
    hardwareInfo,
    systemStartupInfo,
  } = useSSE();

  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [txError, setTxError] = useState("");

  const theme = darkMode ? "dark" : "light";

  const { implementation } = lnInfoLite;
  const { lightning: lightningState } = systemStartupInfo || {};

  const isLnImplSelected =
    implementation !== null &&
    implementation !== "" &&
    implementation !== "NONE";

  const getTransactions = useCallback(async () => {
    if (!isLnImplSelected || (lightningState && lightningState !== "done")) {
      return;
    }
    try {
      const tx = await instance.get("/lightning/list-all-tx", {
        params: {
          reversed: true,
        },
      });
      setTransactions(tx.data);
      if (tx.status === 200 && walletLocked) {
        setWalletLocked(false);
      }
    } catch (err: any) {
      if (err.response.status === 423) {
        setWalletLocked(true);
      } else {
        setTxError(
          `${t("login.error")}: ${
            err.response?.data?.detail?.[0]?.msg ||
            err.response?.data?.detail ||
            err.message
          }`
        );
      }
    }
  }, [lightningState, isLnImplSelected, walletLocked, setWalletLocked, t]);

  useEffect(() => {
    if (isLnImplSelected && !walletLocked && isLoadingTransactions) {
      getTransactions().finally(() => {
        setIsLoadingTransactions(false);
      });
    }
  }, [
    implementation,
    isLnImplSelected,
    isLoadingTransactions,
    walletLocked,
    getTransactions,
  ]);

  useEffect(() => {
    enableGutter();

    if (lightningState === "locked") {
      setWalletLocked(true);
    }

    if (!walletLocked) {
      setIsLoadingTransactions(true);
      setTxError("");
    }
  }, [
    t,
    lightningState,
    walletLocked,
    setWalletLocked,
    setIsLoadingTransactions,
  ]);

  useInterval(getTransactions, 5000);

  const showSendModalHandler = useCallback(() => {
    setShowSendModal(true);
  }, []);

  const closeSendModalHandler = useCallback(
    (confirmed?: boolean) => {
      setShowSendModal(false);
      if (confirmed) {
        toast.success(t("tx.sent"), { theme });
      }
    },
    [t, theme]
  );

  const showReceiveHandler = useCallback(() => {
    setShowReceiveModal(true);
  }, []);

  const closeReceiveModalHandler = useCallback(() => {
    setShowReceiveModal(false);
  }, []);

  const showDetailHandler = (index: number) => {
    const tx = transactions.find((tx) => tx.index === index);
    if (!tx) {
      console.error("Could not find transaction with index ", index);
      return;
    }
    setDetailTx(tx);
    setShowDetailModal(true);
  };

  const closeDetailHandler = useCallback(() => {
    setDetailTx(null);
    setShowDetailModal(false);
  }, []);

  const receiveModal = showReceiveModal && (
    <ReceiveModal onClose={closeReceiveModalHandler} />
  );

  const sendModal = showSendModal && (
    <SendModal
      onchainBalance={balance.onchain_confirmed_balance!}
      lnBalance={balance.channel_local_balance!}
      onClose={closeSendModalHandler}
    />
  );

  const detailModal = showDetailModal && (
    <TransactionDetailModal
      transaction={detailTx!}
      close={closeDetailHandler}
    />
  );

  const closeUnlockModal = useCallback(
    (unlocked: boolean) => {
      if (unlocked) {
        if (systemStartupInfo) {
          systemStartupInfo.lightning = "done";
        }
        toast.success(t("wallet.unlock_success"), { theme });
      }
    },
    [t, theme, systemStartupInfo]
  );

  const unlockModal = walletLocked && (
    <UnlockModal onClose={closeUnlockModal} />
  );

  const gridRows = 6 + appStatus.length / 4;
  const height = isLnImplSelected ? "h-full" : "h-full md:h-1/2";

  if (implementation === null && lightningState !== "disabled") {
    return (
      <>
        {unlockModal}
        <main
          className={`content-container page-container flex h-full items-center justify-center bg-gray-100 transition-colors dark:bg-gray-700 dark:text-white`}
        >
          <LoadingSpinner />
        </main>
      </>
    );
  }

  return (
    <>
      {unlockModal}
      {receiveModal}
      {sendModal}
      {detailModal}
      <main
        className={`content-container page-container grid h-full grid-cols-1 gap-2 bg-gray-100 transition-colors dark:bg-gray-700 dark:text-white grid-rows-${gridRows.toFixed()} md:grid-cols-2 xl:grid-cols-4`}
      >
        {isLnImplSelected && (
          <article className="col-span-2 row-span-2 md:col-span-1 xl:col-span-2">
            <WalletCard
              onchainBalance={balance.onchain_total_balance}
              onChainUnconfirmed={balance.onchain_unconfirmed_balance}
              lnBalance={balance.channel_local_balance}
              onReceive={showReceiveHandler}
              onSend={showSendModalHandler}
            />
          </article>
        )}
        {isLnImplSelected && (
          <article className="col-span-2 row-span-4 w-full md:col-span-1 xl:col-span-2">
            <TransactionCard
              isLoading={isLoadingTransactions}
              transactions={transactions}
              showDetails={showDetailHandler}
              error={txError}
              implementation={implementation}
            />
          </article>
        )}
        <article className="col-span-2 row-span-2 w-full md:col-span-1 xl:col-span-2">
          <div className={`flex ${height} flex-col p-5 lg:flex-row`}>
            <ConnectionCard
              torAddress={systemInfo.tor_web_ui!}
              sshAddress={systemInfo.ssh_address!}
              nodeId={lnInfoLite.identity_pubkey}
            />
            <HardwareCard hardwareInfo={hardwareInfo} />
          </div>
        </article>
        <article
          className={`${height} col-span-2 row-span-2 w-full md:col-span-1 xl:col-span-2`}
        >
          <BitcoinCard info={btcInfo} network={systemInfo.chain!} />
        </article>
        {isLnImplSelected && (
          <article className="col-span-2 row-span-2 w-full md:col-span-1 xl:col-span-2">
            <LightningCard
              version={lnInfoLite.version!}
              implementation={lnInfoLite.implementation!}
              channelActive={lnInfoLite.num_active_channels!}
              channelPending={lnInfoLite.num_pending_channels!}
              channelInactive={lnInfoLite.num_inactive_channels!}
              localBalance={balance.channel_local_balance!}
              remoteBalance={balance.channel_remote_balance!}
              pendingLocalBalance={balance.channel_pending_open_local_balance!}
              pendingRemoteBalance={
                balance.channel_pending_open_remote_balance!
              }
            />
          </article>
        )}
        {appStatus
          .filter((app: AppStatus) => app.installed)
          .map((app: AppStatus) => {
            return (
              <article
                key={app.id}
                className="col-span-2 row-span-1 md:col-span-1"
              >
                <AppStatusCard app={app} />
              </article>
            );
          })}
      </main>
    </>
  );
};

export default Home;
