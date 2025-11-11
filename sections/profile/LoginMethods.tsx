"use client";

import LoaderComponent from "@/components/general/LoaderComponent";
import ProfileSettingRow from "@/components/profile/ProfileSettingRow";
import ConnectEmailAndPasswordModal from "@/modals/profile/ConnectEmailAndPasswordModal";
import { auth } from "@/firebase/client";
import { useUid } from "@/hooks/useUid";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  onIdTokenChanged,
  unlink,
  linkWithRedirect,
  GoogleAuthProvider,
  TwitterAuthProvider,
  linkWithPopup,
  updateEmail,
} from "firebase/auth";
import { toast } from "sonner";
import { MdEmail } from "react-icons/md";
import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type CanonicalProviderId = "password" | "google.com" | "twitter.com";

const LoginMethods = () => {
  const { loading } = useUid();

  // 1) Keep the user in React state (reactive source of truth)
  const [user, setUser] = useState(() => auth.currentUser);
  const [showConnectEmailModal, setShowConnectEmailModal] = useState(false);

  // 2) Derive providerData from user (and ensure a new reference)
  const providerData = useMemo(
    () => (user?.providerData ? [...user.providerData] : []),
    [user?.providerData]
  );

  // 3) Subscribe to auth changes and reload to refresh providerData
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      setUser(u ?? null);
    });
    return unsub;
  }, []);

  const isConnected = useCallback(
    (canonicalId: CanonicalProviderId) => providerData.some((p) => p.providerId === canonicalId),
    [providerData]
  );

  // 4) Connect actions (stubbed; ensure canonical IDs when you implement)
  const connectProvider = async (canonicalId: CanonicalProviderId) => {
    if (!user) return;

    if (canonicalId === "password") {
      setShowConnectEmailModal(true);
      return;
    }
    if (canonicalId === "google.com") {
      try {
        const provider = new GoogleAuthProvider();
        const result = await linkWithPopup(user, provider);
        console.log("Google linkWithRedirect result: ", result);
        await user.reload(); // ✅ refresh providerData
        setUser({ ...auth.currentUser! }); // ✅ new reference
        toast.success("Google connected successfully.");
      } catch (error) {
        if (error && (error as { code?: string }).code === "auth/email-already-in-use") {
          console.error("Error connecting Google provider:", error);
          toast.error("The email address is already in use by another account.");
          return;
        }
        console.error("Error connecting Google provider:", error);
        toast.error("Failed to connect Google. Please try again.");
      }
      return;
    }
    if (canonicalId === "twitter.com") {
      try {
        const provider = new TwitterAuthProvider();
        await linkWithRedirect(user, provider);
        await user.reload(); // ✅ refresh providerData
        setUser({ ...auth.currentUser! }); // ✅ new reference
        toast.success("X (Twitter) connected successfully.");
      } catch (error) {
        console.error("Error connecting Twitter provider:", error);
        toast.error("Failed to connect X (Twitter). Please try again.");
      }
      return;
    }
    toast.error("Unsupported provider");
    return;
  };

  // 5) Disconnect actions: use canonical IDs, reload, then update state
  const disconnectProvider = async (canonicalId: CanonicalProviderId) => {
    if (!user) return;

    // prevent removing the last login method
    const connectedCount = providerData.length;
    if (connectedCount <= 1 && isConnected(canonicalId)) {
      toast.error("You cannot disconnect your only login method.");
      return;
    }

    const title = (() => {
      switch (canonicalId) {
        case "password":
          return "Email & Password";
        case "google.com":
          return "Google";
        case "twitter.com":
          return "X (Twitter)";
      }
    })();

    try {
      console.log("Disconnecting provider:", canonicalId, "from user:", user);
      await unlink(user, canonicalId); // ✅ must be canonical id
      if (canonicalId === "password") {
        await updateEmail(user, "");
      }
      await user.reload(); // ✅ refresh providerData
      // set a *new* user reference so React sees a change
      setUser({ ...auth.currentUser! });
      toast.success(`${title} disconnected successfully.`);
    } catch (err) {
      console.error("Error disconnecting provider:", err);
      toast.error(`Failed to disconnect ${title}. Please try again.`);
    }
  };

  return (
    <>
      <LoaderComponent
        height="200px"
        width="100%"
        loading={loading}
        rounded="lg"
        className="bg-(--secondary-color) p-6 rounded-lg flex flex-col gap-4"
        loadingClassName="bg-(--secondary-color)"
      >
        <h2 className="text-xl font-bold">Login Methods</h2>

        {/* Email & Password */}
        <ProfileSettingRow
          title="Email & Password"
          actionText={isConnected("password") ? "Disconnect" : "Connect"}
          onActionClick={
            isConnected("password")
              ? () => disconnectProvider("password")
              : () => connectProvider("password")
          }
          description={isConnected("password") ? "Connected" : "Not Connected"}
          icon={MdEmail}
          iconVariant="success"
          actionButtonVariant={isConnected("password") ? "danger" : "default"}
          descriptionIcon={isConnected("password") ? IoIosCheckmarkCircle : IoIosCloseCircle}
          descriptionIconColor={isConnected("password") ? "success-color" : "secondary-text-color"}
          descriptionClassName={isConnected("password") ? "text-(--success-color)" : ""}
        />

        {/* Google */}
        <ProfileSettingRow
          title="Google"
          actionText={isConnected("google.com") ? "Disconnect" : "Connect"}
          onActionClick={
            isConnected("google.com")
              ? () => disconnectProvider("google.com")
              : () => connectProvider("google.com")
          }
          description={isConnected("google.com") ? "Connected" : "Not Connected"}
          icon={FaGoogle}
          iconVariant="danger"
          actionButtonVariant={isConnected("google.com") ? "danger" : "default"}
          descriptionIcon={isConnected("google.com") ? IoIosCheckmarkCircle : IoIosCloseCircle}
          descriptionIconColor={
            isConnected("google.com") ? "success-color" : "secondary-text-color"
          }
          descriptionClassName={isConnected("google.com") ? "text-(--success-color)" : ""}
        />

        {/* Twitter/X */}
        <ProfileSettingRow
          title="X (Twitter)"
          actionText={isConnected("twitter.com") ? "Disconnect" : "Connect"}
          onActionClick={
            isConnected("twitter.com")
              ? () => disconnectProvider("twitter.com")
              : () => connectProvider("twitter.com")
          }
          description={isConnected("twitter.com") ? "Connected" : "Not Connected"}
          icon={FaXTwitter}
          iconVariant="default"
          actionButtonVariant={isConnected("twitter.com") ? "danger" : "default"}
          descriptionIcon={isConnected("twitter.com") ? IoIosCheckmarkCircle : IoIosCloseCircle}
          descriptionIconColor={
            isConnected("twitter.com") ? "success-color" : "secondary-text-color"
          }
          descriptionClassName={isConnected("twitter.com") ? "text-(--success-color)" : ""}
        />
      </LoaderComponent>

      <ConnectEmailAndPasswordModal
        open={showConnectEmailModal}
        setOpen={setShowConnectEmailModal}
      />
    </>
  );
};

export default LoginMethods;
