import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Settings.module.scss";

import { IoTrashOutline } from "react-icons/io5";

import { useSession, getSession } from "next-auth/react";

import { Scrollbar } from "react-scrollbars-custom";

import AddApi from "../components/AddApi";

import Select from "react-select";

import ConfirmDelete from "../components/ConfirmDelete";
import Alert from "../components/Alert";

const customStyles = {
  control: () => ({
    // none of react-select's styles are passed to <Control />
    width: "100%",
    display: "flex",
    padding: "0.4rem 0.5rem",
    fontSize: "1rem",
  }),
  option: (provided, state) => ({
    ...provided,
    color: "black",
  }),
  menuList: (base) => ({
    ...base,
    height: "8rem",
    "::-webkit-scrollbar": {
      width: "3px",
      height: "0px",
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#888",
      borderRadius: 10,
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  }),
};

function ActivatedApi({ sub, apiKeys, changed }) {
  const apiOptions = apiKeys
    ? apiKeys
        .filter(
          (key) =>
            (key.exchange === sub.exchange ||
              key.exchange === sub.secondExchange) &&
            (!key.taken || (sub.api ? sub.api.name === key.name : false))
        )
        .map((key) => {
          return { value: key.name, label: key.name };
        })
    : [];

  const { data: session, status } = useSession();

  const [apiValue, setApiValue] = useState(
    sub.api
      ? {
          value: sub.api.name,
          label: sub.api.name,
        }
      : null
  );

  const changeValue = async (val) => {
    if (val.value && session) {
      try {
        const response = await fetch("/api/update-subbed-api", {
          method: "POST",
          body: JSON.stringify({
            email: session.user.email,
            newApiName: val.value,
            oldApiName: sub.api ? sub.api.name : null,
            traderId: sub.traderId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();

        if (!response.ok) {
          setError(json.message);
          throw new Error(json.message || "Something went wrong");
        }
      } catch (error) {
        return;
      }

      setApiValue(val);
      changed();
    }
  };

  return (
    <div
      className={styles.api}
      style={
        !apiValue.value
          ? {
              border: "2px solid #e96d69",
              boxShadow: "0 0 3px #e96d6952",
            }
          : undefined
      }
    >
      <div className={styles.values}>
        <h4>{sub.traderId}</h4>
      </div>
      {sub.secondExchange ? (
        <img
          src={`/images/settings/exchanges/${sub.secondExchange}-${sub.exchange}.svg`}
          alt="Exchange"
          className={styles.exchange}
        />
      ) : (
        <img
          src={`/images/settings/exchanges/${sub.exchange}.svg`}
          alt="Exchange"
          className={styles.exchange}
        />
      )}
      {apiKeys && (
        <Select
          className={styles.select}
          styles={customStyles}
          defaultValue={apiValue}
          options={apiOptions}
          value={apiValue}
          onChange={changeValue}
          isSearchable={false}
        />
      )}
    </div>
  );
}

function Settings() {
  const [openModal, setOpenModal] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [forceUpdate, setForceUpdate] = useState(0);

  const [deleting, setDeleting] = useState(null);

  const [activeLink, setActiveLink] = useState("list");

  const { data: session, status } = useSession();

  const getApiKeys = async () => {
    if (!session) return;

    const res = await fetch(`http://localhost:3000/api/apiKeys`);

    const keys = await res.json();

    setApiKeys(keys ? keys : []);
  };

  const getSubs = async () => {
    if (!session) return;

    const res = await fetch(`http://localhost:3000/api/subscribe`);

    const subs = await res.json();

    setSubscriptions(subs ? subs : []);
  };

  useEffect(() => {
    getApiKeys();
    getSubs();
  }, [session, forceUpdate]);

  const shorten = (str, n) => {
    let start = str.substr(0, n);
    let end = str.substr(str.length - 3);
    return start + (start === str ? "" : "..." + end);
  };

  const deleteApi = async (apiName) => {
    setDeleting(null);
    if (apiName && session) {
      try {
        const response = await fetch("/api/delete-api", {
          method: "DELETE",
          body: JSON.stringify({
            apiName: apiName,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();

        if (!response.ok) {
          setError(json.message);
          throw new Error(json.message || "Something went wrong");
        }
      } catch (error) {
        return;
      }

      setForceUpdate((fu) => fu + 1);
    }
  };

  return (
    <main className={styles.settings}>
      {openModal && (
        <AddApi
          open={openModal}
          handleClose={() => setOpenModal(false)}
          updateKeys={getApiKeys}
        />
      )}
      {deleting && (
        <ConfirmDelete
          apiName={deleting}
          open={deleting !== null}
          handleClose={(apiName) =>
            apiName !== null ? deleteApi(apiName) : setDeleting(null)
          }
        />
      )}
      <Head>
        <title>Settings | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        <div className={styles.header}>
          <h1>Settings</h1>
        </div>
        <div className={styles.body}>
          <section className={styles.addApi}>
            <div className={styles.box}>
              <h3>Add API</h3>
              <p>
                API will let you control your exchanges and will be used to
                automate the trading process
              </p>
              <button onClick={() => setOpenModal(true)}>Add API</button>
            </div>
            <Alert
              error={true}
              text={
                "DISCLAIMER: All unsubscribed API's have been deleted and all API names have been changed in the new security update. Don't worry, you will be able to change the name of your API soon."
              }
            />
          </section>
          <section className={styles.apiList}>
            <div className={styles.titles}>
              <h3
                style={{ opacity: activeLink === "list" ? 1 : 0.3 }}
                onClick={() => setActiveLink("list")}
              >
                API list
              </h3>
              <h3
                style={{ opacity: activeLink === "activated" ? 1 : 0.3 }}
                onClick={() => setActiveLink("activated")}
              >
                Activated
              </h3>
            </div>
            <Scrollbar style={{ height: "22.2rem" }}>
              {activeLink === "list" ? (
                <>
                  {apiKeys.length > 0 ? (
                    <div className={styles.list}>
                      {apiKeys.map((api, i) => (
                        <div
                          className={styles.api}
                          key={i}
                          style={
                            api.taken
                              ? {
                                  border: "2px solid #39c491",
                                  boxShadow: "0 0 3px #39c49152",
                                }
                              : undefined
                          }
                        >
                          <IoTrashOutline
                            className={styles.trash}
                            onClick={() => setDeleting(api.name)}
                          />
                          <div className={styles.values}>
                            <h4>{shorten(api.name, 20)}</h4>
                            <h4>{shorten(api.api, 20)}</h4>
                          </div>
                          <img
                            src={`/images/settings/exchanges/${api.exchange}.svg`}
                            alt="Exchange"
                          />
                          <div
                            className={styles.delBtn}
                            onClick={() => setDeleting(api.name)}
                          >
                            <IoTrashOutline />
                            <p>DELETE</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <h1>{"You didn't add any API keys yet."}</h1>
                  )}
                </>
              ) : (
                <>
                  {subscriptions &&
                  subscriptions.length > 0 &&
                  apiKeys.length > 0 ? (
                    <div className={styles.list}>
                      {subscriptions.map((sub, i) => (
                        <ActivatedApi
                          sub={sub}
                          apiKeys={apiKeys}
                          key={i}
                          changed={getApiKeys}
                        />
                      ))}
                    </div>
                  ) : (
                    <h1>{"You don't have any subscriptions yet."}</h1>
                  )}
                </>
              )}
            </Scrollbar>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Settings;
