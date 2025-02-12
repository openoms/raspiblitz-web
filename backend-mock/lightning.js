const express = require("express");
const router = express.Router();
const transactions = require("./transactions");
const util = require("./sse/util");

let WALLET_LOCKED = true;

router.post("/add-invoice", (req, res) => {
  console.info(
    `call to /api/v1/lightning/add-invoice with value ${req.query.value_msat} and memo ${req.query.memo}`
  );
  res.send(
    JSON.stringify({
      payment_request:
        "lnbcrt2u1pseumjxpp5v86496waqjpnt2y6wxa77er2wsrp6afqqmnk3ap0kzjr857vj7ksdqvvdhk6mt9de6qcqzpgxqrrsssp5dvku88d87th4wqmstcl4watfsje0azhk35wtey3vlh59nrr7s2qs9qyyssq3j2l3e3d022vz290j2m5asp7sgud036gfxg2ltm33nm2tcxqz7mntcfd8s3s5v28cna25nmraf75ugsvrflalhamvqrep6fed7amuvcqxnzjpe",
    })
  );
});

router.post("/send-coins", (req, res) => {
  console.info(`call to ${req.originalUrl}`);
  res.status(200).send({
    txid: "txid",
    address: "11234",
    amount: 120202,
    label: "someLabel",
  });
});

router.get("/decode-pay-req", (req, res) => {
  console.info(
    "call to /api/v1/lightning/decode-pay-req with invoice",
    req.query["pay_req"]
  );

  setTimeout(() => {
    return res.status(200).send(
      JSON.stringify({
        destination:
          "0323dbd695d801553837f9907100f304abd153932bb000a3a7ea9132ff3e7437a1",
        payment_hash:
          "dc171b0d9a6c33d40ba2d9ed95819b29af40d83132b15072ab4e8b60feb08b90",
        num_satoshis: 20,
        timestamp: 1893456000000,
        expiry: 36000,
        description: "TEST",
        description_hash: "",
        fallback_addr: "",
        cltv_expiry: 40,
        route_hints: [],
        payment_addr:
          "24efc95be534b44b801ea5603b9aa1ad5424196972c7a3357b478e773b55f22e",
        num_msat: 20000,
        features: [
          {
            key: 9,
            value: {
              name: "tlv-onion",
              is_required: false,
              is_known: true,
            },
          },
          {
            key: 14,
            value: {
              name: "payment-addr",
              is_required: true,
              is_known: true,
            },
          },
          {
            key: 17,
            value: {
              name: "multi-path-payments",
              is_required: false,
              is_known: true,
            },
          },
        ],
      })
    );
  }, 1500);
});

router.post("/send-payment", (req, res) => {
  console.info(
    `call to ${req.originalUrl} with invoice ${req.query["pay_req"]}`
  );

  return res.status(200).send(
    JSON.stringify({
      payment_hash:
        "b56e1d38dd4b7a04dec7ad87f5ab403bda96a28d4c70dea1d208e8c39b1e8500",
      payment_preimage:
        "df6160dc0f0760c9b3e279a462145fd4e3fef507230c1967a030592f2ae457af",
      value_msat: 1000000,
      payment_request:
        "lnbcrt10u1pscxuktpp5k4hp6wxafdaqfhk84krlt26q80dfdg5df3cdagwjpr5v8xc7s5qqdpz2phkcctjypykuan0d93k2grxdaezqcn0vgxqyjw5qcqp2sp5ndav50eqfh32xxpwd4wa645hevumj7ze5meuajjs40vtgkucdams9qy9qsqc34r4wlyytf68xvt540gz7yq80wsdhyy93dgetv2d2x44dhtg4fysu9k8v0aec8r649tcgtu5s9xths93nuxklvf93px6gnlw2h7u0gq602rww",
      status: "succeeded",
      fee_msat: 0,
      creation_time_ns: 1636004563364389000,
      htlcs: [
        {
          attempt_id: 1000,
          status: "succeeded",
          route: {
            total_time_lock: 178,
            total_fees: 0,
            total_amt: 1000,
            hops: [
              {
                chan_id: 148434069815296,
                chan_capacity: 250000,
                amt_to_forward: 1000,
                fee: 0,
                expiry: 178,
                amt_to_forward_msat: 1000000,
                fee_msat: 0,
                pub_key:
                  "038b6e605d2e2a3f49aed0d3140eb47ae45b011481ef4669f874bdcc2d7baf6d14",
                tlv_payload: true,
              },
            ],
            total_fees_msat: 0,
            total_amt_msat: 1000000,
            mpp_record: null,
            amp_record: null,
            custom_records: [],
          },
          attempt_time_ns: 1636004563379560200,
          resolve_time_ns: 1636004563515875600,
          failure: {
            code: 0,
            channel_update: {
              signature: "",
              chain_hash: "",
              chan_id: 0,
              timestamp: 0,
              message_flags: 0,
              channel_flags: 0,
              time_lock_delta: 0,
              htlc_minimum_msat: 0,
              base_fee: 0,
              fee_rate: 0,
              htlc_maximum_msat: 0,
              extra_opaque_data: "",
            },
            htlc_msat: 0,
            onion_sha_256: "",
            cltv_expiry: 0,
            flags: 0,
            failure_source_index: 0,
            height: 0,
          },
          preimage:
            "df6160dc0f0760c9b3e279a462145fd4e3fef507230c1967a030592f2ae457af",
        },
      ],
      payment_index: 3,
      failure_reason: "FAILURE_REASON_NONE",
    })
  );
});

router.get("/list-all-tx", (req, res) => {
  console.info(`call to ${req.originalUrl}`);
  if (WALLET_LOCKED) {
    return res.status(423).send();
  }
  return res.status(200).send(JSON.stringify(transactions.listTransactions()));
});

router.post("/new-address", (req, res) => {
  console.info(
    `call to /api/v1/lightning/new-address with type ${req.body.type}`
  );
  return res.status(200).send("bcrt1qvh74klc36lefsdgq5r2d44vwxxzkdsch0hhyrz");
});

router.post("/unlock-wallet", (req, res) => {
  console.info(
    `call to /api/v1/lightning/unlock-wallet with type ${req.body.password}`
  );
  // simulate loading time
  setTimeout(() => {
    if (req.body.password === "password") {
      WALLET_LOCKED = false;
      setTimeout(() => {
        util.sendSSE("system_startup_info", {
          bitcoin: "done",
          bitcoin_msg: "",
          lightning: "done",
          lightning_msg: "",
        });
      }, 3000);
      return res.status(200).send(true);
    }
    return res.status(401).send();
  }, 1000);
});

router.post("/open-channel", (req, res) => {
  console.info(`call to ${req.originalUrl}`);
});

router.get("/list-channel", (req, res) => {
  console.info(`call to ${req.originalUrl}`);
});

router.post("/close-channel", (req, res) => {
  console.info(`call to ${req.originalUrl}`);
});

module.exports = router;
